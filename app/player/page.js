"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import playlist from "./playlist";

export default function SpirtuozPlayer() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Лоадер
  useEffect(() => {
    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 300);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const playPause = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.warn("Playback interrupted:", err));
      }
      setIsPlaying(true);
    }
  };

  const next = () => {
    setCurrent((c) => (c + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prev = () => {
    setCurrent((c) => (c - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  // Обновление времени и метаданных
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const update = () => setTime({ cur: a.currentTime, dur: a.duration || 0 });
    const loaded = () => setTime({ cur: 0, dur: a.duration || 0 });
    const end = () => next();
    a.addEventListener("loadedmetadata", loaded);
    a.addEventListener("timeupdate", update);
    a.addEventListener("ended", end);
    return () => {
      a.removeEventListener("loadedmetadata", loaded);
      a.removeEventListener("timeupdate", update);
      a.removeEventListener("ended", end);
    };
  }, [current]);

  // Безопасное переключение треков
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.load();
    if (isPlaying) {
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.warn("Playback interrupted:", err));
      }
    }
  }, [current, isPlaying]);

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const ratio = (x - rect.left) / rect.width;
    const newTime = ratio * (time.dur || 0);
    audioRef.current.currentTime = newTime;
    setTime({ ...time, cur: newTime });
  };

  const playTrack = (index) => {
    setCurrent(index);
    setIsPlaying(true);
  };

  if (isLoading)
    return <Loader text="Сжимаем до 8-bit" progress={progress} />;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center pb-24 px-4 overflow-hidden">
      {/* Кнопка закрытия */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition"
        aria-label="Закрыть"
      >
        ×
      </button>

      {/* Заголовок */}
      <div className="mt-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#6eff8c] tracking-wider animate-neon">
          8-bit DOODLE
        </h1>
        <p className="text-gray-400 text-sm mt-1">by SPIRTUOZ</p>
      </div>

      {/* Аудио */}
      <audio ref={audioRef} src={playlist[current].src} preload="auto" />

      {/* Центральная кнопка */}
      <div className="flex flex-col items-center mt-6 mb-4">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-4 ${
              isPlaying
                ? "border-[#6eff8c]/80 animate-ringGlow"
                : "border-[#6eff8c]/20"
            }`}
          />
          <button
            onClick={playPause}
            className={`w-24 h-24 flex items-center justify-center rounded-full bg-[#6eff8c]/15 border border-[#6eff8c]/60 shadow-[0_0_10px_#6eff8c40] transition-transform ${
              isPlaying ? "scale-95" : "scale-100"
            }`}
          >
            {isPlaying ? (
              <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#6eff8c]">
                <rect x="25" y="25" width="15" height="50" rx="4" />
                <rect x="60" y="25" width="15" height="50" rx="4" />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#6eff8c]">
                <polygon points="35,25 75,50 35,75" />
              </svg>
            )}
          </button>
        </div>

        {/* Кнопки переключения */}
        <div className="flex gap-8 text-2xl text-gray-400 mt-3">
          <button onClick={prev} className="hover:text-[#6eff8c] transition">
            ⏮
          </button>
          <button onClick={next} className="hover:text-[#6eff8c] transition">
            ⏭
          </button>
        </div>
      </div>

      {/* Прогресс */}
      <div className="w-full max-w-md px-4 mt-1 select-none">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(time.cur)}</span>
          <span>{formatTime(time.dur)}</span>
        </div>
        <div
          ref={progressRef}
          className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={handleSeek}
          onTouchStart={handleSeek}
        >
          <div
            className="h-full bg-[#6eff8c] transition-all duration-100 ease-linear"
            style={{ width: `${(time.cur / (time.dur || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Заголовок плейлиста */}
      <h2 className="text-xl text-[#6eff8c] font-semibold mt-8 mb-2">
        Плейлист
      </h2>

      {/* Плейлист */}
      <div className="w-full max-w-md border-t border-white/10 pt-3 rounded-xl bg-[#101010]/70 backdrop-blur-sm overflow-y-auto h-[42vh] mb-32 scrollbar-thin scrollbar-thumb-[#6eff8c]/40">
        {playlist.map((track, i) => (
          <div
            key={i}
            onClick={() => playTrack(i)}
            className={`p-2 px-3 rounded-lg mb-2 cursor-pointer transition-all ${
              i === current
                ? "bg-[#6eff8c]/40 text-white"
                : "hover:bg-[#6eff8c]/15 text-gray-300"
            }`}
          >
            {i + 1}. {track.title}
          </div>
        ))}
      </div>

      {/* Футтер как в FactPage */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

      <style jsx global>{`
        @keyframes ringGlow {
          0%,
          100% {
            box-shadow: 0 0 5px #6eff8c50;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 10px #6eff8c;
            transform: scale(1.04);
          }
        }
        .animate-ringGlow {
          animation: ringGlow 2s infinite ease-in-out;
        }

        @keyframes neonFlicker {
          0%,
          18%,
          22%,
          25%,
          53%,
          57%,
          100% {
            opacity: 1;
            text-shadow: 0 0 5px #6eff8c, 0 0 10px #6eff8c;
          }
          20%,
          24%,
          55% {
            opacity: 0.6;
            text-shadow: none;
          }
        }
        .animate-neon {
          animation: neonFlicker 3s infinite;
        }
      `}</style>
    </div>
  );
}
