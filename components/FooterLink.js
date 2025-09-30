"use client";
import React from "react";

export default function FooterLink() {
  return (
    <div className="absolute bottom-4 w-full flex justify-center">
      <div className="px-3 py-1 rounded bg-black/50">
        <a
          href="https://t.me/dimaspirtuoz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 text-sm hover:text-white transition"
        >
          Блог автора t.me/dimaspirtuoz
        </a>
      </div>
    </div>
  );
}
