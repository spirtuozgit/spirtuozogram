// utils/sfx8bit.js
// ============================================================
// 🎮 SPIRTUOZ 8-BIT SOUND FX LIBRARY
// Использует playTone() из audio.js v3
// ============================================================

import { playTone } from "./audio";

export const sfx = {
  // 📦 короткий клик (UI)
  click() {
    playTone(700, { type: "square", duration: 0.07, volume: 0.25, pitchRandom: 5 });
  },

  // 💰 монетка / поощрение
  coin() {
    const notes = [900, 1200, 1500];
    notes.forEach((f, i) =>
      setTimeout(() => playTone(f, { type: "square", duration: 0.06, volume: 0.25 }), i * 60)
    );
  },

  // ✅ успех / правильный ответ
  success() {
    const tones = [500, 700, 950];
    tones.forEach((t, i) =>
      setTimeout(() => playTone(t, { type: "triangle", duration: 0.1, volume: 0.25 }), i * 120)
    );
  },

  // ❌ ошибка / промах
  fail() {
    playTone(340, { type: "square", duration: 0.15, volume: 0.3 });
    setTimeout(() => playTone(210, { type: "square", duration: 0.25, volume: 0.25 }), 100);
  },

  // 🏁 старт уровня
  start() {
    const tones = [400, 500, 600, 800];
    tones.forEach((t, i) =>
      setTimeout(() => playTone(t, { type: "square", duration: 0.08, volume: 0.25 }), i * 90)
    );
  },

  // 💥 взрыв / проигрыш
  explosion() {
    for (let i = 0; i < 10; i++) {
      const f = 900 - i * 60 + Math.random() * 100;
      setTimeout(() => {
        playTone(f, {
          type: "sawtooth",
          duration: 0.05 + Math.random() * 0.1,
          volume: 0.2,
          pitchRandom: 20,
        });
      }, i * 25);
    }
  },

  // 🪜 прыжок
  jump() {
    playTone(600, { type: "square", duration: 0.08, volume: 0.2 });
    setTimeout(() => playTone(900, { type: "square", duration: 0.08, volume: 0.2 }), 70);
  },

  // 🎉 победа / финиш
  win() {
    const melody = [400, 600, 800, 1000, 1200];
    melody.forEach((n, i) =>
      setTimeout(() => playTone(n, { type: "triangle", duration: 0.1, volume: 0.25 }), i * 100)
    );
  },

  // 🌟 появление нового объекта
  spawn() {
    playTone(1200, { type: "square", duration: 0.05, volume: 0.2 });
    setTimeout(() => playTone(800, { type: "triangle", duration: 0.05, volume: 0.2 }), 70);
  },

  // 🔔 уведомление
  ding() {
    playTone(1000, { type: "triangle", duration: 0.15, tremolo: 5, volume: 0.25 });
  },

  // 💫 лёгкий блик / шаг
  blip() {
    playTone(800, { type: "square", duration: 0.06, pitchRandom: 5, volume: 0.2 });
  },

  // 🧩 серия / комбо — динамически по уровню
  combo(level = 1) {
    const baseFreq = 500;
    const count = Math.min(6, 2 + level);
    for (let i = 0; i < count; i++) {
      const f = baseFreq + i * 120 + Math.random() * 40;
      setTimeout(() => {
        playTone(f, {
          type: i % 2 ? "square" : "triangle",
          duration: 0.08,
          volume: 0.25,
          pitchRandom: 4,
        });
      }, i * 80);
    }
  },
};
