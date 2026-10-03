export type SpeedMode = 0 | 1 | 2;

export const SPEEDS: { rate: number; label: string; emoji: string }[] = [
  { rate: 1.0, label: "معمولی", emoji: "🐇" },
  { rate: 0.6, label: "آهسته", emoji: "🐢" },
  { rate: 0.35, label: "خیلی آهسته", emoji: "🐌" },
];

let voices: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  voices = window.speechSynthesis.getVoices();
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, mode: SpeedMode) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = SPEEDS[mode].rate;
  u.pitch = 1.05;
  const v =
    voices.find((v) => v.lang === "en-US" && /google|female|samantha/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en"));
  if (v) u.voice = v;
  synth.speak(u);
}

// ---- Fun sound effects via Web Audio (no files needed) ----
let ctx: AudioContext | null = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.2) {
  const ac = audio();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.05);
}

export function playSuccess() {
  try {
    // Cheerful arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => tone(n, i * 0.11, 0.35, "triangle", 0.22));
    tone(1568, 0.6, 0.6, "sine", 0.15);
    tone(2093, 0.65, 0.6, "sine", 0.1);
  } catch {
    /* ignore */
  }
}

export function playCorrect() {
  try {
    tone(659.25, 0, 0.18, "triangle", 0.2);
    tone(987.77, 0.14, 0.3, "triangle", 0.2);
  } catch {
    /* ignore */
  }
}

export function playWrong() {
  try {
    tone(330, 0, 0.2, "sine", 0.15);
    tone(262, 0.18, 0.3, "sine", 0.15);
  } catch {
    /* ignore */
  }
}
