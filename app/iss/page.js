"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ISSMap = dynamic(() => import("../../components/ISSMap"), { ssr: false });

export default function ISSPage() {
  const [issData, setIssData] = useState(null);
  const [location, setLocation] = useState(null);

  function formatOver(loc) {
    if (!loc) return "над океаном";
    const parts = [];
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    if (loc.country) parts.push(loc.country);
    if (!parts.length && loc.country_code) parts.push(loc.country_code);
    if (!parts.length && loc.ocean) parts.push(loc.ocean);
    if (!parts.length && loc.timezone_id) parts.push(loc.timezone_id.split("/").pop());
    return parts.length ? parts.join(", ") : "над океаном";
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const data = await res.json();
        setIssData(data);

        try {
          const locRes = await fetch(
            `https://api.wheretheiss.at/v1/coordinates/${data.latitude},${data.longitude}`
          );
          const locData = await locRes.json();
          setLocation(locData);
        } catch {}
      } catch (err) {
        console.error("Ошибка загрузки ISS:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen px-6 py-8 flex flex-col items-center gap-8">
      <h1 className="text-4xl font-semibold">🌌 Международная космическая станция</h1>

      {issData && (
        <div className="text-center space-y-1 text-gray-200">
          <div>Широта: {issData.latitude.toFixed(4)}°</div>
          <div>Долгота: {issData.longitude.toFixed(4)}°</div>
          <div>Скорость: {Math.round(issData.velocity)} км/ч</div>
          <div>Над: {formatOver(location)}</div>
        </div>
      )}

      <div className="w-full max-w-5xl h-[420px] rounded-2xl overflow-hidden shadow-lg">
        <ISSMap issData={issData} />
      </div>

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
    </div>
  );
}
