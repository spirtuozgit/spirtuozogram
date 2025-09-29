"use client";
import { useState, useEffect } from "react";

export default function MicrobeGame() {
  const CELL = 10;
  const COLORS = ["#3498db", "#2ecc71", "#9b59b6", "#1abc9c", "#f39c12"];
  const GROWTH_STAGES = [
    { score: 10, size: 15, tentacle: "tentaclesSmall" },
    { score: 50, size: 20, tentacle: "tentaclesChip" },
    { score: 100, size: 30, tentacle: "tentaclesAngle" },
    { score: 200, size: 40, tentacle: "tentaclesSpider" },
    { score: 350, size: 55, tentacle: "tentaclesCrazy" },
  ];

  const [state, setState] = useState("life"); // life | death | end
  const [food, setFood] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [score, setScore] = useState(0);
  const [microbe, setMicrobe] = useState({
    x: 50,
    y: 50,
    size: 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tentacleAnim: "tentaclesSmall",
  });

  // Клик → еда
  const handleClick = (e) => {
    if (state !== "life" && state !== "end") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const gx = Math.floor((e.clientX - rect.left) / CELL) * CELL;
    const gy = Math.floor((e.clientY - rect.top) / CELL) * CELL;

    const id = Date.now();
    setFood((prev) => [...prev, { id, x: gx, y: gy }]);
    setExplosions((prev) => [...prev, { id, x: gx, y: gy }]);

    setTimeout(() => {
      setExplosions((prev) => prev.filter((ex) => ex.id !== id));
    }, 500);
  };

  // Движение к ближайшей еде
  useEffect(() => {
    if (state !== "life" && state !== "end") return;

    const interval = setInterval(() => {
      if (food.length === 0) return;

      // ищем ближайшую еду
      const nearest = food.reduce((a, b) => {
        const da = Math.hypot(microbe.x - a.x, microbe.y - a.y);
        const db = Math.hypot(microbe.x - b.x, microbe.y - b.y);
        return da < db ? a : b;
      });

      let { x, y } = microbe;
      const speed = Math.max(1, 4 - microbe.size / 20);

      if (x < nearest.x) x += speed;
      if (x > nearest.x) x -= speed;
      if (y < nearest.y) y += speed;
      if (y > nearest.y) y -= speed;

      // радиус поедания (тело + щупальца)
      const eatRadius = microbe.size / 2 + microbe.size;
      if (Math.hypot(x - nearest.x, y - nearest.y) < eatRadius) {
        setFood((prev) => prev.filter((f) => f.id !== nearest.id));
        setScore((s) => s + 1);
        new Audio("/sound/hroom.mp3").play();
      }

      setMicrobe((m) => ({ ...m, x, y }));
    }, 30);

    return () => clearInterval(interval);
  }, [food, microbe, state]);

  // Рост и смерть
  useEffect(() => {
    if (state !== "life") return;

    const stage = GROWTH_STAGES.find((s) => s.score === score);
    if (stage) {
      setMicrobe((m) => ({
        ...m,
        size: stage.size,
        tentacleAnim: stage.tentacle,
      }));
    }

    if (score >= 500) {
      setState("death");
      setTimeout(() => setState("end"), 2000);
    }
  }, [score, state]);

  // Новый цикл после END
  useEffect(() => {
    if (state === "end" && food.length === 0) {
      setTimeout(() => {
        setMicrobe({
          x: 150,
          y: 100,
          size: 10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          tentacleAnim: "tentaclesSmall",
        });
        setScore(0);
        setState("life");
      }, 3000);
    }
  }, [state, food]);

  return (
    <div
      className="w-screen h-screen bg-black relative overflow-hidden select-none"
      onClick={handleClick}
    >
      {/* Счёт */}
      {state === "life" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg font-bold shadow-md">
          {score}
        </div>
      )}

      {/* Назад */}
      <button
        className="absolute top-4 right-4 text-white text-2xl bg-white/10 backdrop-blur-md rounded-full px-3 py-1 hover:bg-white/20"
        onClick={() => window.history.back()}
      >
        ✕
      </button>

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
        <div key={ex.id} className="absolute" style={{ left: ex.x, top: ex.y }}>
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel1" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel2" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel3" />
          <div className="absolute w-[2px] h-[2px] bg-white animate-pixel4" />
        </div>
      ))}

      {/* Микроб */}
      {state === "life" && (
        <div
          className={`absolute microbe ${microbe.tentacleAnim}`}
          style={{
            left: microbe.x,
            top: microbe.y,
            width: microbe.size,
            height: microbe.size,
            background: microbe.color,
            "--c": microbe.color,
          }}
        />
      )}

      {/* Убийца */}
      {state === "death" && (
        <div
          className="absolute killer"
          style={{
            left: microbe.x + 40,
            top: microbe.y,
            width: microbe.size,
            height: microbe.size,
            background: "red",
          }}
        />
      )}

      {/* END */}
      {state === "end" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-6xl flex gap-4">
          <span>E</span>
          <span>N</span>
          <span className="relative">
            D
            <div
              className="absolute w-4 h-4 bg-yellow-400 animate-microbe"
              style={{ left: "50%", top: "30%" }}
            />
          </span>
        </div>
      )}

      <style jsx>{`
        .microbe {
          position: absolute;
        }
        /* разные стили щупалец */
        .tentaclesSmall {
          animation: tentaclesSmall 0.8s steps(2) infinite alternate;
        }
        .tentaclesChip {
          animation: tentaclesChip 0.8s steps(2) infinite alternate;
        }
        .tentaclesAngle {
          animation: tentaclesAngle 0.8s steps(2) infinite alternate;
        }
        .tentaclesSpider {
          animation: tentaclesSpider 0.8s steps(2) infinite alternate;
        }
        .tentaclesCrazy {
          animation: tentaclesCrazy 0.8s steps(2) infinite alternate;
        }

        @keyframes tentaclesSmall {
          0% { box-shadow: -15px 0 var(--c), 15px 0 var(--c), 0 -15px var(--c), 0 15px var(--c); }
          100% { box-shadow: -16px 0 var(--c), 16px 0 var(--c), 0 -16px var(--c), 0 16px var(--c); }
        }
        @keyframes tentaclesChip {
          0% { box-shadow: -20px 0 var(--c), 20px 0 var(--c), 0 -20px var(--c), 0 20px var(--c); }
          100% { box-shadow: -22px 0 var(--c), 22px 0 var(--c), 0 -22px var(--c), 0 22px var(--c); }
        }
        @keyframes tentaclesAngle {
          0% { box-shadow: -20px -5px var(--c), 20px -5px var(--c), -5px -20px var(--c), -5px 20px var(--c); }
          100% { box-shadow: -22px -8px var(--c), 22px -8px var(--c), -8px -22px var(--c), -8px 22px var(--c); }
        }
        @keyframes tentaclesSpider {
          0% { box-shadow: -25px 0 var(--c), 25px 0 var(--c), 0 -25px var(--c), 0 25px var(--c); }
          100% { box-shadow: -26px -4px var(--c), 26px 4px var(--c), -4px -26px var(--c), 4px 26px var(--c); }
        }
        @keyframes tentaclesCrazy {
          0% { box-shadow: -30px -5px var(--c), 30px 5px var(--c), -5px -30px var(--c), 5px 30px var(--c); }
          100% { box-shadow: -32px 0 var(--c), 32px 0 var(--c), 0 -32px var(--c), 0 32px var(--c); }
        }

        @keyframes pixel1 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-12px,-12px); opacity:0; } }
        @keyframes pixel2 { from { transform: translate(0,0); opacity:1; } to { transform: translate(12px,-12px); opacity:0; } }
        @keyframes pixel3 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-12px,12px); opacity:0; } }
        @keyframes pixel4 { from { transform: translate(0,0); opacity:1; } to { transform: translate(12px,12px); opacity:0; } }
        .animate-pixel1 { animation: pixel1 0.5s ease-out forwards; }
        .animate-pixel2 { animation: pixel2 0.5s ease-out forwards; }
        .animate-pixel3 { animation: pixel3 0.5s ease-out forwards; }
        .animate-pixel4 { animation: pixel4 0.5s ease-out forwards; }

        .killer { animation: blink 0.3s infinite alternate; }
        @keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
        .animate-microbe { animation: tentaclesSmall 0.6s steps(2) infinite alternate; }
      `}</style>
    </div>
  );
}
