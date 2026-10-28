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

// สีข้อความที่เลือกได้ — auto = ตามสีกรอบแบบเดิม
const TEXT_COLORS = [
  "#ffffff",
  "#111827",
  "#be185d",
  "#e11d48",
  "#f97316",
  "#c9a227",
  "#15803d",
  "#0284c7",
  "#420098",
];

// อีโมจิยอดนิยมแตะแล้ววางได้ทันที (นอกนั้นพิมพ์จากคีย์บอร์ดเครื่องได้)
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

/** แปลง #rrggbb -> [h(0-360), s(0-1), l(0-1)] สำหรับสไลด์ปรับ hue */
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
  else[rn, gn, bn] = [c, 0, x];
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
  // สีกรอบเริ่มต้นตามเทมเพลตที่เลือก (เช่น Dark = ดำ, Christmas = แดง)
  const [frameColor, setFrameColor] = useState<FrameColor>(() =>
    frameById(template.defaultFrameId),
  );
  // พรีวิว = รูปฐานที่ "ยังไม่มีข้อความ" แล้ววาดข้อความทับด้วย overlay
  // ชั้นเดียวเท่านั้น — เดิมพรีวิวใช้รูปที่วาดข้อความแล้ว แล้ว overlay
  // ข้อความซ้ำอีกชั้นที่จุดเดียวกัน ขนาดฟอนต์สเกลไม่เท่ากันพอดี
  // จึงเห็นเป็นข้อความซ้อนกันแปลก ๆ
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewComposing, setPreviewComposing] = useState(true);
  const [exportComposing, setExportComposing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  // ข้อความบนรูป — ทุกเทมเพลตเปลี่ยนได้:
  // โพลารอยด์เริ่มว่าง (เว้นช่องว่างไว้), เทมเพลตอื่นเริ่มที่ "photobooth" แบบเดิม
  const [customText, setCustomText] = useState(() =>
    template.caption ? "" : "photobooth",
  );
  // ฟอนต์: โพลารอยด์เริ่มที่ Caveat, เทมเพลตอื่นเริ่มที่ฟอนต์เริ่มต้น (null)
  // เพื่อไม่ให้หน้าตาเดิมเปลี่ยนจนกว่าผู้ใช้จะเลือกฟอนต์เอง
  const [customFont, setCustomFont] = useState<CaptionFont | null>(() =>
    template.caption ? CAPTION_FONTS[0] : null,
  );
  const [customSize, setCustomSize] = useState(() =>
    template.caption ? 44 : 26,
  );
  // เทมเพลตอื่นใส่ วันที่ ไว้โดยค่าเริ่มต้น เอาออกได้จากเช็กบ็อกซ์
  const [includeDate, setIncludeDate] = useState(true);
  // ตำแหน่งข้อความที่ผู้ใช้ลากปรับเอง (px ในพิกัดภาพสุดท้าย)
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });
  // สีข้อความที่ผู้ใช้เลือก — auto = ตามสีกรอบแบบเดิม
  const [textColorChoice, setTextColorChoice] = useState<string>("auto");
  // เทมเพลตเฟรมสำเร็จรูป / ออกแบบเอง: ดีไซน์ตายตัว ไม่มีสีกรอบให้ปรับ
  // แต่ข้อความปรับได้เหมือนเทมเพลตทั่วไป (วาดทับดีไซน์ตอน export)
  const isFrameTemplate = Boolean(
    template.frameOverlay || template.bg || template.bgGradient,
  );
  // Pills tabs ในขั้นตอนที่ 3 — ปรับทีละส่วน หน้าไม่ยาว
  type ResultTab = "filter" | "text" | "stickers";
  const [activeTab, setActiveTab] = useState<ResultTab>("filter");
  const visibleTabs: { id: ResultTab; label: string }[] = [
    { id: "filter", label: t.tabFilterFrame },
    { id: "text", label: t.tabTextFonts },
    { id: "stickers", label: t.tabStickers },
  ];
  const currentTab = visibleTabs.some((tb) => tb.id === activeTab)
    ? activeTab
    : visibleTabs[0].id;
  // สติกเกอร์อีโมจิที่วางบนรูป (x/y เป็นสัดส่วน 0-1 ของภาพ)
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [stickerInput, setStickerInput] = useState("");
  // สถานะท่าทางของสติกเกอร์ที่กำลังลาก/บีบอยู่ (1 นิ้ว = ย้าย,
  // 2 นิ้ว = บีบปรับขนาด + หมุน; นิ้วที่สองแตะตรงไหนของพรีวิวก็ได้
  // ไม่ต้องอยู่ในกรอบสติกเกอร์ — handler ผูกไว้ที่กล่องพรีวิวทั้งกล่อง)
  const stickerGestureRef = useRef<{
    id: string;
    pointers: Map<number, { x: number; y: number }>;
    startX: number;
    startY: number;
    startSize: number;
    startRotation: number;
    startDistance: number;
    startAngle: number;
    startMidX: number;
    startMidY: number;
  } | null>(null);
  // ขนาดพรีวิวที่แสดงจริง (สำหรับแปลง px ตอนลาก กับขนาดฟอนต์บนพรีวิว)
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // พรีวิวฐานไม่มีข้อความ — ไม่ขึ้นกับข้อความ/ตำแหน่งเลย
  // ลากข้อความจึงไม่ต้องวาดรูปใหม่ทั้งภาพ แค่ขยับ overlay
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

  // รูปสำหรับดาวน์โหลด/แชร์วาดสดตอนกด — ได้ตำแหน่งล่าสุดเสมอ
  // ไม่ต้องรอรูปพื้นหลังที่วาดตอนลากเสร็จ
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
      textColor: textColorChoice === "auto" ? null : textColorChoice,
      stickers: stickers.map(({ emoji, image, x, y, size, rotation }) => ({
        emoji,
        image,
        x,
        y,
        size,
        rotation,
      })),
    });

  // ข้อความที่จะวาดบนพรีวิวแบบลากได้ (ตรงกับที่ export)
  const trimmedText = customText.trim();
  const overlayDate = new Date().toLocaleDateString(
    lang === "th" ? "th-TH" : "en-US",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
  // panel: ข้อความบรรทัดบน วันที่บรรทัดล่าง เหมือนตอน export
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
  // สีข้อความอัตโนมัติอิงพื้นหลังจริง (เทมเพลตออกแบบเองใช้ bg ของตัวเอง)
  const bgHex = template.bg ?? template.bgGradient?.[0] ?? frameColor.hex;
  const textColor =
    textColorChoice === "auto"
      ? isDarkHexPublic(bgHex)
        ? "#ffffff"
        : "#be185d"
      : textColorChoice;

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

  const addSticker = (emoji: string, image?: string) => {
    if (!emoji && !image) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setStickers((prev) => [
      ...prev,
      { id, emoji, image, x: 0.5, y: 0.5, size: 90, rotation: 0 },
    ]);
    setSelectedStickerId(id);
  };

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  // นิ้วที่สองเข้ามาร่วมบีบ: ตั้งจุดเริ่มต้นใหม่จากค่าปัจจุบันของสติกเกอร์
  // แล้วเริ่มวัดระยะห่างกับมุมจากตำแหน่งสองนิ้วตรงนั้น
  const reanchorPinch = (gesture: NonNullable<typeof stickerGestureRef.current>) => {
    const current = stickers.find((s) => s.id === gesture.id);
    const pts = [...gesture.pointers.values()];
    if (!current || pts.length < 2) return;
    gesture.startX = current.x;
    gesture.startY = current.y;
    gesture.startSize = current.size;
    gesture.startRotation = current.rotation ?? 0;
    gesture.startDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    gesture.startAngle =
      (Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180) / Math.PI;
    gesture.startMidX = (pts[0].x + pts[1].x) / 2;
    gesture.startMidY = (pts[0].y + pts[1].y) / 2;
  };

  // handler ผูกที่กล่องพรีวิวทั้งกล่อง (ไม่ใช่ที่ตัวสติกเกอร์) — นิ้วที่สอง
  // จึงแตะตรงไหนของรูปก็ได้ ไม่ต้องอยู่ในกรอบสติกเกอร์
  const handleStickerPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const stickerEl = target.closest?.("[data-sticker-id]");
    const id = stickerEl?.getAttribute("data-sticker-id") ?? null;
    const img = imgRef.current;
    if (!img) return;
    const gesture = stickerGestureRef.current;
    if (id) {
      setSelectedStickerId(id);
      const current = stickers.find((s) => s.id === id);
      if (!current) return;
      if (gesture && gesture.id === id) {
        gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (gesture.pointers.size === 2) reanchorPinch(gesture);
      } else {
        stickerGestureRef.current = {
          id,
          pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]),
          startX: current.x,
          startY: current.y,
          startSize: current.size,
          startRotation: current.rotation ?? 0,
          startDistance: 0,
          startAngle: 0,
          startMidX: e.clientX,
          startMidY: e.clientY,
        };
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (
      gesture &&
      gesture.pointers.size === 1 &&
      !target.closest?.("[data-text-overlay]")
    ) {
      // กำลังลากสติกเกอร์อยู่ 1 นิ้ว แล้วนิ้วที่สองแตะที่อื่นของรูป:
      // เข้าร่วมเป็นการบีบ/หมุนทันที (แบบสตอรี่ไอจี) — จาก 1 นิ้วเป็น 2 นิ้วแน่ ๆ
      gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      reanchorPinch(gesture);
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (!gesture) {
      // แตะที่รูป (ไม่ใช่สติกเกอร์) = ยกเลิกการเลือกสติกเกอร์ กรอบหาย
      setSelectedStickerId(null);
    }
  };

  const handleStickerPointerMove = (e: React.PointerEvent) => {
    const gesture = stickerGestureRef.current;
    const img = imgRef.current;
    if (!gesture || !img) return;
    if (!gesture.pointers.has(e.pointerId)) return;
    const id = gesture.id;
    gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pts = [...gesture.pointers.values()];
    if (pts.length === 1) {
      // 1 นิ้ว: ลากย้ายตำแหน่ง
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
      // 2 นิ้ว: บีบปรับขนาดตามสัดส่วนระยะห่างนิ้ว + หมุนตามมุมระหว่างนิ้ว
      // + ขยับตามจุดกลางนิ้ว
      const [p1, p2] = pts;
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const angle =
        (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      if (gesture.startDistance > 0) {
        const size = Math.max(
          12,
          Math.min(300, Math.round(gesture.startSize * (dist / gesture.startDistance))),
        );
        // องศาเก็บไว้ช่วง -180..180 จะได้ตรงกับสไลด์หมุน
        const rotation =
          ((gesture.startRotation + (angle - gesture.startAngle) + 180) % 360 + 360) % 360 - 180;
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
                  rotation,
                }
              : s,
          ),
        );
      }
    }
  };

  const handleStickerPointerUp = (e: React.PointerEvent) => {
    const gesture = stickerGestureRef.current;
    if (!gesture) return;
    const id = gesture.id;
    gesture.pointers.delete(e.pointerId);
    if (gesture.pointers.size === 0) {
      stickerGestureRef.current = null;
    } else if (gesture.pointers.size === 1) {
      // เหลือนิ้วเดียว: ตั้งจุดเริ่มต้นใหม่ จะได้ลากต่อได้ไม่กระตุก
      const current = stickers.find((s) => s.id === id);
      const pt = [...gesture.pointers.values()][0];
      if (current && pt) {
        gesture.startX = current.x;
        gesture.startY = current.y;
        gesture.startSize = current.size;
        gesture.startRotation = current.rotation ?? 0;
        gesture.startMidX = pt.x;
        gesture.startMidY = pt.y;
        gesture.startDistance = 0;
      }
    }
  };

  const selectedSticker =
    stickers.find((s) => s.id === selectedStickerId) ?? null;

  // อัปเดตขนาดพรีวิวเมื่อรูปเปลี่ยน / หน้าจอเปลี่ยนขนาด
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
    // iOS: เปิดแท็บว่าง "ตอนกด" ทันที (ยังอยู่ใน user gesture) ไว้เป็น
    // ทางสำรอง — ถ้าเปิดแท็บหลัง await วาดรูปเสร็จ Safari จะบล็อกเป็น popup
    let pendingTab: Window | null = null;
    if (isIOS) {
      try {
        pendingTab = window.open("", "_blank");
      } catch {
        pendingTab = null;
      }
    }
    setExportComposing(true);
    try {
      const exportUrl = await buildExportUrl();
      // ใช้ Blob URL แทน data URL ตรง ๆ และต้องแปะ <a> ไว้ใน DOM
      // ก่อน click — เดิมสร้าง <a> ลอย ๆ แล้ว click เลย ซึ่ง Safari
      // บน iPhone/iPad ไม่ยอมทำงาน
      const res = await fetch(exportUrl);
      const blob = await res.blob();
      if (isIOS) {
        // iOS ไม่มี "ดาวน์โหลดเข้า Files" แบบคอม: Safari จะเปิดรูปแทน
        // การโหลดไฟล์ — วิธีที่ตรงที่สุดคือเปิด Share Sheet ของเครื่อง
        // ผู้ใช้เลือก Save to Files ได้เลย (หรือ Save to Photos)
        const file = new File([blob], `photobooth-${template.id}.png`, {
          type: "image/png",
        });
        if (
          typeof navigator.share === "function" &&
          (!navigator.canShare || navigator.canShare({ files: [file] }))
        ) {
          try {
            await navigator.share({
              title: "Photobooth",
              text: t.shareText,
              files: [file],
            });
            if (pendingTab && !pendingTab.closed) pendingTab.close();
            return;
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
              // ผู้ใช้ปิด Share Sheet เอง — ปิดแท็บว่างทิ้ง ไม่ต้องทำอะไรต่อ
              if (pendingTab && !pendingTab.closed) pendingTab.close();
              return;
            }
            // Share ใช้ไม่ได้ด้วยเหตุอื่น — ตกไปใช้วิธีเปิดแท็บแทน
          }
        }
        const url = URL.createObjectURL(blob);
        if (pendingTab && !pendingTab.closed) {
          pendingTab.location.href = url;
        } else {
          window.open(url, "_blank");
        }
        setShareMessage(t.saveToPhotosHint);
        // ให้เวลาเซฟนานขึ้น (5 นาที) ก่อนลบ Blob URL ทิ้ง
        setTimeout(() => URL.revokeObjectURL(url), 300000);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photobooth-${template.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // ทางสำรองสุดท้าย: เปิดรูปตรง ๆ (วาดสดอีกครั้ง)
      try {
        const fallbackUrl = await buildExportUrl();
        if (isIOS && pendingTab && !pendingTab.closed) {
          pendingTab.location.href = fallbackUrl;
        } else {
          window.open(fallbackUrl, "_blank");
        }
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
      // Device can't share files directly -> download instead
      // (ปลด flag ก่อนเรียก download ไม่งั้น download จะถูก guard กันไว้)
      setExportComposing(false);
      download();
      setShareMessage(t.shareFallback);
    } catch (err) {
      // User cancelled the share sheet themselves — nothing to report
      if (err instanceof Error && err.name === "AbortError") return;
      setExportComposing(false);
      download();
    } finally {
      setExportComposing(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-800">{t.resultTitle}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.resultDesc}</p>

      {/* Final strip preview — ตรึงไว้บนสุด (sticky) ขณะเลื่อนปรับค่าด้านล่าง
          จะได้เห็นผลทันทีโดยไม่ต้องเลื่อนขึ้นลง; รูปฐานไม่มีข้อความ
          ข้อความกับสติกเกอร์เป็น overlay ชั้นเดียวเท่านั้น จึงไม่ซ้อนกัน */}
      <div className="sticky top-0 z-30 -mx-4 mt-4 bg-[#fff9fb] px-4 py-3 shadow-[0_2px_12px_rgba(244,114,182,0.15)]">
        <div className="flex justify-center rounded-3xl bg-pink-50/60 p-3">
          {previewComposing && !previewUrl && (
            <p className="py-16 text-sm text-pink-500">{t.composing}</p>
          )}
          {previewUrl && (
            <div
              className="relative inline-block"
              onPointerDown={handleStickerPointerDown}
              onPointerMove={handleStickerPointerMove}
              onPointerUp={handleStickerPointerUp}
              onPointerCancel={handleStickerPointerUp}
              // pan-y = เลื่อนหน้าขึ้นลงด้วยนิ้วเดียวได้ตามปกติ แต่ห้ามเบราว์เซอร์
              // pinch-zoom เอง — สองนิ้วจะได้ตกมาที่ handler บีบ/หมุนของเราแทน
              style={{ touchAction: "pan-y" }}
            >
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
                className="fade-in max-h-[380px] w-auto max-w-full rounded-lg shadow-xl shadow-violet-200/60 ring-1 ring-pink-100"
              />
              {/* ข้อความลากได้ — overlay บนพรีวิวเท่านั้น
                ตำแหน่งที่ลากจะถูกส่งไปวาดตอน export ผ่าน textOffset */}
              {showOverlay && (
                <div
                  data-text-overlay="true"
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
              {/* สติกเกอร์อีโมจิ — overlay บนพรีวิว ลากย้าย + บีบสองนิ้วปรับขนาดได้
                ตอน export จะวาดลงรูปด้วย stickers ใน composeStrip */}
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
                    data-sticker-id={sticker.id}
                    role="button"
                    aria-label={sticker.emoji || "sticker"}
                    className={`absolute z-20 cursor-grab rounded-full text-center leading-none active:cursor-grabbing ${selected ? "ring-2 ring-pink-400 ring-offset-1" : ""
                      }`}
                    style={{
                      left: `${sticker.x * 100}%`,
                      top: `${sticker.y * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg)`,
                      fontSize: displaySize,
                      touchAction: "none",
                      userSelect: "none",
                    }}
                  >
                    {sticker.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sticker.image}
                        alt=""
                        draggable={false}
                        style={{ width: displaySize, height: "auto" }}
                      />
                    ) : (
                      sticker.emoji
                    )}
                    {/* ปุ่มลบตรงกรอบ — โผล่เฉพาะสติกเกอร์ที่เลือกอยู่ */}
                    {selected && (
                      <button
                        type="button"
                        aria-label={t.removeSticker}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          setStickers((prev) =>
                            prev.filter((s) => s.id !== sticker.id),
                          );
                          setSelectedStickerId(null);
                        }}
                        className="absolute -right-2 -top-2 z-30 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs font-bold leading-none text-white shadow-md"
                      >
                        ×
                      </button>
                    )}
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
      </div>

      {/* Pills tabs: ปรับทีละส่วน — Filter & Frame / Text & Fonts / Stickers */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 pt-2">
        {visibleTabs.map((tb) => {
          const active = tb.id === currentTab;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id)}
              aria-pressed={active}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active
                  ? "bg-violet-400 text-white shadow-md shadow-violet-200"
                  : "bg-white text-gray-700 ring-1 ring-pink-200 hover:bg-pink-50"
                }`}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      {currentTab === "filter" && (
        <>
          {/* Filter picker — จัดกลุ่มตามหมวดฟิลเตอร์ (classic/analog/digicam/mood/glitch) */}
          <h3 className="mt-6 font-medium text-gray-800">{t.filterTitle}</h3>
          {(["classic", "analog", "digicam", "mood", "glitch"] as const).map((group) => {
            const items = FILTERS.filter((f) => (f.group ?? "classic") === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t.filterGroup[group] ?? group}
                </p>
                <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
                  {items.map((item) => {
                    const active = item.id === filter.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFilter(item)}
                        className={`shrink-0 rounded-2xl p-1.5 text-center transition ${active
                            ? "bg-violet-400 shadow-md shadow-violet-200"
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
                          className={`mt-1.5 block px-1 pb-1 text-xs font-medium ${active ? "text-white" : "text-gray-600"
                            }`}
                        >
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Frame color picker — เทมเพลตเฟรมสำเร็จรูปไม่มีสีกรอบให้ปรับ */}
          {!isFrameTemplate && (
            <>
              <h3 className="mt-4 font-medium text-gray-800">{t.frameTitle}</h3>
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
                      className={`h-11 w-11 rounded-full transition ${active
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

              {/* สีเอง: color picker ของระบบ + สไลด์ปรับ hue */}
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
                <span className="shrink-0 text-sm font-medium text-gray-700">
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
                    // สีขาว/ดำไม่มี saturation เลย รูด hue อย่างเดียวจะไม่เห็นอะไร
                    // เลยให้ saturation กับความสว่างขั้นต่ำไว้ จะได้เห็นสีเปลี่ยนจริง
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
            </>
          )}
        </>
      )}

      {currentTab === "text" && (
        <>
          {/* ข้อความบนรูป — ทุกเทมเพลต: พิมพ์ข้อความเอง เลือกฟอนต์ ปรับขนาด */}
          <h3 className="mt-6 font-medium text-gray-800">
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

          <h4 className="mt-4 text-sm font-medium text-gray-700">
            {t.captionFontTitle}
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {/* เทมเพลตอื่นมีตัวเลือก "ค่าเริ่มต้น" ด้วย — คือฟอนต์ระบบแบบเดิม */}
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
                  className={`rounded-full px-4 py-2 text-base transition ${active
                      ? "bg-violet-400 text-white shadow-md shadow-violet-200"
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
            <span className="shrink-0 text-sm font-medium text-gray-700">
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

          {/* สีข้อความ — auto = ตามสีกรอบแบบเดิม (แสดงตลอด เพราะมีผลกับข้อความที่จะพิมพ์ด้วย) */}
          <h4 className="mt-4 text-sm font-medium text-gray-700">
            {t.textColorTitle}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTextColorChoice("auto")}
              title={t.textColorAuto}
              aria-label={t.textColorAuto}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold transition ${textColorChoice === "auto"
                  ? "ring-4 ring-pink-400 ring-offset-2"
                  : "ring-1 ring-pink-200 hover:scale-105"
                }`}
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 50%, #111827 50%)",
                color: "#be185d",
              }}
            >
              {t.textColorAuto}
            </button>
            {TEXT_COLORS.map((hex) => {
              const active = textColorChoice === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setTextColorChoice(hex)}
                  title={hex}
                  aria-label={hex}
                  className={`h-9 w-9 rounded-full transition ${active
                      ? "ring-4 ring-pink-400 ring-offset-2"
                      : "ring-1 ring-pink-200 hover:scale-105"
                    }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
            {/* สีข้อความเอง: color picker ของระบบ (เหมือนสีกรอบ) */}
            <label
              className={`relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full transition ${
                textColorChoice !== "auto" &&
                !TEXT_COLORS.includes(textColorChoice)
                  ? "ring-4 ring-pink-400 ring-offset-2"
                  : "ring-1 ring-pink-200 hover:scale-105"
              }`}
              style={{ backgroundColor: textColor }}
              title={t.customColorTitle}
            >
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
                +
              </span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColorChoice(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label={t.customColorTitle}
              />
            </label>
          </div>
          {/* สไลด์ปรับ hue ของสีข้อความ — ใช้สีปัจจุบันเป็นฐานเหมือนสีกรอบ */}
          <div className="mt-3 flex items-center gap-3">
            <span className="shrink-0 text-sm font-semibold text-gray-700">
              {t.hueTitle}
            </span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={Math.round(hexToHsl(textColor)[0])}
              onChange={(e) => {
                const [, s0, l0] = hexToHsl(textColor);
                const s = s0 < 0.3 ? 0.75 : s0;
                const l = l0 > 0.9 ? 0.85 : l0 < 0.1 ? 0.2 : l0;
                setTextColorChoice(hslToHex(Number(e.target.value), s, l));
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

          {/* ปรับตำแหน่งข้อความละเอียดด้วยสไลด์ X/Y + รีเซ็ต */}
          {showOverlay && (
            <>
              <div className="mt-5 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  {t.textPositionTitle}
                </h4>
                <button
                  type="button"
                  onClick={() => setTextOffset({ x: 0, y: 0 })}
                  disabled={textOffset.x === 0 && textOffset.y === 0}
                  className="text-sm font-medium text-pink-500 disabled:opacity-40"
                >
                  {t.resetPosition}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="w-6 shrink-0 text-sm font-medium text-gray-700">
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
                <span className="w-6 shrink-0 text-sm font-medium text-gray-700">
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
        </>
      )}

      {/* Download / share */}
      {currentTab === "stickers" && (
        <>
          {/* สติกเกอร์อีโมจิ — เลือกจากเครื่อง / แตะอีโมจิยอดนิยม แล้วลากวางบนรูป */}
          <h3 className="mt-6 font-medium text-gray-800">{t.stickerTitle}</h3>
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
              className="shrink-0 rounded-full bg-violet-400 px-5 py-3 text-sm font-medium text-white shadow-md shadow-violet-200 transition hover:bg-violet-500 disabled:opacity-40"
            >
              {t.addSticker}
            </button>
          </div>
          {selectedSticker && (
            <>
              <div className="mt-4 flex items-center gap-3">
                {selectedSticker.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedSticker.image}
                    alt=""
                    className="h-8 w-8 shrink-0"
                  />
                ) : (
                  <span className="shrink-0 text-2xl leading-none">
                    {selectedSticker.emoji}
                  </span>
                )}
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  {t.stickerSizeTitle}
                </span>
                <input
                  type="range"
                  min={12}
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
              {/* หมุนสติกเกอร์ — สำหรับเมาส์/คีย์บอร์ดที่บีบสองนิ้วไม่ได้ */}
              <div className="mt-3 flex items-center gap-3">
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  {t.stickerRotateTitle}
                </span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={selectedSticker.rotation ?? 0}
                  onChange={(e) =>
                    setStickers((prev) =>
                      prev.map((s) =>
                        s.id === selectedSticker.id
                          ? { ...s, rotation: Number(e.target.value) }
                          : s,
                      ),
                    )
                  }
                  className="flex-1 accent-pink-500"
                  aria-label={t.stickerRotateTitle}
                />
                <span className="w-14 shrink-0 text-right text-sm text-gray-500">
                  {selectedSticker.rotation ?? 0}°
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
                className="mt-2 self-start text-sm font-medium text-red-500"
              >
                {t.removeSticker}
              </button>
            </>
          )}
        </>
      )}

      {/* ปุ่มล่าง: Download เต็มแถว (หลัก) > Share เต็มแถว (รอง) >
          Retake/Start over ครึ่งแถวคู่กัน — ป้ายสั้น + nowrap ไม่ตัดบรรทัด */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={download}
          disabled={exportComposing}
          className="w-full whitespace-nowrap rounded-full bg-violet-400 py-4 text-base font-medium text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500 disabled:opacity-40"
        >
          {t.download}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={exportComposing}
          className="w-full whitespace-nowrap rounded-full bg-white py-3.5 text-sm font-medium text-pink-600 ring-2 ring-pink-200 disabled:opacity-40"
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
            className="flex-1 whitespace-nowrap rounded-full border-2 border-pink-200 bg-white px-2 py-3 text-sm font-medium text-pink-600"
          >
            {t.retakeAll}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 whitespace-nowrap rounded-full border-2 border-pink-200 bg-white px-2 py-3 text-sm font-medium text-pink-600"
          >
            {t.restart}
          </button>
        </div>
      </div>
    </div>
  );
}
