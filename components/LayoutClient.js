"use client";
import { useEffect } from "react";
import { stopAllSounds, unlockAudio } from "../utils/audio";

/**
 * Клиентская обёртка для RootLayout.
 * Управляет поведением звука при смене страниц и фокусе вкладки.
 */
export default function LayoutClient({ children }) {
  useEffect(() => {
    const handleRouteChange = () => stopAllSounds();

    // События навигации
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("beforeunload", handleRouteChange);

    // 🔄 Восстанавливаем AudioContext при возврате во вкладку
    const handleVisibility = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("beforeunload", handleRouteChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <>{children}</>;
}
