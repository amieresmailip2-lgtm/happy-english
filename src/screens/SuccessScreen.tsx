import { useEffect, useMemo } from "react";
import { playSuccess } from "../services/speech";

interface Props {
  en: string;
  image: string | null;
  onBack: () => void;
}

const COLORS = ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#fb7185"];

export default function SuccessScreen({ en, image, onBack }: Props) {
  useEffect(() => {
    playSuccess();
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 3 + Math.random() * 3,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 8,
      })),
    []
  );

  return (
    <div className="dvh-screen relative flex w-full flex-col items-center justify-between overflow-hidden">
      <img src="./success-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/70 via-white/50 to-pink-100/70" />
      {confetti.map((c, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: `${c.left}%`, background: c.color, width: c.w, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}
        />
      ))}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="animate-pop text-7xl">🏆</div>
        <h1 className="animate-pop mt-3 text-6xl font-black text-orange-500 drop-shadow">آفرین!</h1>
        <p className="font-en mt-1 text-3xl font-bold text-pink-500">Well done!</p>

        <div className="mt-6 flex items-center gap-4 rounded-3xl bg-white/85 px-6 py-4 shadow-lg backdrop-blur-sm">
          {image && <img src={image} alt={en} className="h-20 w-20 rounded-2xl object-cover" />}
          <div>
            <p className="font-en text-3xl font-bold text-sky-700">{en}</p>
            <div className="mt-1 text-lg text-yellow-500">⭐⭐⭐</div>
          </div>
        </div>

        <p className="mt-6 text-2xl font-bold text-emerald-700">تو این کلمه را یاد گرفتی!</p>
      </div>

      <div className="relative z-10 w-full px-6 pb-10">
        <button
          onClick={onBack}
          className="w-full rounded-full bg-gradient-to-b from-sky-400 to-blue-500 py-5 text-3xl font-black text-white shadow-[0_8px_0_#1e40af] transition active:translate-y-1 active:shadow-[0_4px_0_#1e40af]"
        >
          🔙 بازگشت
        </button>
      </div>
    </div>
  );
}
