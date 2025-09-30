"use client";

export default function Loader({ text = "Загрузка…" }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[2000]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
      <p className="text-white mt-4 text-lg">{text}</p>
    </div>
  );
}
