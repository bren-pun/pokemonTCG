// Synthesized sound effects using Web Audio API — no external files needed

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = "sine", volume = 0.15, ramp = true) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Short click / UI tap */
export function sfxClick() {
  playTone(800, 0.06, "square", 0.08);
}

/** Pack opening whoosh — rising sweep */
export function sfxSpinStart() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

/** Tick sound as cards pass by on the reel */
export function sfxTick() {
  playTone(1200 + Math.random() * 200, 0.03, "square", 0.06);
}

/** Winning reveal — ascending arpeggio */
export function sfxReveal(rarity = "Common") {
  const ctx = getCtx();
  const base = rarity === "Rare Holo EX" ? 523 : rarity === "Rare" ? 440 : rarity === "Uncommon" ? 392 : 349;
  const notes = [base, base * 1.25, base * 1.5, base * 2];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = rarity === "Rare Holo EX" ? "sine" : "triangle";
    const t = ctx.currentTime + i * 0.1;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });

  // Extra shimmer for ultra rare
  if (rarity === "Rare Holo EX") {
    setTimeout(() => {
      playTone(1047, 0.4, "sine", 0.12);
      setTimeout(() => playTone(1318, 0.5, "sine", 0.1), 100);
    }, 400);
  }
}

/** Sell card — coin drop sound */
export function sfxSell() {
  const ctx = getCtx();
  [880, 1100, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.06;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

/** Error / insufficient funds buzz */
export function sfxError() {
  playTone(200, 0.2, "sawtooth", 0.1);
  setTimeout(() => playTone(150, 0.3, "sawtooth", 0.08), 150);
}

/** Free coins claimed — happy ascending cascade */
export function sfxCoinClaim() {
  const ctx = getCtx();
  [660, 880, 1100, 1320, 1540].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.07;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

/** Countdown tick */
export function sfxCountdown() {
  playTone(600, 0.12, "square", 0.1);
}

/** Battle win — triumphant fanfare */
export function sfxBattleWin() {
  const ctx = getCtx();
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const t = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Battle lose — descending sad tones */
export function sfxBattleLose() {
  const ctx = getCtx();
  [440, 370, 311, 261].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    const t = ctx.currentTime + i * 0.15;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Card flip reveal in battle */
export function sfxCardFlip() {
  playTone(1000, 0.08, "sine", 0.12);
  setTimeout(() => playTone(1400, 0.06, "sine", 0.1), 60);
}
