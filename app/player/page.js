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

  // ---------- ПРЕДЗАГРУЗКА ----------
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
      ...playlist.map((t) => t.src)
    ];

    let loaded = 0;
    const total = assets.length;

    const updateProgress = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) setTimeout(() => setIsLoading(false), 300);
    };

    assets.forEach((url) => {
      if (url.endsWith(".mp3") || url.endsWith(".ogg")) {
        const a = document.createElement("audio");
        a.src = url;
        a.preload = "auto";
        a.oncanplaythrough = updateProgress;
        a.onerror = updateProgress;
      } else {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = url;
      }
    });
  }, []);

  // ---------- ФОРМАТ ВРЕМЕНИ ----------
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---------- ОБНОВЛЕНИЕ ВИЗУАЛА ----------
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

  // ---------- PLAY / PAUSE ----------
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

  // ---------- СЛЕДУЮЩИЙ / ПРЕДЫДУЩИЙ ----------
  const next = () => setCurrent((c) => (c + 1) % playlist.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + playlist.length) % playlist.length);

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
    const onEnded = () => next(); // автовоспроизведение следующего

    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.load();

    return () => {
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
    };
  }, [current]);

  // ---------- ПЕРЕМОТКА ----------
  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const ratio = Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
    const newTime = ratio * (time.dur || 0);
    audioRef.current.currentTime = newTime;
    setTime({ ...time, cur: newTime });
  };

  // ---------- НАЖАТИЕ НА ТРЕК ----------
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

  // ---------- ZIP ----------
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

  // ---------- СПИСОК ТРЕКОВ ----------
  const openTrackList = () => {
    const html = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    body{background:#000;color:#6eff8c;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    margin:0;padding:30px 0 60px;text-align:center;}
    h2{font-size:clamp(22px,4vw,28px);margin-bottom:25px;text-shadow:0 0 10px #6eff8c;}
    ul{list-style:none;padding:0;margin:0 auto;width:92%;max-width:420px;text-align:left;}
    li{display:flex;align-items:center;gap:12px;background:rgba(20,20,20,.8);border:1px solid #222;
    border-radius:10px;margin-bottom:12px;padding:12px 14px;box-shadow:0 0 10px #6eff8c20;}
    a{color:#6eff8c;text-decoration:none;flex:1;font-size:clamp(15px,3.5vw,18px);}
    a:hover{text-decoration:underline;}
    img.save-icon{width:clamp(20px,4vw,24px);}
    img.cover{width:clamp(180px,60vw,240px);height:clamp(180px,60vw,240px);
    object-fit:cover;border-radius:14px;box-shadow:0 0 20px #6eff8c60;margin-bottom:25px;}
    footer{position:fixed;bottom:10px;width:100%;font-size:12px;color:#6eff8c80;}
    </style>`;
    const win = window.open("", "_blank");
    if (!win) return alert("Разрешите всплывающие окна!");
    win.document.write("<html><head>" + html + "</head><body>");
    win.document.write(`
      <h2>8BitDoodle by Spirtuoz</h2>
      <img src="/player/cover.jpg" class="cover" />
      <ul>`);
    playlist.forEach((t) =>
      win.document.write(
        `<li><img src="/player/save.png" class="save-icon" /><a href="${t.src}" download>${t.title}</a></li>`
      )
    );
    win.document.write(`
      </ul>
      <a href="https://tips.yandex.ru/guest/payment/3578262" target="_blank" style="color:#6eff8c;">💰 Поддержать автора</a>
      <footer>Spirtuozgram © 2025</footer></body></html>`);
    win.document.title = "8BitDoodle — Треки";
  };

  // ---------- ЛОАДЕР ----------
  if (isLoading)
    return <Loader text="Spirtuoz Fest Player" progress={progress} />;

  // ---------- UI ----------
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center pb-40 px-4 overflow-hidden">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 text-[#6eff8c] text-3xl hover:scale-110 transition"
      >
        ×
      </button>

      <div className="mt-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#6eff8c] tracking-wider animate-neon">
          8-bit DOODLE
        </h1>
        <p className="text-gray-400 text-sm mt-1">by SPIRTUOZ</p>
      </div>

      <audio ref={audioRef} src={playlist[current].src} preload="auto" />

      {/* ПРОГРЕСС-КРУГ */}
      <div className="relative flex items-center justify-center mt-8 mb-4">
        <svg className="absolute w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke="#2e2e2e" strokeWidth="5" fill="none" />
          <circle cx="50" cy="50" r="46" stroke="#6eff8c40" strokeWidth="5" fill="none"
            strokeDasharray={`${(bufferProgress / 100) * 2 * Math.PI * 46},999`}
            strokeLinecap="round" />
          <circle cx="50" cy="50" r="41" stroke="#6eff8c" strokeWidth="4" fill="none"
            strokeDasharray={`${(playProgress / 100) * 2 * Math.PI * 41},999`}
            strokeLinecap="round" />
        </svg>

        <button
          onClick={playPause}
          className="w-24 h-24 rounded-full flex items-center justify-center bg-[#6eff8c]/15 border border-[#6eff8c]/60 shadow-[0_0_10px_#6eff8c40] transition-transform z-10">
          <img
            src={isPlaying ? "/player/pause.png" : "/player/play.png"}
            alt="play"
            className="w-12 h-12"
          />
        </button>
      </div>

      {/* СКРОБАР */}
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

      {/* НАЗВАНИЕ */}
      <p className="text-[#6eff8c] text-lg font-semibold truncate mt-6">
        {playlist[current].title}
      </p>

      {/* СПИСОК */}
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

      {/* КНОПКИ */}
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

      {/* МОДАЛКА */}
      {showDownloadChoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-[#101010]/90 border border-[#6eff8c]/40 rounded-xl p-6 w-64 text-center shadow-[0_0_20px_#6eff8c50] flex flex-col items-center justify-center">
            <button
              onClick={() => setShowDownloadChoice(false)}
              className="absolute top-2 right-3 text-[#6eff8c] text-lg hover:scale-110 transition">
              ✖
            </button>
            <h3 className="text-[#6eff8c] text-lg font-semibold mb-5 mt-2">Скачать альбом</h3>
            <div className="flex flex-col gap-4 justify-center items-center w-full">
              <button
                onClick={downloadZipAlbum}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6eff8c]/30 hover:bg-[#6eff8c]/50 border border-[#6eff8c]/60 shadow-[0_0_10px_#6eff8c80] transition text-sm w-40 justify-center">
                <img src="/player/zip.png" className="w-4 h-4" /> ZIP
              </button>
              <button
                onClick={openTrackList}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6eff8c]/20 hover:bg-[#6eff8c]/40 border border-[#6eff8c]/50 shadow-[0_0_8px_#6eff8c70] transition text-sm w-40 justify-center">
                <img src="/player/music.png" className="w-4 h-4" /> Треки
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
}