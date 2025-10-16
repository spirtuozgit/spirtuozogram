"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function IntroScreen({ onFinish, onShowRecords, onExit }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#6eff8c",
        fontFamily: "monospace",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {/* ✖ Кнопка выхода в меню */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "42px",
          height: "42px",
          fontSize: "24px",
          border: "none",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          color: "#6eff8c",
          cursor: "pointer",
          boxShadow: "0 0 6px #6eff8c33",
        }}
        title="Выйти в меню"
      >
        ✖
      </button>

      {/* 🎨 Логотип */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <Image
          src="/ivan-memory/title.png"
          alt="Восстанавливаем цепочку событий"
          width={420}
          height={120}
          style={{
            maxWidth: "80vw",
            height: "auto",
            filter: "drop-shadow(0 0 8px #6eff8c)",
          }}
        />
        <p
          style={{
            marginTop: "12px",
            fontSize: "1.1rem",
            opacity: 0.9,
            letterSpacing: "0.5px",
          }}
        >
          Восстанавливаем цепочку событий
        </p>
      </div>

      {/* ▶️ Кнопка начать */}
      <button
        onClick={onFinish}
        style={{
          background: "#6eff8c",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "12px 28px",
          fontSize: "1.1rem",
          cursor: "pointer",
          marginBottom: "14px",
          boxShadow: "0 0 10px #6eff8c66",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        Начать игру
      </button>

      {/* 👁 Кнопка посмотреть таблицу рекордов */}
      <button
        onClick={onShowRecords}
        style={{
          background: "transparent",
          border: "1px solid #6eff8c",
          color: "#6eff8c",
          borderRadius: "8px",
          padding: "10px 24px",
          fontSize: "1rem",
          cursor: "pointer",
          opacity: 0.85,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.boxShadow = "0 0 8px #6eff8c44";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.85";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Таблица рекордов
      </button>

      {/* ⚡ Подпись */}
      <p
        style={{
          marginTop: "40px",
          fontSize: "0.9rem",
          opacity: 0.5,
          letterSpacing: "0.5px",
        }}
      >
        © Spirtuoz — 2025
      </p>
    </div>
  );
}
