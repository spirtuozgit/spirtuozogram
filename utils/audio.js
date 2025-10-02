// utils/audio.js

let audioCtx;
const bufferCache = {};

// Единый контекст
export function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const handleVisibility = () => {
      if (!audioCtx) return;
      if (document.hidden) {
        audioCtx.suspend();
      } else {
        audioCtx.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", () => audioCtx && audioCtx.suspend());
    window.addEventListener("pageshow", () => audioCtx && audioCtx.resume());
  }
  return audioCtx;
}

// Принудительная разблокировка (вызывать при жесте)
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
}

/**
 * Предзагрузка (без «прогрева» — iOS блокирует)
 */
export async function preloadAudio(path) {
  const ctx = getCtx();
  if (bufferCache[path]) return;

  try {
    const res = await fetch(path);
    const arr = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arr);
    bufferCache[path] = buffer;
  } catch (err) {
    console.error("Ошибка предзагрузки:", path, err);
  }
}

/**
 * Однократное воспроизведение
 */
export function playAudio(path) {
  return new Promise((resolve) => {
    const ctx = getCtx();
    const buffer = bufferCache[path];
    if (!buffer) return resolve();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    resolve();
  });
}

/**
 * Зацикленное воспроизведение (например, топот)
 */
export function playLoop(path, volume = 1) {
  const ctx = getCtx();
  const buffer = bufferCache[path];
  if (!buffer) return null;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.buffer = buffer;
  source.loop = true;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);

  return { source, gain };
}
