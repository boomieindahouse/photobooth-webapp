"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { PhotoboothTemplate } from "@/lib/photobooth";
import type { Dict } from "@/lib/i18n";

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
    while (current.length < template.shots) {
      const shot = await shootOne();
      if (cancelledRef.current) break;
      if (!shot) break;
      current = [...current, shot];
      setPhotos(current);
      if (current.length < template.shots) await wait(PAUSE_BETWEEN_SHOTS_MS);
    }
    setIsShooting(false);
    if (!cancelledRef.current && current.length >= template.shots) {
      await wait(700);
      if (!cancelledRef.current) onDone(current);
    }
  }, [isShooting, photos, template.shots, shootOne, onDone]);

  const retakeLast = useCallback(() => {
    if (isShooting || photos.length === 0) return;
    setPhotos((prev) => prev.slice(0, -1));
  }, [isShooting, photos.length]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, template.shots - photos.length);
    const dataUrls = await Promise.all(picked.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    })));
    const next = [...photos, ...dataUrls];
    setPhotos(next);
    if (next.length >= template.shots) onDone(next);
  }, [photos, template.shots, onDone]);

  const remaining = template.shots - photos.length;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800">{t.cameraTitle} — {template.name}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.cameraDesc}</p>
      <div className="relative mt-4 overflow-hidden rounded-3xl bg-gray-900 shadow-lg shadow-pink-100">
        <div className="relative aspect-[4/3] w-full">
          <video ref={videoRef} playsInline muted autoPlay className="-scale-x-100 h-full w-full object-cover" />
          {!cameraReady && !cameraError && <div className="absolute inset-0 flex items-center justify-center bg-pink-50 text-sm text-pink-500">{t.cameraOpening}</div>}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-pink-50 p-6 text-center">
              <p className="text-sm text-gray-600">{cameraError}</p>
              <button type="button" onClick={startCamera} className="rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white">{t.retryCamera}</button>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={`${t.shotLabel} ${i + 1}`} className="h-20 w-auto shrink-0 rounded-xl object-cover ring-2 ring-pink-200" />
        ))}
        {Array.from({ length: remaining }).map((_, i) => (
          <div key={`empty-${i}`} className="flex h-20 w-[106px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 text-xs text-pink-300">{t.shotLabel} {photos.length + i + 1}</div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {!isShooting && photos.length < template.shots && (
          <button type="button" onClick={startSession} disabled={!cameraReady} className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-4 text-base font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600 disabled:opacity-40">
            <Icon icon="lucide:camera" width={20} height={20} aria-hidden="true" />
            {photos.length === 0 ? t.startShoot : `${t.shootMore} ${remaining} ${t.shots}`}
          </button>
        )}
        {isShooting && <p className="rounded-full bg-pink-100 py-3 text-center text-sm font-medium text-pink-700">{t.shootingAuto}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onBack} disabled={isShooting} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600 disabled:opacity-40">{t.changeTemplate}</button>
          <button type="button" onClick={retakeLast} disabled={isShooting || photos.length === 0} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600 disabled:opacity-40">{t.retakeLast}</button>
        </div>
        <label className="cursor-pointer rounded-full bg-white py-3 text-center text-sm font-medium text-gray-500 ring-1 ring-pink-100">
          {t.noCameraUpload}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
    </div>
  );
}
