"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

export default function FridayPage() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const today = new Date().getDay() - 1;
  const [dayIndex, setDayIndex] = useState(today === -1 ? 6 : today);

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const fridayness = [0, 2, 4, 7, 10, 7, 3];

  useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = new ChartJS(canvasRef.current, {
        type: "line",
        data: {
          labels: days,
          datasets: [
            // базовая зелёная линия недели
            {
              label: "Пятничность недели",
              data: fridayness,
              borderColor: "#00ff88",
              backgroundColor: "rgba(0,255,136,0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: "#00ff88",
            },
            // жёлтая динамическая линия для выбранного дня
            {
              label: "Сегодня",
              data: fridayness.map((v, i) => (i === dayIndex ? v : 0)),
              borderColor: "#ffff00",
              backgroundColor: "rgba(255,255,0,0.3)",
              tension: 0.2,
              pointRadius: 6,
              pointBackgroundColor: days.map((_, i) =>
                i === dayIndex ? "#ff0" : "transparent"
              ),
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 400 },
          scales: {
            y: {
              min: 0,
              max: 10,
              title: { display: true, text: "0–10" },
            },
          },
        },
      });
    }
    return () => chartRef.current?.destroy();
  }, []);

  // обновляем жёлтую линию при движении слайдера
  useEffect(() => {
    if (chartRef.current) {
      const dynamicDataset = chartRef.current.data.datasets[1];
      dynamicDataset.data = fridayness.map((v, i) => (i === dayIndex ? v : 0));
      dynamicDataset.pointBackgroundColor = days.map((_, i) =>
        i === dayIndex ? "#ff0" : "transparent"
      );
      chartRef.current.update();
    }
  }, [dayIndex]);

  return (
    <main className="bg-black text-white w-screen h-screen flex flex-col items-center justify-center p-8">
      <Link
        href="/"
        className="absolute top-4 left-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md"
      >
        ← Назад
      </Link>

      <h1 className="text-2xl mb-6">📊 Насколько сегодня пятница?</h1>

      <canvas ref={canvasRef} className="max-w-xl"></canvas>

      <input
        type="range"
        min="0"
        max="6"
        step="1"
        value={dayIndex}
        onChange={(e) => setDayIndex(parseInt(e.target.value))}
        className="w-96 mt-4"
      />

      <p className="mt-2 text-lg">
        Сегодня: {days[dayIndex]} → пятничность {fridayness[dayIndex]}/10
      </p>
    </main>
  );
}
