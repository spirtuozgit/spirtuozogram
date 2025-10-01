"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { playAudio } from "../../utils/audio"; // ✅ используем общий модуль

/* === ДАННЫЕ ТЕСТА === */
const NODES = {
  start: { text: "Ты лошадь?" },
  notHorse1: { text: "Ты не лошадь.", final: true },
  legs: { text: "Сколько у тебя ног?" },
  notHorse2: { text: "Ты не лошадь.", final: true },
  sure: { text: "Точно?" },
  read: { text: "Ты умеешь читать и писать?" },
  notHorse3: { text: "Ты не лошадь.", final: true },
  lie: { text: "Врёшь, ты ведь читаешь это" },
  final: { text: "Ты не лошадь.", final: true },
};

const BUTTONS = {
  start: [
    { label: "Нет", to: "notHorse1" },
    { label: "Да", to: "legs" },
    { label: "Может быть", to: "legs" },
  ],
  legs: [
    { label: "Две", to: "notHorse2" },
    { label: "Четыре", to: "sure" },
  ],
  sure: [
    { label: "Нет", to: "read" },
    { label: "Да", to: "read" },
  ],
  read: [
    { label: "Да", to: "notHorse3" },
    { label: "Нет", to: "lie" },
  ],
  lie: [{ label: "Да", to: "final" }],
};

/* === ПАРАМЕТРЫ ЛОШАДЕЙ === */
const HORSE_FRAMES = ["/sprites/horse_frame_1.svg", "/sprites/horse_frame_2.svg"];
const ANIMATION_SPEED = 400;
const BASE_MOVE_SPEED = 3;
const HORSE_COUNT = 3;

/* === ЗВУКИ === */
const CLICK_SOUNDS = ["/sound/click.mp3"];
const RESET_SOUNDS = ["/sound/reset.mp3"];
const playSfx = (list) => {
  const src = list[Math.floor(Math.random() * list.length)];
  playAudio(src);
};

