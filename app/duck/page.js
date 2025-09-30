"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";

// ---------- Аудиокэш ----------
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
    a.addEventListener("error", () => {
      console.error("Ошибка загрузки звука:", src);
      resolve();
    });
    a.load();
  });
}

// ---------- Камера ----------
function CameraRig({ dist }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, dist);
    camera.updateProjectionMatrix();
  }, [camera, dist]);
  return null;
}

// ---------- Утка ----------
function Duck({ onQuack, rotationY }) {
  const { scene } = useGLTF("/models/duck.glb");
  return (
    <primitive
      object={scene}
      scale={1.5}
      rotation={[0, rotationY, 0]} // всегда повернута на 90° по Y
      onPointerDown={onQuack}
    />
  );
}
useGLTF.preload("/models/duck.glb");

// ---------- Страница ----------
export default function DuckPage() {
  const [ready, setReady] = useState(false);

  // дистанция камеры (с анимацией)
  const [dist, setDist] = useState(3);
  const targetDist = useRef(3);

  // поворот уточки (фиксированное начальное значение)
  const [rotationY] = useState(Math.PI / 2);

  const [quacks, setQuacks] = useState([]);
  const audioRef = useRef(null);
  const idCounter = useRef(0);

  const MIN_DIST = 1.5;
  const MAX_DIST = 6;

  // ---------- загрузка звука ----------
  useEffect(() => {
    const boot = async () => {
      await preloadAudio("/sound/quack.mp3");
      audioRef.current = audioCache["/sound/quack.mp3"];
      setReady(true);
    };
    boot();
  }, []);

  // ---------- анимация плавного зума ----------
  useEffect(() => {
    let frame;
    const animate = () => {
      setDist((d) => {
        const next = d + (targetDist.current - d) * 0.1;
        return Math.abs(next - targetDist.current) < 0.001
          ? targetDist.current
          : next;
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // ---------- звук + текст ----------
  const handleQuack = (e) => {
    const a = audioRef.current;
    if (a) {
      try {
        a.currentTime = 0;
        a.volume = 1;
        a.playbackRate = 1;
        a.play().catch((err) =>
          console.error("Не удалось воспроизвести звук:", err)
        );
      } catch (err) {
        console.error("Ошибка звука:", err);
      }
    }

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

  // ---------- колесо мыши (устанавливает targetDist) ----------
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = Math.exp(e.deltaY * 0.0015);
    targetDist.current = Math.min(
      MAX_DIST,
      Math.max(MIN_DIST, targetDist.current * factor)
    );
  };

  if (!ready) return <Loader done={ready} />;

  return (
    <div
      className="relative w-screen h-screen bg-black select-none"
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      {/* Кнопка назад */}
      <Link
        href="/"
        className="absolute top-4 right-6 z-50 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* 3D сцена */}
      <Canvas
        camera={{ position: [0, 0, dist], fov: 50, near: 0.01, far: 10000 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1} />

        <CameraRig dist={dist} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={1}
          enableDamping
          dampingFactor={0.08}
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
