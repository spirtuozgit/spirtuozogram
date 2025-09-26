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
        if (!ring) return;
        const handle = document.getElementById("ringHandle");
        const timeEl = document.getElementById("time");
        const left = document.getElementById("chart-left");
        const right = document.getElementById("chart-right");

        let dragging = false;
        let prevPointer = null;
        const ECHO = 0.15;

        const toRad = (deg) => (deg * Math.PI) / 180;
        const norm360 = (a) => ((a % 360) + 360) % 360;
        const shortestDelta = (target, current) =>
            (target - current + 540) % 360 - 180;

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
            const size = parseFloat(
                getComputedStyle(ring).getPropertyValue("width")
            );
            const r = size / 2 - 2;
            const c = size / 2;
            const rad = toRad(angleDeg - 90);
            handle.style.left = `${c + r * Math.cos(rad)}px`;
            handle.style.top = `${c + r * Math.sin(rad)}px`;
        }

        // drag start
        function startDrag(x, y) {
            dragging = true;
            autoRotateRef.current = false;
            setAutoRotate(false);
            prevPointer = pointerAngle(x, y);
            ring.classList.add("ring-active");
        }

        // drag move
        function moveDrag(x, y) {
            if (!dragging) return;
            const cur = pointerAngle(x, y);
            const step = shortestDelta(cur, prevPointer);
            targetAngleRef.current += step;
            prevPointer = cur;
        }

        // drag end
        function endDrag() {
            if (dragging) {
                targetAngleRef.current = drawAngleRef.current;
            }
            dragging = false;
            prevPointer = null;
            ring.classList.remove("ring-active");
        }

        // mouse
        handle.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
        document.addEventListener("mousemove", (e) =>
            moveDrag(e.clientX, e.clientY)
        );
        document.addEventListener("mouseup", endDrag);

        // touch
        handle.addEventListener("touchstart", (e) =>
            startDrag(e.touches[0].clientX, e.touches[0].clientY)
        );
        document.addEventListener("touchmove", (e) =>
            moveDrag(e.touches[0].clientX, e.touches[0].clientY)
        );
        document.addEventListener("touchend", endDrag);

        // animation loop
        function tick() {
            if (autoRotateRef.current) {
                targetAngleRef.current += 0.3;
            }
            const delta = shortestDelta(
                targetAngleRef.current,
                drawAngleRef.current
            );
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

            requestAnimationFrame(tick);
        }

        placeHandleBy(0);
        requestAnimationFrame(tick);
    }, []);

    return (
        <main className="bg-black text-white w-screen h-screen overflow-hidden">
            {/* Кнопка назад */}
            <Link
                href="/"
                className="absolute top-4 left-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md z-20"
            >
                ← Назад
            </Link>

            {/* === ПК макет === */}
            <div className="hidden lg:block w-[1920px] h-[1080px] mx-auto relative overflow-hidden">
                <h1 className="absolute top-[60px] left-1/2 -translate-x-1/2 text-2xl">
                    Синхронизация с котом в течение дня
                </h1>

                <div className="absolute top-[150px] left-1/2 -translate-x-1/2 flex gap-[40px]">
                    <object
                        id="chart-left"
                        data="/svg/Man.svg"
                        className="w-[360px] h-[360px]"
                    />
                    <object
                        id="chart-right"
                        data="/svg/Cat.svg"
                        className="w-[360px] h-[360px]"
                    />
                    <img
                        src="/svg/sync.svg"
                        className="absolute left-1/2 top-1/2 w-[80px] -translate-x-1/2 -translate-y-1/2"
                    />
                </div>

                <div
                    id="ring"
                    className="absolute top-[600px] left-1/2 -translate-x-1/2 w-[260px] h-[260px]"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-white/80"></div>
                    <div
                        id="ringHandle"
                        className="absolute w-[20px] h-[20px] bg-contain bg-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ backgroundImage: "url(/svg/handle.svg)" }}
                    ></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 pointer-events-none">
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
                                        targetAngleRef.current = drawAngleRef.current;
                                    }
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-green-500 transition"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                        <span className="text-xs text-gray-400 select-none">
                            Автопрокрутка
                        </span>
                    </div>
                </div>

                {/* фоновые */}
                <img
                    src="/image/image_cat.png"
                    className="absolute bottom-0 left-[100px] w-[420px]"
                />
                <img
                    src="/image/image_clock.png"
                    className="absolute bottom-[250px] left-[40px] w-[220px]"
                />
                <img
                    src="/image/image_food.png"
                    className="absolute top-[80px] right-[120px] w-[240px]"
                />
                <img
                    src="/image/image_mouse.png"
                    className="absolute top-[180px] right-[180px] w-[140px]"
                />
            </div>

            {/* === Смартфон макет === */}
            <div className="block lg:hidden w-[1170px] h-[2532px] mx-auto relative overflow-hidden">
                <img
                    src="/image/image_food.png"
                    className="absolute top-[100px] right-[300px] w-[180px]"
                />
                <img
                    src="/image/image_mouse.png"
                    className="absolute top-[120px] left-[320px] w-[120px]"
                />

                <h1 className="absolute top-[400px] left-1/2 -translate-x-1/2 text-3xl">
                    Синхронизация с котом в течение дня
                </h1>

                <div className="absolute top-[500px] left-1/2 -translate-x-1/2 flex gap-[30px]">
                    <object
                        id="chart-left"
                        data="/svg/Man.svg"
                        className="w-[420px] h-[420px]"
                    />
                    <object
                        id="chart-right"
                        data="/svg/Cat.svg"
                        className="w-[420px] h-[420px]"
                    />
                    <img
                        src="/svg/sync.svg"
                        className="absolute left-1/2 top-1/2 w-[70px] -translate-x-1/2 -translate-y-1/2"
                    />
                </div>

                <div
                    id="ring"
                    className="absolute top-[1200px] left-1/2 -translate-x-1/2 w-[220px] h-[220px]"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-white/80"></div>
                    <div
                        id="ringHandle"
                        className="absolute w-[20px] h-[20px] bg-contain bg-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ backgroundImage: "url(/svg/handle.svg)" }}
                    ></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 pointer-events-none">
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
                                        targetAngleRef.current = drawAngleRef.current;
                                    }
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-green-500 transition"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                        <span className="text-xs text-gray-400 select-none">
                            Автопрокрутка
                        </span>
                    </div>
                </div>

                <img
                    src="/image/image_cat.png"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px]"
                />
                <img
                    src="/image/image_clock.png"
                    className="absolute bottom-[380px] left-[200px] w-[160px]"
                />
            </div>
        </main>
    );
}
