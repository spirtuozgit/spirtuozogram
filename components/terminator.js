// components/terminator.js
import SunCalc from "suncalc";

/**
 * Полигон «ночной стороны» Земли
 * @param {Date} date
 * @param {number} stepLon шаг долготы (°)
 * @returns {Array<[number, number]>}
 */
export function computeTerminatorPolygon(date = new Date(), stepLon = 2) {
  const sunPos = SunCalc.getPosition(date, 0, 0);
  const subSolarLat = (sunPos.declination * 180) / Math.PI;

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;
  const subSolarLon = ((utcHours * 15) % 360) - 180;

  const latlngs = [];
  for (let lon = -180; lon <= 180; lon += stepLon) {
    const dLon = ((lon - subSolarLon + 540) % 360) - 180;
    const phiGp = (subSolarLat * Math.PI) / 180;
    let phi;
    if (Math.abs(Math.tan(phiGp)) < 1e-6) {
      phi = 0; // защита от деления на ноль (равноденствия)
    } else {
      phi = Math.atan(-Math.cos((dLon * Math.PI) / 180) / Math.tan(phiGp));
    }
    const lat = (phi * 180) / Math.PI;
    if (!Number.isNaN(lat)) latlngs.push([lat, lon]);
  }

  return [
    [-90, -180],
    ...latlngs,
    [-90, 180],
    [-90, -180],
  ];
}
