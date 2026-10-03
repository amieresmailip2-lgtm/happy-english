interface Props {
  onClose: () => void;
}

export default function InstallGuide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-black text-sky-700">📲 نصب روی گوشی اندروید</h2>
        <ol className="mt-3 space-y-2 text-sm font-bold leading-relaxed text-slate-700">
          <li>۱. این صفحه را در مرورگر <span className="text-sky-600">Chrome</span> باز کن.</li>
          <li>۲. منوی سه‌نقطه (⋮) بالا سمت راست را بزن.</li>
          <li>۳. گزینه‌ی «<span className="text-emerald-600">نصب برنامه</span>» یا «افزودن به صفحه اصلی» را انتخاب کن.</li>
          <li>۴. آیکن «انگلیسی شاد» روی صفحه‌ی گوشی ظاهر می‌شود و مثل یک برنامه‌ی عادی باز می‌شود.</li>
        </ol>
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          نکته: فایل دانلودشده‌ی HTML با ضربه زدن باز نمی‌شود؛ برنامه باید از طریق آدرس اینترنتی در Chrome نصب شود.
        </p>
        <button onClick={onClose} className="mt-4 w-full rounded-full bg-sky-500 py-3 text-lg font-bold text-white active:scale-95">
          فهمیدم
        </button>
      </div>
    </div>
  );
}
