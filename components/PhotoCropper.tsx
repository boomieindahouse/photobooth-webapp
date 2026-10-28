"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/lib/i18n";

interface Props {
  t: Dict;
  file: File;
  src: string;
  /** สัดส่วนกว้าง:สูงของช่องรูปที่จะวาง (กรอบครอปเท่านี้พอดี) */
  aspect: number;
  onConfirm: (dataUrl: string) => void;
  onUseOriginal: () => void;
  onCancel: () => void;
}

const MAX_OUTPUT_SIDE = 1600;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

/**
 * ครอปรูปอัปโหลดก่อนวางลงช่องเทมเพลต — กรอบครอปมีสัดส่วนเท่าช่องรูปพอดี
 * วิธีใช้: นิ้วเดียวลากเลื่อนรูป, สองนิ้วบีบซูม, หรือเลื่อนสไลด์ซูม
 * รูปที่เห็นในกรอบ = รูปที่จะได้ (ไม่ถูกตัดซ้ำตอน export)
 * หมายเหตุ: รูปจากมือถือมักมี EXIF orientation จึงโหลดต้นฉบับด้วย
 * createImageBitmap({ imageOrientation: "from-image" }) เพื่อให้พิกัดครอป
 * ตรงกับรูปที่แสดง (เบราว์เซอร์แสดง <img> แบบหมุนตาม EXIF เหมือนกัน)
 */
