"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { preloadAudio, playAudio } from "../../utils/audio";

// ---------- Утка ----------
function Duck({ onQuack, rotationY }) {
  const { scene } = useGLTF("/models/duck.glb");
  return (
    <primitive
      object={scene}
      scale={1}
      rotation={[0, rotationY, 0]}
      onPointerDown={onQuack}
    />
  );
}
useGLTF.preload("/models/duck.glb");

// ---------- Страница ----------
export default function DuckPage() {
  const [ready, setReady] = useState(false);
  const [rotationY] = useState(Math.PI / 2);
  const [quacks, setQuacks] = useState([]);
  const idCounter = useRef(0);

  // ---------- загрузка звука ----------
  useEffect(() => {
    const boot = async () => {
      await preloadAudio("/sound/quack.mp3");
      setReady(true);
    };
    boot();
  }, []);

  // ---------- звук + текст ----------
  const handleQuack = (e) => {
    playAudio("/sound/quack.mp3");
    const point = e.point.clone();
    idCounter.current += 1;
    const id = idCounter.current;
    const size = 1.5 + Math.random() * 1.5;
    const rotate = -30 + Math.random() * 60;
    setQuacks((q) => [...q, { id, pos: point, size, rotate }]);
    setTimeout(() => {
      setQuacks((q) => q.filter((qq) => qq.id !== id));
    }, 1200);
  };

  if (!ready) return <Loader text="Загрузка уточки…" />;

  return (
    <div className="relative w-screen h-screen bg-black select-none">
      {/* Кнопка назад */}
      <Link
        href="/"
        className="absolute top-4 right-6 z-50 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* 3D сцена */}
      <Canvas camera={{ position: [0, 0, 3], fov: 50, near: 0.1, far: 100 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1} />

        <OrbitControls
          enableZoom={true}     // ✅ включаем нативный зум
          enablePan={false}
          rotateSpeed={1}
          enableDamping
          dampingFactor={0.08}
          minDistance={1}       // ✅ ограничение минимального зума
          maxDistance={6}       // ✅ ограничение максимального зума
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

      {/* футер */}
      <FooterLink />

      <style jsx global>{`
        .quack-text {
          color: #fff;
          font-weight: bold;
          animation: quackAnim 1.2s forwards;
          pointer-events: none;
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
