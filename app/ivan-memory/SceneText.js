"use client";
import { useEffect, useState, useRef } from "react";
import { unlockAudio, playTone } from "../../utils/audio";

export default function SceneText({ text, onNext }) {
  const [displayed, setDisplayed] = useState("");
  const [ready, setReady] = useState(false);
  const [showIvan, setShowIvan] = useState(false);
  const [bgm, setBgm] = useState(null);
  const textRef = useRef(0);

  useEffect(() => {
    unlockAudio();

    const bg = new Audio("/ivan-memory/sound/8BitDoodle – MorningJuce_conv.m4a");
    bg.loop = true;
    bg.volume = 0.4;
    bg.play().catch(() => {});
    setBgm(bg);

    setTimeout(() => setShowIvan(true), 200);
    setTimeout(() => startTyping(), 1000);

    return () => {
      bg.pause();
      bg.src = "";
    };
  }, [text]);

  const startTyping = () => {
    // ✅ если text — массив, склеиваем его с переводом строки
    const fullText = Array.isArray(text) ? text.join("\n") : text;
    const chars = fullText.split("");

    const interval = setInterval(() => {
      if (textRef.current >= chars.length) {
        clearInterval(interval);
        setReady(true);
        return;
      }
      const nextChar = chars[textRef.current];
      setDisplayed((prev) => prev + nextChar);
      textRef.current++;

      if (/[а-яА-Яa-zA-Z0-9]/.test(nextChar)) {
        const tone = 440 + (Math.random() * 150 - 75);
        playTone(tone, { type: "square", duration: 0.05, volume: 0.06 });
      }
    }, 75);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        color: "#57ff8a",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
        fontSize: 24,
        whiteSpace: "pre-wrap",
        lineHeight: 1.5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🧔 Иконка Вани */}
      <img
        src="/ivan-memory/ivan_art.png"
        alt="Иван"
        style={{
          width: 160,
          height: "auto",
          marginBottom: 20,
          opacity: showIvan ? 1 : 0,
          transform: showIvan ? "translateY(0)" : "translateY(-30px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
          pointerEvents: "none",
        }}
      />

      {/* 🟩 Текст кат-сцены */}
      <div
        style={{
          maxWidth: 800,
          minHeight: 200,
          opacity: 0.95,
        }}
      >
        {displayed}
        {!ready && <span style={{ opacity: 0.6 }}>▌</span>}
      </div>

      {/* Кнопка ДАЛЕЕ */}
      {ready && (
        <button
          onClick={() => {
            if (bgm) bgm.pause();
            onNext();
          }}
          style={{
            position: "absolute",
            bottom: 180,
            padding: "12px 36px",
            fontSize: 20,
            color: "#57ff8a",
            background: "transparent",
            border: "2px solid #57ff8a",
            borderRadius: 10,
            cursor: "pointer",
            transition: "opacity 0.3s ease, background 0.3s ease",
          }}
        >
          ДАЛЕЕ
        </button>
      )}
    </div>
  );
}
