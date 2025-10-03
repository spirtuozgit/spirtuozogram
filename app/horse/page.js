"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { playSound, loadSound, stopAllSounds } from "../../utils/audio";
import { NODES, BUTTONS } from "./data";
import confetti from "canvas-confetti";

const HORSE_FRAMES = ["/horse/sprites/horse_frame_1.svg", "/horse/sprites/horse_frame_2.svg"];
const ANIMATION_SPEED = 400;
const BASE_MOVE_SPEED = 3;
const HORSE_COUNT = 3;

export default function HorseGame() {
  const [activeNodes, setActiveNodes] = useState(["start"]);
  const [chosen, setChosen] = useState({});
  const [selectedBtn, setSelectedBtn] = useState({});
  const [horses, setHorses] = useState([]);
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState([]);

  const nodeRefs = useRef({});
  const containerRef = useRef(null);

  // Предзагрузка ресурсов
  useEffect(() => {
    const assets = [
      loadSound("reset", "/horse/sound/reset.ogg"),
      loadSound("click", "/common/sound/click.ogg"),
      ...HORSE_FRAMES.map(
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

    Promise.all(assets).then(() => {
      setHorses(
        Array.from({ length: HORSE_COUNT }).map((_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight - 150) + 80,
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: BASE_MOVE_SPEED + Math.random() * 1.5,
        }))
      );
      setReady(true);
    });

    return () => stopAllSounds();
  }, []);

  // Анимация кадров
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % HORSE_FRAMES.length), ANIMATION_SPEED);
    return () => clearInterval(id);
  }, [ready]);

  // Движение лошадей
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      setHorses((prev) =>
        prev.map((h) => {
          let { x, y, dir, speed } = h;
          x += dir * speed;
          const width = window.innerWidth;
          if (dir === 1 && x > width + 100) {
            dir = -1;
            y = Math.random() * (window.innerHeight - 150) + 80;
            x = width + 100;
          } else if (dir === -1 && x < -100) {
            dir = 1;
            y = Math.random() * (window.innerHeight - 150) + 80;
            x = -100;
          }
          return { ...h, x, y, dir };
        })
      );
    }, 30);
    return () => clearInterval(interval);
  }, [ready]);

  // Автоскролл
  useEffect(() => {
    const lastId = activeNodes[activeNodes.length - 1];
    const el = nodeRefs.current[lastId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeNodes]);

  // Обновление линий
  useEffect(() => {
    if (!containerRef.current) return;
    const newLines = [];
    activeNodes.slice(1).forEach((id, i) => {
      const prevId = activeNodes[i];
      const from = nodeRefs.current[prevId];
      const to = nodeRefs.current[id];
      if (!from || !to) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.bottom - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top - containerRect.top;

      newLines.push({ x1, y1, x2, y2 });
    });
    setLines(newLines);
  }, [activeNodes, ready]);

  const addNode = (from, to, label) => {
    playSound("click");
    if (chosen[from]) return;
    setChosen((p) => ({ ...p, [from]: true }));
    setSelectedBtn((p) => ({ ...p, [from]: label }));
    setActiveNodes((p) => (!p.includes(to) ? [...p, to] : p));

    if (NODES[to]?.final) {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 300);
    }
  };

  const restart = () => {
    playSound("reset");
    setActiveNodes(["start"]);
    setChosen({});
    setSelectedBtn({});
    setLines([]);
  };

  if (!ready) return <Loader text="Загрузка игры..." progress={progress} />;

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center p-4 sm:p-6 relative overflow-hidden">
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-4 sm:right-6 text-2xl sm:text-3xl font-bold text-white hover:text-red-400 transition z-40"
      >
        ✕
      </Link>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 z-20">Я лошадь?</h1>
      <p className="text-sm sm:text-base md:text-lg text-white/60 mb-6 z-20">
        наиболее точный психологический тест
      </p>

      {horses.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) scaleX(${h.dir === 1 ? 1 : -1})`,
          }}
        >
          <img src={HORSE_FRAMES[frame]} alt="horse" className="w-12 sm:w-16 md:w-20 lg:w-24 h-auto" />
        </div>
      ))}

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-2xl mx-auto pb-32 flex flex-col items-center gap-6"
      >
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {activeNodes.map((id) => {
          const node = NODES[id];
          if (!node) return null;
          const disabled = chosen[id];
          const isFinal = node.final;

          return (
            <div
              id={id}
              key={id}
              ref={(el) => (nodeRefs.current[id] = el)}
              className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl backdrop-blur-md shadow-lg text-center inline-flex flex-col items-center min-w-[200px] max-w-lg mx-auto transition-colors
                ${disabled ? "bg-white/10 border border-white/20" : "bg-green-600/30 border border-green-400"}
              `}
            >
              <p className="mb-3 text-sm sm:text-base md:text-lg break-words">{node.text}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {isFinal ? (
                  <button
                    onClick={() => restart()}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base"
                  >
                    но можем перепроверить
                  </button>
                ) : (
                  (BUTTONS[id] || []).map((b) => {
                    const isSelected = selectedBtn[id] === b.label;
                    return (
                      <button
                        key={`${id}-${b.to}-${b.label}`}
                        onClick={() => !disabled && addNode(id, b.to, b.label)}
                        disabled={disabled && !isSelected}
                        className={`px-3 py-1.5 rounded-lg transition text-sm sm:text-base ${
                          isSelected
                            ? "bg-white/30"
                            : disabled
                            ? "opacity-30 cursor-not-allowed"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>
    </div>
  );
}
