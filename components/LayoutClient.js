"use client";
import { useEffect } from "react";
import { stopAllSounds, unlockAudio } from "../utils/audio";

export default function LayoutClient({ children }) {
  useEffect(() => {
    const handleRouteChange = () => stopAllSounds();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("beforeunload", handleRouteChange);
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
