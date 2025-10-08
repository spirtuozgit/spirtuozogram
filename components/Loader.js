"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Loader({ files = [], onReady }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!files.length) {
      // если список не передан — просто фейковая задержка
      const t = setTimeout(() => onReady && onReady(), 1200);
      return () => clearTimeout(t);
    }

    let loaded = 0;
    const total = files.length;

    const loadFile = (url) =>
      fetch(url, { cache: "force-cache" })
        .then((res) => res.blob())
        .catch(() => null)
        .finally(() => {
          loaded++;
          setProgress(Math.round((loaded / total) * 100));
          if (loaded >= total && onReady) onReady();
        });

    files.forEach(loadFile);
  }, [files, onReady]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-24 h-24 border-4 border-zinc-700 border-t-green-500 rounded-full flex items-center justify-center relative"
      >
        <span className="text-2xl font-bold text-green-400 absolute select-none">S</span>
      </motion.div>

      <motion.div
        key={progress}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-6 text-lg text-zinc-400"
      >
        {progress}%
      </motion.div>
    </div>
  );
}
