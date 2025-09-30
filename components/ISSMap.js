"use client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import L from "leaflet";

// иконка ISS
const issIcon = new L.Icon({
  iconUrl: "/iss_icon.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

function ISSController({ issData, crew }) {
  const map = useMap();
  const [showCrew, setShowCrew] = useState(false);

  // следим за ISS и двигаем карту
  useEffect(() => {
    if (!issData) return;
    const newPos = [issData.latitude, issData.longitude];
    map.setView(newPos, map.getZoom(), { animate: true });
  }, [issData, map]);

  return (
    <>
      {/* Маркер ISS */}
      {issData && (
        <Marker
          position={[issData.latitude, issData.longitude]}
          icon={issIcon}
          eventHandlers={{
            click: () => setShowCrew(true),
          }}
        />
      )}

      {/* окно экипажа */}
      {showCrew && (
        <div
          style={{
            position: "absolute",
            bottom: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.9)",
            padding: "16px",
            borderRadius: "12px",
            color: "white",
            minWidth: "220px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setShowCrew(false)}
            style={{
              position: "absolute",
              top: "6px",
              right: "10px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>👩‍🚀 Экипаж МКС</h3>
          {crew && crew.length > 0 ? (
            <ul style={{ fontSize: "14px", lineHeight: "1.4" }}>
              {crew.map((person, idx) => (
                <li key={idx}>• {person.name}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "14px", opacity: 0.7 }}>Нет данных</p>
          )}
        </div>
      )}
    </>
  );
}

function ISSMapClient({ issData, crew }) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="w-full h-full"
        worldCopyJump={true}
        attributionControl={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        minZoom={2}
        maxZoom={6}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />
        <ISSController issData={issData} crew={crew} />
      </MapContainer>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ISSMapClient), { ssr: false });
