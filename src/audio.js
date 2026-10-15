// Short synthesized sounds. Browsers only allow audio after a tap, so call unlock() from a click handler.
let ctx = null;
let enabled = true;

const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

export function setSoundEnabled(value) {
  enabled = value;
}

export function unlock() {
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, start, dur, type = 'sine', vol = 0.12) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const play = (fn) => {
  if (!enabled || !ctx) return;
  try {
    fn();
  } catch (e) {
    /* ignore audio errors */
  }
};

export const sfx = {
  tap: () => play(() => tone(520, 0, 0.08, 'triangle', 0.08)),
  start: () => play(() => {
    tone(392, 0, 0.12, 'triangle');
    tone(523, 0.1, 0.16, 'triangle');
  }),
  done: () => play(() => {
    tone(523, 0, 0.12, 'triangle');
    tone(659, 0.1, 0.12, 'triangle');
    tone(784, 0.2, 0.22, 'triangle');
  }),
  timesUp: () => play(() => {
    tone(440, 0, 0.3, 'sine', 0.09);
    tone(349, 0.28, 0.4, 'sine', 0.09);
  }),
  sticker: () => play(() => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.1));
  }),
  legendary: () => play(() => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle', 0.11));
  }),
};

export function buzz(ms = 30) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
}
