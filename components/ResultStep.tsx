"use client";

import { useEffect, useState } from "react";
import { FILTERS, FRAME_COLORS, composeStrip, frameById, type FrameColor, type PhotoFilter, type PhotoboothTemplate } from "@/lib/photobooth";
import type { Dict, Language } from "@/lib/i18n";

interface Props {
  t: Dict;
  lang: Language;
  photos: string[];
  template: PhotoboothTemplate;
  onRetake: () => void;
  onRestart: () => void;
}

export default function ResultStep({ t, lang, photos, template, onRetake, onRestart }: Props) {
  const [filter, setFilter] = useState<PhotoFilter>(FILTERS[0]);
  const [frameColor, setFrameColor] = useState<FrameColor>(() => frameById(template.defaultFrameId));
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(true);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsComposing(true);
    composeStrip({ photos, template, filter, frameColor, dateLocale: lang === "th" ? "th-TH" : "en-US" })
      .then((url) => { if (!cancelled) setResultUrl(url); })
      .catch(() => { if (!cancelled) setResultUrl(null); })
      .finally(() => { if (!cancelled) setIsComposing(false); });
    return () => { cancelled = true; };
  }, [photos, template, filter, frameColor, lang]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `photobooth-${template.id}.png`;
    a.click();
  };

  const share = async () => {
    if (!resultUrl) return;
    setShareMessage(null);
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const file = new File([blob], "photobooth.png", { type: "image/png" });
      if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: "Photobooth", text: t.shareText, files: [file] });
        return;
      }
      download();
      setShareMessage(t.shareFallback);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      download();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800">{t.resultTitle}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.resultDesc}</p>
      <div className="mt-4 flex justify-center rounded-3xl bg-pink-50/60 p-4">
        {isComposing && !resultUrl && <p className="py-16 text-sm text-pink-500">{t.composing}</p>}
        {resultUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultUrl} alt="Finished photobooth strip" className="fade-in max-h-[560px] w-auto max-w-full rounded-lg shadow-xl shadow-pink-200/60 ring-1 ring-pink-100" />
        )}
      </div>
      <h3 className="mt-6 font-semibold text-gray-800">{t.filterTitle}</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {FILTERS.map((item) => {
          const active = item.id === filter.id;
          return (
            <button key={item.id} type="button" onClick={() => setFilter(item)} className={`shrink-0 rounded-2xl p-1.5 text-center transition ${active ? "bg-pink-500 shadow-md shadow-pink-200" : "bg-white ring-1 ring-pink-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0]} alt="" style={{ filter: item.css === "none" ? undefined : item.css }} className="h-16 w-20 rounded-xl object-cover" />
              <span className={`mt-1.5 block px-1 pb-1 text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}>{item.name}</span>
            </button>
          );
        })}
      </div>
      <h3 className="mt-4 font-semibold text-gray-800">{t.frameTitle}</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        {FRAME_COLORS.map((color) => {
          const active = color.id === frameColor.id;
          const name = t.frameColorName[color.id] ?? color.name;
          return <button key={color.id} type="button" onClick={() => setFrameColor(color)} title={name} aria-label={name} className={`h-11 w-11 rounded-full transition ${active ? "ring-4 ring-pink-400 ring-offset-2" : "ring-1 ring-pink-200 hover:scale-105"}`} style={{ backgroundColor: color.hex }} />;
        })}
        <span className="self-center text-sm text-gray-500">{t.frameColorName[frameColor.id] ?? frameColor.name}</span>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <button type="button" onClick={download} disabled={!resultUrl || isComposing} className="w-full rounded-full bg-pink-500 py-4 text-base font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600 disabled:opacity-40">{t.download}</button>
        <button type="button" onClick={share} disabled={!resultUrl || isComposing} className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-pink-600 ring-2 ring-pink-200 disabled:opacity-40">{t.share}</button>
        {shareMessage && <p className="text-center text-sm text-gray-500">{shareMessage}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onRetake} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600">{t.retakeAll}</button>
          <button type="button" onClick={onRestart} className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600">{t.restart}</button>
        </div>
      </div>
    </div>
  );
}
