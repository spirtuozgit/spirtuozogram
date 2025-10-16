import React, { useEffect, useRef } from "react";

export default function RecordsModal({ score, player, setPlayer, records, onSave }) {
  const isDemo = score === null;
  const listRef = useRef();

  // Автопрокрутка в интро-режиме
  useEffect(() => {
    if (isDemo && listRef.current) {
      const el = listRef.current;
      let dir = 1;
      const scroll = () => {
        el.scrollTop += dir * 0.4;
        if (el.scrollTop >= el.scrollHeight - el.clientHeight) dir = -1;
        if (el.scrollTop <= 0) dir = 1;
        requestAnimationFrame(scroll);
      };
      scroll();
    }
  }, [isDemo]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        color: "#6eff8c",
        fontFamily: "monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "320px",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>Таблица рекордов</h2>

        {!isDemo && (
          <>
            <p style={{ fontSize: "1rem", marginBottom: "10px" }}>
              Ваш результат:&nbsp;<b>{score}</b>
            </p>

            <div style={{ position: "relative", marginBottom: "10px" }}>
              <input
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                placeholder="Введите имя"
                style={{
                  width: "220px",
                  padding: "10px 32px 10px 10px",
                  borderRadius: "8px",
                  border: "1px solid #6eff8c",
                  background: "#000",
                  color: "#6eff8c",
                  fontSize: "1rem",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              {player && (
                <button
                  onClick={() => {
                    setPlayer("");
                    localStorage.removeItem("ivan_player");
                  }}
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#6eff8c",
                    fontSize: "20px",
                    cursor: "pointer",
                    lineHeight: "1",
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={onSave}
              style={{
                background: "#6eff8c",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "18px",
              }}
            >
              Сохранить и начать заново
            </button>
          </>
        )}

        {/* 📜 таблица */}
        <div
          ref={listRef}
          style={{
            width: "280px",
            textAlign: "left",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            borderTop: "1px solid #333",
            borderBottom: "1px solid #333",
            padding: "8px 0",
            maxHeight: isDemo ? "60vh" : "none",
            overflowY: isDemo ? "auto" : "hidden",
          }}
        >
          {records && records.length > 0 ? (
            (isDemo ? records : records.slice(0, 10)).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #111",
                  padding: "3px 0",
                }}
              >
                <span>
                  {i + 1}. {r.name}
                </span>
                <span>{r.score}</span>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.6, textAlign: "center" }}>Рекордов пока нет</p>
          )}
        </div>

        {isDemo && (
          <button
            onClick={onSave}
            style={{
              marginTop: "20px",
              background: "transparent",
              border: "1px solid #6eff8c",
              borderRadius: "8px",
              padding: "8px 20px",
              color: "#6eff8c",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}
