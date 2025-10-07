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
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [progress, setProgress] = useState(0);
  const [showDownloadChoice, setShowDownloadChoice] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const progressRef = useRef(null);
  const cancelZipRef = useRef(false); // <--- флаг отмены архивации

  // --- Лоадер ---
  useEffect(() => {
    const imageUrls = [
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
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loaded++;
        setProgress(Math.round((loaded / imageUrls.length) * 100));
        if (loaded === imageUrls.length) setTimeout(() => setIsLoading(false), 300);
      };
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
    if (a.buffered.length > 0) {
      const loaded = (a.buffered.end(a.buffered.length - 1) / a.duration) * 100;
      setBufferProgress(Math.min(loaded, 100));
    }
    setTime({ cur: a.currentTime, dur: a.duration });
    rafRef.current = requestAnimationFrame(updateVisuals);
  };

  const safePlay = async () => {
    const a = audioRef.current;
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
    } else {
      if (a.readyState < 1) a.load();
      await safePlay();
      setIsPlaying(true);
    }
  };

  const next = () => setCurrent((c) => (c + 1) % playlist.length);
  const prev = () => setCurrent((c) => (c - 1 + playlist.length) % playlist.length);

  // --- автопереход ---
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handleEnded = () => {
      setCurrent((c) => (c + 1) % playlist.length);
      setIsPlaying(true);
    };
    a.addEventListener("ended", handleEnded);
    return () => a.removeEventListener("ended", handleEnded);
  }, []);

  // --- смена трека ---
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(rafRef.current);
    a.pause();
    setBufferProgress(0);
    setPlayProgress(0);
    a.load();
    const onReady = () => {
      if (isPlaying) safePlay();
      a.removeEventListener("canplay", onReady);
    };
    a.addEventListener("canplay", onReady);
  }, [current]);

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX || e.touches?.[0].clientX;
    const ratio = (x - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * (time.dur || 0);
  };

  const playTrack = (i) => {
    if (i === current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        safePlay();
        setIsPlaying(true);
      }
    } else {
      setCurrent(i);
      setIsPlaying(true);
    }
  };

  // --- ZIP с возможностью отмены ---
  const downloadZipAlbum = async () => {
    setIsZipping(true);
    setZipProgress(0);
    cancelZipRef.current = false;

    try {
      const zip = new JSZip();
      const albumFolder = zip.folder("8BitDoodle by Spirtuoz");

      // обложка
      try {
        const coverResp = await fetch("/player/cover.jpg");
        albumFolder.file("cover.jpg", await coverResp.blob());
      } catch {}

      // треки
      for (let i = 0; i < playlist.length; i++) {
        if (cancelZipRef.current) throw new Error("cancelled");
        try {
          const res = await fetch(playlist[i].src);
          albumFolder.file(playlist[i].title + ".mp3", await res.blob());
        } catch {}
        setZipProgress(Math.round(((i + 1) / playlist.length) * 90));
      }

      // генерация архива
      const blob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE" },
        (meta) => {
          if (cancelZipRef.current) throw new Error("cancelled");
          setZipProgress(90 + Math.round(meta.percent / 10));
        }
      );

      if (!cancelZipRef.current) {
        saveAs(blob, "8BitDoodle by Spirtuoz.zip");
        setZipProgress(100);
      }
    } catch (e) {
      if (e.message !== "cancelled") alert("Ошибка при создании архива!");
    } finally {
      setTimeout(() => {
        setIsZipping(false);
        setShowDownloadChoice(false);
        setZipProgress(0);
      }, 300);
    }
  };

  if (isLoading)
    return <Loader text="Spirtuoz Fest Player" progress={progress} />;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center pb-40 px-4 overflow-hidden">
      {/* выход */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition">
        ×
      </button>

      {/* заголовок */}
      <div className="mt-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#6eff8c] tracking-wider animate-neon">
          8-bit DOODLE
        </h1>
        <p className="text-gray-400 text-sm mt-1">by SPIRTUOZ</p>
      </div>

      <audio ref={audioRef} src={playlist[current].src} preload="auto" />

      {/* кнопки управления */}
      <div className="flex items-center justify-center gap-12 mt-10 mb-4">
        <button onClick={prev} className="hover:scale-110 transition">
          <img src="/player/back.png" alt="prev" className="w-10 h-10" />
        </button>

        <div className="relative flex items-center justify-center">
          <svg className="absolute w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="#2e2e2e" strokeWidth="5" fill="none" />
            <circle
              cx="50" cy="50" r="46"
              stroke="#6eff8c40" strokeWidth="5"
              fill="none"
              strokeDasharray={`${(bufferProgress / 100) * 2 * Math.PI * 46},999`}
              strokeLinecap="round"
            />
            <circle
              cx="50" cy="50" r="41"
              stroke="#6eff8c" strokeWidth="4"
              fill="none"
              strokeDasharray={`${(playProgress / 100) * 2 * Math.PI * 41},999`}
              strokeLinecap="round"
            />
          </svg>
          <button
            onClick={playPause}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-[#6eff8c]/15 border border-[#6eff8c]/60 shadow-[0_0_10px_#6eff8c40] transition-transform z-10 hover:shadow-[0_0_15px_#6eff8c80]">
            <img
              src={isPlaying ? "/player/pause.png" : "/player/play.png"}
              alt="play"
              className="w-10 h-10"
            />
          </button>
        </div>

        <button onClick={next} className="hover:scale-110 transition">
          <img src="/player/forward.png" alt="next" className="w-10 h-10" />
        </button>
      </div>

      {/* прогресс и тайминг */}
      <div className="w-full max-w-md px-4 mt-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(time.cur)}</span>
          <span>{formatTime(time.dur)}</span>
        </div>
        <div
          ref={progressRef}
          className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={handleSeek}>
          <div className="h-full bg-[#6eff8c]" style={{ width: `${playProgress}%` }} />
        </div>
      </div>

      {/* название */}
      <p className="text-[#6eff8c] text-lg font-semibold truncate mt-6 max-w-md text-center">
        {playlist[current].title}
      </p>

      {/* список */}
      <div className="w-full max-w-md mt-4 border-t border-white/10 pt-3 bg-[#101010]/70 backdrop-blur-sm overflow-y-auto h-[28vh] mb-4 scrollbar-thin rounded-xl">
        {playlist.map((t, i) => (
          <div
            key={i}
            onClick={() => playTrack(i)}
            className={`p-2 px-3 rounded-lg mb-2 cursor-pointer ${
              i === current ? "bg-[#6eff8c]/40 text-white" : "hover:bg-[#6eff8c]/15 text-gray-300"
            }`}>
            {i + 1}. {t.title}
          </div>
        ))}
      </div>

      {/* действия */}
      <div className="flex flex-col items-center gap-3 mt-2 mb-[calc(env(safe-area-inset-bottom)+70px)]">
        <button
          onClick={() => setShowDownloadChoice(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 shadow-[0_0_10px_#6eff8c40] transition text-sm">
          <img src="/player/zip.png" className="w-5 h-5" /> Скачать альбом
        </button>
        <a
          href="https://tips.yandex.ru/guest/payment/3578262"
          target="_blank"
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 shadow-[0_0_10px_#6eff8c40] transition text-sm">
          <img src="/common/UI/money.png" className="w-5 h-5" /> Задонатить автору
        </a>
      </div>

      {/* Модалка ZIP с возможностью отмены */}
      {showDownloadChoice && showDownloadChoice !== "tracks" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#101010] border border-[#6eff8c]/40 rounded-2xl shadow-[0_0_20px_#6eff8c40] w-full max-w-sm p-6 relative text-center text-[#6eff8c]">
            <button
              onClick={() => {
                if (isZipping) {
                  cancelZipRef.current = true;
                  setIsZipping(false);
                  setShowDownloadChoice(false);
                  setZipProgress(0);
                } else {
                  setShowDownloadChoice(false);
                }
              }}
              className="absolute top-3 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition">
              ×
            </button>

            {!isZipping ? (
              <>
                <h2 className="text-xl mb-4 font-semibold">Скачать альбом</h2>
                <button
                  onClick={downloadZipAlbum}
                  className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 transition">
                  <img src="/player/zip.png" className="w-5 h-5" />
                  ZIP-архив целиком
                </button>
                <button
                  onClick={() => setShowDownloadChoice("tracks")}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-[#6eff8c]/20 border border-[#6eff8c]/50 hover:bg-[#6eff8c]/40 transition">
                  <img src="/player/music.png" className="w-5 h-5" />
                  Отдельные треки
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg mb-4 font-semibold">Создаём ZIP-архив...</h2>
                <div className="relative w-full h-3 bg-[#222] rounded-full overflow-hidden mb-3">
                  <div
                    className="absolute left-0 top-0 h-full bg-[#6eff8c] transition-all"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{zipProgress}%</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Модалка треков */}
      {showDownloadChoice === "tracks" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#101010] border border-[#6eff8c]/40 rounded-2xl shadow-[0_0_20px_#6eff8c40] w-full max-w-md p-6 relative text-[#6eff8c] text-center">
            <button
              onClick={() => setShowDownloadChoice(false)}
              className="absolute top-3 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition">
              ×
            </button>
            <h2 className="text-xl mb-5 font-semibold">Отдельные треки</h2>
            <img
              src="/player/cover.jpg"
              alt="cover"
              className="w-48 h-48 object-cover rounded-xl mx-auto mb-5 shadow-[0_0_15px_#6eff8c80]"
            />
            <div className="text-left max-h-[50vh] overflow-y-auto px-1 scrollbar-thin">
              {playlist.map((t, i) => (
                <a
                  key={i}
                  href={t.src}
                  download={`${t.title}.mp3`}
                  target="_blank"
                  className="flex items-center gap-3 mb-2 px-3 py-2 rounded-lg bg-[#1a1a1a]/60 border border-[#6eff8c20] hover:bg-[#6eff8c]/20 transition text-sm text-[#aaffc1]">
                  <img src="/player/save.png" className="w-4 h-4" />
                  <span className="truncate">{t.title}</span>
                </a>
              ))}
            </div>
            <a
              href="https://tips.yandex.ru/guest/payment/3578262"
              target="_blank"
              className="inline-flex items-center gap-2 mt-6 text-sm text-[#6eff8c] hover:text-[#aaffc1]">
              <img src="/common/UI/money.png" className="w-5 h-5" />
              Поддержать автора
            </a>
          </div>
        </div>
      )}

      <div className="relative z-40 w-full bg-black/80 backdrop-blur-sm pt-3 pb-[calc(env(safe-area-inset-bottom)+25px)]">
        <FooterLink />
      </div>

      <style jsx global>{`
        .animate-neon {
          text-shadow: 0 0 6px #6eff8c, 0 0 15px #6eff8c;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #6eff8c40 transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6eff8c60;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
