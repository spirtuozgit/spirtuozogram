"use client";
import { useEffect } from "react";
import { unlockAudio, loadSound } from "../utils/audio";

export default function GlobalPreload() {
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });

    // загружаем звук клика
    loadSound("click", "/common/sound/click");
  }, []);

    return null;
}
