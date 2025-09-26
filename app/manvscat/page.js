"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function ManVsCat() {
    const [autoRotate, setAutoRotate] = useState(false);

    // углы и флаги через useRef
    const targetAngleRef = useRef(0);
    const drawAngleRef = useRef(0);
    const autoRotateRef = useRef(false); // текущее состояние авто

    useEffect(() => {
        const ring = document.getElementById("ring");
        const handle = document.getElementById("ringHandle");
        const timeEl = document.getElementById("time");
        const left = document.getElementById("chart-left");
        const right = document.getElementById("chart-right");

        let dragging = false;
        let prevPointer = null;
        const ECHO = 0.15;

        const toRad = (deg) => (deg * Math.PI) / 180;
        const norm360 = (a) => ((a % 360) + 360) % 360;

        function shortestDelta(target, current) {
            return (target - current + 540) % 360 - 180;
        }

        function pointerAngle(clientX, clientY) {
            const r = ring.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;
            let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
            if (deg < 0) deg += 360;
            return (deg + 90) % 360;
        }

        function placeHandleBy(angleDeg) {
            const size = parseFloat(getComputedStyle(ring).getPropertyValue("width"));
            const r = size / 2 - 2;
            const c = size / 2;
            const rad = toRad(angleDeg - 90);
            handle.style.left = `${c + r * Math.cos(rad)}px`;
            handle.style.top = `${c + r * Math.sin(rad)}px`;
        }

        function updateParallax(angle) {
            const rad = (angle * Math.PI) / 180;
            const depth = 20;

            const cat = document.querySelector(".cat");
            const food = document.querySelector(".food");
            const mouse = document.querySelector(".mouse");
            const clock = document.querySelector(".clock");

            if (cat) cat.style.transform = `translateX(${Math.sin(rad) * depth}px) scale(1.2)`;
            if (food) food.style.transform = `translateX(${Math.sin(rad) * depth * 1.5}px)`;
            if (mouse) mouse.style.transform = `translateX(${Math.sin(rad * 1.5) * depth}px)`;
            if (clock) clock.style.transform = `translateX(${Math.sin(rad * 1.5) * depth - 80}px) scale(1.05)`;
        }

        handle.addEventListener("mousedown", (e) => {
            dragging = true;
            autoRotateRef.current = false; // выключаем авто
            setAutoRotate(false);
            prevPointer = pointerAngle(e.clientX, e.clientY);
            e.preventDefault();

            // подсветка кольца при захвате
            ring.classList.add("ring-active");
        });

        document.addEventListener("mouseup", () => {
            if (dragging) {
                targetAngleRef.current = drawAngleRef.current; // синхронизируем углы
            }
            dragging = false;
            prevPointer = null;

            // убрать подсветку
            ring.classList.remove("ring-active");
        });

        document.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            const cur = pointerAngle(e.clientX, e.clientY);
            const step = shortestDelta(cur, prevPointer);
            targetAngleRef.current += step
            ;
            prevPointer = cur;
        });

        function tick() {
            if (autoRotateRef.current) {
                targetAngleRef.current += 0.3;
            }

            const delta = shortestDelta(targetAngleRef.current, drawAngleRef.current);
            drawAngleRef.current += delta * ECHO;

            // нормализуем только для ручки
            const a = norm360(drawAngleRef.current);

            placeHandleBy(a);

            // Два оборота за сутки (720° = 24 ч)
            const minutes = Math.round((drawAngleRef.current / 720) * 1440);
            const hours = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
            const mins = String(minutes % 60).padStart(2, "0");
            timeEl.textContent = `${hours} ч ${mins} мин`;

            if (left) left.style.transform = `rotate(${a}deg)`;
            if (right) right.style.transform = `rotate(${-a}deg)`;

            updateParallax(drawAngleRef.current);
            requestAnimationFrame(tick);
        
        }

        placeHandleBy(0);
        requestAnimationFrame(tick);
    }, []);

    return (
        <main className="relative flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden">
            {/* Кнопка назад */}
            <Link
                href="/"
                className="absolute top-4 left-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md transition z-20"
            >
                ← Назад
            </Link>

            <h1 className="text-xl mb-6">Синхронизация с котом в течение дня</h1>

            {/* SVG графика */}
            <div className="relative flex gap-0 z-10">
                <object id="chart-left" type="image/svg+xml" data="/svg/Man.svg" className="w-[320px] h-[320px]"></object>
                <object id="chart-right" type="image/svg+xml" data="/svg/Cat.svg" className="w-[320px] h-[320px]"></object>
                <img
                    src="/svg/sync.svg"
                    alt="sync"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] pointer-events-none"
                />
            </div>

            {/* Кольцо */}
            <div className="relative w-[220px] h-[220px] z-[999]" id="ring">
                {/* толще кольцо */}
                <div className="absolute inset-0 rounded-full border-2 border-white/80"></div>

                {/* Ручка */}
                <div
                    id="ringHandle"
                    className="absolute w-[20px] h-[20px] bg-contain bg-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ backgroundImage: "url(/svg/handle.svg)" }}
                ></div>

                {/* Время и тумблер внутри кольца */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-300 pointer-events-none">
                    <div id="time" className="text-lg select-none">
                        00 ч 00 мин
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer pointer-events-auto">
                        <input
                            id="autoToggle"
                            type="checkbox"
                            checked={autoRotate}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setAutoRotate(checked);
                                autoRotateRef.current = checked;
                                if (!checked) {
                                    targetAngleRef.current = drawAngleRef.current; // фиксируем положение
                                }
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-700 rounded-full peer-checked:bg-green-500 transition"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </label>

                    <span className="text-xs text-gray-400 select-none">Автопрокрутка</span>
                </div>
            </div>

            {/* Фоновые элементы */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                    src="/image/image_cat.png"
                    className="cat absolute bottom-0 left-[10%] w-[420px] blur-[0px] z-50"
                />
                <img
                    src="/image/image_mouse.png"
                    className="mouse absolute top-[80px] right-[18%] w-[120px] blur-[1px] z-10"
                />
                <img
                    src="/image/image_food.png"
                    className="food absolute top-[40px] right-[10%] w-[300px] blur-[0px] opacity-100 z-20"
                />
                <img
                    src="/image/image_clock.png"
                    className="clock absolute bottom-[20%] left-[5%] w-[380px] blur-[2px] opacity-80 z-0"
                />
            </div>

            {/* Подсветка кольца */}
            <style jsx>{`
        #ring.ring-active .rounded-full {
          border-color: #4ade80; /* зелёная подсветка */
        }
      `}</style>
        </main>
    );
}
