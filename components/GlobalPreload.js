"use client";
import { useEffect } from "react";
import { preloadAudio, getCtx } from "../utils/audio";

// ✅ полный список всех звуков
const sounds = [
  "/sound/click.ogg",
  "/sound/reset.ogg",
  "/sound/hoof.ogg",
  "/sound/quack.ogg",
  "/sound/hroom.ogg",
  "/sound/pop_1.ogg",
  "/sound/pop_2.ogg",
  "/sound/pop_3.ogg",
  "/sound/typewrite.ogg",
];

export default function GlobalPreload() {
  useEffect(() => {
    // Предзагрузка всех звуков
    sounds.forEach((file) => preloadAudio(file));

    // 🔓 Разблокировка основного AudioContext
    const unlock = () => {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
  }, []);

  return null;
}
