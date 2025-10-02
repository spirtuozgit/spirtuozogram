"use client";
import { useState, useEffect, useRef } from "react";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { loadSound, playSound } from "../../utils/audio";

function Microbe({ x, y, phrase, onClick }) {
  const frames = ["/sprites/microbe_frame_1.svg", "/sprites/microbe_frame_2.svg"];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute z-40 flex flex-col items-center"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
      onClick={onClick}
    >
      {/* bubble */}
      <div className="relative mb-2 max-w-[180px] sm:max-w-[140px] px-3 py-2 bg-white rounded-xl shadow-md border border-black text-black text-sm sm:text-xs font-bold text-center">
        {phrase}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
      </div>
      {/* микроб */}
      <img src={frames[frame]} alt="microbe" className="w-16 h-16 sm:w-12 sm:h-12" />
    </div>
  );
}

export default function PopPage() {
  const [clicks, setClicks] = useState(0);
  const [explosions, setExplosions] = useState([]);
  const [disabledBlocks, setDisabledBlocks] = useState([]);
  const [ready, setReady] = useState(false);
  const [microbeRun, setMicrobeRun] = useState(null);
  const [praise, setPraise] = useState(null);

  const containerRef = useRef(null);

  // 🔑 адаптивный размер блоков
  const baseBlock = typeof window !== "undefined" && window.innerWidth < 400 ? 4 : 6;
  const BLOCK_SIZE = baseBlock;

  const colors = ["white", "red", "yellow", "lime", "cyan", "magenta", "orange"];
  const currentColor = colors[Math.floor(clicks / 50) % colors.length];

  // предзагрузка звуков
  useEffect(() => {
    loadSound("pop1", "/sound/pop_1.ogg");
    loadSound("pop2", "/sound/pop_2.ogg");
    loadSound("pop3", "/sound/pop_3.ogg");
    setReady(true);
  }, []);

  // запуск микроба каждые 100 кликов
  useEffect(() => {
    if (clicks > 0 && clicks % 100 === 0) {
      const startY = Math.random() * (window.innerHeight - 100) + 50;
      const endY = Math.random() * (window.innerHeight - 100) + 50;
      const fromLeft = Math.random() > 0.5;

      const phrases = [
        "Не заебался тыкать?",
        "Вот тебе делать нехуй",
        "А тыыкалка у тебя не сотрется?",
        "Ты еще тут? Я хуею...",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];

      setMicrobeRun({
        id: Date.now(),
        x: fromLeft ? -100 : window.innerWidth + 100,
        y: startY,
        endX: fromLeft ? window.innerWidth + 100 : -100,
        endY: endY,
        startTime: performance.now(),
        phrase,
      });
    }
  }, [clicks]);

  // анимация микроба
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

  // похвала каждые 50 кликов
  useEffect(() => {
    if (clicks > 0 && clicks % 50 === 0) {
      setPraise(`Ты уже натыкал ${clicks} раз!`);
      setTimeout(() => setPraise(null), 2000);
    }
  }, [clicks]);

  const handleClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / BLOCK_SIZE) * BLOCK_SIZE;
    const y = Math.floor((e.clientY - rect.top) / BLOCK_SIZE) * BLOCK_SIZE;

    if (disabledBlocks.some((b) => b.x === x && b.y === y)) return;

    const newBlock = { x, y, color: currentColor };
    setDisabledBlocks((prev) => [...prev, newBlock]);

    const text = Math.random() > 0.5 ? "тык" : "пык";
    setClicks((prev) => prev + 1);

    const id = Date.now();
    setExplosions((prev) => [...prev, { id, x, y, text }]);

    setTimeout(() => {
      setExplosions((prev) => prev.filter((ex) => ex.id !== id));
    }, 1000);

    // звук
    const soundNames = ["pop1", "pop2", "pop3"];
    const random = soundNames[Math.floor(Math.random() * soundNames.length)];
    playSound(random);
  };

  if (!ready) return <Loader text="Загружаем тыки и пыки" />;

  return (
    <div
      ref={containerRef}
      className="w-screen h-dvh bg-black relative overflow-hidden select-none"
      onClick={handleClick}
    >
      {/* Счётчик */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 text-white text-lg sm:text-base font-bold shadow-md z-50">
        {clicks} тыков
      </div>

      {/* Похвала */}
      {praise && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 text-2xl sm:text-xl font-bold animate-fadeUp z-50">
          {praise}
        </div>
      )}

      {/* Кнопка назад */}
      <button
        className="fixed top-4 right-4 text-white text-2xl bg-white/10 backdrop-blur-md rounded-full px-3 py-1 hover:bg-white/20 z-50"
        onClick={() => window.history.back()}
      >
        ✕
      </button>

      {/* Точки */}
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
          <div className="absolute w-[2px] h-[2px] animate-pixel1" style={{ backgroundColor: currentColor }} />
          <div className="absolute w-[2px] h-[2px] animate-pixel2" style={{ backgroundColor: currentColor }} />
          <div className="absolute w-[2px] h-[2px] animate-pixel3" style={{ backgroundColor: currentColor }} />
          <div className="absolute w-[2px] h-[2px] animate-pixel4" style={{ backgroundColor: currentColor }} />
          <div className="text-white text-xl sm:text-lg font-bold animate-fadeUp">{ex.text}</div>
        </div>
      ))}

      {/* Микроб */}
      {microbeRun && (
        <Microbe
          x={microbeRun.curX}
          y={microbeRun.curY}
          phrase={microbeRun.phrase}
          onClick={() =>
            setMicrobeRun((m) => m && { ...m, phrase: "В жопу себе потыкай" })
          }
        />
      )}

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .animate-fadeUp { animation: fadeUp 2s ease-out forwards; }
        @keyframes pixel1 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-12px,-12px); opacity:0; } }
        @keyframes pixel2 { from { transform: translate(0,0); opacity:1; } to { transform: translate(12px,-12px); opacity:0; } }
        @keyframes pixel3 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-12px,12px); opacity:0; } }
        @keyframes pixel4 { from { transform: translate(0,0); opacity:1; } to { transform: translate(12px,12px); opacity:0; } }
        .animate-pixel1 { animation: pixel1 0.6s ease-out forwards; }
        .animate-pixel2 { animation: pixel2 0.6s ease-out forwards; }
        .animate-pixel3 { animation: pixel3 0.6s ease-out forwards; }
        .animate-pixel4 { animation: pixel4 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
