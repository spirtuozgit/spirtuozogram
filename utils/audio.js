// utils/audio.js
let context;
const sounds = {};
const loops = {};
let unlocked = false;

/* ============================================================
   🧩 Получаем или создаём AudioContext
   ============================================================ */
function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

/* ============================================================
   🔓 Разблокировка звука (фикс iOS встроенных динамиков)
   ============================================================ */
export function unlockAudio() {
  const ctx = getContext();
  if (unlocked) return;

  try {
    // 1️⃣ Активируем контекст, если приостановлен
    if (ctx.state === "suspended" || ctx.state === "interrupted") {
      ctx.resume();
    }

    // 2️⃣ Создаём "пустой" звук, чтобы прогреть AudioContext
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // 3️⃣ Основной хак: создаём HTMLAudioElement с "тишиной" (AAC)
    const dummy = document.createElement("audio");
    dummy.src =
      "data:audio/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDFtcDQyaXNvbQAAABRkaXNvAAAAAAAAAAEAAQABAAAAAAA=";
    dummy.volume = 0.001;
    dummy.play()
      .then(() => {
        dummy.pause();
        dummy.remove();
        console.info("🔊 iOS speaker route activated");
      })
      .catch(() => {});

    unlocked = true;
    console.log("✅ Audio unlocked (speaker ready on iPhone)");
  } catch (e) {
    console.warn("⚠️ unlockAudio error", e);
  }
}

/* ============================================================
   🎧 Определяем расширение (iOS/Android → m4a, остальные → ogg)
   ============================================================ */
function getAudioExt() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return "m4a";
  return "ogg";
}

/* ============================================================
   📦 Загрузка звука в буфер
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
   ▶️ Воспроизведение коротких звуков
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
   🔁 Воспроизведение зацикленного звука
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
   ⏹ Остановка всех звуков
   ============================================================ */
export function stopAllSounds() {
  Object.keys(loops).forEach((k) => {
    try {
      loops[k].source.stop();
    } catch {}
    delete loops[k];
  });
}

/* ============================================================
   ♻️ Перезапуск контекста при смене вывода / возврате вкладки
   ============================================================ */
function restartContext() {
  try {
    if (context && context.state !== "closed") {
      context.close().then(() => {
        context = new (window.AudioContext || window.webkitAudioContext)();
        unlocked = false;
        console.info("🔁 AudioContext restarted (output changed)");
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