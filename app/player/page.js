"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import playlist from "./playlist";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function SpirtuozPlayer() {
  const router = useRouter();
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const progressRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [showDownloadChoice, setShowDownloadChoice] = useState(false);

  // ---------- ЛОАДЕР ----------
  useEffect(() => {
    const assets = [
      "/player/play.png",
      "/player/pause.png",
      "/player/back.png",
      "/player/forward.png",
      "/player/zip.png",
      "/player/music.png",
      "/player/close.png",
      "/player/save.png",
      "/player/cover.jpg",
      "/common/UI/money.png",
    ];
    let loaded = 0;
    const total = assets.length;
    const update = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) setTimeout(() => setIsLoading(false), 300);
    };
    assets.forEach((url) => {
      const img = new Image();
      img.onload = update;
      img.onerror = update;
      img.src = url;
    });
  }, []);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const updateVisuals = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setPlayProgress((a.currentTime / a.duration) * 100);
    try {
      if (a.buffered.length > 0) {
        const loaded =
          (a.buffered.end(a.buffered.length - 1) / a.duration) * 100;
        setBufferProgress(Math.min(loaded, 100));
      }
    } catch {}
    setTime({ cur: a.currentTime, dur: a.duration });
    rafRef.current = requestAnimationFrame(updateVisuals);
  };

  const safePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await a.play();
      cancelAnimationFrame(rafRef.current);
      updateVisuals();
    } catch (err) {
      console.warn("play interrupted:", err);
    }
  };

  const playPause = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
      return;
    }
    await safePlay();
    setIsPlaying(true);
  };

  const next = () => setCurrent((c) => (c + 1) % playlist.length);
  const prev = () => setCurrent((c) => (c - 1 + playlist.length) % playlist.length);

  // ---------- СМЕНА ТРЕКА ----------
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(rafRef.current);
    a.pause();
    setBufferProgress(0);
    setPlayProgress(0);
    setTime({ cur: 0, dur: 0 });

    const onCanPlay = () => {
      setTime({ cur: 0, dur: a.duration || 0 });
      if (isPlaying) safePlay();
      a.removeEventListener("canplay", onCanPlay);
    };
    const onEnded = () => next();

    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.load();

    return () => {
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
    };
  }, [current]);

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const ratio = Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
    const newTime = ratio * (time.dur || 0);
    audioRef.current.currentTime = newTime;
    setTime({ ...time, cur: newTime });
  };

  const playTrack = (i) => {
    const a = audioRef.current;
    if (!a) return;
    if (i === current) {
      if (!isPlaying) {
        safePlay();
        setIsPlaying(true);
      } else {
        a.pause();
        setIsPlaying(false);
      }
    } else {
      setCurrent(i);
      setIsPlaying(true);
    }
  };

  const downloadZipAlbum = async () => {
    setShowDownloadChoice(false);
    const zip = new JSZip();
    const folder = zip.folder("8BitDoodle by Spirtuoz");
    try {
      const cover = await fetch("/player/cover.jpg").then((r) => r.blob());
      folder.file("cover.jpg", cover);
    } catch {}
    for (const track of playlist) {
      try {
        const blob = await fetch(track.src).then((r) => r.blob());
        folder.file(`${track.title}.mp3`, blob);
      } catch {}
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "8BitDoodle by Spirtuoz.zip");
  };

  if (isLoading)
    return <Loader text="Spirtuoz Fest Player" progress={progress} />;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center pb-40 px-4 overflow-hidden">
      {/* кнопка выход */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition"
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

      <audio ref={audioRef} src={playlist[current].src} preload="auto" />

      {/* исправленный круглый прогресс */}
      <div className="relative flex items-center justify-center mt-8 mb-4">
        <svg
          className="absolute w-32 h-32"
          viewBox="0 0 100 100"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            WebkitTransformOrigin: "50% 50%",
          }}
        >
          <circle cx="50" cy="50" r="46" stroke="#2e2e2e" strokeWidth="5" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#6eff8c40"
            strokeWidth="5"
            fill="none"
            strokeDasharray={`${(bufferProgress / 100) * 2 * Math.PI * 46},999`}
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="41"
            stroke="#6eff8c"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(playProgress / 100) * 2 * Math.PI * 41},999`}
            strokeLinecap="round"
          />
        </svg>

        <button
          onClick={playPause}
          className="w-24 h-24 rounded-full flex items-center justify-center bg-[#6eff8c]/15 border border-[#6eff8c]/60 shadow-[0_0_10px_#6eff8c40] transition-transform z-10"
        >
          <img
            src={isPlaying ? "/player/pause.png" : "/player/play.png"}
            alt="play"
            className="w-12 h-12"
          />
        </button>
      </div>

      {/* время и прогресс-линия */}
      <div className="w-full max-w-md px-4 mt-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(time.cur)}</span>
          <span>{formatTime(time.dur)}</span>
        </div>
        <div
          ref={progressRef}
          className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={handleSeek}
        >
          <div className="h-full bg-[#6eff8c]" style={{ width: `${playProgress}%` }} />
        </div>
      </div>

      {/* название */}
      <p className="text-[#6eff8c] text-lg font-semibold truncate mt-6">
        {playlist[current].title}
      </p>

      {/* список треков */}
      <div className="w-full max-w-md mt-4 border-t border-white/10 pt-3 bg-[#101010]/70 backdrop-blur-sm overflow-y-auto h-[28vh] mb-4 scrollbar-thin rounded-xl">
        {playlist.map((t, i) => (
          <div
            key={i}
            onClick={() => playTrack(i)}
            className={`p-2 px-3 rounded-lg mb-2 cursor-pointer ${
              i === current ? "bg-[#6eff8c]/40 text-white" : "hover:bg-[#6eff8c]/15 text-gray-300"
            }`}
          >
            {i + 1}. {t.title}
          </div>
        ))}
      </div>

      {/* кнопки */}
      <div className="flex flex-wrap gap-6 mb-12 justify-center">
        <button
          onClick={() => setShowDownloadChoice(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 shadow-[0_0_10px_#6eff8c40] transition text-sm"
        >
          <img src="/player/zip.png" className="w-5 h-5" /> Скачать альбом
        </button>

        <a
          href="https://tips.yandex.ru/guest/payment/3578262"
          target="_blank"
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 shadow-[0_0_10px_#6eff8c40] transition text-sm"
        >
          <img src="/common/UI/money.png" className="w-5 h-5" /> Поддержать автора
        </a>
      </div>

      {/* футтер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

      <style jsx global>{`
        .animate-neon {
          text-shadow: 0 0 6px #6eff8c, 0 0 15px #6eff8c;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6eff8c60;
          border-radius: 8px;
        }
        svg circle {
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}