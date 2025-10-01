"use client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import L from "leaflet";

// иконка ISS
const issIcon = new L.Icon({
  iconUrl: "/iss_icon.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

function ISSController({ issData }) {
  const map = useMap();

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
        />
      )}
    </>
  );
}

function ISSMapClient({ issData }) {
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
        <ISSController issData={issData} />
      </MapContainer>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ISSMapClient), { ssr: false });
