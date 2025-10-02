"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Loader from "../../components/Loader";
import FooterLink from "../../components/FooterLink";
import { playSound, loadSound, stopAllSounds } from "../../utils/audio";

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

export default function HorseTest() {
  const [activeNodes, setActiveNodes] = useState(["start"]);
  const [chosen, setChosen] = useState({});
  const [selectedBtn, setSelectedBtn] = useState({});
  const [horses, setHorses] = useState([]);
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const nodeRefs = useRef({});

  /* === Loader + предзагрузка === */
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

    // предзагрузка только клика и ресета
    Promise.all([
      loadSound("click", "/sound/click.ogg"),
      loadSound("reset", "/sound/reset.ogg"),
    ]);

    return () => {
      stopAllSounds();
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

  /* === Автоскролл при добавлении узлов === */
  useEffect(() => {
    const lastId = activeNodes[activeNodes.length - 1];
    const el = nodeRefs.current[lastId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeNodes]);

  /* === Добавление узла === */
  const addNode = (from, to, label) => {
    playSound("click");
    if (chosen[from]) return;
    setChosen((p) => ({ ...p, [from]: true }));
    setSelectedBtn((p) => ({ ...p, [from]: label }));
    setActiveNodes((p) => (!p.includes(to) ? [...p, to] : p));
  };

  /* === Перезапуск === */
  const restart = () => {
    playSound("reset");
    setActiveNodes(["start"]);
    setChosen({});
    setSelectedBtn({});
  };

  if (!loaded) return <Loader done={loaded} />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 sm:p-6 relative overflow-hidden">
      {/* крестик */}
      <Link
        href="/"
        onClick={() => stopAllSounds()}
        className="fixed top-4 right-4 sm:right-6 text-2xl sm:text-3xl font-bold text-white hover:text-red-400 transition z-40"
      >
        ✕
      </Link>

      {/* Заголовок */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 z-20">Я лошадь?</h1>
      <p className="text-sm sm:text-base md:text-lg text-white/60 mb-6 z-20">
        наиболее точный психологический тест
      </p>

      {/* Ссылка на модалку */}
      <button
        onClick={() => setShowInfo(true)}
        className="italic text-xs sm:text-sm md:text-base text-gray-400 hover:text-gray-200 mb-8 z-20"
      >
        Почему люди страдают Гиппохорсикой? (Syndroma Hippohorsica)
      </button>

      {/* Лошади (визуал) */}
      {horses.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) scaleX(${h.dir === 1 ? 1 : -1})`,
          }}
        >
          <img
            src={HORSE_FRAMES[frame]}
            alt="horse"
            className="w-12 sm:w-16 md:w-20 lg:w-24 h-auto"
          />
        </div>
      ))}

      {/* Плитки */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto pb-32 flex flex-col items-center gap-10">
        {activeNodes.map((id) => {
          const node = NODES[id];
          if (!node) return null;
          const disabled = chosen[id];
          const isFinal = node.final;

          return (
            <div
              id={id}
              key={id}
              ref={(el) => (nodeRefs.current[id] = el)} // ✅ ref для автоскролла
              className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border shadow-lg text-center backdrop-blur-md w-full ${
                disabled ? "bg-green-600/30 border-green-400" : "bg-white/10 border-white/20"
              }`}
            >
              <p className="mb-3 text-sm sm:text-base md:text-lg">{node.text}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {isFinal ? (
                  <button
                    onClick={restart}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base"
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
                        className={`px-3 py-1.5 rounded-lg transition text-sm sm:text-base ${
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
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-40">
        <FooterLink />
      </div>

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
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Синдром Гиппохорсики (Syndroma Hippohorsica)
            </h2>
            <p className="mb-2 text-sm sm:text-base">
              — редкое и малоизученное состояние, при котором у человека формируется устойчивая
              идентификация себя с лошадью. Заболевание чаще всего развивается у лиц, находящихся в
              состоянии хронической переработки и профессионального выгорания.
            </p>
            <p className="mb-2 text-sm sm:text-base">
              Этиологически синдром связан с длительным стрессом, нарушением баланса труда и отдыха.
            </p>
            <p className="mb-2 text-sm sm:text-base">
              Клиническая картина включает три формы. В лёгкой пациенты занимаются хоббихорсингом и
              коллекционируют предметы, связанные с лошадьми, иногда сопровождая это спонтанным
              ржанием. Средняя форма характеризуется навязчивыми высказываниями о собственной
              «лошадиной сущности», скачкообразным мышлением, а также характерной привычкой у мужчин
              носить длинные пальто. В тяжёлой стадии возникают приступы громкого ржания не к месту,
              ночной бред с нелепыми ассоциациями и выраженная социальная дезадаптация.
            </p>
            <p className="mb-2 text-sm sm:text-base">
              Прогноз благоприятный для жизни, но осложнённый для социальной и профессиональной
              деятельности. Возможен переход в хроническую стадию (hippohorsomania chronica).
            </p>
            <p className="mb-2 text-sm sm:text-base">
              Лечение носит комплексный характер: снижение нагрузки, отдых в естественной среде
              («пастбищная терапия»), дозированная физическая активность. В тяжёлых случаях
              целесообразен длительный отпуск.
            </p>
            <p className="text-sm sm:text-base">
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
