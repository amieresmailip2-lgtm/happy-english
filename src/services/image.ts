// Generates a simple cartoon picture of the concept using a free AI image endpoint,
// then converts it to a small data URL so it can be cached on the device.

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function shrink(dataUrl: string, size = 220): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function fetchConceptImage(en: string): Promise<string | null> {
  if (!navigator.onLine) return null;
  const prompt = `simple cute cartoon illustration of ${en}, flat vector style for children, single object centered, plain soft pastel background, bright colors, no text`;
  const seed = Math.floor(Math.random() * 10000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=384&height=384&nologo=true&seed=${seed}`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const dataUrl = await blobToDataUrl(blob);
    return await shrink(dataUrl);
  } catch {
    return null;
  }
}