export default function PhotoCropper({ t, file, src, aspect, onConfirm, onUseOriginal, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const sourceRef = useRef<ImageBitmap | HTMLImageElement | null>(null);

  // ขนาดรูปต้นฉบับหลังหมุนตาม EXIF (กว้าง x สูง, px)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [loadError, setLoadError] = useState(false);
  // ขนาดกล่องครอปที่แสดงจริง (วัดจากจอ)
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // โหลดต้นฉบับแบบหมุนตาม EXIF; ถ้าไม่รองรับ ถอยไปใช้ <img> ธรรมดา
  useEffect(() => {
    let cancelled = false;
    let bitmap: ImageBitmap | null = null;
    const load = async () => {
      try {
        if (typeof createImageBitmap === "function") {
          bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
          if (cancelled) {
            bitmap.close();
            return;
          }
          sourceRef.current = bitmap;
          setImgSize({ w: bitmap.width, h: bitmap.height });
          return;
        }
        throw new Error("no createImageBitmap");
      } catch {
        if (cancelled) return;
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          sourceRef.current = img;
          setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => {
          if (!cancelled) setLoadError(true);
        };
        img.src = src;
      }
    };
    load();
    return () => {
      cancelled = true;
      bitmap?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // วัดขนาดกล่องครอป (กว้างตามจอ, สูงตามสัดส่วน)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setBoxSize({ w: rect.width, h: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ขนาดรูปที่แสดง (cover กล่องครอปที่ scale 1) + กันเลื่อนจนเห็นขอบนอก
  const disp =
    imgSize && boxSize.w > 0
      ? (() => {
          const base = Math.max(boxSize.w / imgSize.w, boxSize.h / imgSize.h);
          return { w: imgSize.w * base * scale, h: imgSize.h * base * scale, base };
        })()
      : null;

  const clampOffset = (x: number, y: number, s: number) => {
    if (!disp || !imgSize || boxSize.w === 0) return { x, y };
    const base = Math.max(boxSize.w / imgSize.w, boxSize.h / imgSize.h);
    const w = imgSize.w * base * s;
    const h = imgSize.h * base * s;
    return {
      x: Math.max(-Math.max(0, (w - boxSize.w) / 2), Math.min(Math.max(0, (w - boxSize.w) / 2), x)),
      y: Math.max(-Math.max(0, (h - boxSize.h) / 2), Math.min(Math.max(0, (h - boxSize.h) / 2), y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pointers = pointersRef.current;
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setOffset((o) => clampOffset(o.x + dx, o.y + dy, scale));
    } else if (pointers.size === 2 && pinchRef.current) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      if (dist > 0 && pinchRef.current.dist > 0) {
        const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * (dist / pinchRef.current.dist)));
        setOffset((o) => clampOffset(o.x + (midX - pinchRef.current!.midX), o.y + (midY - pinchRef.current!.midY), nextScale));
        setScale(nextScale);
      }
      pinchRef.current = { dist, midX, midY };
    }
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
  };

  const handleConfirm = () => {
    const source = sourceRef.current;
    if (!source || !disp || !imgSize || boxSize.w === 0) return;
    // จุดซ้ายบนของรูปที่แสดง (เทียบกับกล่องครอป)
    const left = (boxSize.w - disp.w) / 2 + offset.x;
    const top = (boxSize.h - disp.h) / 2 + offset.y;
    // แปลงกรอบครอป (กล่องทั้งใบ) กลับเป็นพิกัดรูปต้นฉบับ
    const sx = Math.max(0, (0 - left) / disp.w) * imgSize.w;
    const sy = Math.max(0, (0 - top) / disp.h) * imgSize.h;
    const sw = Math.min(imgSize.w - sx, (boxSize.w / disp.w) * imgSize.w);
    const sh = Math.min(imgSize.h - sy, (boxSize.h / disp.h) * imgSize.h);
    if (sw <= 0 || sh <= 0) return;
    const longSide = Math.max(sw, sh);
    const outScale = longSide > MAX_OUTPUT_SIDE ? MAX_OUTPUT_SIDE / longSide : 1;
    const outW = Math.max(1, Math.round(sw * outScale));
    const outH = Math.max(1, Math.round(sh * outScale));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, outW, outH);
    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{t.cropTitle}</h3>
      <p className="mt-1 text-sm text-gray-500">{t.cropHint}</p>
      {/* กล่องครอป: สัดส่วนเท่าช่องรูป, ข้างนอกกรอบมืดลง, มีเส้นตาราง 3x3 */}
      <div ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd} className="relative mt-4 w-full touch-none overflow-hidden rounded-3xl bg-black shadow-lg shadow-pink-100" style={{ aspectRatio: `${aspect}`, touchAction: "none" }}>
        {imgSize && disp && boxSize.w > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" draggable={false} className="absolute select-none" style={{ width: disp.w, height: disp.h, left: (boxSize.w - disp.w) / 2 + offset.x, top: (boxSize.h - disp.h) / 2 + offset.y }} />
        )}
        {/* เส้นกรอบ + ตาราง 3x3 (ไม่รับ pointer — ลากทะลุได้) */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-white/80">
          <div className="absolute bottom-0 left-1/3 top-0 w-px bg-white/50" />
          <div className="absolute bottom-0 left-2/3 top-0 w-px bg-white/50" />
          <div className="absolute left-0 right-0 top-1/3 h-px bg-white/50" />
          <div className="absolute left-0 right-0 top-2/3 h-px bg-white/50" />
        </div>
      </div>
      {loadError ? (
        <p className="mt-3 text-center text-sm text-red-500">{t.cropError}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-gray-700">{t.cropZoom}</span>
          <input type="range" min={MIN_SCALE} max={MAX_SCALE} step={0.05} value={scale} onChange={(e) => { const s = Number(e.target.value); setScale(s); setOffset((o) => clampOffset(o.x, o.y, s)); }} className="w-full accent-pink-500" aria-label={t.cropZoom} />
        </div>
      )}
      <div className="mt-5 flex flex-col gap-3">
        <button type="button" onClick={handleConfirm} disabled={!imgSize || loadError} className="w-full rounded-full bg-violet-400 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500 disabled:opacity-40">
          {t.cropConfirm}
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onUseOriginal} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600">
            {t.cropUseOriginal}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600">
            {t.cropCancel}
          </button>
        </div>
      </div>
    </div>
  );
}
