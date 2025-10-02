"use client";
import { useEffect, useRef, useState } from "react";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { loadSound, playLoop, stopAllSounds } from "../../utils/audio";

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

  const abortRef = useRef(null);
  const lastIndexRef = useRef(-1);

  // загрузка фактов
  useEffect(() => {
    fetch("/data/facts.json")
      .then((r) => r.json())
      .then((data) => setFacts((Array.isArray(data) ? data : []).map(String)))
      .finally(() => setLoading(false));
  }, []);

  // выбор случайного факта
  useEffect(() => {
    if (facts.length > 0 && currentIndex === 0) {
      let next;
      if (facts.length === 1) {
        next = 0;
      } else {
        do {
          next = Math.floor(Math.random() * facts.length);
        } while (next === lastIndexRef.current);
      }
      setCurrentIndex(next);
      lastIndexRef.current = next;
    }
  }, [facts]);

  // предзагрузка звука
  useEffect(() => {
    loadSound("typewrite", "/sound/typewrite.ogg").catch((e) =>
      console.warn("Ошибка загрузки звука:", e)
    );
  }, []);

  // печать текста
  useEffect(() => {
    if (!facts.length) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fact = facts[currentIndex] ?? "";
    setText("");

    const run = async () => {
      // ✅ запускаем звук один раз в начале печати
      const typingLoop = playLoop("typewrite", 0.6);

      for (let i = 0; i < fact.length; i++) {
        if (controller.signal.aborted) {
          typingLoop?.stop();
          return;
        }

        setText((prev) => prev + fact.charAt(i));

        let delay = 40 + Math.floor(Math.random() * 31);
        if (fact.charAt(i) === " " && Math.random() < 0.15) {
          delay = 100 + Math.floor(Math.random() * 101);
        }
        await sleep(delay, controller.signal);
      }

      // ✅ останавливаем звук после окончания печати
      typingLoop?.stop();

      // пауза → новый факт
      await sleep(5000, controller.signal);
      if (!controller.signal.aborted) {
        setCurrentIndex((prev) => {
          if (facts.length <= 1) return 0;
          let next;
          do {
            next = Math.floor(Math.random() * facts.length);
          } while (next === prev);
          lastIndexRef.current = next;
          return next;
        });
      }
    };

    run();
    return () => {
      controller.abort();
      stopAllSounds(); // убиваем все звуки при смене факта
    };
  }, [facts, currentIndex]);

  if (loading) return <Loader text="Загружаем факты…" />;

  return (
    <div className="relative min-h-screen w-full bg-black text-green-400 font-mono flex flex-col items-center justify-center px-4">
      {/* крестик */}
      <button
        onClick={() => {
          stopAllSounds();
          window.history.back();
        }}
        className="fixed top-4 right-4 text-2xl sm:text-3xl text-white z-50"
      >
        ✕
      </button>

      {/* текст */}
      <div className="max-w-3xl px-2 text-center text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed -translate-y-8">
        <span className="whitespace-pre-line break-words">{text}</span>
        <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-6 bg-green-400 ml-1 animate-pulse align-baseline" />
      </div>

      {/* футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>
    </div>
  );
}
