"use client";
import { useEffect } from "react";
import { unlockAudio, loadSound } from "../utils/audio";

export default function GlobalPreload() {
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      console.info("🎧 AudioContext activated by user gesture");
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });

    // заранее подгружаем базовые клики
    loadSound("click", "/common/sound/click");
  }, []);

  return null;
}