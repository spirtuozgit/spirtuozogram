"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadSound, playSound } from "../utils/audio";

export default function Menu() {
  const [layout, setLayout] = useState({ cols: 3, maxWidth: 360 });
  const [ageConfirmed, setAgeConfirmed] = useState(null);

  useEffect(() => {
    // ✅ Загружаем звук клика (автоматически выберет .m4a на iOS/Android, .ogg на остальных)
    loadSound("click", "/common/sound/click").catch(() =>
      console.warn("Ошибка загрузки click")
    );

    // Восстанавливаем выбор возраста
    const saved = localStorage.getItem("ageConfirmed");
    if (saved === "true") setAgeConfirmed(true);
    if (saved === "false") window.location.href = "/kids";

    // Адаптивная сетка
    const updateLayout = () => {
      const portrait = window.innerHeight >= window.innerWidth;
      if (portrait) {
        if (window.innerWidth < 360) {
          setLayout({ cols: 2, maxWidth: 240 });
        } else {
          setLayout({ cols: 3, maxWidth: 360 });
        }
      } else {
        setLayout({ cols: 6, maxWidth: 720 });
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const tiles = [
    { href: "/horse", label: "Я лошадь?", icon: "/common/icons/horse_icon.png" },
    { href: "/fact", label: "Факты", icon: "/common/icons/fact_icon.png" },
    { href: "/duck", label: "Покрути уточку", icon: "/common/icons/duck_icon.png" },
    { href: "/microbe", label: "Микроб-Матершинник", icon: "/common/icons/microbe_icon.png" },
    { href: "/doodletest", label: "Дудло-Тест", icon: "/common/icons/doodle_icon.png" },
    { href: "/pop", label: "Тык-Пык", icon: "/common/icons/pop_icon.png" },
    { href: "/soon", label: "Скоро...", icon: "/common/icons/soon_icon.png", disabled: true },
    { href: "/soon", label: "Скоро...", icon: "/common/icons/soon_icon.png", disabled: true },
    { href: "/soon", label: "Скоро...", icon: "/common/icons/soon_icon.png", disabled: true },
  ];

  // --- Экран проверки возраста ---
  if (ageConfirmed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-6">Вам есть 18 лет?</h1>
        <div className="flex gap-6">
          <button
            onClick={() => {
              setAgeConfirmed(true);
              localStorage.setItem("ageConfirmed", "true");
            }}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Да
          </button>
          <button
            onClick={() => {
              localStorage.setItem("ageConfirmed", "false");
              window.location.href = "/kids";
            }}
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Нет
          </button>
        </div>
      </div>
    );
  }

  // --- Основное меню ---
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Логотип */}
      <div className="flex-shrink-0 flex flex-col items-center py-3 px-2">
        <Image
          src="/logo_small.png"
          alt="SPIRTUOZGRAM logo"
          width={280}
          height={90}
          className="w-[55vw] max-w-[300px] h-auto mb-2"
          priority
        />
        <p className="text-[10px] sm:text-xs text-gray-400 leading-tight mb-2 text-center">
          Самая полезная информация на все случаи жизни
        </p>
      </div>

      {/* Сетка плиток */}
      <div className="flex-1 overflow-y-auto px-2">
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gap: "8px",
            maxWidth: `${layout.maxWidth}px`,
          }}
        >
          {tiles.map((tile, index) =>
            tile.disabled ? (
              <div
                key={`disabled-${index}`}
                className="flex flex-col items-center justify-center text-gray-500 opacity-60"
              >
                <img
                  src={tile.icon}
                  alt={tile.label}
                  style={{ width: "100px", height: "100px" }}
                />
                <span className="mt-1 text-[10px] sm:text-xs text-center break-words">
                  {tile.label}
                </span>
              </div>
            ) : (
              <Link
                key={`tile-${index}`}
                href={tile.href}
                onClick={() => playSound("click")}
                className="flex flex-col items-center justify-center"
              >
                <img
                  src={tile.icon}
                  alt={tile.label}
                  style={{ width: "100px", height: "100px" }}
                />
                <span className="mt-1 text-[10px] sm:text-xs text-center break-words">
                  {tile.label}
                </span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Футер */}
      <div className="flex-shrink-0 text-center text-gray-500 text-[9px] sm:text-[10px] md:text-xs pb-[env(safe-area-inset-bottom)] py-2">
        <a
          href="https://t.me/dimaspirtuoz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          t.me/dimaspirtuoz
        </a>
      </div>
    </div>
  );
}
