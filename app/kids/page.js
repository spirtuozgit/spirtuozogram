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
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">{poem.title}</h1>
      <pre className="whitespace-pre-wrap text-lg leading-relaxed text-center mb-4">
        {poem.text}
      </pre>
      <p className="italic text-gray-300">
        {poem.author}, {poem.date}
      </p>
    </main>
  );
}
