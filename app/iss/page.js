"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink"; // ✅ футер

// карту подгружаем только на клиенте
const ISSMap = dynamic(() => import("../../components/ISSMap"), { ssr: false });

export default function ISSPage() {
  const [issData, setIssData] = useState(null);
  const [location, setLocation] = useState(null);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchLocation(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=5&addressdetails=1`,
        { headers: { "User-Agent": "ISS-Tracker" } }
      );
      const data = await res.json();
      return data.address || null;
    } catch {
      return null;
    }
  }

  function formatOver(loc) {
    if (!loc) return "над океаном";
    if (loc.city && loc.country) return `${loc.city}, ${loc.country}`;
    if (loc.state && loc.country) return `${loc.state}, ${loc.country}`;
    if (loc.country) return loc.country;
    return "над океаном";
  }

  useEffect(() => {
    let interval;

    const loadAll = async () => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const data = await res.json();
        setIssData(data);

        const locData = await fetchLocation(data.latitude, data.longitude);
        setLocation(locData);

        const crewRes = await fetch("http://api.open-notify.org/astros.json");
        const crewData = await crewRes.json();
        const issCrew = crewData.people.filter((p) => p.craft === "ISS");
        setCrew(issCrew);

        setLoading(false);

        interval = setInterval(async () => {
          try {
            const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
            const data = await res.json();
            setIssData(data);

            const locData = await fetchLocation(data.latitude, data.longitude);
            setLocation(locData);

            const crewRes = await fetch("http://api.open-notify.org/astros.json");
            const crewData = await crewRes.json();
            const issCrew = crewData.people.filter((p) => p.craft === "ISS");
            setCrew(issCrew);
          } catch (err) {
            console.error("Ошибка обновления ISS:", err);
          }
        }, 3000);
      } catch (err) {
        console.error("Ошибка первой загрузки ISS:", err);
        setLoading(false);
      }
    };

    loadAll();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen px-6 py-8 flex flex-col items-center gap-8 relative pb-16">
      {loading && <Loader text="Сканируем космос, ищем МКС…" />}

      {/* крестик назад */}
      <Link
        href="/"
        className="absolute top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      <h1 className="text-4xl font-semibold">🌌 Международная космическая станция</h1>

      {issData && (
        <div className="text-center space-y-1 text-gray-200">
          <div>Широта: {issData.latitude.toFixed(4)}°</div>
          <div>Долгота: {issData.longitude.toFixed(4)}°</div>
          <div>Скорость: {Math.round(issData.velocity)} км/ч</div>
          <div>Пролетаем: {formatOver(location)}</div>
        </div>
      )}

      {!loading && (
        <div className="w-full max-w-5xl h-[60vh] sm:h-[420px] rounded-2xl overflow-hidden shadow-lg relative">
          <ISSMap issData={issData} crew={crew} />
        </div>
      )}

      {!loading && (
        <div
          className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src="https://www.youtube.com/embed/fO9e9jnhYK8?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0"
            title="ISS Live"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* фиксированный футер */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md">
        <FooterLink />
      </div>
    </div>
  );
}
