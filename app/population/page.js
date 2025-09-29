"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  TimeScale
);

// helpers
function startOfTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfTodayLocal() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// плагин для вертикальной линии «сейчас»
const currentTimeLine = {
  id: "currentTimeLine",
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const xScale = scales.x;
    if (!xScale) return;

    const now = new Date();
    if (now < startOfTodayLocal() || now > endOfTodayLocal()) return;

    const x = xScale.getPixelForValue(now);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  },
};

export default function PopulationPage() {
  const chartRef = useRef(null);

  const START_DATE_UTC = new Date("2025-01-01T00:00:00Z");
  const START_POP = 8_100_000_000;

  const BIRTHS_PER_DAY = 370_000;
  const DEATHS_PER_DAY = 150_000;

  const [population, setPopulation] = useState(START_POP);
  const [birthsToday, setBirthsToday] = useState(0);
  const [deathsToday, setDeathsToday] = useState(0);

  function computePopulationNow() {
    const now = Date.now();
    const secondsSinceStart = Math.floor(
      (now - START_DATE_UTC.getTime()) / 1000
    );
    const netPerSec = (BIRTHS_PER_DAY - DEATHS_PER_DAY) / 86400;
    return START_POP + netPerSec * secondsSinceStart;
  }

  // генерация точек от 00:00 до текущего времени
  function prefillData() {
    const births = [];
    const deaths = [];

    const start = startOfTodayLocal().getTime();
    const now = new Date();
    const current = now.getTime();
    const step = 5 * 60 * 1000; // шаг 5 минут

    const secondsSinceMidnight =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const progress = secondsSinceMidnight / 86400;

    setPopulation(computePopulationNow());
    setBirthsToday(BIRTHS_PER_DAY * progress);
    setDeathsToday(DEATHS_PER_DAY * progress);

    let prevB = 0;
    let prevD = 0;

    for (let t = start; t <= current; t += step) {
      const ts = new Date(t);
      const dayProgress = (t - start) / 86_400_000;

      // лёгкий шум ±3%
      const rfB = 0.97 + Math.random() * 0.06;
      const rfD = 0.97 + Math.random() * 0.06;

      let yB = BIRTHS_PER_DAY * dayProgress * rfB;
      let yD = DEATHS_PER_DAY * dayProgress * rfD;

      yB = Math.max(yB, prevB);
      yD = Math.max(yD, prevD);

      prevB = yB;
      prevD = yD;

      births.push({ x: ts, y: yB });
      deaths.push({ x: ts, y: yD });
    }

    births.push({ x: now, y: BIRTHS_PER_DAY * progress });
    deaths.push({ x: now, y: DEATHS_PER_DAY * progress });

    return { births, deaths };
  }

  function addPoint(chart) {
    const now = new Date();
    const secondsSinceMidnight =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const progress = secondsSinceMidnight / 86400;

    const births = BIRTHS_PER_DAY * progress;
    const deaths = DEATHS_PER_DAY * progress;

    setPopulation(computePopulationNow());
    setBirthsToday(births);
    setDeathsToday(deaths);

    chart.data.datasets[0].data.push({ x: now, y: births });
    chart.data.datasets[1].data.push({ x: now, y: deaths });

    chart.update("none");
  }

  useEffect(() => {
    const ctx = document.getElementById("populationChart").getContext("2d");
    chartRef.current?.destroy();

    const { births, deaths } = prefillData();

    chartRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Рожденные сегодня",
            data: births,
            borderColor: "rgb(0,200,255)",
            borderWidth: 2,
            tension: 0.5,
            pointRadius: 0,
          },
          {
            label: "Умершие сегодня",
            data: deaths,
            borderColor: "rgb(255,80,80)",
            borderWidth: 2,
            tension: 0.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            labels: { color: "#fff", font: { size: 14 }, usePointStyle: true },
          },
        },
        scales: {
          x: {
            type: "time",
            min: startOfTodayLocal(),
            max: endOfTodayLocal(),
            time: {
              unit: "hour",
              displayFormats: { hour: "HH:mm" },
            },
            ticks: { color: "#fff" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          y: {
            min: 0,
            max: 500_000,
            ticks: {
              color: "#fff",
              callback: (v) => Number(v).toLocaleString("ru-RU"),
            },
            grid: { color: "rgba(255,255,255,0.06)" },
          },
        },
      },
      plugins: [currentTimeLine],
    });

    const secTimer = setInterval(() => {
      addPoint(chartRef.current);
    }, 1000);

    return () => {
      clearInterval(secTimer);
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      {/* Кнопка назад */}
      <button
        className="absolute top-4 right-4 text-white text-2xl bg-white/10 backdrop-blur-md rounded-full px-3 py-1 hover:bg-white/20"
        onClick={() => window.history.back()}
      >
        ✕
      </button>

      <h1 className="text-3xl font-bold mb-2">Рост населения Земли</h1>
      <h2 className="text-2xl font-semibold mb-6">
        Население: {Math.round(population).toLocaleString("ru-RU")}
      </h2>

      <canvas
        id="populationChart"
        width="900"
        height="420"
        style={{ display: "block", margin: "0 auto" }}
      />

      <div className="mt-6 text-lg text-center">
        <p>Рожденные сегодня: {Math.round(birthsToday).toLocaleString("ru-RU")}</p>
        <p>Умершие сегодня: {Math.round(deathsToday).toLocaleString("ru-RU")}</p>
      </div>
    </div>
  );
}
