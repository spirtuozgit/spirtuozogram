"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { loadSound, playSound, stopAllSounds, unlockAudio } from "../../utils/audio";
import { QUESTIONS, getResult } from "./data";

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function DoodleTest() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showCounting, setShowCounting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const current = QUESTIONS[step];

  /* === Предзагрузка звуков и изображений === */
  useEffect(() => {
    const assets = [
      // ✅ универсальные пути (подхватывают .m4a на iOS/Android)
      loadSound("click", "/common/sound/click"),
      loadSound("winner", "/common/sound/winner"),
      "/doodle/sprites/gay.png",
      "/doodle/sprites/office.png",
      "/doodle/sprites/gran.png",
      "/doodle/sprites/conductor.png",
      "/doodle/sprites/driver.png",
      "/doodle/sprites/tram.png",
    ].map((src) =>
      typeof src === "string"
        ? new Promise((resolve) => {
            const img = new window.Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          })
        : src
    );

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

  /* === Перемешивание ответов === */
  useEffect(() => {
    if (current) setShuffledAnswers(shuffleArray(current.answers));
  }, [step]);

  /* === Обработка ответа === */
  const handleAnswer = (answer) => {
    playSound("click");
    const isCorrect =
      (Array.isArray(current.correct) && current.correct.includes(answer)) ||
      answer === current.correct;
    if (isCorrect) setScore((s) => s + 1);
    setStep((s) => s + 1);
  };

  /* === Перезапуск === */
  const restart = () => {
    playSound("click");
    setStarted(false);
    setStep(0);
    setScore(0);
    setShowCounting(false);
    setShowResult(false);
  };

  /* === Завершение теста + конфетти === */
  useEffect(() => {
    if (step === QUESTIONS.length && started) {
      playSound("winner");
      setShowCounting(true);

      const timer = setTimeout(() => {
        setShowCounting(false);
        setShowResult(true);

        const duration = 4000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [step, started]);

  /* === Loader === */
  if (!ready) return <Loader text="Загрузка..." progress={progress} />;

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-start pt-16 pb-32 px-4 sm:px-6">
      {/* Кнопка звука */}
      <button
        onClick={() => unlockAudio()}
        className="fixed top-4 left-6 text-2xl sm:text-3xl font-bold text-white hover:text-green-400 transition z-50"
      >
        🔊
      </button>

      {/* Кнопка выхода */}
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-6 text-white text-xl sm:text-2xl md:text-3xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* Логотип */}
      {(!started || step < QUESTIONS.length) && (
        <div className="w-full flex justify-center mb-6">
          <Image
            src="/doodle/sprites/tram.png"
            alt="Трамвай Doodle"
            width={160}
            height={110}
            priority
            className="max-w-[50%] sm:max-w-[160px] h-auto"
          />
        </div>
      )}

      {/* Экран начала */}
      {!started ? (
        <div className="max-w-2xl text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Тест на знание творчества группы Doodle
          </h1>
          <p className="mb-6 text-sm sm:text-base md:text-lg">
            Давай узнаем, кто ты в трамвае, который едет по десятому маршруту
          </p>
          <button
            onClick={() => {
              playSound("click");
              setStarted(true);
            }}
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base md:text-lg"
          >
            Поехали
          </button>
        </div>
      ) : step < QUESTIONS.length ? (
        /* Экран вопроса */
        <div className="max-w-xl text-center">
          <p className="mb-4 text-xs sm:text-sm md:text-base text-gray-400">
            Вопрос {step + 1} из {QUESTIONS.length}
          </p>
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-6">
            {current.text}
          </h2>
          <div className="flex flex-col gap-3">
            {shuffledAnswers.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(a)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm sm:text-base md:text-lg"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      ) : showCounting ? (
        /* Экран подсчёта */
        <div className="max-w-2xl text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 animate-pulse">
            Подсчитываем баллы...
          </h2>
        </div>
      ) : showResult ? (
        /* Экран результата */
        (() => {
          const result = getResult(score);
          return (
            <div className="max-w-2xl text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Результат
              </h2>
              <p className="mb-2 text-sm sm:text-base md:text-lg">
                Ты набрал <b>{score}</b> из {QUESTIONS.length}
              </p>
              <div className="flex justify-center mb-6">
                <Image
                  src={result.image}
                  alt="результат"
                  width={200}
                  height={200}
                  className="max-w-[150px] sm:max-w-[200px] h-auto"
                />
              </div>
              <p className="mb-6 text-sm sm:text-base md:text-lg">{result.text}</p>
              <a
                href="https://t.me/doodle_music"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-600 block mb-4 text-sm sm:text-base"
              >
                Подписаться на Telegram
              </a>
              <button
                onClick={() => restart()}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base md:text-lg"
              >
                Пройти ещё раз
              </button>
            </div>
          );
        })()
      ) : null}

      {/* Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>
    </div>
  );
}
