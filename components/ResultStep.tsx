"use client";

import { useEffect, useRef, useState } from "react";
import {
  CAPTION_FONTS,
  FILTERS,
  FRAME_COLORS,
  composeStrip,
  frameById,
  getTextAnchor,
  getTextWrapWidth,
  isDarkHexPublic,
  type CaptionFont,
  type EmojiSticker,
  type FrameColor,
  type PhotoFilter,
  type PhotoboothTemplate,
} from "@/lib/photobooth";
import type { Dict, Language } from "@/lib/i18n";

interface Props {
  t: Dict;
  lang: Language;
  photos: string[];
  template: PhotoboothTemplate;
  onRetake: () => void;
  onRestart: () => void;
}

interface StickerItem extends EmojiSticker {
  id: string;
}

const PRESET_EMOJIS = [
  "❤️",
  "😍",
  "🎉",
  "✨",
  "🌸",
  "🐶",
  "🐱",
  "⭐",
  "🔥",
  "🎀",
  "🍓",
  "🥳",
];

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rn)}${toHex(gn)}${toHex(bn)}`;
}

export default function ResultStep({
  t,
  lang,
  photos,
  template,
  onRetake,
  onRestart,
}: Props) {
  const [filter, setFilter] = useState<PhotoFilter>(FILTERS[0]);
  const [frameColor, setFrameColor] = useState<FrameColor>(() =>
    frameById(template.defaultFrameId),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewComposing, setPreviewComposing] = useState(true);
  const [exportComposing, setExportComposing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [customText, setCustomText] = useState(() =>
    template.caption ? "" : "photobooth",
  );
  const [customFont, setCustomFont] = useState<CaptionFont | null>(() =>
    template.caption ? CAPTION_FONTS[0] : null,
  );
  const [customSize, setCustomSize] = useState(() =>
    template.caption ? 44 : 26,
  );
  const [includeDate, setIncludeDate] = useState(true);
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [stickerInput, setStickerInput] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const stickerGestureRef = useRef<{
    id: string;
    pointers: Map<number, { x: number; y: number }>;
    startX: number;
    startY: number;
    startSize: number;
    startDistance: number;
    startMidX: number;
    startMidY: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPreviewComposing(true);
    composeStrip({
      photos,
      template,
      filter,
      frameColor,
      captionText: "",
      includeDate: false,
    })
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewComposing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [photos, template, filter, frameColor]);

  const buildExportUrl = () =>
    composeStrip({
      photos,
      template,
      filter,
      frameColor,
      dateLocale: lang === "th" ? "th-TH" : "en-US",
      captionText: customText,
      captionFontFamily: customFont?.family ?? null,
      captionSize: customSize,
      includeDate,
      textOffsetX: textOffset.x,
      textOffsetY: textOffset.y,
      stickers: stickers.map(({ emoji, x, y, size }) => ({
        emoji,
        x,
        y,
        size,
      })),
    });

  const trimmedText = customText.trim();
  const overlayDate = new Date().toLocaleDateString(
    lang === "th" ? "th-TH" : "en-US",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
  const overlayText = template.panel
    ? trimmedText
      ? includeDate
        ? `♡  ${trimmedText}  ♡\n${overlayDate}`
        : `♡  ${trimmedText}  ♡`
      : includeDate
        ? overlayDate
        : ""
    : template.caption
      ? trimmedText
      : trimmedText && includeDate
        ? `${trimmedText}  •  ${overlayDate}`
        : trimmedText || (includeDate ? overlayDate : "");
  const showOverlay = overlayText !== "";
  const anchor = getTextAnchor(template);
  const effectiveTextSize = template.panel
    ? customFont
      ? customSize
      : 44
    : customSize;
  const displayFontSize =
    previewSize.height > 0
      ? Math.max(
          10,
          (effectiveTextSize * previewSize.height) / template.stripHeight,
        )
      : effectiveTextSize;
  const textColor = isDarkHexPublic(frameColor.hex)
    ? "#ffffff"
    : "#be185d";
  const clampOffset = (x: number, y: number) => ({
    x: Math.max(-200, Math.min(200, Math.round(x))),
    y: Math.max(-200, Math.min(200, Math.round(y))),
  });
  const handleDragStart = (e: React.PointerEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: textOffset.x,
      offsetY: textOffset.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleDragMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const img = imgRef.current;
    if (!drag || !img) return;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dx = ((e.clientX - drag.startX) / rect.width) * template.stripWidth;
    const dy =
      ((e.clientY - drag.startY) / rect.height) * template.stripHeight;
    setTextOffset(clampOffset(drag.offsetX + dx, drag.offsetY + dy));
  };
  const handleDragEnd = () => {
    dragRef.current = null;
  };
  const firstGrapheme = (value: string): string => {
    try {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme",
      });
      return [...segmenter.segment(value)][0]?.segment ?? "";
    } catch {
      return Array.from(value)[0] ?? "";
    }
  };
  const addSticker = (emoji: string) => {
    if (!emoji) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setStickers((prev) => [
      ...prev,
      { id, emoji, x: 0.5, y: 0.5, size: 90 },
    ]);
    setSelectedStickerId(id);
  };
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const handleStickerPointerDown = (e: React.PointerEvent, id: string) => {
    setSelectedStickerId(id);
    const img = imgRef.current;
    const current = stickers.find((s) => s.id === id);
    if (!img || !current) return;
    const gesture = stickerGestureRef.current;
    if (gesture && gesture.id === id) {
      gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (gesture.pointers.size === 2) {
        const pts = [...gesture.pointers.values()];
        gesture.startX = current.x;
        gesture.startY = current.y;
        gesture.startSize = current.size;
        gesture.startDistance = Math.hypot(
          pts[0].x - pts[1].x,
          pts[0].y - pts[1].y,
        );
        gesture.startMidX = (pts[0].x + pts[1].x) / 2;
        gesture.startMidY = (pts[0].y + pts[1].y) / 2;
      }
    } else {
      stickerGestureRef.current = {
        id,
        pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]),
        startX: current.x,
        startY: current.y,
        startSize: current.size,
        startDistance: 0,
        startMidX: e.clientX,
        startMidY: e.clientY,
      };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleStickerPointerMove = (e: React.PointerEvent, id: string) => {
    const gesture = stickerGestureRef.current;
    const img = imgRef.current;
    if (!gesture || gesture.id !== id || !img) return;
    if (!gesture.pointers.has(e.pointerId)) return;
    gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pts = [...gesture.pointers.values()];
    if (pts.length === 1) {
      const dx = (pts[0].x - gesture.startMidX) / rect.width;
      const dy = (pts[0].y - gesture.startMidY) / rect.height;
      setStickers((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                x: clamp01(gesture.startX + dx),
                y: clamp01(gesture.startY + dy),
              }
            : s,
        ),
      );
    } else if (pts.length >= 2) {
      const [p1, p2] = pts;
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      if (gesture.startDistance > 0) {
        const size = Math.max(
          30,
          Math.min(300, Math.round(gesture.startSize * (dist / gesture.startDistance))),
        );
        const dx = (midX - gesture.startMidX) / rect.width;
        const dy = (midY - gesture.startMidY) / rect.height;
        setStickers((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  x: clamp01(gesture.startX + dx),
                  y: clamp01(gesture.startY + dy),
                  size,
                }
              : s,
          ),
        );
      }
    }
  };
  const handleStickerPointerUp = (e: React.PointerEvent, id: string) => {
    const gesture = stickerGestureRef.current;
    if (!gesture || gesture.id !== id) return;
    gesture.pointers.delete(e.pointerId);
    if (gesture.pointers.size === 0) {
      stickerGestureRef.current = null;
    } else if (gesture.pointers.size === 1) {
      const current = stickers.find((s) => s.id === id);
      const pt = [...gesture.pointers.values()][0];
      if (current && pt) {
        gesture.startX = current.x;
        gesture.startY = current.y;
        gesture.startSize = current.size;
        gesture.startMidX = pt.x;
        gesture.startMidY = pt.y;
        gesture.startDistance = 0;
      }
    }
  };
  const selectedSticker =
    stickers.find((s) => s.id === selectedStickerId) ?? null;
  useEffect(() => {
    const update = () => {
      const img = imgRef.current;
      if (img) {
        const rect = img.getBoundingClientRect();
        setPreviewSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [previewUrl]);

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  const download = async () => {
    if (exportComposing) return;
    setShareMessage(null);
    setExportComposing(true);
    try {
      const exportUrl = await buildExportUrl();
      const res = await fetch(exportUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (isIOS) {
        window.open(url, "_blank");
        setShareMessage(t.saveToPhotosHint);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return;
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = `photobooth-${template.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      try {
        window.open(await buildExportUrl(), "_blank");
      } catch {
        /* เปิดไม่ได้จริง ๆ — ปล่อยให้ผู้ใช้ลองใหม่ */
      }
      if (isIOS) setShareMessage(t.saveToPhotosHint);
    } finally {
      setExportComposing(false);
    }
  };

  const share = async () => {
    if (exportComposing) return;
    setShareMessage(null);
    setExportComposing(true);
    try {
      const res = await fetch(await buildExportUrl());
      const blob = await res.blob();
      const file = new File([blob], "photobooth.png", { type: "image/png" });
      if (
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: "Photobooth",
          text: t.shareText,
          files: [file],
        });
        return;
      }
      setExportComposing(false);
      download();
      setShareMessage(t.shareFallback);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setExportComposing(false);
      download();
    } finally {
      setExportComposing(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800">{t.resultTitle}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.resultDesc}</p>

      <div className="mt-4 flex justify-center rounded-3xl bg-pink-50/60 p-4">
        {previewComposing && !previewUrl && (
          <p className="py-16 text-sm text-pink-500">{t.composing}</p>
        )}
        {previewUrl && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Finished photobooth strip"
              onLoad={() => {
                const img = imgRef.current;
                if (img) {
                  const rect = img.getBoundingClientRect();
                  setPreviewSize({ width: rect.width, height: rect.height });
                }
              }}
              className="fade-in max-h-[560px] w-auto max-w-full rounded-lg shadow-xl shadow-pink-200/60 ring-1 ring-pink-100"
            />
            {showOverlay && (
              <div
                role="button"
                aria-label={t.textPositionTitle}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className="absolute z-10 cursor-grab whitespace-pre-line rounded-lg border border-dashed border-pink-400/70 px-2 py-1 text-center active:cursor-grabbing"
                style={{
                  left: `${((anchor.x + textOffset.x) / template.stripWidth) * 100}%`,
                  top: `${((anchor.y + textOffset.y) / template.stripHeight) * 100}%`,
                  width: `${(getTextWrapWidth(template) / template.stripWidth) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  fontFamily: customFont
                    ? `"${customFont.family}", "Mali", sans-serif`
                    : undefined,
                  fontWeight:
                    template.panel && !customFont
                      ? 700
                      : !template.caption && !customFont
                        ? 600
                        : undefined,
                  fontSize: displayFontSize,
                  color: textColor,
                  touchAction: "none",
                  userSelect: "none",
                  textShadow: "0 1px 4px rgba(255,255,255,0.9)",
                  overflowWrap: "break-word",
                }}
              >
                {overlayText}
              </div>
            )}
            {stickers.map((sticker) => {
              const selected = sticker.id === selectedStickerId;
              const displaySize =
                previewSize.height > 0
                  ? Math.max(
                      12,
                      (sticker.size * previewSize.height) /
                        template.stripHeight,
                    )
                  : sticker.size;
              return (
                <div
                  key={sticker.id}
                  role="button"
                  aria-label={sticker.emoji}
                  onPointerDown={(e) => handleStickerPointerDown(e, sticker.id)}
                  onPointerMove={(e) => handleStickerPointerMove(e, sticker.id)}
                  onPointerUp={(e) => handleStickerPointerUp(e, sticker.id)}
                  onPointerCancel={(e) =>
                    handleStickerPointerUp(e, sticker.id)
                  }
                  className={`absolute z-20 cursor-grab rounded-full text-center leading-none active:cursor-grabbing ${
                    selected ? "ring-2 ring-pink-400 ring-offset-1" : ""
                  }`}
                  style={{
                    left: `${sticker.x * 100}%`,
                    top: `${sticker.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: displaySize,
                    touchAction: "none",
                    userSelect: "none",
                  }}
                >
                  {sticker.emoji}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showOverlay && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {t.dragTextHint}
        </p>
      )}

      <h3 className="mt-6 font-semibold text-gray-800">{t.filterTitle}</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {FILTERS.map((item) => {
          const active = item.id === filter.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-2xl p-1.5 text-center transition ${
                active
                  ? "bg-pink-500 shadow-md shadow-pink-200"
                  : "bg-white ring-1 ring-pink-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[0]}
                alt=""
                style={{ filter: item.css === "none" ? undefined : item.css }}
                className="h-16 w-20 rounded-xl object-cover"
              />
              <span
                className={`mt-1.5 block px-1 pb-1 text-xs font-medium ${
                  active ? "text-white" : "text-gray-600"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-4 font-semibold text-gray-800">{t.frameTitle}</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        {FRAME_COLORS.map((color) => {
          const active = color.id === frameColor.id;
          const name = t.frameColorName[color.id] ?? color.name;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => setFrameColor(color)}
              title={name}
              aria-label={name}
              className={`h-11 w-11 rounded-full transition ${
                active
                  ? "ring-4 ring-pink-400 ring-offset-2"
                  : "ring-1 ring-pink-200 hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
            />
          );
        })}
        <span className="self-center text-sm text-gray-500">
          {t.frameColorName[frameColor.id] ?? frameColor.name}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label
          className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-pink-200"
          style={{ backgroundColor: frameColor.hex }}
          title={t.customColorTitle}
        >
          <span className="absolute inset-0 flex items-center justify-center text-lg text-white drop-shadow">
            +
          </span>
          <input
            type="color"
            value={frameColor.hex}
            onChange={(e) =>
              setFrameColor({
                id: "custom",
                name: t.frameColorName.custom ?? "Custom",
                hex: e.target.value,
              })
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={t.customColorTitle}
          />
        </label>
        <span className="shrink-0 text-sm text-gray-500">
          {t.customColorTitle} {frameColor.hex.toUpperCase()}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="shrink-0 text-sm font-semibold text-gray-700">
          {t.hueTitle}
        </span>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hexToHsl(frameColor.hex)[0])}
          onChange={(e) => {
            const [, s0, l0] = hexToHsl(frameColor.hex);
            const s = s0 < 0.3 ? 0.75 : s0;
            const l = l0 > 0.9 ? 0.85 : l0 < 0.1 ? 0.2 : l0;
            setFrameColor({
              id: "custom",
              name: t.frameColorName.custom ?? "Custom",
              hex: hslToHex(Number(e.target.value), s, l),
            });
          }}
          className="flex-1 accent-pink-500"
          aria-label={t.hueTitle}
          style={{
            background:
              "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            height: 8,
            borderRadius: 999,
          }}
        />
      </div>

      <h3 className="mt-6 font-semibold text-gray-800">
        {template.caption ? t.captionTitle : t.footerTextTitle}
      </h3>
      <input
        type="text"
        value={customText}
        maxLength={80}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder={
          template.caption ? t.captionPlaceholder : t.footerTextPlaceholder
        }
        className="mt-3 w-full rounded-2xl border-2 border-pink-200 bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-pink-400"
        style={
          customFont
            ? { fontFamily: `"${customFont.family}", "Mali", sans-serif` }
            : undefined
        }
      />
      {!template.caption && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={includeDate}
            onChange={(e) => setIncludeDate(e.target.checked)}
            className="h-4 w-4 accent-pink-500"
          />
          {t.includeDate}
        </label>
      )}

      <h4 className="mt-4 text-sm font-semibold text-gray-700">
        {t.captionFontTitle}
      </h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {(!template.caption
          ? [
              { id: "default", name: t.fontDefault, family: "" },
              ...CAPTION_FONTS,
            ]
          : CAPTION_FONTS
        ).map((font) => {
          const active = template.caption
            ? customFont?.id === font.id
            : font.id === "default"
              ? customFont === null
              : customFont?.id === font.id;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() =>
                setCustomFont(
                  font.id === "default"
                    ? null
                    : CAPTION_FONTS.find((f) => f.id === font.id) ?? null,
                )
              }
              className={`rounded-full px-4 py-2 text-base transition ${
                active
                  ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                  : "bg-white text-gray-700 ring-1 ring-pink-200 hover:bg-pink-50"
              }`}
              style={
                font.family
                  ? { fontFamily: `"${font.family}", "Mali", sans-serif` }
                  : undefined
              }
            >
              {font.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-sm font-semibold text-gray-700">
          {t.captionSizeTitle}
        </span>
        <input
          type="range"
          min={template.caption ? 28 : 18}
          max={template.caption ? 72 : 40}
          step={2}
          value={customSize}
          onChange={(e) => setCustomSize(Number(e.target.value))}
          className="flex-1 accent-pink-500"
          aria-label={t.captionSizeTitle}
        />
        <span className="w-14 shrink-0 text-right text-sm text-gray-500">
          {customSize}px
        </span>
      </div>

      {showOverlay && (
        <>
          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              {t.textPositionTitle}
            </h4>
            <button
              type="button"
              onClick={() => setTextOffset({ x: 0, y: 0 })}
              disabled={textOffset.x === 0 && textOffset.y === 0}
              className="text-sm font-semibold text-pink-500 disabled:opacity-40"
            >
              {t.resetPosition}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="w-6 shrink-0 text-sm font-semibold text-gray-700">
              X
            </span>
            <input
              type="range"
              min={-200}
              max={200}
              step={5}
              value={textOffset.x}
              onChange={(e) =>
                setTextOffset((prev) => ({
                  ...prev,
                  x: Number(e.target.value),
                }))
              }
              className="flex-1 accent-pink-500"
              aria-label="Text position X"
            />
            <span className="w-16 shrink-0 text-right text-sm text-gray-500">
              {textOffset.x}px
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="w-6 shrink-0 text-sm font-semibold text-gray-700">
              Y
            </span>
            <input
              type="range"
              min={-200}
              max={200}
              step={5}
              value={textOffset.y}
              onChange={(e) =>
                setTextOffset((prev) => ({
                  ...prev,
                  y: Number(e.target.value),
                }))
              }
              className="flex-1 accent-pink-500"
              aria-label="Text position Y"
            />
            <span className="w-16 shrink-0 text-right text-sm text-gray-500">
              {textOffset.y}px
            </span>
          </div>
        </>
      )}

      <h3 className="mt-6 font-semibold text-gray-800">{t.stickerTitle}</h3>
      <p className="mt-1 text-sm text-gray-500">{t.stickerHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addSticker(emoji)}
            className="rounded-2xl bg-white px-3 py-2 text-2xl ring-1 ring-pink-100 transition hover:bg-pink-50 hover:ring-pink-300"
            aria-label={`Add ${emoji} sticker`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={stickerInput}
          onChange={(e) => setStickerInput(e.target.value)}
          placeholder={t.stickerPlaceholder}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-2xl border-2 border-pink-200 bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-pink-400"
        />
        <button
          type="button"
          onClick={() => {
            const emoji = firstGrapheme(stickerInput.trim());
            if (emoji) {
              addSticker(emoji);
              setStickerInput("");
            }
          }}
          disabled={!stickerInput.trim()}
          className="shrink-0 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-pink-600 disabled:opacity-40"
        >
          {t.addSticker}
        </button>
      </div>
      {selectedSticker && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="shrink-0 text-2xl leading-none">
              {selectedSticker.emoji}
            </span>
            <span className="shrink-0 text-sm font-semibold text-gray-700">
              {t.stickerSizeTitle}
            </span>
            <input
              type="range"
              min={30}
              max={300}
              step={5}
              value={selectedSticker.size}
              onChange={(e) =>
                setStickers((prev) =>
                  prev.map((s) =>
                    s.id === selectedSticker.id
                      ? { ...s, size: Number(e.target.value) }
                      : s,
                  ),
                )
              }
              className="flex-1 accent-pink-500"
              aria-label={t.stickerSizeTitle}
            />
            <span className="w-14 shrink-0 text-right text-sm text-gray-500">
              {selectedSticker.size}px
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStickers((prev) =>
                prev.filter((s) => s.id !== selectedSticker.id),
              );
              setSelectedStickerId(null);
            }}
            className="mt-2 self-start text-sm font-semibold text-red-500"
          >
            {t.removeSticker}
          </button>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={download}
          disabled={exportComposing}
          className="w-full rounded-full bg-pink-500 py-4 text-base font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600 disabled:opacity-40"
        >
          {t.download}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={exportComposing}
          className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-pink-600 ring-2 ring-pink-200 disabled:opacity-40"
        >
          {t.share}
        </button>
        {shareMessage && (
          <p className="text-center text-sm text-gray-500">{shareMessage}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600"
          >
            {t.retakeAll}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-full border-2 border-pink-200 bg-white py-3 text-sm font-semibold text-pink-600"
          >
            {t.restart}
          </button>
        </div>
      </div>
    </div>
  );
}
