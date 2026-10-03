export type Stroke = { x: number[]; y: number[]; t: number[] };

/**
 * Sends ink strokes to Google's handwriting recognition engine
 * (the same engine used by Google Input Tools). No API key required.
 * Returns a list of candidate texts, best first.
 */
export async function recognizeInk(strokes: Stroke[], width: number, height: number): Promise<string[]> {
  if (strokes.length === 0) return [];
  const body = {
    options: "enable_pre_space",
    requests: [
      {
        writing_guide: { writing_area_width: Math.round(width), writing_area_height: Math.round(height) },
        ink: strokes.map((s) => [s.x.map(Math.round), s.y.map(Math.round), s.t]),
        language: "en",
        max_num_results: 10,
        max_completions: 0,
      },
    ],
  };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://inputtools.google.com/request?itc=en-t-i0-handwrit&app=happyenglish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data?.[0] !== "SUCCESS") return [];
    const candidates: string[] = data?.[1]?.[0]?.[1] ?? [];
    return candidates;
  } finally {
    clearTimeout(t);
  }
}

// ---------- Flexible spelling comparison ----------

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

// Visually confusable pairs in children's handwriting (treated as matches,
// because the goal is spelling, not calligraphy).
const CONFUSABLE: [string, string][] = [
  ["l", "i"], ["l", "1"], ["i", "j"], ["o", "0"], ["a", "o"], ["u", "v"],
  ["n", "h"], ["r", "v"], ["q", "g"], ["c", "e"], ["t", "f"], ["s", "5"],
  ["z", "2"], ["b", "6"], ["m", "n"], ["w", "u"], ["y", "g"], ["k", "h"],
];
function confusable(a: string, b: string) {
  return a === b || CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** Edit distance where confusable letters count as equal. */
function distance(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const cost = confusable(a[i - 1], b[j - 1]) ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  return dp[m][n];
}

export interface CheckResult {
  correct: boolean;
  recognized: string; // best guess shown to the user
}

/**
 * Lenient on handwriting quality, strict on spelling:
 * - Accepts if ANY recognizer candidate equals the target (case-insensitive).
 * - Accepts near-identical candidates whose only differences are letter shapes
 *   commonly confused in handwriting (e.g. "l" vs "i").
 * - Rejects when letters are missing/extra (e.g. "Aple" vs "Apple") because
 *   length must match exactly for the confusable rule to apply.
 */
export function checkSpelling(candidates: string[], target: string): CheckResult {
  const t = norm(target);
  const normalized = candidates.map(norm).filter(Boolean);
  if (normalized.length === 0) return { correct: false, recognized: "" };

  if (normalized.some((c) => c === t)) return { correct: true, recognized: target };

  const shapeMatch = normalized.find((c) => c.length === t.length && distance(c, t) === 0);
  if (shapeMatch) return { correct: true, recognized: target };

  return { correct: false, recognized: candidates[0] ?? "" };
}
