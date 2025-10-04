"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { loadSound, playSound, stopAllSounds, unlockAudio } from "../../utils/audio";

// ---------- Утка ----------
function Duck({ onQuack, rotationY }) {
  const { scene } = useGLTF("/duck/models/duck.glb");
  return (
    <group position={[0, 0, 0]} rotation={[0, rotationY, 0]} scale={1}>
      <primitive object={scene} onPointerDown={onQuack} />
    </group>
  );
}
useGLTF.preload("/duck/models/duck.glb");

// ---------- Страница ----------
export default function DuckPage() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rotationY] = useState(Math.PI / 2);
  const [quacks, setQuacks] = useState([]);
  const idCounter = useRef(0);

  /* === Предзагрузка ассетов === */
  useEffect(() => {
    const assets = [
      // ✅ универсальный путь: .m4a на iOS/Android, .ogg на остальных
      loadSound("quack", "/duck/sound/quack"),
      new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = "/duck/preview.png";
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

  /* === Разблокировка звука при первом касании (iOS fix) === */
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("touchstart", handler, { once: true });
  }, []);

  /* === Обработка клика/тапа по утке === */
  const handleQuack = (e) => {
    playSound("quack");

    const point = e.point.clone();
    idCounter.current += 1;
    const id = idCounter.current;

    const base = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 1.8 : 2.4;
    const size = base + Math.random() * 1.2;
    const rotate = -30 + Math.random() * 60;

    setQuacks((q) => [...q, { id, pos: point, size, rotate }]);
    setTimeout(() => {
      setQuacks((q) => q.filter((qq) => qq.id !== id));
    }, 1200);
  };

  if (!ready) return <Loader text="Загрузка уточки…" progress={progress} />;

  return (
    <div className="relative w-screen h-[100dvh] bg-black select-none flex items-center justify-center">
      {/* Кнопка звука */}
      <button
        onClick={() => unlockAudio()}
        className="fixed top-4 left-6 text-2xl sm:text-3xl font-bold text-white hover:text-green-400 transition z-50"
      >
        🔊
      </button>

      {/* Кнопка назад */}
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-6 z-50 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* 3D сцена */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50, near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1} />

        <OrbitControls
          enableZoom
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={1}
          maxDistance={6}
        />

        <Duck onQuack={handleQuack} rotationY={rotationY} />

        {quacks.map((q) => (
          <Html key={q.id} position={q.pos} center>
            <span
              className="quack-text"
              style={{
                fontSize: `${q.size}rem`,
                transform: `rotate(${q.rotate}deg)`,
              }}
            >
              Кря
            </span>
          </Html>
        ))}
      </Canvas>

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

      <style jsx global>{`
        .quack-text {
          color: #fff;
          font-weight: bold;
          animation: quackAnim 1.2s forwards;
          pointer-events: none;
          text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
        }
        @keyframes quackAnim {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          70% {
            opacity: 1;
            transform: scale(1.2) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(1.6) translateY(-40px);
          }
        }
      `}</style>
    </div>
  );
}
