export interface WordEntry {
  fa: string;
  en: string;
  image: string | null; // data URL or remote URL
  learned: boolean;
  attempts: number;
  lastPracticed: number;
}

const WORDS_KEY = "happy-english:words";
const API_KEY = "happy-english:ai-key";
const API_BASE_KEY = "happy-english:ai-base";
const API_MODEL_KEY = "happy-english:ai-model";

export function normalizeFa(s: string) {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "");
}

export function loadWords(): Record<string, WordEntry> {
  try {
    return JSON.parse(localStorage.getItem(WORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getWord(fa: string): WordEntry | null {
  return loadWords()[normalizeFa(fa)] ?? null;
}

export function saveWord(entry: WordEntry) {
  const all = loadWords();
  all[normalizeFa(entry.fa)] = entry;
  try {
    localStorage.setItem(WORDS_KEY, JSON.stringify(all));
  } catch {
    // Storage full: drop images from the oldest entries and retry.
    const sorted = Object.values(all).sort((a, b) => a.lastPracticed - b.lastPracticed);
    for (const w of sorted) {
      if (w.image?.startsWith("data:")) w.image = null;
      try {
        localStorage.setItem(WORDS_KEY, JSON.stringify(all));
        return;
      } catch {
        /* continue */
      }
    }
  }
}

// ---- AI settings (kept only on device, never in source code) ----
export function getAiSettings() {
  return {
    key: localStorage.getItem(API_KEY) || "",
    base: localStorage.getItem(API_BASE_KEY) || "https://api.openai.com/v1",
    model: localStorage.getItem(API_MODEL_KEY) || "gpt-4o-mini",
  };
}

export function setAiSettings(s: { key: string; base: string; model: string }) {
  localStorage.setItem(API_KEY, s.key.trim());
  localStorage.setItem(API_BASE_KEY, s.base.trim() || "https://api.openai.com/v1");
  localStorage.setItem(API_MODEL_KEY, s.model.trim() || "gpt-4o-mini");
}
