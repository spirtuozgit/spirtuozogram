"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ColorThief from "colorthief";

const tiles = [
  { href: "/lenin", label: "Этапы Ленина", icon: "/icons/lenin_icon.png" },
  { href: "/iss", label: "Где МКС?", icon: "/icons/iss_icon.png" },
  { href: "/population", label: "Население планеты", icon: "/icons/population_icon.png" },
  { href: "/pop", label: "Тык", icon: "/icons/pop_icon.png" },
  { href: "/microbe", label: "Микроб", icon: "/icons/microbe_icon.png" },
  { href: "/horse", label: "Я лошадь?", icon: "/icons/horse_icon.png" },
  { href: "#", label: "Скоро", icon: "/icons/soon_icon.png" },
  { href: "#", label: "Скоро", icon: "/icons/soon_icon.png" },
  { href: "#", label: "Скоро", icon: "/icons/soon_icon.png" },
];

function Tile({ tile }) {
  const [bg, setBg] = useState("linear-gradient(135deg, #444, #222)");

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = tile.icon;

    img.onload = () => {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 2); // 2 главных цвета
      if (palette && palette.length >= 2) {
        const [c1, c2] = palette;
        const gradient = `linear-gradient(135deg, rgb(${c1[0]},${c1[1]},${c1[2]}) , rgb(${c2[0]},${c2[1]},${c2[2]}))`;
        setBg(gradient);
      }
    };
  }, [tile.icon]);

  return (
    <Link href={tile.href} className="flex flex-col items-center group">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center 
                   shadow-md border border-white/20 overflow-hidden transition-transform 
                   group-hover:scale-105"
        style={{ background: bg }}
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

export default function HomePage() {
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
      <div className="relative z-10 w-full max-w-4xl px-8 py-10 
                      rounded-3xl 
                      bg-gradient-to-r from-white/10 to-white/5 
                      backdrop-blur-xl 
                      border border-white/20 
                      shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
        <div className="grid grid-cols-3 gap-8">
          {tiles.map((tile, i) => (
            <Tile key={i} tile={tile} />
          ))}
        </div>
      </div>

      {/* Ссылка внизу */}
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
