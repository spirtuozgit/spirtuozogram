"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";

/* === ДАННЫЕ ТЕСТА === */
const NODES = {
  start: { text: "Ты лошадь?" },
  notHorse1: { text: "Ты не лошадь.", final: true },
  legs: { text: "Сколько у тебя ног?" },
  notHorse2: { text: "Ты не лошадь.", final: true },
  sure: { text: "Точно?" },
  read: { text: "Ты умеешь читать и писать?" },
  notHorse3: { text: "Ты не лошадь.", final: true },
  lie: { text: "Врёшь, ты ведь читаешь это" },
  final: { text: "Ты не лошадь.", final: true },
};

const BUTTONS = {
  start: [
    { label: "Нет", to: "notHorse1" },
    { label: "Да", to: "legs" },
    { label: "Может быть", to: "legs" },
  ],
  legs: [
    { label: "Две", to: "notHorse2" },
    { label: "Четыре", to: "sure" },
  ],
  sure: [
    { label: "Нет", to: "read" },
    { label: "Да", to: "read" },
  ],
  read: [
    { label: "Да", to: "notHorse3" },
    { label: "Нет", to: "lie" },
  ],
  lie: [{ label: "Да", to: "final" }],
};

/* === ПАРАМЕТРЫ ЛОШАДЕЙ === */
const HORSE_FRAMES = ["/sprites/horse_frame_1.svg", "/sprites/horse_frame_2.svg"];
const ANIMATION_SPEED = 400;
const BASE_MOVE_SPEED = 3;
const HORSE_COUNT = 3;

/* === ЗВУКИ === */
const CLICK_SOUNDS = ["/sound/click.mp3"];
const RESET_SOUNDS = ["/sound/reset.mp3"];
const playSfx = (list) => {
  try {
    const src = list[Math.floor(Math.random() * list.length)];
    const a = new Audio(src);
    a.play().catch(() => {});
  } catch {}
};

/* === Edge === */
function Edge({ fromId, toId, nodeRefs, containerRef }) {
  const pathRef = useRef(null);
  const [d, setD] = useState("M0 0 L0 0");

  const recalc = () => {
    const container = containerRef.current;
    const fromEl = nodeRefs.current[fromId];
    const toEl = nodeRefs.current[toId];
    if (!container || !fromEl || !toEl) return;

    const crect = container.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();

    const sx = a.left + a.width / 2 - crect.left;
    const sy = a.bottom - crect.top;
    const tx = b.left + b.width / 2 - crect.left;
    const ty = b.top - crect.top;

    const dx = (tx - sx) * 0.3;
    const mid1x = sx + dx;
    const mid2x = tx - dx;
    setD(`M ${sx} ${sy} C ${mid1x} ${sy}, ${mid2x} ${ty}, ${tx} ${ty}`);
  };

  useLayoutEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    const fromEl = nodeRefs.current[fromId];
    const toEl = nodeRefs.current[toId];
    if (fromEl) ro.observe(fromEl);
    if (toEl) ro.observe(toEl);
    window.addEventListener("resize", recalc, { passive: true });
    window.addEventListener("scroll", recalc, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc);
    };
  }, [fromId, toId]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke="white"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
  );
}

