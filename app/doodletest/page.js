"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import FooterLink from "../../components/FooterLink";
import { loadSound, playSound } from "../../utils/audio"; // ✅ новый звук

/* === ВОПРОСЫ === */
const QUESTIONS = [
  {
    text: "Какое слово пропущено в строчке «... врагам Кубани»?",
    answers: ["Буй", "Мир", "Мяч", "Хуй"],
    correct: "Хуй",
  },
  {
    text: "Во сколько герой песни «Пивасик» выходит из подъезда?",
    answers: ["7:40", "11:00", "9:30", "18:10"],
    correct: "9:30",
  },
  {
    text: "В какое небо смотрела героиня песни «Зеркальце»?",
    answers: ["Голубое", "Весеннее", "Аустерлица", "Осеннее"],
    correct: "Осеннее",
  },
  {
    text: "Какой Элвис сдохнет в больнице?",
    answers: ["Старый, жирный", "Стильный, модный", "Старый, толстый", "Худой, больной"],
    correct: "Старый, толстый",
  },
  {
    text: "Кем работает герой песни «Трещинка»?",
    answers: ["Певцом", "Продавцом", "Купцом", "Никем"],
    correct: "Никем",
  },
  {
    text: "Убери лишнюю строчку из песни «Всё хорошо».",
    answers: [
      "В этой песне не будет терзаний",
      "В песне не будет лиричных героев",
      "Не будет любовных пиздостраданий",
      "В песне не будет намёков на геев",
    ],
    correct: "В песне не будет намёков на геев",
  },
  {
    text: "Какая строчка есть в песне «Старик Фура»?",
    answers: [
      "Отвесив оплеуху гаду Паспарту",
      "По уху треснули меня вчера в порту",
      "Засунул карлика старик в нору к кроту",
      "Как будто карлики насрали у меня во рту",
    ],
    correct: "Отвесив оплеуху гаду Паспарту",
  },
  {
    text: "Продолжи строчку: «А была бы Ира...»",
    answers: ["был бы борщ", "был бы хуй", "был бы секс", "я бы спел"],
    correct: "был бы секс",
  },
  {
    text: "Чем мы кормим «большую и злую машину»?",
    answers: ["Бензином", "Пирожками", "Деньгами", "Шаурмой"],
    correct: "Деньгами",
  },
  {
    text: "Ты в душе ирландец, если в конце вечера пьёшь:",
    answers: ["Гиннесс", "Виски", "Водку", "Вермут"],
    correct: "Вермут",
  },
  {
    text: "Что читал герой песни «Офис»?",
    answers: ["Трудовой кодекс", "Надписи на заборе", "Бойцовский клуб", "Заявление об увольнении"],
    correct: "Бойцовский клуб",
  },
  {
    text: "Какой у группы Doodle официальный хештег помимо #doodle_music?",
    answers: [
      "#песнипровиноиводку",
      "#песнипляскисиськиписьки",
      "#песнипролюбовьижопу",
      "#пьемтацуемутромплохо",
    ],
    correct: "#песнипролюбовьижопу",
  },
  {
    text: "На каком музыкальном инструменте играет Саша из Doodle?",
    answers: ["Барабаны", "Труба", "Бас", "Бубен"],
    correct: ["Барабаны", "Бас", "Бубен"],
  },
  {
    text: "Кто может догнать в песне «Телепорт»?",
    answers: ["Пёс из подворотни", "Тётенька с косой", "Полицейский в штатском", "Морти и Рик Санчес"],
    correct: "Тётенька с косой",
  },
  {
    text: "Дима принёс в группу новую песню. Какое у неё название?",
    answers: ["«Милфы-самокатчицы»", "«Карлицы-вебкамщицы»", "«Эскортницы-народницы»", "«Тянки-лесбиянки»"],
    correct: "«Карлицы-вебкамщицы»",
  },
];

