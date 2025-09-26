"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function ManVsCat() {
    const [autoRotate, setAutoRotate] = useState(false);

    const targetAngleRef = useRef(0);
    const drawAngleRef = useRef(0);
    const autoRotateRef = useRef(false);

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

            if (cat) cat.style.transform = `translateX(${Math.sin(rad) * depth}px) scale(1.1)`;
            if (food) food.style.transform = `translateX(${Math.sin(rad) * depth * 1.4}px)`;
            if (mouse) mouse.style.transform = `translateX(${Math.sin(rad * 1.5) * depth}px)`;
            if (clock) clock.style.transform = `translateX(${Math.sin(rad * 1.5) * depth - 40}px) scale(1.05)`;
        }

        // мышь
        handle.addEventListener("mousedown", (e) => {
            dragging = true;
            autoRotateRef.current = false;
            setAutoRotate(false);
            prevPointer = pointerAngle(e.clientX, e.clientY);
            e.preventDefault();
            ring.classList.add("ring-active");
        });

        document.addEventListener("mouseup", () => {
            if (dragging) {
                targetAngleRef.current = drawAngleRef.current;
            }
            dragging = false;
            prevPointer = null;
            ring.classList.remove("ring-active");
        });

        document.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            const cur = pointerAngle(e.clientX, e.clientY);
            const step = shortestDelta(cur, prevPointer);
            targetAngleRef.current += step;
            prevPointer = cur;
        });

        // сенсор
        handle.addEventListener("touchstart", (e) => {
            dragging = true;
            autoRotateRef.current = false;
            setAutoRotate(false);
            const touch = e.touches[0];
            prevPointer = pointerAngle(touch.clientX, touch.clientY);
            e.preventDefault();
            ring.classList.add("ring-active");
        });

        document.addEventListener("touchend", () => {
            if (dragging) targetAngleRef.current = drawAngleRef.current;
            dragging = false;
            prevPointer = null;
            ring.classList.remove("ring-active");
        });

        document.addEventListener("touchmove", (e) => {
            if (!dragging) return;
            const touch = e.touches[0];
            const cur = pointerAngle(touch.clientX, touch.clientY);
            const step = shortestDelta(cur, prevPointer);
            targetAngleRef.current += step;
            prevPointer = cur;
        });

        // анимация
        function tick() {
            if (autoRotateRef.current) {
                targetAngleRef.current += 0.3;
            }

            const delta = shortestDelta(targetAngleRef.current, drawAngleRef.current);
            drawAngleRef.current += delta * ECHO;

            const a = norm360(drawAngleRef.current);
            placeHandleBy(a);

            // два оборота за сутки
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
                className="absolute top-4 left-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md shadow-md transition z-20 text-sm sm:text-base"
            >
                ← Назад
            </Link>

            <h1 className="text-lg sm:text-xl mb-6 text-center px-2">
                Синхронизация с котом в течение дня
            </h1>

            {/* SVG диаграммы */}
            <div className="relative flex gap-2 z-10 justify-center">
                <object
                    id="chart-left"
                    type="image/svg+xml"
                    data="/svg/Man.svg"
                    className="w-[45vw] max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px] h-auto"
                ></object>
                <object
                    id="chart-right"
                    type="image/svg+xml"
                    data="/svg/Cat.svg"
                    className="w-[45vw] max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px] h-auto"
                ></object>
                <img
                    src="/svg/sync.svg"
                    alt="sync"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10vw] max-w-[60px] sm:max-w-[70px] md:max-w-[80px] lg:max-w-[90px] pointer-events-none"
                />
            </div>

            {/* Кольцо с таймером */}
            <div
                className="relative w-[65vw] max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] aspect-square z-[999] mt-4"
                id="ring"
            >
                <div className="absolute inset-0 rounded-full border-2 border-white/80"></div>

                <div
                    id="ringHandle"
                    className="absolute w-[20px] h-[20px] bg-contain bg-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ backgroundImage: "url(/svg/handle.svg)" }}
                ></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 pointer-events-none">
                    <div id="time" className="text-[4vw] sm:text-sm md:text-base lg:text-lg select-none">
                        00 ч 00 мин
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer pointer-events-auto scale-[0.7] sm:scale-90 md:scale-100">
                        <input
                            id="autoToggle"
                            type="checkbox"
                            checked={autoRotate}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setAutoRotate(checked);
                                autoRotateRef.current = checked;
                                if (!checked) {
                                    targetAngleRef.current = drawAngleRef.current;
                                }
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-green-500 transition"></div>
                        <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>

                    <span className="text-[3vw] sm:text-[11px] md:text-xs text-gray-400 select-none">
                        Автопрокрутка
                    </span>
                </div>
            </div>

            {/* Фоновые элементы */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Кот главный */}
                <img
                    src="/image/image_cat.png"
                    className="cat absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] max-w-[300px] sm:max-w-[380px] lg:max-w-[420px] h-auto blur-[0.5px] z-5"
                />
                {/* Второстепенные */}
                <img
                    src="/image/image_mouse.png"
                    className="mouse absolute top-[15%] right-[20%] w-[14vw] max-w-[60px] sm:opacity-100 opacity-50 h-auto blur-[1px]"
                />
                <img
                    src="/image/image_food.png"
                    className="food absolute top-[5%] right-[5%] w-[18vw] max-w-[80px] sm:opacity-100 opacity-50 h-auto blur-[0.5px]"
                />
                <img
                    src="/image/image_clock.png"
                    className="clock absolute bottom-[30%] left-[5%] w-[18vw] max-w-[70px] sm:opacity-100 opacity-40 h-auto blur-[2px] z-0"
                />
            </div>

            <style jsx>{`
        #ring.ring-active .rounded-full {
          border-color: #4ade80;
        }
      `}</style>
        </main>
    );
}
