"use client";
import { useState, useEffect } from "react";
import GameGrid from "./GameGrid";
import IntroScreen from "./IntroScreen";
import SceneText from "./SceneText";
import RecordsModal from "./RecordsModal";
import Loader from "../../components/Loader";
import engine from "./engine";
import { supabase } from "../../utils/supabase";
import { playTone, playMusic, stopMusic, getContext } from "../../utils/audio";

export default function IvanMemory() {
  const [scene, setScene] = useState("loader");
  const [state, setState] = useState({});
  const [records, setRecords] = useState([]);
  const [gridKey, setGridKey] = useState(0);
  const [player, setPlayer] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("ivan_player") || "" : ""
  );

  useEffect(() => {
    if (player?.trim()) localStorage.setItem("ivan_player", player.trim());
  }, [player]);

  useEffect(() => {
    engine.onChange = (newState) => setState({ ...newState });
  }, []);

  // 📊 Загрузка рекордов
  async function loadScores() {
    const { data } = await supabase
      .from("ivan_memory_scores")
      .select("*")
      .order("score", { ascending: false });
    setRecords(data || []);
  }

  useEffect(() => {
    if (scene !== "loader") loadScores();
  }, [scene]);

  // 🎵 безопасный запуск музыки
  async function tryPlayMusic() {
    try {
      const ctx = getContext();
      if (ctx.state === "suspended") await ctx.resume();
      playMusic("/sound/8BitDoodle – MorningJuce_conv.m4a", 0.25);
    } catch (err) {
      console.warn("Music start blocked until user gesture", err);
      const unlock = async () => {
        const ctx = getContext();
        if (ctx.state === "suspended") await ctx.resume();
        playMusic("/sound/8BitDoodle – MorningJuce_conv.m4a", 0.25);
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("touchstart", unlock);
      };
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("touchstart", unlock, { once: true });
    }
  }

  // 🌀 после загрузчика — сразу музыка и интро
  const handleLoaderReady = async () => {
    await tryPlayMusic();
    setScene("intro");
  };

  // 🔁 рестарт
  function restart() {
    engine.newGame();
    setGridKey((k) => k + 1);
    setScene("intro");
  }

  // ▶️ кат-сцена
  function startCutscene() {
    engine.newGame();
    setGridKey((k) => k + 1);
    setScene("cutscene");
  }

  // ▶️ старт игры
  async function startGame() {
    await new Promise((r) => setTimeout(r, 600));
    engine.start();
    setScene("game");
  }

  // 👆 клики по кубам
  async function handleClick(i) {
    if (state.disabled) return;
    const ok = engine.click(i);
    if (!ok) {
      playTone(130.81, { type: "sawtooth", duration: 0.6, volume: 0.4 });
      await new Promise((r) => setTimeout(r, 500));
      setScene(state.score >= 24 ? "lose24" : "lose");
    } else if (engine._score >= 24) {
      await new Promise((r) => setTimeout(r, 500));
      setScene("win");
    }
  }

  // 💾 Сохранение рекорда
  async function saveRecord() {
    const name = player.trim() !== "" ? player.trim() : "Анонимный Алкоголик";
    const ua = navigator.userAgent || "";
    const device =
      /Windows/i.test(ua)
        ? "Windows"
        : /Macintosh/i.test(ua)
        ? "Mac"
        : /iPhone/i.test(ua)
        ? "iPhone"
        : /Android/i.test(ua)
        ? "Android"
        : "Unknown";

    let browser = "Browser";
    const m = ua.match(/(Chrome|Safari|Firefox|Edg|Opera|YaBrowser|CriOS)\/([\d.]+)/);
    if (m) browser = `${m[1]} ${m[2]}`;

    const currentScore = engine._score ?? state.score ?? 0;

    const { data: existingRows, error } = await supabase
      .from("ivan_memory_scores")
      .select("id, name, score")
      .eq("name", name);

    if (error) return console.warn("Supabase select error:", error);

    if (!existingRows || existingRows.length === 0) {
      await supabase.from("ivan_memory_scores").insert([
        { name, score: currentScore, device, user_agent: browser },
      ]);
    } else {
      const best = existingRows.reduce((a, b) => (a.score > b.score ? a : b));
      if (currentScore > best.score) {
        await supabase
          .from("ivan_memory_scores")
          .update({ score: currentScore, device, user_agent: browser })
          .eq("id", best.id);
      }
    }

    await loadScores();
    restart();
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative" }}>
      {/* 🌀 LOADER */}
      {scene === "loader" && (
        <Loader
          files={[
            "/ivan-memory/title.png",
            "/ivan-memory/ivan_art.png",
            "/sound/8BitDoodle – MorningJuce_conv.m4a",
            "/common/sound/click.ogg",
          ]}
          onReady={handleLoaderReady}
        />
      )}

      {/* 🏁 INTRO */}
      {scene === "intro" && (
        <IntroScreen
          onFinish={startCutscene}
          onShowRecords={() => {
            loadScores();
            setScene("records-demo");
          }}
          onExit={() => (window.location.href = "/")}
        />
      )}

      {/* 💬 CUTSCENE */}
      {scene === "cutscene" && (
        <SceneText
          text={["Что-то я вчера перебрал...", "А что я пил? Помоги вспомнить!"]}
          onNext={startGame}
        />
      )}

      {/* 🎮 GAME */}
      {scene === "game" && (
        <div>
          {/* 🔺 крестик выхода */}
          <button
            onClick={() => setScene("intro")}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "42px",
              height: "42px",
              fontSize: "24px",
              border: "none",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              color: "#6eff8c",
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            ✖
          </button>

          <GameGrid
            key={gridKey}
            map={state.map}
            highlight={state.highlight}
            center={state.center}
            onClick={handleClick}
            score={state.score}
            disabled={state.disabled}
          />
        </div>
      )}

      {/* 🏆 WIN */}
      {scene === "win" && (
        <SceneText
          text={[
            "Невероятно! Я и половину не запомнил бы...",
            "Ты — герой! Настоящий друг Кубани! Любо!",
          ]}
          onNext={() => setScene("game")}
        />
      )}

      {/* 💀 LOSE */}
      {scene === "lose" && (
        <SceneText
          text={["Ох... вот и я дальше не запомнил.", "Посмотрим таблицу рекордов?"]}
          onNext={() => setScene("records")}
        />
      )}

      {/* 💀 LOSE24 */}
      {scene === "lose24" && (
        <SceneText
          text={["Ты легенда!", "Пора заглянуть в таблицу рекордов!"]}
          onNext={() => setScene("records")}
        />
      )}

      {/* 📊 RECORDS */}
      {scene === "records" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            zIndex: 100,
          }}
        >
          {/* 🔺 крестик в таблице */}
          <button
            onClick={() => setScene("intro")}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "42px",
              height: "42px",
              fontSize: "24px",
              border: "none",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              color: "#6eff8c",
              cursor: "pointer",
              zIndex: 101,
            }}
          >
            ✖
          </button>

          <div style={{ transform: "scale(0.9)", transition: "all 0.3s ease" }}>
            <RecordsModal
              score={state.score}
              player={player}
              setPlayer={setPlayer}
              records={records}
              onSave={saveRecord}
            />
          </div>
        </div>
      )}

      {/* 👁 RECORDS DEMO */}
      {scene === "records-demo" && (
        <RecordsModal
          score={null}
          player={player}
          setPlayer={setPlayer}
          records={records}
          onSave={() => setScene("intro")}
        />
      )}
    </div>
  );
}