export default function HorseTest() {
  const [activeNodes, setActiveNodes] = useState(["start"]);
  const [chosen, setChosen] = useState({});
  const [selectedBtn, setSelectedBtn] = useState({});
  const [horses, setHorses] = useState([]);
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const hoofAudioRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  /* === Loader === */
  useEffect(() => {
    const img1 = new Image();
    const img2 = new Image();
    let done = 0;
    const check = () => {
      done++;
      if (done === 2) {
        setLoaded(true);
        const initial = Array.from({ length: HORSE_COUNT }).map((_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight - 150) + 80,
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: BASE_MOVE_SPEED + Math.random() * 1.5,
        }));
        setHorses(initial);
      }
    };
    img1.onload = check;
    img2.onload = check;
    img1.src = HORSE_FRAMES[0];
    img2.src = HORSE_FRAMES[1];

    hoofAudioRef.current = new Audio("/sound/hoof.mp3");
    hoofAudioRef.current.loop = true;
    hoofAudioRef.current.volume = 0.6;
    hoofAudioRef.current.play().catch(() => {});

    return () => {
      if (hoofAudioRef.current) {
        hoofAudioRef.current.pause();
        hoofAudioRef.current.src = "";
        hoofAudioRef.current = null;
      }
    };
  }, []);

  /* === Анимация кадров === */
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % HORSE_FRAMES.length), ANIMATION_SPEED);
    return () => clearInterval(id);
  }, [loaded]);

  /* === Движение лошадей === */
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setHorses((prev) =>
        prev.map((h) => {
          let { x, y, dir, speed } = h;
          x += dir * speed;
          const width = window.innerWidth;
          if (dir === 1 && x > width + 100) {
            dir = -1;
            y = Math.random() * (window.innerHeight - 150) + 80;
            x = width + 100;
          } else if (dir === -1 && x < -100) {
            dir = 1;
            y = Math.random() * (window.innerHeight - 150) + 80;
            x = -100;
          }
          return { ...h, x, y, dir };
        })
      );
    }, 30);
    return () => clearInterval(interval);
  }, [loaded]);

  /* === Скролл к активному узлу === */
  useEffect(() => {
    const last = activeNodes[activeNodes.length - 1];
    const el = document.getElementById(last);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeNodes]);

  /* === Добавление узла === */
  const addNode = (from, to, label) => {
    playSfx(CLICK_SOUNDS); // ✅ теперь без задержки
    if (chosen[from]) return;
    setChosen((p) => ({ ...p, [from]: true }));
    setSelectedBtn((p) => ({ ...p, [from]: label }));
    setActiveNodes((p) => {
      if (!p.includes(to)) {
        return [...p, to];
      }
      return p;
    });
  };

  /* === Перезапуск === */
  const restart = () => {
    playSfx(RESET_SOUNDS); // ✅ теперь без задержки
    setActiveNodes(["start"]);
    setChosen({});
    setSelectedBtn({});
  };

  if (!loaded) return <Loader done={loaded} />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 relative overflow-hidden">
      <style jsx global>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .tile {
          animation: fadeDown 0.6s ease forwards;
        }
      `}</style>

      {/* крестик */}
      <Link
        href="/"
        className="absolute top-4 right-6 text-white text-2xl font-bold hover:text-red-400 transition z-50"
      >
        ✕
      </Link>

      {/* Заголовок */}
      <h1 className="text-4xl font-bold mb-2 z-20">Я лошадь?</h1>
      <p className="text-lg text-white/60 mb-4 z-20">наиболее точный психолгический тест</p>

      {/* Ссылка на модалку */}
      <button
        onClick={() => setShowInfo(true)}
        className="italic text-sm text-gray-400 hover:text-gray-200 mb-10 z-20"
      >
        Почему люди страдают Гиппохорсикой? (Syndroma Hippohorsica)
      </button>

      {/* Лошади */}
      {horses.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) scaleX(${h.dir === 1 ? 1 : -1})`,
            width: 64,
            height: 64,
            zIndex: 0,
          }}
        >
          <img src={HORSE_FRAMES[frame]} alt="horse" className="w-full h-full" />
        </div>
      ))}

      {/* Плитки */}
      <div className="relative z-10 w-full max-w-3xl mx-auto pb-40 flex flex-col items-center gap-14">
        {activeNodes.map((id) => {
          const node = NODES[id];
          if (!node) return null;
          const disabled = chosen[id];
          const isFinal = node.final;

          return (
            <div
              id={id}
              key={id}
              className={`tile px-5 py-4 rounded-2xl border shadow-lg text-center backdrop-blur-md mx-auto max-w-sm ${
                disabled ? "bg-green-600/30 border-green-400" : "bg-white/10 border-white/20"
              }`}
            >
              <p className="mb-3">{node.text}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {isFinal ? (
                  <button
                    onClick={restart}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition whitespace-nowrap"
                  >
                    но можем перепроверить
                  </button>
                ) : (
                  (BUTTONS[id] || []).map((b) => {
                    const isSelected = selectedBtn[id] === b.label;
                    return (
                      <button
                        key={`${id}-${b.to}-${b.label}`}
                        onClick={() => addNode(id, b.to, b.label)}
                        disabled={disabled && !isSelected}
                        className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                          isSelected
                            ? "bg-white/30"
                            : disabled
                            ? "opacity-30 cursor-not-allowed"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Футер */}
      <FooterLink />

      {/* Модалка */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start overflow-y-auto p-4">
          <div className="relative max-w-2xl w-full mt-10 mb-10 p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-xl font-bold text-white/80 hover:text-red-400"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">
              Синдром Гиппохорсики (Syndroma Hippohorsica)
            </h2>
            <p className="mb-2">
              — редкое и малоизученное состояние, при котором у человека формируется устойчивая
              идентификация себя с лошадью. Заболевание чаще всего развивается у лиц, находящихся в
              состоянии хронической переработки и профессионального выгорания.
            </p>
            <p className="mb-2">
              Этиологически синдром связан с длительным стрессом, нарушением баланса труда и отдыха.
            </p>
            <p className="mb-2">
              Клиническая картина включает три формы. В лёгкой пациенты занимаются хоббихорсингом и
              коллекционируют предметы, связанные с лошадьми, иногда сопровождая это спонтанным
              ржанием. Средняя форма характеризуется навязчивыми высказываниями о собственной
              «лошадиной сущности», скачкообразным мышлением, а также характерной привычкой у мужчин
              носить длинные пальто. В тяжёлой стадии возникают приступы громкого ржания не к месту,
              ночной бред с нелепыми ассоциациями и выраженная социальная дезадаптация.
            </p>
            <p className="mb-2">
              Прогноз благоприятный для жизни, но осложнённый для социальной и профессиональной
              деятельности. Возможен переход в хроническую стадию (hippohorsomania chronica).
            </p>
            <p className="mb-2">
              Лечение носит комплексный характер: снижение нагрузки, отдых в естественной среде
              («пастбищная терапия»), дозированная физическая активность. В тяжёлых случаях
              целесообразен длительный отпуск.
            </p>
            <p>
              Таким образом, синдром Гиппохорсики можно рассматривать как психосоматический ответ на
              профессиональное выгорание, сопровождающийся специфическими поведенческими
              особенностями, включая характерный выбор одежды у мужчин.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
