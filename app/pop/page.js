"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { loadSound, playSound, stopAllSounds } from "../../utils/audio";
import { 
  MICROBE_APPEAR_PHRASES, 
  MICROBE_CLICK_PHRASES, 
  CLICK_TEXTS, 
  PRAISE_MESSAGES 
} from "./data";

function Microbe({ x, y, phrase, onClick }) {
  const frames = ["/pop/sprites/microbe_frame_1.svg", "/pop/sprites/microbe_frame_2.svg"];
  const [frame, setFrame] = useState(0);
  const [scale, setScale] = useState(1);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setScale(1.2);
    setShake(true);
    setTimeout(() => {
      setScale(1);
      setShake(false);
    }, 400);

    playSound("oops"); // 👈 звук только при тапе
    onClick();
  };

  return (
    <div
      className={`absolute z-40 flex flex-col items-center transition-transform duration-150 ${shake ? "animate-shake" : ""}`}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      onPointerDown={handleClick}
    >
      <div className="relative mb-2 max-w-[180px] px-3 py-2 bg-white rounded-xl shadow-md border border-black text-black text-sm font-bold text-center">
        {phrase}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
      </div>
      <img src={frames[frame]} alt="microbe" className="w-16 h-16" />
    </div>
  );
}

export default function PopPage() {
  const [clicks, setClicks] = useState(0);
  const [explosions, setExplosions] = useState([]);
  const [disabledBlocks, setDisabledBlocks] = useState([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const [microbeRun, setMicrobeRun] = useState(null);
  const [praise, setPraise] = useState(null);
  const [selectedColor, setSelectedColor] = useState("white");

  const containerRef = useRef(null);

  const BLOCK_SIZE = 6;
  const allColors = ["white", "red", "yellow", "lime", "cyan", "magenta", "orange", "blue"];

  /* === Предзагрузка ассетов с процентами === */
  useEffect(() => {
    const assets = [
      loadSound("pop1", "/pop/sound/pop_1.ogg"),
      loadSound("pop2", "/pop/sound/pop_2.ogg"),
      loadSound("pop3", "/pop/sound/pop_3.ogg"),
      loadSound("oops", "/pop/sound/oops.ogg"), // 👈 единственный звук микроба
      ...["/pop/sprites/microbe_frame_1.svg", "/pop/sprites/microbe_frame_2.svg"].map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          })
      ),
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

  /* === Запуск микроба каждые 100 кликов (без звука) === */
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

  /* === Анимация движения микроба + поедание еды === */
  useEffect(() => {
    if (!microbeRun) return;
    const runId = microbeRun.id;
    let frame;

    const speed = 0.08;
    const animate = (time) => {
      const progress = (time - microbeRun.startTime) * speed;
      const totalDist = Math.hypot(
        microbeRun.endX - microbeRun.x,
        microbeRun.endY - microbeRun.y
      );
      const t = Math.min(progress / totalDist, 1);

      const curX = microbeRun.x + (microbeRun.endX - microbeRun.x) * t;
      const baseY = microbeRun.y + (microbeRun.endY - microbeRun.y) * t;
      const curY = baseY + Math.sin(t * Math.PI * 4) * 30;

      setDisabledBlocks((prev) =>
        prev.filter(
          (b) =>
            !(
              b.x >= curX - 5 * BLOCK_SIZE &&
              b.x <= curX + 5 * BLOCK_SIZE &&
              b.y >= curY - 5 * BLOCK_SIZE &&
              b.y <= curY + 5 * BLOCK_SIZE
            )
        )
      );

      setMicrobeRun((m) =>
        m && m.id === runId ? { ...m, curX, curY } : m
      );

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setMicrobeRun(null);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [microbeRun]);

  /* === Похвала каждые 50 кликов === */
  useEffect(() => {
    if (clicks > 0 && clicks % 50 === 0) {
      setPraise(PRAISE_MESSAGES(clicks)[0]);
      setTimeout(() => setPraise(null), 2000);
    }
  }, [clicks]);

  /* === Клик / тап по полю === */
  const handleClick = (e) => {
    if (!containerRef.current || !ready) return;
    const rect = containerRef.current.getBoundingClientRect();

    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    const x = Math.floor((clientX - rect.left) / BLOCK_SIZE) * BLOCK_SIZE;
    const y = Math.floor((clientY - rect.top) / BLOCK_SIZE) * BLOCK_SIZE;

    if (disabledBlocks.some((b) => b.x === x && b.y === y)) return;

    setDisabledBlocks((prev) => [...prev, { x, y, color: selectedColor }]);
    setClicks((prev) => prev + 1);

    const id = Date.now();
    const text = CLICK_TEXTS[Math.floor(Math.random() * CLICK_TEXTS.length)];
    setExplosions((prev) => [...prev, { id, x, y, text }]);
    setTimeout(() => setExplosions((prev) => prev.filter((ex) => ex.id !== id)), 1000);

    const soundNames = ["pop1", "pop2", "pop3"];
    const random = soundNames[Math.floor(Math.random() * soundNames.length)];
    playSound(random);
  };

  /* === Loader === */
  if (!ready) return <Loader text="Загружаем тыки и пыки..." progress={progress} />;

  /* === Открытые цвета === */
  const unlockedColors = allColors.map((color, idx) => {
    if (idx === 0) return true;
    if (idx === 1 && clicks >= 50) return true;
    if (idx === 2 && clicks >= 200) return true;
    if (idx === 3 && clicks >= 300) return true;
    if (idx === 4 && clicks >= 400) return true;
    if (idx >= 5 && clicks >= (400 + (idx - 4) * 100)) return true;
    return false;
  });

  return (
    <div
      ref={containerRef}
      className="w-screen h-[100dvh] bg-black relative overflow-hidden select-none"
      onPointerDown={handleClick}
    >
      {/* Кнопка закрытия */}
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

      {/* Похвала */}
      {praise && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 text-2xl font-bold animate-fadeUp z-50">
          {praise}
        </div>
      )}

      {/* Точки (еды) */}
      {disabledBlocks.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: b.x,
            top: b.y,
            width: BLOCK_SIZE + "px",
            height: BLOCK_SIZE + "px",
            backgroundColor: b.color,
          }}
        />
      ))}

      {/* Взрывы */}
      {explosions.map((ex) => (
        <div
          key={ex.id}
          className="absolute"
          style={{ left: ex.x + BLOCK_SIZE / 2, top: ex.y + BLOCK_SIZE / 2 }}
        >
          <div className="absolute w-[4px] h-[4px] animate-pixel1" style={{ backgroundColor: selectedColor }} />
          <div className="absolute w-[4px] h-[4px] animate-pixel2" style={{ backgroundColor: selectedColor }} />
          <div className="absolute w-[4px] h-[4px] animate-pixel3" style={{ backgroundColor: selectedColor }} />
          <div className="absolute w-[4px] h-[4px] animate-pixel4" style={{ backgroundColor: selectedColor }} />
          <div className="text-white text-xl font-bold animate-fadeUp">{ex.text}</div>
        </div>
      ))}

      {/* Микроб */}
      {microbeRun && (
        <Microbe
          x={microbeRun.curX}
          y={microbeRun.curY}
          phrase={microbeRun.phrase}
          onClick={() => {
            const newPhrase =
              MICROBE_CLICK_PHRASES[Math.floor(Math.random() * MICROBE_CLICK_PHRASES.length)];
            setMicrobeRun((m) => m && { ...m, phrase: newPhrase });
          }}
        />
      )}

      {/* Палитра */}
      <div className="fixed bottom-12 left-0 w-full flex justify-center gap-2 z-50">
        {allColors.map((color, idx) => {
          const unlocked = unlockedColors[idx];
          return (
            <div
              key={color}
              onPointerDown={() => unlocked && setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 cursor-pointer transition ${
                unlocked
                  ? selectedColor === color
                    ? "border-white scale-110"
                    : "border-gray-400 opacity-80 hover:scale-110"
                  : "bg-gray-700 border-gray-500 opacity-40 cursor-not-allowed flex items-center justify-center"
              }`}
              style={{ backgroundColor: unlocked ? color : undefined }}
            >
              {!unlocked && "🔒"}
            </div>
          );
        })}
      </div>

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .animate-fadeUp { animation: fadeUp 2s ease-out forwards; }

        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          20% { transform: translate(-50%, -50%) rotate(-10deg) scale(1.1); }
          40% { transform: translate(-50%, -50%) rotate(10deg) scale(1.1); }
          60% { transform: translate(-50%, -50%) rotate(-6deg) scale(1.05); }
          80% { transform: translate(-50%, -50%) rotate(6deg) scale(1.05); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }

        @keyframes pixel1 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-16px,-16px); opacity:0; } }
        @keyframes pixel2 { from { transform: translate(0,0); opacity:1; } to { transform: translate(16px,-16px); opacity:0; } }
        @keyframes pixel3 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-16px,16px); opacity:0; } }
        @keyframes pixel4 { from { transform: translate(0,0); opacity:1; } to { transform: translate(16px,16px); opacity:0; } }

        .animate-pixel1 { animation: pixel1 0.6s ease-out forwards; }
        .animate-pixel2 { animation: pixel2 0.6s ease-out forwards; }
        .animate-pixel3 { animation: pixel3 0.6s ease-out forwards; }
        .animate-pixel4 { animation: pixel4 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
