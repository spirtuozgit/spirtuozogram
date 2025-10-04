let context;
const sounds = {};
const loops = {};
let unlocked = false;

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

// === Разблокировать аудио (для iOS/Android) ===
export function unlockAudio() {
  const ctx = getContext();
  if (unlocked) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume(); // синхронно!
    }

    // короткий "пустой" звук для прогрева
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    unlocked = true;
    console.log("✅ Audio unlocked");
  } catch (e) {
    console.warn("⚠️ unlockAudio error", e);
  }
}

// === Определение расширения (по платформе) ===
function getAudioExt() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return "m4a";
  return "ogg";
}

// === Загрузка звука ===
export async function loadSound(key, basePath) {
  const ctx = getContext();
  const ext = getAudioExt();
  const url = `${basePath}.${ext}`;

  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sounds[key] = audioBuffer;
    console.log(`🎧 Loaded: ${url}`);
    return audioBuffer;
  } catch (err) {
    console.warn(`⚠️ Ошибка загрузки ${url}`, err);
  }
}

// === Проигрывание коротких звуков ===
export function playSound(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();
  if (!sounds[key]) return;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = sounds[key];
  source.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = volume;
  source.start(0);
  return source;
}

// === Зацикленное воспроизведение ===
export function playLoop(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();
  if (!sounds[key]) return null;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = sounds[key];
  source.loop = true;
  source.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = volume;
  source.start(0);

  loops[key] = { source, gain };
  return {
    stop: () => {
      try { source.stop(); } catch {}
      delete loops[key];
    },
  };
}

// === Остановить все звуки ===
export function stopAllSounds() {
  Object.keys(loops).forEach((k) => {
    try { loops[k].source.stop(); } catch {}
    delete loops[k];
  });
}
