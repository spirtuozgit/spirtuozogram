"use client";
import { useEffect } from "react";
import { unlockAudio, loadSound } from "../utils/audio";

export default function GlobalPreload() {
  useEffect(() => {
    // Разблокируем аудио при первом юзер-жесте
    const handler = () => {
      unlockAudio();
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("click", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("click", handler, { once: true });

    // Загружаем общий звук клика
    loadSound("click", "/common/sound/click.ogg").catch(() =>
      console.warn("Ошибка загрузки click.ogg")
    );
  }, []);

  return null;
}
