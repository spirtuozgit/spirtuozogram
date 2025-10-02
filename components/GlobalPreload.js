"use client";
import { useEffect, useState } from "react";
import { preloadAudio, getCtx } from "../utils/audio";

// список звуков
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

// проверка iOS
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function GlobalPreload() {
  const [needUnlock, setNeedUnlock] = useState(isIOS());

  useEffect(() => {
    // предзагружаем все звуки
    sounds.forEach((file) => preloadAudio(file));

    if (!isIOS()) {
      // для не-iOS — стандартный unlock
      const unlock = () => {
        const ctx = getCtx();
        if (ctx.state === "suspended") ctx.resume();

        // пустой звук для активации
        const src = ctx.createBufferSource();
        src.buffer = ctx.createBuffer(1, 1, 22050);
        src.connect(ctx.destination);
        src.start(0);

        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("touchend", unlock);
      };

      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("touchend", unlock, { once: true });

      return () => {
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("touchend", unlock);
      };
    }
  }, []);

  const handleUnlock = () => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    // пустой звук для iOS
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination);
    src.start(0);

    setNeedUnlock(false); // скрываем кнопку
  };

  return (
    <>
      {needUnlock && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={handleUnlock}
        >
          <button
            style={{
              fontSize: "20px",
              padding: "16px 24px",
              borderRadius: "12px",
              border: "none",
              background: "#4caf50",
              color: "#fff",
            }}
          >
            🔊 Включить звук
          </button>
        </div>
      )}
    </>
  );
}
