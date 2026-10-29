"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { PhotoboothTemplate } from "@/lib/photobooth";
import { getCellAspect } from "@/lib/photobooth";
import type { Dict } from "@/lib/i18n";
import PhotoCropper from "@/components/PhotoCropper";

interface Props {
  t: Dict;
  template: PhotoboothTemplate;
  onDone: (photos: string[]) => void;
  onBack: () => void;
}

const COUNTDOWN_FROM = 3;
const PAUSE_BETWEEN_SHOTS_MS = 900;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function CameraCapture({ t, template, onDone, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  // รูปต้นฉบับก่อนครอป คู่ขนานกับ photos ตาม index — เอาไว้ครอปซ้ำรายช็อตจากรูปเต็ม (กล้อง: ช็อตเต็มเฟรม, อัปโหลด: ไฟล์ต้นฉบับ)
  const [sources, setSources] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [justCaptured, setJustCaptured] = useState(false);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraReady(true);
    } catch {
      setCameraError(t.cameraError);
    }
  }, [t]);

  useEffect(() => {
    cancelledRef.current = false;
    startCamera();
    return () => {
      cancelledRef.current = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [startCamera]);

  const captureOne = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Preview is mirrored, but the saved photo is flipped back (like iPhone front camera)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  const shootOne = useCallback(async () => {
    for (let n = COUNTDOWN_FROM; n >= 1; n--) {
      if (cancelledRef.current) return null;
      setCountdown(n);
      await wait(1000);
    }
    if (cancelledRef.current) return null;
    setCountdown(null);
    const shot = captureOne();
    if (shot) {
      setFlash(true);
      setJustCaptured(true);
      setTimeout(() => { setFlash(false); setJustCaptured(false); }, 500);
    }
    return shot;
  }, [captureOne]);

  const startSession = useCallback(async () => {
    if (isShooting || photos.length >= template.shots) return;
    setIsShooting(true);
    let current = [...photos];
    let currentSources = [...sources];
    while (current.length < template.shots) {
      const shot = await shootOne();
      if (cancelledRef.current) break;
      if (!shot) break;
      current = [...current, shot];
      currentSources = [...currentSources, shot];
      setPhotos(current);
      setSources(currentSources);
      if (current.length < template.shots) await wait(PAUSE_BETWEEN_SHOTS_MS);
    }
    setIsShooting(false);
    if (!cancelledRef.current && current.length >= template.shots) {
      await wait(700);
      if (!cancelledRef.current) onDone(current);
    }
  }, [isShooting, photos, sources, template.shots, shootOne, onDone]);

  const retakeLast = useCallback(() => {
    if (isShooting || photos.length === 0) return;
    setPhotos((prev) => prev.slice(0, -1));
    setSources((prev) => prev.slice(0, -1));
  }, [isShooting, photos.length]);

  // ครอปรูปอัปโหลดทีละไฟล์ก่อนวางลงช่อง: เปิดไฟล์แรกขึ้นมาให้ครอปก่อน
  // ไฟล์ที่เหลือรอคิวอยู่ด้านหลัง (กรอบครอป = สัดส่วนช่องรูปช็อตนั้นพอดี)
  const [cropFile, setCropFile] = useState<{ file: File; url: string } | null>(null);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  // รูปต้นฉบับของไฟล์ที่กำลังครอป (อ่านล่วงหน้าตอนเปิดไฟล์ — เอาไว้เก็บเป็น source สำหรับครอปซ้ำทีหลัง; ถ้ายังอ่านไม่ทันใช้รูปครอปแทน)
  const cropSourceRef = useRef<string | null>(null);
  // index ของช็อตที่กำลังครอปซ้ำ (null = ไม่ได้ครอปซ้ำ)
  const [reCropIndex, setReCropIndex] = useState<number | null>(null);

  const openNextCrop = useCallback((queue: File[]) => {
    if (queue.length === 0) {
      setCropFile(null);
      setCropQueue([]);
      return;
    }
    const [next, ...rest] = queue;
    setCropQueue(rest);
    setCropFile({ file: next, url: URL.createObjectURL(next) });
    cropSourceRef.current = null;
    const reader = new FileReader();
    reader.onload = () => { cropSourceRef.current = String(reader.result); };
    reader.readAsDataURL(next);
  }, []);

  /** เพิ่มรูปที่ผ่านการครอปแล้วลงช็อตถัดไป แล้วเปิดไฟล์คิวถัดไป (ถ้ามี) */
  const appendCropped = useCallback((dataUrl: string, sourceOverride?: string) => {
    const next = [...photos, dataUrl];
    const nextSources = [...sources, sourceOverride ?? cropSourceRef.current ?? dataUrl];
    setPhotos(next);
    setSources(nextSources);
    if (cropFile) URL.revokeObjectURL(cropFile.url);
    if (next.length >= template.shots) {
      setCropFile(null);
      setCropQueue([]);
      onDone(next);
    } else {
      openNextCrop(cropQueue);
    }
  }, [photos, sources, cropFile, cropQueue, template.shots, onDone, openNextCrop]);

  /** ใช้รูปเต็มโดยไม่ครอป (ทางลัดสำหรับคนอัปโหลดหลายรูป) */
  const useOriginalFile = useCallback(() => {
    if (!cropFile) return;
    const reader = new FileReader();
    reader.onload = () => { const full = String(reader.result); appendCropped(full, full); };
    reader.readAsDataURL(cropFile.file);
  }, [cropFile, appendCropped]);

  /** ข้ามไฟล์นี้ (ไม่เพิ่มรูป) แล้วเปิดไฟล์คิวถัดไป */
  const cancelCrop = useCallback(() => {
    if (cropFile) URL.revokeObjectURL(cropFile.url);
    openNextCrop(cropQueue);
  }, [cropFile, cropQueue, openNextCrop]);

  /** Fallback when there is no camera: upload photos from the device */
  const handleUpload = useCallback((files: FileList | null) => {
    if (!files || cropFile || reCropIndex !== null) return;
    const picked = Array.from(files).slice(0, template.shots - photos.length);
    if (picked.length === 0) return;
    openNextCrop(picked);
  }, [photos, template.shots, cropFile, reCropIndex, openNextCrop]);

  /** ครอปช็อตที่วางแล้วใหม่ — ครอปจากรูปต้นฉบับของช็อตนั้น */
  const confirmReCrop = useCallback((dataUrl: string) => {
    if (reCropIndex === null) return;
    const index = reCropIndex;
    setPhotos((prev) => prev.map((p, i) => (i === index ? dataUrl : p)));
    setReCropIndex(null);
  }, [reCropIndex]);

  /** ครอปซ้ำแต่เลือก "ใช้รูปเต็ม" = คืนช็อตนั้นกลับเป็นรูปต้นฉบับ */
  const restoreOriginal = useCallback(() => {
    if (reCropIndex === null) return;
    const index = reCropIndex;
    const original = sources[index];
    if (original) setPhotos((prev) => prev.map((p, i) => (i === index ? original : p)));
    setReCropIndex(null);
  }, [reCropIndex, sources]);

  const remaining = template.shots - photos.length;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-800">{t.cameraTitle} — {template.name}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.cameraDesc}</p>
      <div className="relative mt-4 overflow-hidden rounded-3xl bg-gray-900 shadow-lg shadow-pink-100">
        {/* กรอบพรีวิวสัดส่วนเท่าช่องรูปของช็อตที่จะถ่าย (เดิม fix 4:3 ไว้ เทมเพลตแนวตั้งจึงเห็นภาพแนวนอน แล้วแถบรูปครอปกลางภาพอีกที — video object-cover ครอปกลางเหมือน drawCover ของ composeStrip จึงเห็นตรงกับรูปที่จะได้พอดี; ถ่ายเก็บเต็มเฟรมเหมือนเดิมเผื่อครอปซ้ำจากรูปต้นฉบับได้) */}
        <div className="relative w-full" style={{ aspectRatio: `${getCellAspect(template, photos.length)}` }}>
          <video ref={videoRef} playsInline muted autoPlay className="-scale-x-100 h-full w-full object-cover" />
          {!cameraReady && !cameraError && <div className="absolute inset-0 flex items-center justify-center bg-pink-50 text-sm text-pink-500">{t.cameraOpening}</div>}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-pink-50 p-6 text-center">
              <p className="text-sm text-gray-600">{cameraError}</p>
              <button type="button" onClick={startCamera} className="rounded-full bg-violet-400 px-5 py-2.5 text-sm font-medium text-white">{t.retryCamera}</button>
            </div>
          )}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span key={countdown} className="countdown-pop text-[7rem] font-bold leading-none text-white drop-shadow-lg">{countdown}</span>
            </div>
          )}
          {flash && <div className="absolute inset-0 bg-white" />}
        </div>
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="text-sm font-medium text-gray-700">{t.shotOf} {Math.min(photos.length + 1, template.shots)}/{template.shots}</span>
          <span className="text-sm text-pink-500">{isShooting ? t.shootingAuto : justCaptured ? t.captured : remaining === template.shots ? t.ready : `${t.taken} ${photos.length} ${t.shots}, ${remaining} ${t.remaining}`}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {photos.map((src, i) => (
          <button key={i} type="button" onClick={() => setReCropIndex(i)} disabled={isShooting || !!cropFile || reCropIndex !== null} title={t.tapToRecrop} className="relative shrink-0 rounded-xl disabled:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${t.shotLabel} ${i + 1}`} className="h-20 w-auto rounded-xl object-cover ring-2 ring-pink-200" />
            <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-pink-500 shadow"><Icon icon="lucide:crop" width={12} height={12} aria-hidden="true" /></span>
          </button>
        ))}
        {Array.from({ length: remaining }).map((_, i) => (
          <div key={`empty-${i}`} className="flex h-20 w-[106px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 text-xs text-pink-300">{t.shotLabel} {photos.length + i + 1}</div>
        ))}
      </div>
      {photos.length > 0 && !isShooting && <p className="mt-1 text-xs text-gray-400">{t.tapToRecrop}</p>}
      <div className="mt-5 flex flex-col gap-3">
        {!isShooting && photos.length < template.shots && (
          <button type="button" onClick={startSession} disabled={!cameraReady} className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-400 py-4 text-base font-medium text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500 disabled:opacity-40">
            <Icon icon="lucide:camera" width={20} height={20} aria-hidden="true" />
            {photos.length === 0 ? t.startShoot : `${t.shootMore} ${remaining} ${t.shots}`}
          </button>
        )}
        {isShooting && <p className="rounded-full bg-pink-100 py-3 text-center text-sm font-medium text-pink-700">{t.shootingAuto}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onBack} disabled={isShooting} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-medium text-pink-600 disabled:opacity-40">{t.changeTemplate}</button>
          <button type="button" onClick={retakeLast} disabled={isShooting || photos.length === 0} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-medium text-pink-600 disabled:opacity-40">{t.retakeLast}</button>
        </div>
        <label className="cursor-pointer rounded-full bg-white py-3 text-center text-sm font-medium text-gray-500 ring-1 ring-pink-100">
          {t.noCameraUpload}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {/* หน้าครอปซ้ำรายช็อต — ครอปจากรูปต้นฉบับของช็อตนั้น */}
      {reCropIndex !== null && sources[reCropIndex] && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-pink-50 px-4 py-6">
          <div className="mx-auto w-full max-w-md">
            <PhotoCropper key={`recrop-${reCropIndex}`} t={t} file={null} src={sources[reCropIndex]} aspect={getCellAspect(template, reCropIndex)} onConfirm={confirmReCrop} onUseOriginal={restoreOriginal} onCancel={() => setReCropIndex(null)} />
          </div>
        </div>
      )}
      {/* หน้าครอปรูปอัปโหลด — โผล่ทับจอกล้อง (กล้องยังค้างอยู่ข้างหลัง) */}
      {cropFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-pink-50 px-4 py-6">
          <div className="mx-auto w-full max-w-md">
            <PhotoCropper key={cropFile.url} t={t} file={cropFile.file} src={cropFile.url} aspect={getCellAspect(template, photos.length)} onConfirm={appendCropped} onUseOriginal={useOriginalFile} onCancel={cancelCrop} />
          </div>
        </div>
      )}
    </div>
  );
}
