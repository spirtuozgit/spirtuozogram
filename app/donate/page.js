"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/Loader";
import { Send, Heart, Wallet, Coins, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DonatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Список файлов для реальной предзагрузки
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
      url: "https://donatepay.ru/don/spirtuoz",
      icon: <Coins className="w-5 h-5 text-black" />,
      color: "from-orange-500 to-red-400",
      desc: "Донаты с сообщениями",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white relative">
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
            {/* Крестик */}
            <button
              onClick={goMenu}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-8 text-center"
            >
              Поддержать автора 💚
            </motion.h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-8 w-full">
              {links.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-black font-semibold flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {link.icon}
                    <span className="text-base">{link.name}</span>
                  </div>
                  <p className="text-xs text-black/70 text-center leading-snug">
                    {link.desc}
                  </p>
                </motion.a>
              ))}
            </div>

            <motion.button
              onClick={goMenu}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-5 py-2 mt-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-200 transition-colors"
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
    </div>
  );
}

