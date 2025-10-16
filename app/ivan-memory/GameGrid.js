"use client";
import { useMemo, useState, useLayoutEffect } from "react";

export default function GameGrid({
  map = [],
  highlight = null,
  center = null,
  onClick,
  score = 0,
  disabled = false,
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hydrated, setHydrated] = useState(false);

  // ⚙️ Меряем окно до первого paint — чтобы не было «смещения» и черного моргания,
  // и БОЛЬШЕ не выключаем поле.
  useLayoutEffect(() => {
    const measure = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
      if (!hydrated) setHydrated(true);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [hydrated]);

  // 25 позиций сетки 5×5
  const positions = useMemo(() => {
    const arr = [];
    for (let y = -2; y <= 2; y++)
      for (let x = -2; x <= 2; x++) arr.push({ x, y });
    return arr;
  }, []);

  // Плейсхолдер — только до первого измерения
  if (!hydrated) {
    return <div style={{ width: "100vw", height: "100vh", background: "#000" }} />;
  }

  const gap = 8;
  const cube = Math.min(size.w, size.h) / 7;
  const startX = (size.w - (cube * 5 + gap * 4)) / 2;
  const startY = (size.h - (cube * 5 + gap * 4)) / 2;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
        color: "#57ff8a",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      {/* SCORE */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 32,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#57ff8a",
          textShadow: "0 0 12px #57ff8a",
          pointerEvents: "none",
        }}
      >
        Score: {score}
      </div>

      {/* Сетка ячеек */}
      {positions.map((p, i) => {
        const x = p.x + 2;
        const y = p.y + 2;
        const left = startX + x * (cube + gap);
        const top = startY + y * (cube + gap);

        const cell = map[i];                 // ожидаем объект {color, code, name, perc}
        const visible = !!cell;
        const active = highlight === i;
        const bg = visible ? cell.color : "#111";

        return (
          <div
            key={i}
            onClick={() => visible && !disabled && onClick(i)}
            style={{
              position: "absolute",
              left,
              top,
              width: cube,
              height: cube,
              background: bg,
              borderRadius: 10,
              border: "2px solid #000",
              opacity: visible ? (active ? 1 : 0.7) : 0.05,
              boxShadow: active ? `0 0 25px ${bg}` : "none",
              cursor: visible && !disabled ? "pointer" : "default",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              padding: cube * 0.12,
              transition: "opacity 0.2s ease, box-shadow 0.2s ease",
              userSelect: "none",
            }}
          >
            {/* проценты (тонкий шрифт, верхний правый угол) */}
            {visible && (
              <div
                style={{
                  position: "absolute",
                  top: cube * 0.08,
                  right: cube * 0.12,
                  fontSize: cube * 0.13,
                  fontWeight: 400,
                  color: "#000",
                  opacity: 0.8,
                }}
              >
                {typeof cell.perc === "number" ? `${cell.perc}%` : cell.perc}
              </div>
            )}

            {/* код напитка (латиницей) */}
            {visible && (
              <div
                style={{
                  color: "#000",
                  fontWeight: 800,
                  fontSize: cube * 0.22,
                  lineHeight: 1.1,
                  marginBottom: cube * 0.04,
                  textAlign: "left",
                }}
              >
                {cell.code}
              </div>
            )}

            {/* название на русском (чуть меньше) */}
            {visible && (
              <div
                style={{
                  color: "#000",
                  fontWeight: 600,
                  fontSize: cube * 0.14,
                  lineHeight: 1.15,
                  textAlign: "left",
                  opacity: 0.92,
                }}
              >
                {cell.name}
              </div>
            )}
          </div>
        );
      })}

      {/* Центральный «?» */}
      <div
        style={{
          position: "absolute",
          left: startX + 2 * (cube + gap),
          top: startY + 2 * (cube + gap),
          width: cube,
          height: cube,
          borderRadius: 10,
          border: "3px solid #57ff8a",
          background: center ? center : "rgba(87,255,138,0.15)",
          boxShadow: center
            ? `0 0 30px ${center}`
            : "0 0 20px rgba(87,255,138,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#57ff8a",
          fontSize: cube * 0.6,
          fontFamily: '"Press Start 2P", monospace',
          textShadow: "0 0 12px #57ff8a",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        ?
      </div>
    </div>
  );
}
