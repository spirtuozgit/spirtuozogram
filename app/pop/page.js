"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { loadSound, playSound, stopAllSounds, unlockAudio } from "../../utils/audio";
import { MICROBE_APPEAR_PHRASES, MICROBE_CLICK_PHRASES, CLICK_TEXTS } from "./data";

export default function PopPage() {
  const [clicks, setClicks] = useState(0);
  const [explosions, setExplosions] = useState([]);
  const [disabledBlocks, setDisabledBlocks] = useState([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [microbeRun, setMicrobeRun] = useState(null);
  const [selectedColor, setSelectedColor] = useState("white");

  const containerRef = useRef(null);
  const BLOCK_SIZE = 6;
  const allColors = ["white", "red", "yellow", "lime", "cyan", "magenta", "orange", "blue"];

  /* === Предзагрузка ассетов === */
  useEffect(() => {
    const assets = [
      loadSound("pop1", "/pop/sound/pop_1"),
      loadSound("pop2", "/pop/sound/pop_2"),
      loadSound("pop3", "/pop/sound/pop_3"),
      loadSound("oops", "/pop/sound/oops"),
      new Promise((resolve) => {
        const img = new Image();
        img.src = "/pop/sprites/microbe_frame_1.svg";
        img.onload = resolve;
        img.onerror = resolve;
      }),
      new Promise((resolve) => {
        const img = new Image();
        img.src = "/pop/sprites/microbe_frame_2.svg";
        img.onload = resolve;
        img.onerror = resolve;
      }),
    ];

    let loaded = 0;
    assets.forEach((p) =>
      p.then(() => {
        loaded++;
        setProgress(Math.floor((loaded / assets.length) * 100));
      })
    );

    Promise.all(assets).then(() => setReady(true));
    return () => stopAllSounds();
  }, []);

  /* === Разблокировка звука на iOS === */
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });
  }, []);

  /* === Анимация микроба === */
  const [microFrame, setMicroFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMicroFrame((f) => (f === 0 ? 1 : 0));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  /* === Обработка клика по экрану === */
  const handlePointerDown = (e) => {
    if (!ready) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    const x = Math.floor((clientX - rect.left) / BLOCK_SIZE) * BLOCK_SIZE;
    const y = Math.floor((clientY - rect.top) / BLOCK_SIZE) * BLOCK_SIZE;

    // запрет на повторное размещение еды
    if (disabledBlocks.some((b) => b.x === x && b.y === y)) return;

    const id = Date.now();
    setDisabledBlocks((prev) => [...prev, { x, y, color: selectedColor }]);
    setClicks((prev) => prev + 1);

    // создаём эффект взрыва
    setExplosions((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setExplosions((prev) => prev.filter((ex) => ex.id !== id)), 1000);

    // звук клика
    const popSounds = ["pop1", "pop2", "pop3"];
    playSound(popSounds[Math.floor(Math.random() * popSounds.length)]);
  };

  /* === Активация микроба каждые 100 кликов === */
  useEffect(() => {
    if (clicks > 0 && clicks % 100 === 0) {
      const startY = Math.random() * (window.innerHeight - 100) + 50;
      const endY = Math.random() * (window.innerHeight - 100) + 50;
      const fromLeft = Math.random() > 0.5;
      const phrase =
        MICROBE_APPEAR_PHRASES[Math.floor(Math.random() * MICROBE_APPEAR_PHRASES.length)];
      setMicrobeRun({
        id: Date.now(),
        x: fromLeft ? -100 : window.innerWidth + 100,
        y: startY,
        endX: fromLeft ? window.innerWidth + 100 : -100,
        endY,
        startTime: performance.now(),
        phrase,
      });
    }
  }, [clicks]);

  /* === Анимация движения микроба === */
  useEffect(() => {
    if (!microbeRun) return;
    let frame;
    const speed = 0.08;
    const runId = microbeRun.id;

    const animate = (time) => {
      const progress = (time - microbeRun.startTime) * speed;
      const totalDist = Math.hypot(microbeRun.endX - microbeRun.x, microbeRun.endY - microbeRun.y);
      const t = Math.min(progress / totalDist, 1);
      const curX = microbeRun.x + (microbeRun.endX - microbeRun.x) * t;
      const curY = microbeRun.y + (microbeRun.endY - microbeRun.y) * t + Math.sin(t * Math.PI * 4) * 30;
      setMicrobeRun((m) => (m && m.id === runId ? { ...m, curX, curY } : m));
      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setMicrobeRun(null);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [microbeRun]);

  if (!ready) return <Loader text="Загружаем..." progress={progress} />;

  /* === Расчёт доступных цветов === */
  const unlockedColors = allColors.map((color, idx) => {
    if (idx === 0) return true;
    if (idx === 1 && clicks >= 50) return true;
    if (idx === 2 && clicks >= 200) return true;
    if (idx === 3 && clicks >= 300) return true;
    if (idx === 4 && clicks >= 400) return true;
    if (idx >= 5 && clicks >= 400 + (idx - 4) * 100) return true;
    return false;
  });

  return (
    <div
      ref={containerRef}
      className="w-screen h-[100dvh] bg-black relative overflow-hidden select-none"
      onPointerDown={handlePointerDown}
    >
      {/* Кнопка звука */}
      <button
        onClick={() => unlockAudio()}
        className="fixed top-4 left-6 text-2xl sm:text-3xl font-bold text-white hover:text-green-400 transition z-50"
      >
        🔊
      </button>

      {/* Кнопка выхода */}
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-6 text-2xl sm:text-3xl font-bold text-white hover:text-red-400 transition z-50"
      >
        ✕
      </Link>

      {/* Счётчик */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md z-50">
        {clicks} тыков
      </div>

      {/* Еда / “пыки” */}
      {disabledBlocks.map((b) => (
        <div
          key={`${b.x}-${b.y}`}
          className="absolute rounded-[2px] animate-food"
          style={{
            left: b.x,
            top: b.y,
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            backgroundColor: b.color,
          }}
        />
      ))}

      {/* Взрывы */}
      {explosions.map((ex) => (
        <div
          key={ex.id}
          className="absolute"
          style={{
            left: ex.x + BLOCK_SIZE / 2,
            top: ex.y + BLOCK_SIZE / 2,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel1" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel2" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel3" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel4" />
        </div>
      ))}

      {/* Микроб */}
      {microbeRun && (
        <div
          className="absolute z-40 flex flex-col items-center"
          style={{
            left: microbeRun.curX,
            top: microbeRun.curY,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={() => {
            playSound("oops");
            setMicrobeRun(null);
          }}
        >
          <div className="relative mb-2 max-w-[180px] px-3 py-2 bg-white rounded-xl shadow-md border border-black text-black text-sm font-bold text-center">
            {microbeRun.phrase}
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </div>
          <img
            src={`/pop/sprites/microbe_frame_${microFrame + 1}.svg`}
            alt="microbe"
            className="w-16 h-16"
          />
        </div>
      )}

      {/* Палитра цветов */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {allColors.map((color, idx) => (
          <button
            key={color}
            disabled={!unlockedColors[idx]}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor === color ? "border-white scale-110" : "border-transparent"
            } transition transform ${
              unlockedColors[idx] ? "opacity-100" : "opacity-30 cursor-not-allowed"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

      {/* Анимации */}
      <style jsx>{`
        @keyframes foodIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-food {
          animation: foodIn 0.2s ease-out;
        }
        @keyframes pixel1 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(0, -12px);
            opacity: 0;
          }
        }
        @keyframes pixel2 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(0, 12px);
            opacity: 0;
          }
        }
        @keyframes pixel3 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(-12px, 0);
            opacity: 0;
          }
        }
        @keyframes pixel4 {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(12px, 0);
            opacity: 0;
          }
        }
        .animate-pixel1 {
          animation: pixel1 0.5s ease-out forwards;
        }
        .animate-pixel2 {
          animation: pixel2 0.5s ease-out forwards;
        }
        .animate-pixel3 {
          animation: pixel3 0.5s ease-out forwards;
        }
        .animate-pixel4 {
          animation: pixel4 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
