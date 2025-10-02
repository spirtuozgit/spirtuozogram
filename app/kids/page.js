"use client";

import { useState, useEffect } from "react";

const poems = [
  {
    text: `Идёт бычок, качается,
Вздыхает на ходу:
— Ох, доска кончается,
Сейчас я упаду!`,
    author: "Агния Барто",
    date: "1936",
    title: "Бычок",
  },
  {
    text: `Уронила мишку на пол,
Оторвала мишке лапу.
Всё равно его не брошу —
Потому что он хороший.`,
    author: "Агния Барто",
    date: "1936",
    title: "Таня",
  },
  {
    text: `О чём поют воробушки
В последний день зимы?
О том, что день весенний уж
На крыльях к ним летит!`,
    author: "Самуил Маршак",
    date: "1923",
    title: "О чём поют воробушки…",
  },
  {
    text: `Буря мглою небо кроет,
Вихри снежные крутя;
То, как зверь, она завоет,
То заплачет, как дитя…`,
    author: "А.С. Пушкин",
    date: "1825",
    title: "Зимний вечер",
  },
];

export default function KidsPage() {
  const [poem, setPoem] = useState(null);

  useEffect(() => {
    const random = poems[Math.floor(Math.random() * poems.length)];
    setPoem(random);
  }, []);

  if (!poem) return null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white px-4 sm:px-6 py-10">
      {/* Заголовок */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center">
        {poem.title}
      </h1>

      {/* Текст стиха */}
      <pre className="whitespace-pre-wrap text-base sm:text-lg md:text-xl leading-relaxed text-center mb-6 max-w-3xl">
        {poem.text}
      </pre>

      {/* Автор и дата */}
      <p className="italic text-gray-300 text-sm sm:text-base text-center">
        {poem.author}, {poem.date}
      </p>
    </main>
  );
}
