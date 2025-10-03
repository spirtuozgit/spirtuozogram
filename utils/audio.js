// utils/audio.js
let context;
const sounds = {};
const loops = {};

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

// === Разбудить контекст (iOS fix) ===
export async function unlockAudio() {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  // iOS баг: иногда звук не идёт, пока не сыграть пустой buffer
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    console.warn("unlockAudio error", e);
  }
}

// === Загрузка звука ===
export async function loadSound(key, url) {
  const ctx = getContext();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  sounds[key] = audioBuffer;
  return audioBuffer;
}

// === Одноразовое воспроизведение ===
export async function playSound(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  const buffer = sounds[key];
  if (!buffer) return;

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.value = volume;

  source.start(0);
  return source;
}

// === Зацикленное воспроизведение ===
export async function playLoop(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  const buffer = sounds[key];
  if (!buffer) return null;

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.value = volume;

  source.start(0);
  loops[key] = { source, gainNode };

  return {
    stop: () => {
      try {
        source.stop();
      } catch {}
      delete loops[key];
    },
  };
}

// === Остановка всех звуков ===
export function stopAllSounds() {
  Object.keys(loops).forEach((key) => {
    try {
      loops[key].source.stop();
    } catch {}
    delete loops[key];
  });
}
