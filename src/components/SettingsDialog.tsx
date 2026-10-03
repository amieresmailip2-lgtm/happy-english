import { useState } from "react";
import { getAiSettings, setAiSettings } from "../services/storage";

interface Props {
  onClose: () => void;
}

export default function SettingsDialog({ onClose }: Props) {
  const init = getAiSettings();
  const [key, setKey] = useState(init.key);
  const [base, setBase] = useState(init.base);
  const [model, setModel] = useState(init.model);

  const save = () => {
    setAiSettings({ key, base, model });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-black text-sky-700">⚙️ تنظیمات هوش مصنوعی (اختیاری)</h2>
        <p className="mt-1 text-sm text-slate-500">
          بدون کلید هم برنامه با سرویس‌های رایگان کار می‌کند. اگر کلید API سازگار با OpenAI دارید، فقط روی همین
          گوشی ذخیره می‌شود و در کد برنامه قرار نمی‌گیرد.
        </p>
        <label className="mt-4 block text-sm font-bold text-slate-700">کلید API</label>
        <input
          dir="ltr"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="mt-1 w-full rounded-xl border-2 border-sky-200 px-3 py-2 text-left outline-none focus:border-sky-400"
        />
        <label className="mt-3 block text-sm font-bold text-slate-700">آدرس پایه (Base URL)</label>
        <input
          dir="ltr"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="mt-1 w-full rounded-xl border-2 border-sky-200 px-3 py-2 text-left outline-none focus:border-sky-400"
        />
        <label className="mt-3 block text-sm font-bold text-slate-700">مدل</label>
        <input
          dir="ltr"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 w-full rounded-xl border-2 border-sky-200 px-3 py-2 text-left outline-none focus:border-sky-400"
        />
        <div className="mt-5 flex gap-3">
          <button onClick={save} className="flex-1 rounded-full bg-emerald-500 py-3 text-lg font-bold text-white active:scale-95">
            ذخیره
          </button>
          <button onClick={onClose} className="flex-1 rounded-full bg-slate-200 py-3 text-lg font-bold text-slate-700 active:scale-95">
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
