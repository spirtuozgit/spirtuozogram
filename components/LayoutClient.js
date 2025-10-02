"use client";
import { useEffect } from "react";
import { stopAllSounds } from "../utils/audio";

/**
 * Клиентская обёртка для RootLayout.
 * Здесь следим за сменой маршрутов и выгружаем все звуки.
 */
export default function LayoutClient({ children }) {
  useEffect(() => {
    const handleRouteChange = () => {
      stopAllSounds(); // глушим все звуки при смене страницы
    };

    // Слушаем события истории (работают в App Router)
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);

    // Дополнительно глушим звуки при закрытии вкладки/обновлении страницы
    window.addEventListener("beforeunload", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("beforeunload", handleRouteChange);
    };
  }, []);

  return <>{children}</>;
}
