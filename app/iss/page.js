"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";

const ISSMap = dynamic(() => import("../../components/ISSMap"), { ssr: false });

export default function ISSPage() {
  const [issData, setIssData] = useState(null);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrew, setShowCrew] = useState(false);

  // загрузка данных
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const data = await res.json();
        setIssData(data);

        // экипаж через open-notify (HTTP)
        try {
          const crewRes = await fetch("http://api.open-notify.org/astros.json");
          const crewData = await crewRes.json();
          setCrew(crewData.people || []);
        } catch (err) {
          console.error("Ошибка загрузки космонавтов:", err);
          setCrew([]);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatOver = (loc) => {
    if (!loc) return "—";
    return loc;
  };

  if (loading) {
    return <Loader text="Сканируем космос, ищем МКС…" />;
  }

  return (
    <div className="relative w-full min-h-screen bg-black text-white flex flex-col items-center px-4 pt-6 pb-[env(safe-area-inset-bottom)]">
      {/* крестик */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 right-4 text-3xl text-white z-50"
      >
        ✕
      </button>

      {/* Заголовок */}
      <h1 className="text-2xl font-semibold mb-4 text-center">
        МКС на карте
      </h1>

      {/* Данные */}
      {issData && (
        <div className="grid grid-cols-2 gap-2 text-gray-200 text-sm sm:text-base text-center mb-4">
          <div>Широта: {issData.latitude.toFixed(2)}°</div>
          <div>Долгота: {issData.longitude.toFixed(2)}°</div>
          <div>Скорость: {Math.round(issData.velocity)} км/ч</div>
          <div>Пролетаем: {formatOver(issData.location)}</div>
        </div>
      )}

      {/* Карта */}
      <div className="w-full max-w-5xl h-[30vh] sm:h-[320px] rounded-2xl overflow-hidden shadow-lg relative mb-4">
        <ISSMap issData={issData} crew={crew} />
      </div>

      {/* Кнопка экипажа */}
      <button
        onClick={() => setShowCrew(true)}
        className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
      >
        Сколько всего людей сейчас в космосе
      </button>

      {/* YouTube с дисклеймером */}
      <div className="w-full max-w-5xl space-y-2 mb-6">
        <p className="text-xs text-gray-400 text-center">
          в случае потери связи со станцией возможен показ предыдущих записей
        </p>
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src="https://www.youtube.com/embed/fO9e9jnhYK8?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0"
            title="ISS Live"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
            onError={(e) => {
              e.target.parentNode.innerHTML =
                '<div class="flex items-center justify-center w-full h-full text-white text-center text-sm">Видео недоступно</div>';
            }}
          />
        </div>
      </div>

      {/* Футер */}
      <FooterLink />

      {/* Модалка с экипажем поверх всего */}
      {showCrew && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-white relative">
            <button
              onClick={() => setShowCrew(false)}
              className="absolute top-2 right-3 text-2xl hover:text-red-400"
            >
              ✕
            </button>
            <h1 className="text-lg font-semibold mb-4 text-left">Сейчас в космосе:</h1>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {crew.length > 0 ? (
                crew.map((person, i) => (
                  <li key={i} className="border-b border-white/20 pb-1">
                    {person.name} ({person.craft})
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Нет данных об экипаже</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