export default function HorseTest() {
  const [activeNodes, setActiveNodes] = useState(["start"]);
  const [connections, setConnections] = useState([]);
  const [chosen, setChosen] = useState({});
  const [selectedBtn, setSelectedBtn] = useState({});
  const [offsets, setOffsets] = useState({});
  const nodeRefs = useRef({});
  const containerRef = useRef(null);

  const [horses, setHorses] = useState([]);
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const hoofAudioRef = useRef(null);

  /* === Loader === */
  useEffect(() => {
    const img1 = new Image();
    const img2 = new Image();
    let done = 0;
    const check = () => {
      done++;
      if (done === 2) {
        setLoaded(true);
        const initial = Array.from({ length: HORSE_COUNT }).map((_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight - 150) + 80,
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: BASE_MOVE_SPEED + Math.random() * 1.5,
        }));
        setHorses(initial);
      }
    };
    img1.onload = check;
    img2.onload = check;
    img1.src = HORSE_FRAMES[0];
    img2.src = HORSE_FRAMES[1];

    // создаём и запускаем звук копыт
    hoofAudioRef.current = new Audio("/sound/hoof.mp3");
    hoofAudioRef.current.loop = true;
    hoofAudioRef.current.volume = 0.6;
    hoofAudioRef.current.play().catch(() => {}); // автозапуск

    return () => {
      if (hoofAudioRef.current) {
        hoofAudioRef.current.pause();
        hoofAudioRef.current.src = "";
        hoofAudioRef.current = null;
      }
    };
  }, []);

  /* === кадры === */
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % HORSE_FRAMES.length), ANIMATION_SPEED);
    return () => clearInterval(id);
  }, [loaded]);

  /* === движение === */
  useEffect(() => {
    if (!loaded) return;
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
  }, [loaded]);

  /* === автопрокрутка === */
  useEffect(() => {
    const last = activeNodes[activeNodes.length - 1];
    const el = nodeRefs.current[last];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeNodes]);

  const addNode = (from, to, label) => {
    playSfx(CLICK_SOUNDS);
    if (chosen[from]) return;
    setChosen((p) => ({ ...p, [from]: true }));
    setSelectedBtn((p) => ({ ...p, [from]: label }));
    setActiveNodes((p) => {
      if (!p.includes(to)) {
        setOffsets((o) => ({ ...o, [to]: Math.floor(Math.random() * 200 - 100) }));
        return [...p, to];
      }
      return p;
    });
    setConnections((p) => (p.find((c) => c.from === from && c.to === to) ? p : [...p, { from, to }]));
  };

  const restart = () => {
    playSfx(RESET_SOUNDS);
    setActiveNodes(["start"]);
    setConnections([]);
    setChosen({});
    setSelectedBtn({});
    setOffsets({});
  };

  if (!loaded) return <Loader done={loaded} />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 relative overflow-hidden">
      {/* крестик */}
      <Link
        href="/"
        className="absolute top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition z-50"
      >
        ✕
      </Link>

      {/* Заголовок */}
      <h1 className="text-4xl font-bold mb-2 z-20">Я лошадь?</h1>
      <p className="text-lg text-white/60 mb-10 z-20">наиболее точный интерактивный тест</p>

      {/* Лошади */}
      {horses.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) scaleX(${h.dir === 1 ? 1 : -1})`,
            width: 64,
            height: 64,
            zIndex: 0,
          }}
        >
          <img src={HORSE_FRAMES[frame]} alt="horse" className="w-full h-full" />
        </div>
      ))}

      {/* Контейнер плиток */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-3xl mx-auto pb-40 flex flex-col items-center gap-14 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {/* Линии */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {connections.map((c, i) => (
            <Edge
              key={`${c.from}-${c.to}-${i}`}
              fromId={c.from}
              toId={c.to}
              nodeRefs={nodeRefs}
              containerRef={containerRef}
            />
          ))}
        </svg>

        {/* Плитки */}
        {activeNodes.map((id) => {
          const node = NODES[id];
          if (!node) return null;
          const disabled = chosen[id];
          const isFinal = node.final;
          const offset = offsets[id] || 0;

          return (
            <div
              key={id}
              ref={(el) => (nodeRefs.current[id] = el)}
              className={`px-5 py-4 rounded-2xl border shadow-lg text-center transition backdrop-blur-md ${
                disabled ? "bg-green-600/30 border-green-400" : "bg-white/10 border-white/20"
              }`}
              style={{ transform: `translateX(${offset}px)`, maxWidth: "520px" }}
            >
              <p className="mb-3">{node.text}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {isFinal ? (
                  <button
                    onClick={restart}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    но можем перепроверить
                  </button>
                ) : (
                  (BUTTONS[id] || []).map((b) => {
                    const isSelected = selectedBtn[id] === b.label;
                    return (
                      <button
                        key={`${id}-${b.to}-${b.label}`}
                        onClick={() => addNode(id, b.to, b.label)}
                        disabled={disabled && !isSelected}
                        className={`px-3 py-1.5 rounded-lg transition ${
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

      {/* Футер */}
      <FooterLink />
    </div>
  );
}
