"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { playSound, loadSound } from "../../utils/audio"; // ✅ новый менеджер звука

/* === ПАРАМЕТРЫ === */
const CELL = 4;
const ANIMATION_SPEED = 400;
const MOVE_SPEED = 4; 
const EAT_RADIUS = 12;

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
      // загружаем звук через новый менеджер
      await loadSound("hroom", "/sound/hroom.ogg");

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

        // Поедание
        if (dist < EAT_RADIUS && !nearest.eaten) {
          nearest.eaten = true;
          setFood((prevFood) => prevFood.filter((f) => f.id !== nearest.id));
          setScore((s) => s + 1);

          playSound("hroom"); // ✅ новое воспроизведение

          if (phrases.length > 0) {
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            const bubbleId = `${Date.now()}-${Math.random()}`;

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
                (b) => Math.hypot(b.offsetX - offsetX, b.offsetY - offsetY) < 40
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
      className="w-screen min-h-screen bg-black relative overflow-hidden select-none"
      onClick={handleClick}
    >
      {/* Счёт (фиксированный сверху) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md z-50">
        {score}
      </div>

      {/* Назад (фиксированный крестик) */}
      <Link
        href="/"
        className="fixed top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition z-50"
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
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>

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
