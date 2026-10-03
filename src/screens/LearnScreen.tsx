import { useCallback, useEffect, useRef, useState } from "react";
import DrawingPad, { type DrawingPadHandle } from "../components/DrawingPad";
import SettingsDialog from "../components/SettingsDialog";
import { checkSpelling, recognizeInk } from "../services/handwriting";
import { fetchConceptImage } from "../services/image";
import { canSpeak, playCorrect, playWrong, speak, SPEEDS, type SpeedMode } from "../services/speech";
import { getWord, loadWords, saveWord, type WordEntry } from "../services/storage";
import { translateFaToEn } from "../services/translate";

type Stage = "input" | "loading" | "copy" | "memory";

interface Props {
  onSuccess: (entry: WordEntry) => void;
}

export default function LearnScreen({ onSuccess }: Props) {
  const [fa, setFa] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [entry, setEntry] = useState<WordEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [speed, setSpeed] = useState<SpeedMode>(0);
  const [checking, setChecking] = useState(false);
  const [wrong, setWrong] = useState<{ recognized: string } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [recent, setRecent] = useState<WordEntry[]>([]);
  const padRef = useRef<DrawingPadHandle>(null);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (stage === "input") {
      setRecent(Object.values(loadWords()).sort((a, b) => b.lastPracticed - a.lastPracticed).slice(0, 8));
    }
  }, [stage]);

  const apply = useCallback(
    async (word?: string) => {
      const w = (word ?? fa).trim();
      if (!w) return;
      setFa(w);
      setError(null);
      setStage("loading");
      setLoadingMsg("در حال پیدا کردن کلمه انگلیسی…");

      const cached = getWord(w);
      let en = cached?.en ?? null;
      let image = cached?.image ?? null;

      if (!en) {
        const tr = await translateFaToEn(w);
        if (!tr) {
          setStage("input");
          setError(
            navigator.onLine
              ? "متأسفم، نتوانستم این کلمه را پیدا کنم. کلمه ساده‌تری امتحان کن."
              : "برای دریافت تصویر و اطلاعات جدید، اتصال اینترنت را بررسی کنید."
          );
          return;
        }
        en = tr.en;
      }

      if (!image) {
        setLoadingMsg("در حال کشیدن نقاشی… 🎨");
        image = await fetchConceptImage(en);
      }

      const e: WordEntry = {
        fa: w,
        en,
        image,
        learned: cached?.learned ?? false,
        attempts: cached?.attempts ?? 0,
        lastPracticed: Date.now(),
      };
      saveWord(e);
      setEntry(e);
      setWrong(null);
      setSpeed(0);
      setStage("copy");
      setTimeout(() => speak(en!, 0), 400);
    },
    [fa]
  );

  const pronounce = () => {
    if (!entry) return;
    speak(entry.en, speed);
    setSpeed(((speed + 1) % 3) as SpeedMode);
  };

  const clearPad = () => {
    padRef.current?.clear();
    setWrong(null);
  };

  const check = async () => {
    if (!entry || !padRef.current || padRef.current.isEmpty()) return;
    if (!navigator.onLine) {
      setError("برای بررسی دست‌خط، اتصال اینترنت را بررسی کنید.");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const { width, height } = padRef.current.getSize();
      const candidates = await recognizeInk(padRef.current.getStrokes(), width, height);
      const result = checkSpelling(candidates, entry.en);
      const updated = { ...entry, attempts: entry.attempts + 1, lastPracticed: Date.now() };

      if (result.correct) {
        playCorrect();
        setWrong(null);
        padRef.current.clear();
        if (stage === "copy") {
          setStage("memory");
          setEntry(updated);
          saveWord(updated);
        } else {
          const done = { ...updated, learned: true };
          saveWord(done);
          onSuccess(done);
        }
      } else {
        playWrong();
        setWrong({ recognized: result.recognized });
        setEntry(updated);
        saveWord(updated);
      }
    } catch {
      setError("بررسی دست‌خط انجام نشد. اتصال اینترنت را بررسی کن و دوباره تلاش کن.");
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setStage("input");
    setEntry(null);
    setWrong(null);
    setError(null);
    setFa("");
  };

  // ---------- RENDER ----------
  return (
    <div className="dvh-screen flex w-full flex-col bg-gradient-to-b from-sky-100 to-indigo-50">
      {/* Top: Persian word input */}
      <div className="shrink-0 px-3 pt-3">
        <div className="rounded-2xl bg-white/90 p-3 shadow-md">
          <div className="flex items-center justify-between">
            <label className="text-base font-black text-sky-700">کلمه فارسی را وارد کن</label>
            <div className="flex items-center gap-2">
              {!online && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">آفلاین</span>}
              <button onClick={() => setShowSettings(true)} className="text-xl" aria-label="تنظیمات">⚙️</button>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={fa}
              onChange={(e) => setFa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="مثلاً: سیب"
              disabled={stage === "loading"}
              className="min-w-0 flex-1 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-lg font-bold text-slate-800 outline-none focus:border-sky-400"
            />
            <button
              onClick={() => apply()}
              disabled={stage === "loading" || !fa.trim()}
              className="rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-5 text-lg font-black text-white shadow-[0_4px_0_#047857] active:translate-y-0.5 active:shadow-[0_2px_0_#047857] disabled:opacity-50"
            >
              اعمال
            </button>
          </div>
          {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-600">{error}</p>}
        </div>
      </div>

      {/* Input stage: recent words */}
      {stage === "input" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="animate-float text-7xl">✏️</div>
          <p className="mt-3 text-lg font-bold text-slate-500">یک کلمه فارسی بنویس و «اعمال» را بزن</p>
          {recent.length > 0 && (
            <div className="mt-6 w-full">
              <p className="mb-2 text-sm font-bold text-slate-400">کلمه‌های قبلی (بدون اینترنت هم کار می‌کنند):</p>
              <div className="flex flex-wrap justify-center gap-2">
                {recent.map((r) => (
                  <button
                    key={r.fa}
                    onClick={() => apply(r.fa)}
                    className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-sky-700 shadow active:scale-95"
                  >
                    {r.learned && <span>⭐</span>}
                    {r.fa}
                    <span className="font-en text-slate-400">· {r.en}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-wiggle text-7xl">🔍</div>
          <p className="mt-4 text-xl font-bold text-sky-700">{loadingMsg}</p>
          <div className="mt-4 h-2 w-40 overflow-hidden rounded-full bg-sky-200">
            <div className="h-full w-1/2 animate-[float_1s_linear_infinite] rounded-full bg-sky-500" style={{ animation: "slide 1.2s ease-in-out infinite" }} />
          </div>
          <style>{`@keyframes slide{0%{transform:translateX(100%)}100%{transform:translateX(-200%)}}`}</style>
        </div>
      )}

      {(stage === "copy" || stage === "memory") && entry && (
        <>
          {/* Word card */}
          <div className="shrink-0 px-3 pt-2">
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-2.5 shadow-md">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-50">
                {entry.image ? (
                  <img src={entry.image} alt={entry.en} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">🖼️</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {stage === "copy" ? (
                  <p className="font-en animate-pop truncate text-4xl font-bold text-sky-700" dir="ltr">
                    {entry.en.charAt(0).toUpperCase() + entry.en.slice(1)}
                  </p>
                ) : (
                  <p className="text-base font-black leading-snug text-violet-700">
                    🧠 حالا بدون نگاه کردن به کلمه، آن را بنویس!
                  </p>
                )}
                <p className="text-sm font-bold text-slate-400">{entry.fa}</p>
              </div>
              {canSpeak() && (
                <button
                  onClick={pronounce}
                  className="flex shrink-0 flex-col items-center rounded-2xl bg-gradient-to-b from-pink-400 to-rose-500 px-3 py-1.5 text-white shadow-[0_4px_0_#9f1239] active:translate-y-0.5 active:shadow-[0_2px_0_#9f1239]"
                  aria-label="تلفظ"
                >
                  <span className="text-2xl">🔊</span>
                  <span className="text-[11px] font-bold leading-tight">
                    {SPEEDS[speed].emoji} {SPEEDS[speed].label}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Drawing area: the largest part */}
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
            <p className="mb-1 shrink-0 text-center text-sm font-black text-slate-600">
              {stage === "copy" ? "حالا کلمه انگلیسی را با انگشت بنویس" : "کلمه را از حافظه‌ات بنویس"}
            </p>
            <div
              className={`relative min-h-0 flex-1 overflow-hidden rounded-3xl border-4 bg-white shadow-inner ${
                wrong ? "animate-shake border-rose-300" : "border-sky-200"
              }`}
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 79px, #e0f2fe 79px 80px)",
              }}
            >
              <DrawingPad ref={padRef} disabled={checking} onChange={setHasInk} />
            </div>

            {/* Feedback */}
            {wrong && (
              <div className="mt-2 shrink-0 rounded-2xl bg-rose-50 px-3 py-2 text-center">
                <p className="text-sm font-bold text-rose-500">
                  املای درست این است، دوباره تلاش کن:
                  {wrong.recognized && (
                    <span className="font-en mr-1 text-slate-400" dir="ltr">
                      (تو نوشتی: {wrong.recognized})
                    </span>
                  )}
                </p>
                <p className="font-en text-3xl font-bold tracking-wide text-rose-600" dir="ltr">
                  {entry.en.charAt(0).toUpperCase() + entry.en.slice(1)}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="mt-2 flex shrink-0 gap-2">
              <button
                onClick={reset}
                className="rounded-2xl bg-slate-200 px-4 py-3 text-lg font-bold text-slate-600 active:scale-95"
                aria-label="کلمه جدید"
              >
                🏠
              </button>
              <button
                onClick={clearPad}
                className="flex-1 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-400 py-3 text-lg font-black text-white shadow-[0_4px_0_#c2410c] active:translate-y-0.5 active:shadow-[0_2px_0_#c2410c]"
              >
                🧽 پاک کن
              </button>
              <button
                onClick={check}
                disabled={checking || !hasInk}
                className="flex-[1.4] rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 py-3 text-lg font-black text-white shadow-[0_4px_0_#047857] active:translate-y-0.5 active:shadow-[0_2px_0_#047857] disabled:opacity-50"
              >
                {checking ? "⏳ در حال بررسی…" : "✅ بررسی کن"}
              </button>
            </div>
          </div>
        </>
      )}

      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </div>
  );
}
