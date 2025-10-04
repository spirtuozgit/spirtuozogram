// utils/audio.js
let context;
const sounds = {};
const loops = {};
let unlocked = false;

/* ============================================================
   🎧 Создание или получение AudioContext
   ============================================================ */
function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

/* ============================================================
   🔓 Разблокировка звука (рабочая версия для iOS встроенных динамиков)
   ============================================================ */
export async function unlockAudio() {
  const ctx = getContext();
  if (unlocked) return;

  try {
    // 1️⃣ Резюмируем, если контекст приостановлен
    if (ctx.state === "suspended" || ctx.state === "interrupted") {
      await ctx.resume();
    }

    // 2️⃣ Создаём и проигрываем реальный HTMLAudioElement (включает speaker route)
    const el = document.createElement("audio");
    el.src =
      "data:audio/mp4;base64,AAAAIGZ0eXBpc29tAAAAAGlzb21pc28ybXA0MQAAAA9tZGF0AAAADm1wNDEAAAAAAAAAAA==";
    el.volume = 0.001;
    el.play().catch(() => {});
    await new Promise((r) => setTimeout(r, 100));

    // 3️⃣ Привязываем Web Audio к реальному медиа-потоку (для speaker)
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
    console.log("✅ AudioContext fully unlocked (iPhone speaker active)");
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
   ▶️ Проигрывание коротких звуков
   ============================================================ */
export function playSound(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
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

/* ============================================================
   🔁 Циклическое воспроизведение
   ============================================================ */
export function playLoop(key, volume = 1.0) {
  const ctx = getContext();
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
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
   ♻️ Автоматический перезапуск контекста при возврате из сна
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