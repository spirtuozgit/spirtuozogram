"use client";

export default function Loader({ text = "Загрузка…", progress = 0 }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[2000] select-none">
      {/* вращающееся кольцо */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <img
          src="/svg/loader.svg"
          alt="Loader ring"
          className="w-20 h-20 animate-spin"
          draggable={false}
        />
        <span className="absolute text-white text-2xl font-bold animate-pulse-s">
          S
        </span>
      </div>

      {/* подпись */}
      <p className="text-white mt-4 text-lg tracking-wide">
        {text} {progress}%
      </p>

      {/* индикатор прогресса */}
      <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <style jsx global>{`
        @keyframes pulseS {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        .animate-pulse-s {
          animation: pulseS 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
