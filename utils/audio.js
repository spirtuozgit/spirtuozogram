// utils/audio.js
let context;
const sounds = {};
const loops = {};

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    // Разбудить контекст при первом тапе
    const resume = () => {
      if (context.state === "suspended") {
        context.resume();
      }
      document.removeEventListener("touchstart", resume);
      document.removeEventListener("click", resume);
    };
    document.addEventListener("touchstart", resume, { once: true });
    document.addEventListener("click", resume, { once: true });
  }
  return context;
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
export function playSound(key, volume = 1.0) {
  const ctx = getContext();
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
export function playLoop(key, volume = 1.0) {
  const ctx = getContext();
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
