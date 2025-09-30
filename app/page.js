"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const tiles = [
  { href: "/horse", label: "Я лошадь?", icon: "/icons/horse_icon.png" },
  { href: "/pop", label: "Тык", icon: "/icons/pop_icon.png" },
  { href: "/duck", label: "Крутить уточку", icon: "/icons/duck_icon.png" },
  { href: "/microbe", label: "Некультурный микроб", icon: "/icons/microbe_icon.png" },
  { href: "/lenin", label: "Этапы Ленина", icon: "/icons/lenin_icon.png" },
  { href: "/iss", label: "Где МКС?", icon: "/icons/iss_icon.png" },
  { href: "/fact", label: "Факты", icon: "/icons/fact_icon.png" },
  { href: "#", label: "Скоро", icon: "/icons/soon_icon.png" },
  { href: "#", label: "Скоро", icon: "/icons/soon_icon.png" },
];

function Tile({ tile }) {
  return (
    <Link href={tile.href} className="flex flex-col items-center group">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center 
                   shadow-md border border-white/20 overflow-hidden transition-transform 
                   group-hover:scale-105 bg-gradient-to-br from-gray-600 to-gray-800"
      >
        <Image
          src={tile.icon}
          alt={tile.label}
          width={80}
          height={80}
          className="w-[90%] h-[90%] object-contain"
        />
      </div>
      <span className="mt-2 text-sm text-gray-200 group-hover:text-white text-center">
        {tile.label}
      </span>
    </Link>
  );
}

function AgeCheck({ onYes, onNo }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-6">
      {/* Лого или fallback */}
      {!logoError ? (
        <>
          <Image
            src="/logo_small.png"
            alt="SPIRTUOZ logo"
            width={200}
            height={60}
            className="w-[200px] h-auto mb-2"
            priority
            onError={() => setLogoError(true)}
          />
          <p className="text-sm text-gray-400 mb-8">spirtuoz.ru</p>
        </>
      ) : (
        <h1 className="text-3xl font-bold mb-8">spirtuoz.ru</h1>
      )}

      <h2 className="text-2xl mb-6">Вам есть 18 лет?</h2>
      <div className="flex gap-6">
        <button
          onClick={onYes}
          className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition"
        >
          Да
        </button>
        <button
          onClick={onNo}
          className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
        >
          Нет
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [ageChecked, setAgeChecked] = useState(false);
  const [isAdult, setIsAdult] = useState(null);
  const router = useRouter();

  // проверка при загрузке
  useEffect(() => {
    const stored = sessionStorage.getItem("isAdult");
    if (stored !== null) {
      setIsAdult(stored === "true");
      setAgeChecked(true);
    }
  }, []);

  if (!ageChecked) {
    return (
      <AgeCheck
        onYes={() => {
          setIsAdult(true);
          setAgeChecked(true);
          sessionStorage.setItem("isAdult", "true");
        }}
        onNo={() => {
          setIsAdult(false);
          setAgeChecked(true);
          sessionStorage.setItem("isAdult", "false");
          router.push("/kids"); // редирект на детскую страницу
        }}
      />
    );
  }

  if (isAdult === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Переход...
      </div>
    );
  }

  return (
    <main className="homepage relative flex flex-col items-center justify-between min-h-screen text-white px-6 py-8 overflow-hidden">
      {/* Лого + подпись */}
      <div className="flex flex-col items-center mt-10 mb-10 z-10">
        <Image
          src="/logo_small.png"
          alt="SPIRTUOZGRAM logo"
          width={400}
          height={120}
          className="w-[400px] h-auto mb-1"
          priority
        />
        <p className="text-sm text-gray-400 leading-tight">
          Самая полезная информация на все случаи жизни
        </p>
      </div>

      {/* Плитки */}
      <div
        className="relative z-10 w-fit mx-auto px-4 py-6 
                      rounded-3xl 
                      bg-gradient-to-r from-white/10 to-white/5 
                      backdrop-blur-xl 
                      border border-white/20 
                      shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
      >
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {tiles.map((tile, i) => (
            <Tile key={i} tile={tile} />
          ))}
        </div>
      </div>

      {/* Футтер */}
      <footer className="z-10 text-gray-500 text-sm mb-4 mt-8">
        <a
          href="https://t.me/dimaspirtuoz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          t.me/dimaspirtuoz
        </a>
      </footer>
    </main>
  );
}
