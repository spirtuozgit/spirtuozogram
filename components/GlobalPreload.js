"use client";

import { useEffect } from "react";
import { preloadAudio } from "../utils/audio";

// ✅ Все звуки из public/sound/
const sounds = [
  "click.mp3",
  "reset.mp3",
  "hoof.mp3",
  "quack.mp3",
  "hroom.mp3",
  "pop_1.mp3",
  "pop_2.mp3",
  "pop_3.mp3",
];

export default function GlobalPreload() {
  useEffect(() => {
    sounds.forEach((file) => preloadAudio(`/sound/${file}`));
  }, []);

  return null; // ничего не рендерим
}
