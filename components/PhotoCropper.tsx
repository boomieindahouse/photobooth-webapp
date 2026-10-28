"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import type { Dict } from "@/lib/i18n";

interface Props {
  t: Dict;
  /** ไฟล์ต้นฉบับ (โหมดอัปโหลด) — ถ้าไม่มี (โหมดครอปซ้ำ) จะโหลดจาก src แทน */
  file: File | null;
  src: string;
  /** สัดส่วนกว้าง:สูงของช่องรูปที่จะวาง (กรอบครอปเท่านี้พอดี) */
  aspect: number;
  onConfirm: (dataUrl: string) => void;
  onUseOriginal: () => void;
  onCancel: () => void;
}

const MAX_OUTPUT_SIDE = 1600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * ครอปรูปอัปโหลดก่อนวางลงช่องเทมเพลต — กรอบครอปมีสัดส่วนเท่าช่องรูปพอดี
 * ท่าทางทั้งหมด (ลากเลื่อน, บีบซูม 2 นิ้ว, สไลด์ซูม) ใช้ react-easy-crop
 * ซึ่งเป็น library ครอปยอดนิยมที่จัดการ gesture บนมือถือมาให้แล้ว
 * (ของเดิมที่เขียน handler เองมีอาการซูมกระตุก/รูปไถลหนีนิ้ว)
 * รูปที่เห็นในกรอบ = รูปที่จะได้ (ไม่ถูกตัดซ้ำตอน export)
 * หมายเหตุ: รูปจากมือถือมักมี EXIF orientation จึงโหลดต้นฉบับสำหรับ
 * export ด้วย createImageBitmap({ imageOrientation: "from-image" })
 * เพื่อให้พิกัดครอปจาก library ตรงกับรูปที่วาดออกมา
 */
export default function PhotoCropper({ t, file, src, aspect, onConfirm, onUseOriginal, onCancel }: Props) {
  const sourceRef = useRef<ImageBitmap | HTMLImageElement | null>(null);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  // ขนาดรูปต้นฉบับหลังหมุนตาม EXIF (กว้าง x สูง, px)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // โหลดต้นฉบับสำหรับ export แบบหมุนตาม EXIF; ถ้าไม่รองรับ ถอยไปใช้ <img>
  useEffect(() => {
    let cancelled = false;
    let bitmap: ImageBitmap | null = null;
    const load = async () => {
      try {
        if (file && typeof createImageBitmap === "function") {
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
  }, [file, src]);

  const handleConfirm = () => {
    const source = sourceRef.current;
    const pixels = croppedAreaPixelsRef.current;
    if (!source || !pixels || !imgSize) return;
    // กันพิกัดหลุดขอบรูปต้นฉบับ (ปัดเศษ/กันค่าติดลบจากความคลาดเคลื่อน)
    const sx = Math.max(0, Math.min(imgSize.w - 1, pixels.x));
    const sy = Math.max(0, Math.min(imgSize.h - 1, pixels.y));
    const sw = Math.max(1, Math.min(imgSize.w - sx, pixels.width));
    const sh = Math.max(1, Math.min(imgSize.h - sy, pixels.height));
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
      {/* กล่องครอป: สัดส่วนเท่าช่องรูป, library จัดการลาก/บีบซูมให้เอง */}
      <div className="relative mt-4 w-full overflow-hidden rounded-3xl bg-black shadow-lg shadow-pink-100" style={{ aspectRatio: `${aspect}` }}>
        <Cropper image={src} crop={crop} zoom={zoom} rotation={0} aspect={aspect} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} cropShape="rect" objectFit="cover" showGrid zoomSpeed={1} restrictPosition onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => { croppedAreaPixelsRef.current = pixels; }} style={{ containerStyle: { width: "100%", height: "100%", backgroundColor: "#000000" } }} />
      </div>
      {loadError ? (
        <p className="mt-3 text-center text-sm text-red-500">{t.cropError}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-gray-700">{t.cropZoom}</span>
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-pink-500" aria-label={t.cropZoom} />
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
