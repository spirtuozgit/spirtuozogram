"use client";

import { useEffect } from "react";
import { preloadAudio } from "../utils/audio";

const sounds = [
  "/sound/click.mp3",
  "/sound/reset.mp3",
  "/sound/hoof.mp3",
  "/sound/quack.mp3",
  "/sound/hroom.mp3",
  "/sound/pop_1.mp3",
  "/sound/pop_2.mp3",
  "/sound/pop_3.mp3",
];

export default function GlobalPreload() {
  useEffect(() => {
    sounds.forEach((s) => preloadAudio(s));
  }, []);

  return null; // компонент ничего не рендерит
}



