"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";

/* === ПАРАМЕТРЫ === */
const CELL = 4;
const ANIMATION_SPEED = 400;
const MOVE_SPEED = 4;
const EAT_RADIUS = 12;

/* === АУДИО КЭШ === */
const audioCache = {};
function preloadAudio(src) {
  return new Promise((resolve) => {
    if (audioCache[src]) return resolve();
    const a = new Audio(src);
    a.preload = "auto";
    a.addEventListener("canplaythrough", () => {
      audioCache[src] = a;
      resolve();
    });
    a.addEventListener("error", resolve);
  });
}
function playSound(src) {
  const base = audioCache[src];
  const a = base ? base.cloneNode(true) : new Audio(src);
  a.play().catch(() => {});
}

export default function MicrobeGame() {
  const [food, setFood] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [score, setScore] = useState(0);
  const [microbe, setMicrobe] = useState({ x: 128, y: 128 });
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);

  const [phrases, setPhrases] = useState([]);
  const [bubbles, setBubbles] = useState([]);

  const frames = ["/sprites/microbe_frame_1.svg", "/sprites/microbe_frame_2.svg"];

  /* === Загрузка звуков и фраз === */
  useEffect(() => {
    const load = async () => {
      const sounds = ["/sound/hroom.mp3"];
      await Promise.all(sounds.map(preloadAudio));

      try {
        const res = await fetch("/data/phrases.json");
        const json = await res.json();
        setPhrases(json);
      } catch (err) {
        console.error("Ошибка загрузки фраз:", err);
      }

      setDone(true);
    };
    load();
  }, []);

  /* === Анимация кадров === */
  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, ANIMATION_SPEED);
    return () => clearInterval(id);
  }, []);

  /* === Клик → еда === */
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const gx = Math.floor((e.clientX - rect.left) / CELL) * CELL;
    const gy = Math.floor((e.clientY - rect.top) / CELL) * CELL;

    const id = Date.now();
    setFood((prev) => [...prev, { id, x: gx, y: gy, eaten: false }]);

    setExplosions((prev) => [...prev, { id, x: gx, y: gy }]);
    setTimeout(() => {
      setExplosions((prev) => prev.filter((ex) => ex.id !== id));
    }, 400);
  };

  /* === Движение и поедание === */
  useEffect(() => {
    const interval = setInterval(() => {
      if (food.length === 0) return;

      setMicrobe((prev) => {
        let { x, y } = prev;

        const nearest = food.reduce((a, b) => {
          const da = Math.hypot(x - a.x, y - a.y);
          const db = Math.hypot(x - b.x, y - b.y);
          return da < db ? a : b;
        });

        const angle = Math.atan2(nearest.y - y, nearest.x - x);
        const t = Date.now() / 300;
        const curve = Math.sin(t) * 0.5;
        const curveAngle = angle + curve;

        x += Math.cos(curveAngle) * MOVE_SPEED;
        y += Math.sin(curveAngle) * MOVE_SPEED;

        // Поедание
        if (Math.hypot(x - nearest.x, y - nearest.y) < EAT_RADIUS && !nearest.eaten) {
          nearest.eaten = true; // ✅ защита от повторного срабатывания
          setFood((prevFood) => prevFood.filter((f) => f.id !== nearest.id));
          setScore((s) => s + 1);
          playSound("/sound/hroom.mp3");

          if (phrases.length > 0) {
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            const bubbleId = `${Date.now()}-${Math.random()}`;

            // случайное размещение вокруг микроба
            let offsetX, offsetY;
            const radius = 40;
            let tries = 0;
            do {
              const a = Math.random() * 2 * Math.PI;
              offsetX = Math.cos(a) * radius;
              offsetY = Math.sin(a) * radius - 20;
              tries++;
            } while (
              bubbles.some(
                (b) =>
                  Math.hypot(b.offsetX - offsetX, b.offsetY - offsetY) < 40
              ) &&
              tries < 10
            );

            setBubbles((prev) => [
              ...prev,
              { id: bubbleId, text: phrase, offsetX, offsetY },
            ]);
            setTimeout(() => {
              setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
            }, 2000);
          }
        }

        return { x, y };
      });
    }, 60);

    return () => clearInterval(interval);
  }, [food, phrases, bubbles]);

  if (!done) return <Loader done={done} />;

  return (
    <div
      className="w-screen h-screen bg-black relative overflow-hidden select-none"
      onClick={handleClick}
    >
      {/* Счёт */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md">
        {score}
      </div>

      {/* Назад */}
      <Link
        href="/"
        className="absolute top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* Еда */}
      {food.map((f) => (
        <div
          key={f.id}
          className="absolute bg-white"
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
        className="absolute"
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
      <FooterLink />

      <style jsx>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -70%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -90%) scale(1.1); }
        }
        .animate-fadeUp { animation: fadeUp 2s ease-out forwards; }

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
