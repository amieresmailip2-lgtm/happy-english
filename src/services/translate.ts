import { getAiSettings } from "./storage";

// A small offline dictionary for common kid words (works without internet).
const OFFLINE: Record<string, string> = {
  "سیب": "apple", "موز": "banana", "پرتقال": "orange", "گربه": "cat", "سگ": "dog",
  "خانه": "house", "کتاب": "book", "مداد": "pencil", "توپ": "ball", "ماشین": "car",
  "آب": "water", "درخت": "tree", "گل": "flower", "خورشید": "sun", "ماه": "moon",
  "ستاره": "star", "پرنده": "bird", "ماهی": "fish", "شیر": "lion", "فیل": "elephant",
  "خرگوش": "rabbit", "اسب": "horse", "گاو": "cow", "مرغ": "chicken", "اردک": "duck",
  "میز": "table", "صندلی": "chair", "در": "door", "پنجره": "window", "کیف": "bag",
  "قرمز": "red", "آبی": "blue", "سبز": "green", "زرد": "yellow", "سفید": "white",
  "سیاه": "black", "یک": "one", "دو": "two", "سه": "three", "چهار": "four", "پنج": "five",
  "مادر": "mother", "پدر": "father", "دوست": "friend", "مدرسه": "school", "معلم": "teacher",
  "نان": "bread", "شیرینی": "cake", "بستنی": "ice cream", "تخم مرغ": "egg", "پنیر": "cheese",
  "دست": "hand", "پا": "foot", "چشم": "eye", "گوش": "ear", "دهان": "mouth", "بینی": "nose",
  "کلاه": "hat", "کفش": "shoe", "لباس": "dress", "باران": "rain", "برف": "snow", "ابر": "cloud",
  "دریا": "sea", "کوه": "mountain", "باغ": "garden", "پروانه": "butterfly", "زنبور": "bee",
  "قاشق": "spoon", "لیوان": "cup", "تخت": "bed", "ساعت": "clock", "تلفن": "phone", "موش": "mouse",
  "میمون": "monkey", "خرس": "bear", "زرافه": "giraffe", "گرگ": "wolf", "روباه": "fox", "قورباغه": "frog",
  "هویج": "carrot", "گوجه": "tomato", "انگور": "grape", "هندوانه": "watermelon", "توت فرنگی": "strawberry",
  "لیمو": "lemon", "گلابی": "pear", "هواپیما": "airplane", "قطار": "train", "دوچرخه": "bicycle", "کشتی": "ship",
};

function cleanWord(s: string) {
  return s
    .replace(/[^a-zA-Z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function viaAi(fa: string): Promise<string | null> {
  const { key, base, model } = getAiSettings();
  if (!key) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You translate single Persian words for children learning English. Reply with ONLY the most common, simple English equivalent (one or two words, lowercase, no punctuation, no explanation).",
          },
          { role: "user", content: fa },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = cleanWord(data?.choices?.[0]?.message?.content ?? "");
    return txt || null;
  } catch {
    return null;
  }
}

async function viaMyMemory(fa: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(fa)}&langpair=fa|en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    let txt: string = data?.responseData?.translatedText ?? "";
    // Prefer short, high-quality matches if available
    const matches: { translation: string; quality: string | number }[] = data?.matches ?? [];
    const good = matches
      .filter((m) => Number(m.quality) >= 70 && m.translation.split(" ").length <= 2)
      .sort((a, b) => Number(b.quality) - Number(a.quality))[0];
    if (good) txt = good.translation;
    txt = cleanWord(txt);
    if (!txt || /^[a-z]$/.test(txt)) return null;
    // Avoid returning the input echoed back (untranslated)
    if (/[\u0600-\u06FF]/.test(txt)) return null;
    return txt;
  } catch {
    return null;
  }
}

async function viaGoogleFree(fa: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=en&dt=t&q=${encodeURIComponent(fa)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const txt = cleanWord(data?.[0]?.map((p: string[]) => p[0]).join("") ?? "");
    return txt || null;
  } catch {
    return null;
  }
}

export interface TranslateResult {
  en: string;
  source: "offline" | "ai" | "online";
}

export async function translateFaToEn(faRaw: string): Promise<TranslateResult | null> {
  const fa = faRaw.trim();
  if (OFFLINE[fa]) return { en: OFFLINE[fa], source: "offline" };
  if (!navigator.onLine) return null;

  const ai = await viaAi(fa);
  if (ai) return { en: ai, source: "ai" };

  const g = await viaGoogleFree(fa);
  if (g) return { en: g, source: "online" };

  const mm = await viaMyMemory(fa);
  if (mm) return { en: mm, source: "online" };

  return null;
}
