export const NODES = {
  start: { text: "Ты лошадь?" },
  notHorse1: { text: "Ты не лошадь.", final: true },
  legs: { text: "Сколько у тебя ног?" },
  notHorse2: { text: "Ты не лошадь.", final: true },
  sure: { text: "Точно?" },
  read: { text: "Ты умеешь читать и писать?" },
  notHorse3: { text: "Ты не лошадь.", final: true },
  lie: { text: "Врёшь, ты ведь читаешь это" },
  final: { text: "Ты не лошадь.", final: true },
};

export const BUTTONS = {
  start: [
    { label: "Нет", to: "notHorse1" },
    { label: "Да", to: "legs" },
    { label: "Может быть", to: "legs" },
  ],
  legs: [
    { label: "Две", to: "notHorse2" },
    { label: "Четыре", to: "sure" },
  ],
  sure: [
    { label: "Нет", to: "read" },
    { label: "Да", to: "read" },
  ],
  read: [
    { label: "Да", to: "notHorse3" },
    { label: "Нет", to: "lie" },
  ],
  lie: [{ label: "Да", to: "final" }],
};
