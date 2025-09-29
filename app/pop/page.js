"use client";
import { useState } from "react";

export default function PopPage() {
  const [clicks, setClicks] = useState(0);
  const [explosions, setExplosions] = useState([]);
  const [disabledBlocks, setDisabledBlocks] = useState(new Set());

  // Размер блока
  const BLOCK_SIZE = 3;

  const handleClick = (e) => {
    // Привязка к сетке
    const x = Math.floor(e.clientX / BLOCK_SIZE) * BLOCK_SIZE;
    const y = Math.floor(e.clientY / BLOCK_SIZE) * BLOCK_SIZE;

    const key = `${x},${y}`;
    if (disabledBlocks.has(key)) return; // блок уже занят

    // Добавляем в "сгоревшие"
    const newDisabled = new Set(disabledBlocks);
    newDisabled.add(key);
    setDisabledBlocks(newDisabled);

    // Счётчик
    const text = Math.random() > 0.5 ? "тык" : "пык";
    setClicks((prev) => prev + 1);

    const id = Date.now();
    setExplosions((prev) => [...prev, { id, x, y, text }]);

    // Удаляем анимацию через 1 сек
    setTimeout(() => {
      setExplosions((prev) => prev.filter((ex) => ex.id !== id));
    }, 1000);

    // 🎵 Рандомный звук
    const sounds = ["/sound/pop_1.mp3", "/sound/pop_2.mp3", "/sound/pop_3.mp3"];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    new Audio(randomSound).play();
  };

  return (
    <div
      className="w-screen h-screen bg-black relative overflow-hidden select-none"
      onClick={handleClick}
    >
      {/* Счётчик */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md">
        {clicks} тыков
      </div>

      {/* Кнопка назад */}
      <button
        className="absolute top-4 right-4 text-white text-2xl bg-white/10 backdrop-blur-md rounded-full px-3 py-1 hover:bg-white/20"
        onClick={() => window.history.back()}
      >
        ✕
      </button>

      {/* Белые блоки 3×3 */}
      {[...disabledBlocks].map((coord, i) => {
        const [px, py] = coord.split(",").map(Number);
        return (
          <div
            key={i}
            className="absolute bg-white"
            style={{ left: px, top: py, width: BLOCK_SIZE + "px", height: BLOCK_SIZE + "px" }}
          />
        );
      })}

      {/* Взрывы */}
      {explosions.map((ex) => (
        <div
          key={ex.id}
          className="absolute"
          style={{ left: ex.x + BLOCK_SIZE / 2, top: ex.y + BLOCK_SIZE / 2 }}
        >
          {/* 4 пикселя разлетаются */}
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel1" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel2" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel3" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel4" />

          {/* Текст */}
          <div className="text-white text-xl font-bold animate-fadeUp">{ex.text}</div>
        </div>
      ))}

      {/* Анимации */}
      <style jsx>{`
        @keyframes fadeUp {
          0% {
            transform: translateY(0px);
            opacity: 1;
          }
          100% {
            transform: translateY(-30px);
            opacity: 0;
          }
        }
        .animate-fadeUp {
          animation: fadeUp 1s ease-out forwards;
        }

        @keyframes pixel1 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(-12px, -12px);
            opacity: 0;
          }
        }
        @keyframes pixel2 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(12px, -12px);
            opacity: 0;
          }
        }
        @keyframes pixel3 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(-12px, 12px);
            opacity: 0;
          }
        }
        @keyframes pixel4 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(12px, 12px);
            opacity: 0;
          }
        }
        .animate-pixel1 {
          animation: pixel1 0.6s ease-out forwards;
        }
        .animate-pixel2 {
          animation: pixel2 0.6s ease-out forwards;
        }
        .animate-pixel3 {
          animation: pixel3 0.6s ease-out forwards;
        }
        .animate-pixel4 {
          animation: pixel4 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
