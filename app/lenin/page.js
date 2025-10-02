"use client";

import { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";
import { playSound, loadSound } from "../../utils/audio"; // ✅ новый звук

export default function LeninPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // предзагружаем звук для клика
    loadSound("click", "/sound/click.ogg").catch((e) =>
      console.warn("Ошибка предзагрузки звука:", e)
    );
  }, []);

  const handleBack = () => {
    playSound("click"); // звук при возврате
    window.history.back();
  };

  const handleImageLoad = () => {
    setLoaded(true);
    playSound("pop1"); // звук при загрузке (если хочешь)
  };

  return (
    <main className="bg-black min-h-screen relative flex flex-col">
      {!loaded && <Loader text="Загружаем Ленина…" />}

      {/* Кнопка назад (фиксированная) */}
      <button
        aria-label="Назад"
        onClick={handleBack}
        className="fixed top-4 right-4 z-50 text-white text-3xl font-light hover:text-gray-300"
      >
        ✕
      </button>

      {/* Десктоп: zoom/pan */}
      <div className="hidden md:flex flex-1 items-center justify-center py-8">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: true }}
          wheel={{ step: 0.12 }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "90vw",
              height: "80vh",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            contentStyle={{ width: "auto", height: "auto" }}
          >
            <img
              src="/desktop.jpg"
              alt="Этапы жизни Ленина"
              className="block max-w-full max-h-full mx-auto select-none"
              draggable={false}
              onLoad={handleImageLoad}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Мобилка со скроллом */}
      <div className="md:hidden flex-1 w-full pt-16 pb-6 overflow-auto">
        <div className="w-[200%]">
          <img
            src="/phone.jpg"
            alt="Этапы жизни Ленина"
            className="block w-full h-auto select-none shadow-2xl"
            draggable={false}
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      {/* Футер (фиксированный + safe-area) */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>
    </main>
  );
}
