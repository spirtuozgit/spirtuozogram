/**
 * Универсальная функция для получения правильного пути
 * учитывает NEXT_PUBLIC_BASE_PATH (нужен для GitHub Pages)
 */
function resolvePath(path) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/${path.replace(/^\/+/, "")}`;
}

/**
 * Предзагрузка звука (без воспроизведения)
 * @param {string} path - путь к файлу относительно public (например "sound/click.mp3")
 */
export function preloadAudio(path) {
  return new Promise((resolve) => {
    const src = resolvePath(path);
    const a = new Audio(src);

    a.addEventListener("canplaythrough", () => resolve());
    a.addEventListener("error", () => {
      console.error("Ошибка предзагрузки:", src);
      resolve();
    });

    a.load();
  });
}

/**
 * Воспроизведение звука
 * @param {string} path - путь к файлу относительно public (например "sound/click.mp3")
 */
export function playAudio(path) {
  return new Promise((resolve) => {
    const src = resolvePath(path);
    const a = new Audio(src);

    a.addEventListener("canplaythrough", () => {
      a.play().catch((err) => console.error("Ошибка воспроизведения:", err));
      resolve();
    });

    a.addEventListener("error", () => {
      console.error("Ошибка загрузки:", src);
      resolve();
    });

    a.load();
  });
}
