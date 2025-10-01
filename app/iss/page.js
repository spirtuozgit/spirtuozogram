"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FooterLink from "../../components/FooterLink";
import Loader from "../../components/Loader";

const ISSMap = dynamic(() => import("../../components/ISSMap"), { ssr: false });

export default function ISSPage() {
  const [issData, setIssData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("—");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!res.ok) throw new Error("Ошибка координат");
        const data = await res.json();
        setIssData(data);

        // Геолокация
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${data.latitude}&lon=${data.longitude}&format=json`
          );

          if (geoRes.ok) {
            const geoData = await geoRes.json();

            if (geoData.address?.city || geoData.address?.town) {
              const city = geoData.address.city || geoData.address.town;
              const country = geoData.address.country || "";
              setLocationName(`${city}, ${country}`);
            } else if (geoData.address?.country) {
              setLocationName(geoData.address.country);
            } else {
              // fallback на океан
              const oceanRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${data.latitude}&longitude=${data.longitude}&localityLanguage=en`
              );

              if (oceanRes.ok) {
                const oceanData = await oceanRes.json();
                if (oceanData.ocean) {
                  const oceanMap = {
                    "Pacific Ocean": "Тихий океан",
                    "Atlantic Ocean": "Атлантический океан",
                    "Indian Ocean": "Индийский океан",
                    "Southern Ocean": "Южный океан",
                    "Arctic Ocean": "Северный Ледовитый океан",
                  };
                  setLocationName(oceanMap[oceanData.ocean] || oceanData.ocean);
                } else {
                  setLocationName("Нет точных данных");
                }
              } else {
                setLocationName("Нет точных данных");
              }
            }
          } else {
            setLocationName("Нет точных данных");
          }
        } catch {
          setLocationName("Нет точных данных");
        }
      } catch (err) {
        console.error("Ошибка:", err);
        setLocationName("Нет точных данных");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader text="Сканируем космос, ищем МКС…" />;

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      {/* крестик */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 right-4 text-3xl text-white z-50"
      >
        ✕
      </button>

      {/* Верх: карта */}
      <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-2">
         <div className="w-full max-w-[800px] h-[300px] sm:h-[400px] rounded-2xl overflow-hidden shadow-lg">
          <ISSMap issData={issData} />
        </div>
      </div>

      {/* Локация */}
      <div className="w-full flex justify-center mb-4">
        <div className="text-center text-sm sm:text-base text-gray-200">
          Пролетаем над: <span className="font-semibold">{locationName}</span>
          {issData && <> · Скорость: {Math.round(issData.velocity)} км/ч</>}
        </div>
      </div>

      {/* Видео */}
      <div className="w-full flex justify-center mb-4">
        <div
          className="w-full max-w-[800px] rounded-2xl overflow-hidden shadow-xl"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            src="https://www.youtube.com/embed/fO9e9jnhYK8?autoplay=1&mute=1"
            title="ISS Live YouTube"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      {/* Футер */}
      <div className="w-full">
        <FooterLink />
      </div>
    </div>
  );
}
