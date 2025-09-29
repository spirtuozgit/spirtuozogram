"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

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
    const ro = new ResizeObserver(() => recalc());
    const fromEl = nodeRefs.current[fromId];
    const toEl = nodeRefs.current[toId];
    if (fromEl) ro.observe(fromEl);
    if (toEl) ro.observe(toEl);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [fromId, toId]);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = len + "";
    p.style.strokeDashoffset = len + "";
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset 800ms ease";
    p.style.strokeDashoffset = "0";
  }, [d]);

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

export default function HorsePage() {
  const [activeNodes, setActiveNodes] = useState(["start"]);
  const [connections, setConnections] = useState([]);
  const [chosen, setChosen] = useState({});
  const [selectedBtn, setSelectedBtn] = useState({});
  const [offsets, setOffsets] = useState({});

  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  // === ЗВУКИ как в pop ===
  const CLICK_SOUNDS = ["/sound/click.mp3"];
  const RESET_SOUNDS = ["/sound/reset.mp3"]; // можно заменить на свои

  const playSfx = (list) => {
    try {
      const src = list[Math.floor(Math.random() * list.length)];
      const a = new Audio(src);
      a.play().catch(() => {});
    } catch {}
  };

  const playClick = () => playSfx(CLICK_SOUNDS);
  const playReset = () => playSfx(RESET_SOUNDS);

  const randomOffset = () => Math.floor(Math.random() * 200 - 100);

  const addNode = (from, to, label) => {
    if (chosen[from]) return;
    playClick();
    setChosen((prev) => ({ ...prev, [from]: true }));
    setSelectedBtn((prev) => ({ ...prev, [from]: label }));
    setActiveNodes((prev) => {
      if (!prev.includes(to)) {
        setOffsets((o) => ({ ...o, [to]: randomOffset() }));
        return [...prev, to];
      }
      return prev;
    });
    setConnections((prev) =>
      prev.find((c) => c.from === from && c.to === to) ? prev : [...prev, { from, to }]
    );
  };

  const restart = () => {
    playReset();
    setActiveNodes(["start"]);
    setConnections([]);
    setChosen({});
    setSelectedBtn({});
    setOffsets({});
  };

  useEffect(() => {
    const last = activeNodes[activeNodes.length - 1];
    const el = nodeRefs.current[last];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeNodes]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 relative">
      {/* крестик */}
      <Link
        href="/"
        className="absolute top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      <h1 className="text-4xl font-bold mb-2">Я лошадь?</h1>
      <p className="text-lg text-white/60 mb-10">наиболее точный интерактивный тест</p>

      <div ref={containerRef} className="relative w-full max-w-3xl mx-auto pb-40">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
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

        <div className="flex flex-col items-center gap-14 relative z-10">
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
                className={`px-5 py-4 rounded-2xl border shadow-lg text-center transition ${
                  disabled ? "bg-green-600/30 border-green-400" : "bg-white/10 border-white/20 backdrop-blur-md"
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
      </div>
    </div>
  );
}
