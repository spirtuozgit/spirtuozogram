"use client";
import { useEffect } from "react";
import { loadSound } from "../utils/audio";

export default function GlobalPreload() {
  useEffect(() => {
    // Общий клик для всех кнопок
    loadSound("click", "/common/sound/click.ogg").catch(() =>
      console.warn("Ошибка загрузки click.ogg")
    );
  }, []);

  return null;
}
