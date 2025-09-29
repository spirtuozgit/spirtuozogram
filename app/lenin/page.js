"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function LeninPage() {
  return (
    <main className="bg-black min-h-screen relative">
      {/* Кнопка назад — крестик на чёрном фоне */}
      <button
        aria-label="Назад"
        onClick={() => window.history.back()}
        className="fixed top-4 right-4 z-50 text-white text-3xl font-light hover:text-gray-300"
      >
        ✕
      </button>

      {/* Десктоп: zoom/pan в аккуратном вьюпорте */}
      <div className="hidden md:flex items-center justify-center py-8">
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
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Мобилка: вертикальная прокрутка, картинка ниже крестика */}
      <div className="md:hidden w-full pt-16 pb-6">
        <img
          src="/phone.jpg"
          alt="Этапы жизни Ленина"
          className="block w-[92%] mx-auto h-auto select-none shadow-2xl"
          draggable={false}
        />
      </div>
    </main>
  );
}
