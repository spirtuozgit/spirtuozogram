"use client";
import { useEffect, useState } from "react";
import { loadSound } from "../utils/audio";

// список звуков для предзагрузки
const sounds = {
  click: "/sound/click.ogg",
  reset: "/sound/reset.ogg",
  quack: "/sound/quack.ogg",
  hroom: "/sound/hroom.ogg",
  pop1: "/sound/pop_1.ogg",
  pop2: "/sound/pop_2.ogg",
  pop3: "/sound/pop_3.ogg",
  typewrite: "/sound/typewrite.ogg",
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function GlobalPreload() {
  const [needUnlock, setNeedUnlock] = useState(isIOS());

  useEffect(() => {
    // предзагружаем все звуки через единый audio.js
    Object.entries(sounds).forEach(([name, url]) => {
      loadSound(name, url).catch((e) =>
        console.warn(`Не удалось загрузить звук ${name}:`, e)
      );
    });
  }, []);

  const handleUnlock = async () => {
    // простая разблокировка — initAudio внутри loadSound/playSound сработает
    setNeedUnlock(false);
  };

  return needUnlock ? (
    <div
      className="fixed inset-0 bg-black/80 text-white flex items-center justify-center z-[9999]"
      onClick={handleUnlock}
    >
      <button className="px-6 py-4 bg-green-600 rounded-xl text-lg">
        🔊 Включить звук
      </button>
    </div>
  ) : null;
}
