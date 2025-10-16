// utils/audio.js — SPIRTUOZ AUDIO ENGINE v3+
// Поддержка WebAudio, генерации 8-бит тонов, OGG/M4A, циклов и фоновой музыки.

let context;
const sounds = {};
const loops = {};
let unlocked = false;

/* ============================================================
   🎧 Создание или получение AudioContext
   ============================================================ */
export function getContext() {              // 👈 ДОБАВИЛ export
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

/* ============================================================
   🔓 Разблокировка звука (гарантированная версия для iOS/Android)
   ============================================================ */
export async function unlockAudio() {
  const ctx = getContext();
  if (unlocked) return;

  try {
    if (ctx.state === "suspended" || ctx.state === "interrupted") {
      await ctx.resume();
    }

    const el = document.createElement("audio");
    el.src =
      "data:audio/mp4;base64,AAAAIGZ0eXBpc29tAAAAAGlzb21pc28ybXA0MQAAAA9tZGF0AAAADm1wNDEAAAAAAAAAAA==";
    el.volume = 0.001;
    el.play().catch(() => {});
    await new Promise((r) => setTimeout(r, 100));

    const dest = ctx.createMediaStreamDestination();
    const out = new Audio();
    out.srcObject = dest.stream;
    out.play().catch(() => {});
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(dest);
    src.start(0);

    unlocked = true;
    console.log("✅ AudioContext fully unlocked (speaker ready)");
  } catch (e) {
    console.warn("⚠️ unlockAudio error", e);
  }
}

/* ============================================================
   🧩 Определение формата (AAC → iOS/Android, OGG → Desktop)
   ============================================================ */
function getAudioExt() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return "m4a";
  return "ogg";
}

/* ============================================================
   📦 Загрузка звуков
   ============================================================ */
export async function loadSound(key, basePath) {
  const ctx = getContext();
  const ext = getAudioExt();
  const url = `${basePath}.${ext}`;
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sounds[key] = audioBuffer;
    console.log(`🎵 Loaded: ${url}`);
    return audioBuffer;
  } catch (err) {
    console.warn(`⚠️ Ошибка загрузки ${url}`, err);
  }
}

/* ============================================================
   ▶️ Проигрывание коротких звуков (из файла)
   ============================================================ */
export function playSound(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
  if (!sounds[key]) return;

  try {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = sounds[key];
    source.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = volume;
    source.start(0);
    return source;
  } catch (e) {
    console.warn("⚠️ playSound error:", e);
  }
}

/* ============================================================
   🎹 Генерация 8-бит-тона (WebAudio)
   ============================================================ */
export function playTone(freq = 440, options = {}) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();

  const {
    type = "square",
    duration = 0.25,
    volume = 0.2,
    tremolo = 0,
    pitchRandom = 0,
    detune = 0,
  } = options;

  try {
    const detuneRange = freq * (pitchRandom / 100);
    const finalFreq = freq + (Math.random() * 2 - 1) * detuneRange;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(finalFreq, ctx.currentTime);
    if (detune) osc.detune.setValueAtTime(detune, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tremolo > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = tremolo;
      lfoGain.gain.value = 0.1 * volume;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      lfo.stop(ctx.currentTime + duration);
    }

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("⚠️ playTone error", e);
  }
}

/* ============================================================
   🔁 Циклическое воспроизведение (луп)
   ============================================================ */
export function playLoop(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
  if (!sounds[key]) return null;

  try {
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
  } catch (e) {
    console.warn("⚠️ playLoop error", e);
  }
}

/* ============================================================
   ⏹ Остановка всех активных звуков
   ============================================================ */
export function stopAllSounds() {
  Object.keys(loops).forEach((k) => {
    try { loops[k].source.stop(); } catch {}
    delete loops[k];
  });
}

/* ============================================================
   ♻️ Перезапуск контекста после сна
   ============================================================ */
function restartContext() {
  try {
    if (context && context.state !== "closed") {
      context.close().then(() => {
        context = new (window.AudioContext || window.webkitAudioContext)();
        unlocked = false;
        console.info("🔁 AudioContext restarted after sleep");
        unlockAudio();
      });
    }
  } catch (e) {
    console.warn("⚠️ restartContext failed:", e);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") restartContext();
  });
}

/* ============================================================
   🎵 Фоновая музыка (Music Layer с fade-in/out)
   ============================================================ */

let musicSource = null;
let musicGain = null;
let currentMusic = null;

export async function playMusic(src, volume = 0.25) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") await ctx.resume();

  try {
    if (currentMusic === src && musicSource) return;
    stopMusic();

    const res = await fetch(src);
    const buf = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(buf);

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    // плавный fade-in
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    musicSource = source;
    musicGain = gain;
    currentMusic = src;
  } catch (err) {
    console.warn("⚠️ playMusic error:", err);
  }
}

export function stopMusic() {
  const ctx = getContext();
  try {
    if (musicGain) {
      // плавный fade-out
      musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => {
        try { musicSource?.stop(); } catch {}
      }, 800);
    } else {
      musicSource?.stop();
    }
  } catch {}
  musicSource = null;
  musicGain = null;
  currentMusic = null;
}
