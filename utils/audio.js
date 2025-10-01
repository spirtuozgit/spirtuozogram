// utils/audio.js

// Кеш для загруженных звуков
const audioCache = {};

/**
 * Подготовка пути
 */
function resolvePath(path) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/${path.replace(/^\/+/, "")}`;
}

/**
 * Предзагрузка и кеширование звука
 * @param {string} path - путь к файлу (например "/sound/click.mp3")
 */
export function preloadAudio(path) {
  return new Promise((resolve) => {
    const src = resolvePath(path);
    if (audioCache[src]) return resolve(); // уже есть в кеше

    const a = new Audio(src);
    a.preload = "auto";

    a.addEventListener("canplaythrough", () => resolve(), { once: true });
    a.addEventListener("error", () => {
      console.error("Ошибка предзагрузки:", src);
      resolve();
    });

    audioCache[src] = a;
    a.load();
  });
}

/**
 * Воспроизведение звука без задержки
 * @param {string} path - путь к файлу (например "/sound/click.mp3")
 */
export function playAudio(path) {
  return new Promise((resolve) => {
    const src = resolvePath(path);
    const a = audioCache[src];

    if (!a) {
      console.warn("Звук не был предзагружен:", src);
      return resolve();
    }

    // Клонируем, чтобы можно было играть один и тот же звук несколько раз подряд
    const clone = a.cloneNode(true);
    clone.play().catch((err) => console.error("Ошибка воспроизведения:", err));
    resolve();
  });
}
