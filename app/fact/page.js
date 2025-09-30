"use client";
import { useEffect, useRef, useState } from "react";
import FooterLink from "../../components/FooterLink"; // путь может отличаться, смотри структуру проекта

function sleep(ms, signal) {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(id);
        signal.removeEventListener("abort", onAbort);
      };
      signal.addEventListener("abort", onAbort);
    }
  });
}

export default function FactPage() {
  const [facts, setFacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(null);
  const abortRef = useRef(null);

  // загрузка фактов
  useEffect(() => {
    fetch("/data/facts.json")
      .then((r) => r.json())
      .then((data) => setFacts((Array.isArray(data) ? data : []).map(String)))
      .finally(() => setLoading(false));
  }, []);

  // подготовка звука
  useEffect(() => {
    const a = new Audio("/sound/typewrite.mp3");
    a.preload = "auto";
    a.loop = true; // играет фоном пока печатает
    audioRef.current = a;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // сброс в полночь
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const t = setTimeout(() => setCurrentIndex(0), msToMidnight);
    return () => clearTimeout(t);
  }, []);

  // печать
  useEffect(() => {
    if (!facts.length) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fact = facts[currentIndex] ?? "";
    setText("");

    const run = async () => {
      // стартуем звук
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          if (audioRef.current.paused) {
            await audioRef.current.play();
          }
        } catch (err) {
          console.warn("Ошибка воспроизведения звука:", err);
        }
      }

      // печатаем посимвольно
      for (let i = 0; i < fact.length; i++) {
        if (controller.signal.aborted) return;

        setText((prev) => prev + fact.charAt(i));

        // задержка: 40–70 мс, иногда «задумчивость»
        let delay = 40 + Math.floor(Math.random() * 31);
        if (fact.charAt(i) === " " && Math.random() < 0.15) {
          delay = 100 + Math.floor(Math.random() * 101);
        }

        await sleep(delay, controller.signal);
      }

      // стоп звук после печати
      if (audioRef.current && !audioRef.current.paused) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }

      // пауза 5 секунд → следующий факт
      await sleep(5000, controller.signal);
      if (!controller.signal.aborted) {
        setCurrentIndex((i) => (i + 1) % facts.length);
      }
    };

    run();

    return () => {
      controller.abort();
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
  }, [facts, currentIndex]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black text-green-400 flex items-center justify-center">
        Загрузка фактов…
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black text-green-400 font-mono flex flex-col items-center justify-center">
      {/* крестик */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 right-4 text-3xl text-white"
      >
        ✕
      </button>

      {/* текст */}
      <div className="max-w-4xl px-6 text-center text-2xl sm:text-3xl md:text-4xl leading-relaxed">
        <span className="whitespace-pre-line break-words">{text}</span>
        <span className="inline-block w-2 h-6 bg-green-400 ml-1 animate-pulse align-baseline" />
      </div>

      {/* футер */}
      <FooterLink />
    </div>
  );
}
