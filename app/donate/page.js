"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/Loader"; // ✅ исправленный путь
import { Send, Heart, Wallet, Coins, X, ArrowLeft, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { donors } from "./data";

export default function DonatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const preloadFiles = [
    "/sound/click.ogg",
    "/sound/ready.ogg",
    "/img/sp_logo.png",
    "/fonts/spirtuoz.woff2",
  ];

  const goMenu = () => router.push("/");

  const links = [
    {
      name: "Telegram Donate",
      url: "https://t.me/tribute/app?startapp=dyr5",
      icon: <Send className="w-5 h-5 text-black" />,
      color: "from-sky-500 to-blue-400",
      desc: "Поддержка прямо в Telegram",
    },
    {
      name: "Яндекс Чаевые",
      url: "https://tips.yandex.ru/guest/payment/3578262",
      icon: <Heart className="w-5 h-5 text-black" />,
      color: "from-yellow-400 to-amber-500",
      desc: "Быстрый донат",
    },
    {
      name: "YooMoney",
      url: "https://yoomoney.ru/to/41001346810264",
      icon: <Wallet className="w-5 h-5 text-black" />,
      color: "from-purple-500 to-pink-400",
      desc: "Прямой перевод",
    },
    {
      name: "DonatePay",
      action: () => setShowModal(true),
      icon: <Coins className="w-5 h-5 text-black" />,
      color: "from-orange-500 to-red-400",
      desc: "Донаты с сообщениями",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white relative overflow-hidden">
      <AnimatePresence>
        {!ready ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader files={preloadFiles} onReady={() => setReady(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center w-full px-4 py-10"
          >
            {/* Кнопка выхода */}
            <button
              onClick={goMenu}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Заголовок */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-8 text-center"
            >
              Поддержать автора 💚
            </motion.h1>

            {/* Бесконечная бегущая строка донатеров */}
            <div className="w-full overflow-hidden border-y border-zinc-800 py-3 mb-8 relative">
              <div className="flex gap-12 whitespace-nowrap text-sm text-zinc-300 animate-marquee">
                {[...donors, ...donors].map((d, i) => {
                  const isNumber = !isNaN(Number(d.amount));
                  return (
                    <span key={i} className="inline-block">
                      💚 <strong>{d.name}</strong> —{" "}
                      {isNumber ? `${d.amount}₽` : d.amount}
                      {d.message ? ` (${d.message})` : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Кнопки донатов */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-8 w-full">
              {links.map((link, i) => {
                const commonProps = {
                  key: i,
                  className: `p-4 rounded-xl bg-gradient-to-r ${link.color} text-black font-semibold flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform`,
                  whileHover: { scale: 1.05 },
                };

                return link.url ? (
                  <motion.a
                    {...commonProps}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {link.icon}
                      <span className="text-base">{link.name}</span>
                    </div>
                    <p className="text-xs text-black/70 text-center leading-snug">
                      {link.desc}
                    </p>
                  </motion.a>
                ) : (
                  <motion.button {...commonProps} onClick={link.action}>
                    <div className="flex items-center gap-2 mb-1">
                      {link.icon}
                      <span className="text-base">{link.name}</span>
                    </div>
                    <p className="text-xs text-black/70 text-center leading-snug">
                      {link.desc}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Модальное окно DonatePay */}
            <AnimatePresence>
              {showModal && (
                <motion.div
                  key="modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 flex flex-col items-center"
                  >
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <iframe
                      src="https://widget.donatepay.ru/widgets/page/b1a665dbf867920f81992b88fb330fc45da3f026ab0dc57aa30e3db9c25dd4fe?widget_id=7105306&sum=200"
                      width="510"
                      height="260"
                      frameBorder="0"
                      allowtransparency="true"
                      className="rounded-xl"
                    ></iframe>

                    {/* Подсказка */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-green-600/30 px-4 py-2 rounded-lg animate-pulse"
                    >
                      <CreditCard className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-400 font-medium">
                        Выберите способ оплаты — <b>Банкинг / СБП 💳</b>
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Кнопка Назад */}
            <motion.button
              onClick={goMenu}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-5 py-2 mt-6 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад в меню
            </motion.button>

            <p className="text-zinc-500 text-sm mt-6 text-center max-w-sm">
              Спасибо за поддержку! Каждый донат помогает мне не забить хуй на творчество 🌿
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Локальные стили анимации */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: 35s;
          }
        }
      `}</style>
    </div>
  );
}
