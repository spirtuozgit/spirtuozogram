import { playTone } from "../../utils/audio";

export class SimonEngine {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this._inited = false;
    this._resetCore();
  }

  _resetCore() {
    this._level = 1;
    this._score = 0;
    this._sequence = [];
    this._user = [];
    this._map = Array(25).fill(null);
    this._playing = false;
    this._blocked = true; // 👈 блокируем до начала
  }

  // === Новая игра ===
  newGame() {
    this._resetCore();

const colors = [
  "#FF595E", // кораллово-красный
  "#FF9F1C", // апельсиновый
  "#FFD60A", // солнечно-жёлтый
  "#8AC926", // лаймово-зелёный
  "#06D6A0", // мятно-зелёный
  "#2EC4B6", // бирюзовый
  "#4CC9F0", // лазурный
  "#4895EF", // ярко-синий
  "#00BBF9", // голубой
  "#95CEED", // небесно-голубой
  "#9B5DE5", // сиренево-фиолетовый
  "#B16EFF", // светлый фиолетовый (осветлён)
  "#F243FD", // пурпур
  "#F15BB5", // розово-малиновый
  "#FF80D0", // неоново-розовый
  "#F72585", // фуксия
  "#B5179E", // яркий пурпурный (осветлён)
  "#FFCA3A", // лимонно-жёлтый
  "#7AFF3F", // салатовый
  "#90F1EF", // мятный
  "#FFA6C9", // пастельно-розовый
  "#FA7921", // мандариновый
  "#42D9C8", // светло-бирюзовый
  "#E9FF70"  // жёлто-зелёный пастель
];

    const drinks = [
      { code: "Vd", name: "Водка", perc: 38 },
      { code: "Rm", name: "Ром", perc: 40 },
      { code: "Gn", name: "Джин", perc: 37 },
      { code: "Wn", name: "Вино", perc: 12 },
      { code: "Br", name: "Бренди", perc: 40 },
      { code: "Wh", name: "Виски", perc: 45 },
      { code: "Te", name: "Текила", perc: 40 },
      { code: "Be", name: "Пиво", perc: 6 },
      { code: "Pr", name: "Просекко", perc: 11 },
      { code: "Bu", name: "Бурбон", perc: 43 },
      { code: "Cm", name: "Кампари", perc: 25 },
      { code: "Ch", name: "Шампусик", perc: 12 },
      { code: "Mt", name: "Минту", perc: 38 },
      { code: "Ab", name: "Абсент", perc: 70 },
      { code: "Sg", name: "Сангрия", perc: 14 },
      { code: "Om", name: "Омывайка", perc: 65 },
      { code: "Mh", name: "Мохито", perc: 15 },
      { code: "Bq", name: "Бугульма", perc: 40 },
      { code: "Sb", name: "Сиббитер", perc: 17 },
      { code: "Vs", name: "Вермут", perc: 18 },
      { code: "Sn", name: "Самогон", perc: 50 },
      { code: "Gr", name: "Гараж", perc: 8 },
      { code: "Ck", name: "Коньяк", perc: 42 },
      { code: "Bl", name: "Бейлиз", perc: 17 },
      { code: "Hr", name: "Херес", perc: 19 },
    ];

    this._drinks = this._shuffle(
      drinks.map((d, i) => ({ ...d, color: colors[i % colors.length] }))
    );

    this._applyMask(1);
    this._emit();
    this._inited = true;
  }

  // === Старт ===
  start() {
    if (!this._inited) this.newGame();
    this._blocked = true;
    this._emit();
    setTimeout(() => this._nextRound(), 1000);
  }

  // === Маски ===
  _getIndices(level = this._level) {
    const masks = {
      1: [
        [0,0,0,0,0],
        [0,0,1,0,0],
        [0,1,0,1,0],
        [0,0,1,0,0],
        [0,0,0,0,0],
      ],
      2: [
        [0,0,0,0,0],
        [0,1,1,1,0],
        [0,1,0,1,0],
        [0,1,1,1,0],
        [0,0,0,0,0],
      ],
      3: [
        [1,0,1,0,1],
        [0,1,1,1,0],
        [0,1,0,1,0],
        [0,1,1,1,0],
        [1,0,1,0,1],
      ],
      4: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,0,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
      ],
    };

    const arr = [];
    let i = 0;
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 5; x++, i++)
        if (masks[level][y][x] === 1) arr.push(i);
    return arr;
  }

  _applyMask(level) {
    const indices = this._getIndices(level);
    const nextMap = Array(25).fill(null);
    indices.forEach((i) => {
      nextMap[i] = this._drinks[i % this._drinks.length];
    });
    this._map = nextMap;
  }

  _emit(extra = {}) {
    if (this.onUpdate)
      this.onUpdate({
        ...extra,
        map: this._map,
        score: this._score,
        level: this._level,
        disabled: this._blocked || this._playing,
      });
  }

  async _nextRound() {
    this._blocked = true;
    this._emit();

    const pool = this._getIndices(this._level);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    this._sequence.push(idx);

    await new Promise((r) => setTimeout(r, 600));

    this._playing = true;
    await this._showSequence();
    this._playing = false;

    this._blocked = false; // 👈 клики разрешаем только после показа цепочки
    this._user = [];
    this._emit();
  }

  async _showSequence() {
    const baseFlash = 520;
    const speedUp = Math.max(0.5, 1 - this._score * 0.03);
    const flash = baseFlash * speedUp;
    const pause = 250 * speedUp;

    for (let i = 0; i < this._sequence.length; i++) {
      const idx = this._sequence[i];
      const drink = this._map[idx];
      const note = 261.63 + (idx % 12) * 30;

      this._emit({ highlight: idx, center: drink.color });
      playTone(note, { type: "square", duration: 0.22 * speedUp, volume: 0.3 });

      await new Promise((r) => setTimeout(r, flash));
      this._emit({ highlight: null, center: null });
      await new Promise((r) => setTimeout(r, pause));
    }
  }

  click(i) {
    if (this._playing || this._blocked) return false;

    const step = this._user.length;
    const ok = i === this._sequence[step];
    const drink = this._map[i];

    const note = 261.63 + (i % 12) * 30;
    playTone(note, { type: "square", duration: 0.25, volume: 0.3 });
    this._emit({ highlight: i, center: drink?.color });

    if (!ok) {
      this._blocked = true; // 👈 полностью блокируем до новой игры
      setTimeout(() => {
        this._emit({ highlight: null, center: null });
        this._emit({ fail: true });
      }, 200);
      return false;
    }

    this._user.push(i);
    const finished = this._user.length === this._sequence.length;
    if (finished) {
      this._score++;

      let newLevel = this._level;
      if (this._score === 5) newLevel = 2;
      else if (this._score === 10) newLevel = 3;
      else if (this._score === 18) newLevel = 4;

      const levelChanged = newLevel !== this._level;
      if (levelChanged) {
        this._level = newLevel;
        this._applyMask(this._level);
      }

      this._blocked = true;
      this._user = [];

      setTimeout(() => {
        this._emit({ highlight: null, center: null });
        setTimeout(() => this._nextRound(), 600);
      }, 200);

      return true;
    }

    setTimeout(() => this._emit({ highlight: null, center: null }), 200);
    return true;
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

const engine = new SimonEngine();
engine.onUpdate = (state) => {
  if (engine.onChange) engine.onChange(state);
};
export default engine;
