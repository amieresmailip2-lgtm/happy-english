import { useState } from "react";
import InstallGuide from "../components/InstallGuide";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const { canInstall, installed, install } = useInstallPrompt();
  const [guide, setGuide] = useState(false);

  const onInstallClick = async () => {
    if (canInstall) {
      const ok = await install();
      if (!ok) setGuide(true);
    } else {
      setGuide(true);
    }
  };

  return (
    <div className="dvh-screen relative flex w-full flex-col items-center justify-between overflow-hidden">
      <img
        src="./welcome-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/70 via-white/40 to-amber-100/70" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="animate-float mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-sky-200">
          <img src="./icon-512.png" alt="آیکن" className="h-full w-full object-cover" />
        </div>
        <h1 className="animate-pop text-5xl font-black text-sky-700 drop-shadow-sm">خوش آمدید!</h1>
        <p className="font-en mt-2 text-3xl font-bold text-pink-500">Welcome!</p>

        <div className="mt-8 rounded-3xl bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm">
          <p className="text-xl font-bold text-emerald-700">با هم انگلیسی یاد بگیریم!</p>
          <p className="font-en mt-1 text-lg font-semibold text-emerald-600">Let's learn English together!</p>
        </div>
      </div>

      <div className="relative z-10 w-full space-y-3 px-6 pb-8">
        <button
          onClick={onStart}
          className="w-full rounded-full bg-gradient-to-b from-amber-300 to-orange-400 py-5 text-3xl font-black text-white shadow-[0_8px_0_#c2410c] transition active:translate-y-1 active:shadow-[0_4px_0_#c2410c]"
        >
          🚀 شروع
        </button>
        {!installed && (
          <button
            onClick={onInstallClick}
            className="w-full rounded-full bg-white/90 py-3 text-lg font-black text-sky-700 shadow-md active:scale-95"
          >
            📲 نصب روی گوشی
          </button>
        )}
      </div>

      {guide && <InstallGuide onClose={() => setGuide(false)} />}
    </div>
  );
}
