const sounds = {};
const loops = {};

export async function loadSound(key, url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.oncanplaythrough = () => {
      sounds[key] = audio;
      resolve(audio);
    };
    audio.onerror = reject;
  });
}

export function playSound(key, volume = 1.0) {
  if (!sounds[key]) return;
  const clone = sounds[key].cloneNode();
  clone.volume = volume;
  clone.play().catch(() => {});
  return clone;
}

export function playLoop(key, volume = 1.0) {
  if (!sounds[key]) return null;
  const audio = sounds[key].cloneNode();
  audio.volume = volume;
  audio.loop = true;
  audio.play().catch(() => {});
  loops[key] = audio;
  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      delete loops[key];
    },
  };
}

export function stopAllSounds() {
  Object.values(loops).forEach((a) => {
    if (a?.pause) {
      a.pause();
      a.currentTime = 0;
    }
  });
  for (const k in loops) delete loops[k];

  Object.values(sounds).forEach((a) => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  });
}
