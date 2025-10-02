// utils/audio.js

// Хранилища
const sounds = {};       // загруженные оригинальные звуки
const loops = {};        // активные циклы (playLoop)

/* === Загрузка звука === */
export async function loadSound(key, url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.oncanplaythrough = () => {
      sounds[key] = audio;
      resolve(audio);
    };
    audio.onerror = reject;
  });
}

/* === Разовое воспроизведение === */
export function playSound(key, volume = 1.0) {
  if (!sounds[key]) return;
  // делаем клон, чтобы можно было накладывать несколько звуков
  const clone = sounds[key].cloneNode();
  clone.volume = volume;
  clone.play().catch(() => {});
  return clone;
}

/* === Циклическое воспроизведение === */
export function playLoop(key, volume = 1.0) {
  if (!sounds[key]) return null;

  const audio = sounds[key].cloneNode();
  audio.volume = volume;
  audio.loop = true;
  audio.play().catch(() => {});

  // сохраняем активный цикл
  loops[key] = audio;

  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      delete loops[key];
    },
  };
}

/* === Универсально: стопнуть все звуки === */
export function stopAllSounds() {
  // Остановим все циклы
  Object.values(loops).forEach((a) => {
    if (a && typeof a.pause === "function") {
      a.pause();
      a.currentTime = 0;
    }
  });
  for (const k in loops) delete loops[k];

  // Сбросим оригиналы (если кто-то случайно их воспроизвёл напрямую)
  Object.values(sounds).forEach((a) => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  });
}
