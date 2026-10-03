import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Stroke } from "../services/handwriting";

export interface DrawingPadHandle {
  clear: () => void;
  getStrokes: () => Stroke[];
  getSize: () => { width: number; height: number };
  isEmpty: () => boolean;
}

interface Props {
  disabled?: boolean;
  onChange?: (hasInk: boolean) => void;
}

const DrawingPad = forwardRef<DrawingPadHandle, Props>(({ disabled, onChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const drawing = useRef(false);
  const startTime = useRef(Date.now());
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const setupCanvas = useCallback(() => {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = w.getBoundingClientRect();
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    c.style.width = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1e3a8a";
    // redraw existing strokes
    for (const s of strokes.current) {
      ctx.beginPath();
      s.x.forEach((x, i) => (i === 0 ? ctx.moveTo(x, s.y[i]) : ctx.lineTo(x, s.y[i])));
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const ro = new ResizeObserver(() => setupCanvas());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [setupCanvas]);

  const clear = useCallback(() => {
    strokes.current = [];
    current.current = null;
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d")!;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.restore();
    }
    startTime.current = Date.now();
    setHasInk(false);
    onChange?.(false);
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    clear,
    getStrokes: () => strokes.current,
    getSize: () => {
      const r = wrapRef.current?.getBoundingClientRect();
      return { width: r?.width ?? 0, height: r?.height ?? 0 };
    },
    isEmpty: () => strokes.current.length === 0,
  }));

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    current.current = { x: [p.x], y: [p.y], t: [Date.now() - startTime.current] };
    last.current = p;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !current.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    // Use coalesced events for smoother, lower-latency lines
    const native = e.nativeEvent as PointerEvent;
    const events = native.getCoalescedEvents?.() ?? [native];
    const r = canvasRef.current!.getBoundingClientRect();
    for (const ev of events) {
      const p = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      const l = last.current!;
      const mid = { x: (l.x + p.x) / 2, y: (l.y + p.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.quadraticCurveTo(l.x, l.y, mid.x, mid.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      current.current.x.push(p.x);
      current.current.y.push(p.y);
      current.current.t.push(Date.now() - startTime.current);
      last.current = p;
    }
  };

  const onUp = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    drawing.current = false;
    if (current.current) {
      strokes.current.push(current.current);
      current.current = null;
      if (!hasInk) {
        setHasInk(true);
        onChange?.(true);
      }
    }
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full select-none">
      <canvas
        ref={canvasRef}
        className="touch-none absolute inset-0 block"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      />
      {!hasInk && !disabled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-sky-300/80">✍️ اینجا بنویس</span>
        </div>
      )}
    </div>
  );
});

DrawingPad.displayName = "DrawingPad";
export default DrawingPad;
