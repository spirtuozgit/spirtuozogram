"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { playSound, loadSound, stopAllSounds, unlockAudio } from "../../utils/audio";
import { CELL, ANIMATION_SPEED, MOVE_SPEED, EAT_RADIUS, PHRASES } from "./data";

export default function MicrobeGame() {
  const [food, setFood] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [score, setScore] = useState(0);
  const [microbe, setMicrobe] = useState({ x: 128, y: 128 });
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [oopsShake, setOopsShake] = useState(false);

  const frames = [
    "/microbe/sprites/microbe_frame_1.svg",
    "/microbe/sprites/microbe_frame_2.svg",
  ];

  /* === Предзагрузка ассетов с прогрессом === */
  useEffect(() => {
    const assets = [
      ...frames.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          })
      ),
      // ✅ теперь без расширения: выберет .m4a на iOS/Android, .ogg на остальных
      loadSound("hroom", "/microbe/sound/hroom"),
      loadSound("oops", "/microbe/sound/oops"),
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

  /* === Разблокировка аудио при первом касании === */
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });
  }, []);

  /* === Анимация кадров === */
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, ANIMATION_SPEED);
    return () => clearInterval(id);
  }, [ready]);

  /* === Клик / Тап === */
  const handlePointerDown = (e) => {
    if (!ready) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    const microbeHalf = 32;
    const inMicrobe =
      clientX >= microbe.x - microbeHalf &&
      clientX <= microbe.x + microbeHalf &&
      clientY >= microbe.y - microbeHalf &&
      clientY <= microbe.y + microbeHalf;

    if (inMicrobe) {
      playSound("oops");
      setOopsShake(true);
      setTimeout(() => setOopsShake(false), 400);
      return;
    }

    // создаём еду (не дублируем)
    const gx = Math.floor((clientX - rect.left) / CELL) * CELL;
    const gy = Math.floor((clientY - rect.top) / CELL) * CELL;

    if (food.some((f) => f.x === gx && f.y === gy && !f.eaten)) return;

    const id = Date.now();
    setFood((prev) => [...prev, { id, x: gx, y: gy, eaten: false }]);
    setExplosions((prev) => [...prev, { id, x: gx, y: gy }]);
    setTimeout(() => setExplosions((prev) => prev.filter((ex) => ex.id !== id)), 400);
  };

  /* === Движение и поедание === */
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      if (food.length === 0) return;

      setMicrobe((prev) => {
        let { x, y } = prev;

        const nearest = food.reduce((a, b) => {
          const da = Math.hypot(x - a.x, y - a.y);
          const db = Math.hypot(x - b.x, y - b.y);
          return da < db ? a : b;
        });

        const dist = Math.hypot(x - nearest.x, y - nearest.y);
        const speed = Math.max(
          MOVE_SPEED * 0.5,
          Math.min(MOVE_SPEED + dist / 80, MOVE_SPEED * 3)
        );

        const angle = Math.atan2(nearest.y - y, nearest.x - x);
        const t = Date.now() / 300;
        const curve = Math.sin(t) * 0.5;
        const curveAngle = angle + curve;

        x += Math.cos(curveAngle) * speed;
        y += Math.sin(curveAngle) * speed;

        // === Поедание ===
        if (dist < EAT_RADIUS && !nearest.eaten) {
          nearest.eaten = true;
          setFood((prevFood) => prevFood.filter((f) => f.id !== nearest.id));
          setScore((s) => s + 1);
          playSound("hroom");

          const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
          const bubbleId = `${Date.now()}-${Math.random()}`;
          const baseRadius = 60;
          let offsetX, offsetY;
          let tries = 0;
          let ok = false;

          do {
            const radius = baseRadius + Math.random() * 30;
            const a = Math.random() * 2 * Math.PI;
            offsetX = Math.cos(a) * radius;
            offsetY = Math.sin(a) * radius - 20;
            ok = !bubbles.some(
              (b) => Math.hypot(b.offsetX - offsetX, b.offsetY - offsetY) < 50
            );
            tries++;
          } while (!ok && tries < 40);

          setBubbles((prev) => [
            ...prev,
            { id: bubbleId, text: phrase, offsetX, offsetY },
          ]);
          setTimeout(
            () => setBubbles((prev) => prev.filter((b) => b.id !== bubbleId)),
            2000
          );
        }

        return { x, y };
      });
    }, 60);

    return () => clearInterval(interval);
  }, [food, bubbles, ready]);

  /* === Loader === */
  if (!ready) return <Loader text="Загрузка микроба..." progress={progress} />;

  return (
    <div
      className="w-screen min-h-[100dvh] bg-black relative overflow-hidden select-none touch-none"
      onPointerDown={handlePointerDown}
    >
      {/* Счёт */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md z-50">
        {score}
      </div>

      {/* Кнопка звука */}
      <button
        onClick={() => unlockAudio()}
        className="fixed top-4 left-6 text-2xl sm:text-3xl font-bold text-white hover:text-green-400 transition z-50"
      >
        🔊
      </button>

      {/* Назад */}
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition z-50"
      >
        ✕
      </Link>

      {/* Еда */}
      {food.map((f) => (
        <div
          key={f.id}
          className="absolute bg-white animate-food"
          style={{ left: f.x, top: f.y, width: CELL, height: CELL }}
        />
      ))}

      {/* Взрывы */}
      {explosions.map((ex) => (
        <div
          key={ex.id}
          className="absolute"
          style={{
            left: ex.x + CELL / 2,
            top: ex.y + CELL / 2,
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
      <div
        className={`absolute ${oopsShake ? "animate-shake" : ""}`}
        style={{
          left: microbe.x,
          top: microbe.y,
          transform: "translate(-50%, -50%)",
          width: 64,
          height: 64,
        }}
      >
        <img src={frames[frame]} alt="microbe" className="w-full h-full" />
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute text-white font-bold animate-fadeUp"
            style={{
              left: `calc(50% + ${b.offsetX}px)`,
              top: `calc(50% + ${b.offsetY}px)`,
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {b.text}
          </div>
        ))}
      </div>

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>

      {/* Анимации */}
      <style jsx>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -70%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -90%) scale(1.1); }
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

        @keyframes foodIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-food { animation: foodIn 0.2s ease-out; }

        @keyframes pixel1 { from { transform: translate(0,0); opacity:1; } to { transform: translate(0,-12px); opacity:0; } }
        @keyframes pixel2 { from { transform: translate(0,0); opacity:1; } to { transform: translate(0,12px); opacity:0; } }
        @keyframes pixel3 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-12px,0); opacity:0; } }
        @keyframes pixel4 { from { transform: translate(0,0); opacity:1; } to { transform: translate(12px,0); opacity:0; } }
        .animate-pixel1 { animation: pixel1 0.5s ease-out forwards; }
        .animate-pixel2 { animation: pixel2 0.5s ease-out forwards; }
        .animate-pixel3 { animation: pixel3 0.5s ease-out forwards; }
        .animate-pixel4 { animation: pixel4 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