/* === РЕЗУЛЬТАТЫ === */
function getResult(score) {
  if (score <= 3) {
    return {
      text: `Ты заяц. Зашёл в трамвай буквально на пару остановок и выскочил не оплатив проезд. 
Настоятельно рекомендуем тебе ознакомиться с нашим творчеством и стать нашим постоянным пассажиром.`,
      image: "/doodle/gay.png",
    };
  } else if (score <= 7) {
    return {
      text: `Ты тот самый пассажир который каждый день по пути на работу слушает в наушниках песни группы Doodle. 
Может ты и не знаешь все тексты наизусть, но точно подпеваешь припевы и даже не замечаешь, что тебя слышат все вокруг.`,
      image: "/doodle/office.png",
    };
  } else if (score <= 11) {
    return {
      text: `Ты та самая бабка в трамвае, которая садится в него с самого раннего утра и мотается от конечной до конечной весь день. 
Все песни тебе хорошо знакомы. Ты ворчишь на тех кто незнаком с нашим творчеством и регулярно скидываешь ссылки своим друзьям со словами «Вы не слышали? Что за молодежь пошла».`,
      image: "/doodle/gran.png",
    };
  } else if (score <= 14) {
    return {
      text: `Ты кондуктор. Doodle для тебя и дом и семья и работа. 
Ты знаешь всех в вагоне. Легко определяешь зайцев и штрафуешь их. 
Ты знаешь не только наше творчество но и наши имена. Даже если мы поменяемся на сцене местами. 
Почти наверняка ты состоишь в нашем фан движении ОПГ Doodle. 
Не пропускаешь концерты и за это мы тебя так любим.`,
      image: "/doodle/conductor.png",
    };
  } else {
    return {
      text: `Поздравляю! Ты водитель трамвая! По всей видимости ты участник группы. 
Потому что 15 из 15 наберет не каждый наш музыкант. 
Мы даже немного переживаем… Может тебе послушать и другие группы? 
Ты же не следишь за нами из темных переулков? 
Скажи честно, это ты тогда молчал и дышал в трубку телефона? 
Ладно! Это мы так шутим. Ты верный и преданный фанат, пусть и немного странный. 
Хотя кто тут нормальный? Ждем тебя на ближайшем концерте. Будем обниматься!`,
      image: "/doodle/driver.png",
    };
  }
}

/* === shuffle === */
function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function DoodleTest() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  const current = QUESTIONS[step];

  useEffect(() => {
    if (current) setShuffledAnswers(shuffleArray(current.answers));
  }, [step]);

  useEffect(() => {
    loadSound("click", "/sound/click.ogg");
  }, []);

  const handleAnswer = (answer) => {
    playSound("click");
    const isCorrect =
      (Array.isArray(current.correct) && current.correct.includes(answer)) ||
      answer === current.correct;
    if (isCorrect) setScore((s) => s + 1);
    setStep((s) => s + 1);
  };

  const restart = () => {
    playSound("click");
    setStarted(false);
    setStep(0);
    setScore(0);
  };

  /* 🎉 Конфетти */
  useEffect(() => {
    if (step === QUESTIONS.length && started) {
      const duration = 4000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [step, started]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start pt-16 pb-32 px-4 sm:px-6">
      {/* крестик */}
      <Link
        href="/"
        className="fixed top-4 right-6 text-white text-xl sm:text-2xl md:text-3xl font-bold hover:text-red-400 transition"
      >
        ✕
      </Link>

      {/* 🚋 трамвай */}
      {(!started || step < QUESTIONS.length) && (
        <div className="w-full flex justify-center mb-6">
          <Image src="/doodle/tram.png" alt="Трамвай Doodle" width={160} height={110} priority
            className="max-w-[50%] sm:max-w-[160px] h-auto" />
        </div>
      )}

      {!started ? (
        <div className="max-w-2xl text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Тест на знание творчества группы Doodle
          </h1>
          <p className="mb-6 text-sm sm:text-base md:text-lg">
            Давай узнаем, кто ты в трамвае, который едет по десятому маршруту
          </p>
          <button
            onClick={() => { playSound("click"); setStarted(true); }}
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base md:text-lg"
          >
            Поехали
          </button>
        </div>
      ) : step < QUESTIONS.length ? (
        <div className="max-w-xl text-center">
          <p className="mb-4 text-xs sm:text-sm md:text-base text-gray-400">
            Вопрос {step + 1} из {QUESTIONS.length}
          </p>
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-6">{current.text}</h2>
          <div className="flex flex-col gap-3">
            {shuffledAnswers.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(a)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm sm:text-base md:text-lg"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      ) : (
        (() => {
          const result = getResult(score);
          return (
            <div className="max-w-2xl text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Результат</h2>
              <p className="mb-2 text-sm sm:text-base md:text-lg">
                Ты набрал <b>{score}</b> из {QUESTIONS.length}
              </p>
              <div className="flex justify-center mb-6">
                <Image src={result.image} alt="результат" width={200} height={200}
                  className="max-w-[150px] sm:max-w-[200px] h-auto" />
              </div>
              {/* ❗ Текст выводим без абзацев */}
              <p className="mb-6 text-sm sm:text-base md:text-lg">
                {result.text.replace(/\s*\n\s*/g, " ")}
              </p>
              <a href="https://t.me/doodle_music" target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 underline hover:text-blue-600 block mb-4 text-sm sm:text-base">
                Подписаться на Telegram
              </a>
              <button
                onClick={restart}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm sm:text-base md:text-lg"
              >
                Пройти ещё раз
              </button>
            </div>
          );
        })()
      )}

      {/* ⚡️ Футер */}
      <div className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] z-50">
        <FooterLink />
      </div>
    </div>
  );
}
