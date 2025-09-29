"use client";
import { MapContainer, TileLayer, Marker, Polyline, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { computeTerminatorPolygon } from "./terminator";

const issIcon = new L.Icon({
  iconUrl: "/iss_icon.png",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// автоцентрирование карты на ISS
function AutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

// плавный маркер
function ISSMarker({ position }) {
  const [pos, setPos] = useState(position);
  useEffect(() => {
    if (!position) return;
    const start = pos || position;
    const end = position;
    let step = 0;
    const steps = 50;
    const id = setInterval(() => {
      step++;
      const lat = start[0] + (end[0] - start[0]) * (step / steps);
      const lon = start[1] + (end[1] - start[1]) * (step / steps);
      setPos([lat, lon]);
      if (step >= steps) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [position]);
  return pos ? <Marker position={pos} icon={issIcon} /> : null;
}

// слой день/ночь
function DayNightLayer() {
  const [polygon, setPolygon] = useState([]);
  useEffect(() => {
    const update = () => setPolygon(computeTerminatorPolygon(new Date(), 2));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);
  return polygon.length ? (
    <Polygon positions={polygon} pathOptions={{ color: "none", fillColor: "#000022", fillOpacity: 0.5 }} />
  ) : null;
}

export default function ISSMap({ issData }) {
  const [path, setPath] = useState([]);          // прошедший путь
  const [futurePath, setFuturePath] = useState([]); // прогнозируемая траектория
  const futureLock = useRef(0);

  // история
  useEffect(() => {
    if (issData) {
      setPath((prev) => [...prev.slice(-200), [issData.latitude, issData.longitude]]);
    }
  }, [issData]);

  // прогноз траектории (API wheretheiss.at)
  useEffect(() => {
    if (!issData) return;
    const now = Math.floor(Date.now() / 1000);
    if (now - futureLock.current < 60) return;
    futureLock.current = now;

    const timestamps = Array.from({ length: 31 }, (_, i) => now + i * 30).join(",");
    const url = `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamps}&units=kilometers`;

    fetch(url)
      .then((r) => r.json())
      .then((arr) => {
        if (Array.isArray(arr)) {
          const pts = arr.map((p) => [p.latitude, ((p.longitude + 540) % 360) - 180]);
          setFuturePath(pts);
        }
      })
      .catch(() => {});
  }, [issData]);

  const position = useMemo(
    () => (issData ? [issData.latitude, issData.longitude] : [0, 0]),
    [issData]
  );

  const gradientPath = useMemo(
    () =>
      path.map((p, i) => ({
        latlng: p,
        color: `hsl(${(i / Math.max(path.length, 1)) * 120}, 100%, 50%)`,
      })),
    [path]
  );

  return (
    <MapContainer
      center={position}
      zoom={3}
      minZoom={2}
      maxZoom={7}
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%" }}
      worldCopyJump={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      <ISSMarker position={position} />
      <AutoCenter position={position} />

      {/* Пройденный путь */}
      {gradientPath.map((seg, i) =>
        i < gradientPath.length - 1 ? (
          <Polyline
            key={i}
            positions={[gradientPath[i].latlng, gradientPath[i + 1].latlng]}
            color={gradientPath[i].color}
            weight={2}
          />
        ) : null
      )}

      {/* Будущий путь */}
      {futurePath.length > 1 && (
        <Polyline positions={futurePath} color="red" dashArray="6" weight={2} />
      )}

      <DayNightLayer />
    </MapContainer>
  );
}
