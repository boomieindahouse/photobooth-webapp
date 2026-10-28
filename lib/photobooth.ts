export type TemplateCategory =
  | "minimal"
  | "dark"
  | "polaroid"
  | "y2k"
  | "kawaii"
  | "story"
  | "photocard"
  | "halloween";

export interface TemplateCell {
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
}

/**
 * โมเดลเทมเพลตแบบกริด:
 * - เทมเพลตธรรมดา: ไม่ต้องระบุ cells ระบบจะวางรูป 1x1 เรียงตามแถวให้เอง
 * - เทมเพลตผสมขนาด (เช่น Layout E/G/H/I ในรูปอ้างอิง): ระบุ cells
 *   ตามลำดับรูปที่จะถ่าย เช่น รูปใหญ่ซ้าย + รูปเล็กขวา
 * - panel: ช่องว่างในกริดที่ไม่ใช่รูป เอาไว้ใส่ข้อความ (เช่น ช่องดำ
 *   "Groom & Bride" ในรูปอ้างอิง) ตอน export จะวาดข้อความ photobooth
 *   + วันที่ไว้ตรงกลางช่องนั้นแทนการวาดที่ท้ายแถบ
 */
export interface PhotoboothTemplate {
  id: string;
  name: string;
  desc: string;
  category: TemplateCategory;
  shots: number;
  cols: number;
  rows: number;
  /** ขนาดภาพสุดท้าย (px) สำหรับ export */
  stripWidth: number;
  stripHeight: number;
  gap: number;
  padding: number;
  /** ความสูงแถบข้อความท้ายภาพ (0 = ไม่มี ใช้ panel แทน หรือไม่มีเลย) */
  footerHeight: number;
  cells?: TemplateCell[];
  panel?: TemplateCell;
  /** สีกรอบที่แนะนำสำหรับเทมเพลตนี้ (ถ้าไม่ระบุ = ขาว) */
  defaultFrameId?: string;
  /**
   * เทมเพลตโพลารอยด์: พื้นที่ footerHeight คือช่องว่างสีขาวด้านล่าง
   * สำหรับข้อความที่ผู้ใช้พิมพ์เอง (ถ้าไม่พิมพ์อะไร จะเว้นว่างไว้
   * เหมือนโพลารอยด์จริงที่เขียนด้วยมือได้)
   */
  caption?: boolean;
  /**
   * เทมเพลตเฟรมสำเร็จรูป (Y2K/Kawaii): รูปเฟรม PNG โปร่งใสที่วาดทับ
   * รูปทั้งหมดตอน export — ช่องรูปในเฟรมโปร่งใส รูปจึงโผล่เฉพาะช่อง
   * (ใช้กับช่องวงรี/ดาวที่ไม่ใช่กริดสี่เหลี่ยมได้ด้วย)
   * cellsPx: ตำแหน่งช่องรูปจริง (px ในพิกัด strip) ใช้แทนกริด
   * เทมเพลตแบบนี้ไม่มีข้อความ/สีกรอบให้ปรับ (เฟรมตายตัว)
   */
  frameOverlay?: string;
  cellsPx?: { x: number; y: number; w: number; h: number }[];
}

export type FilterOp =
  | { kind: "sepia"; value: number }
  | { kind: "saturate"; value: number }
  | { kind: "hueRotate"; value: number }
  | { kind: "brightness"; value: number }
  | { kind: "contrast"; value: number }
  | { kind: "grayscale"; value: number };

export interface PhotoFilter {
  id: string;
  name: string;
  /** CSS filter string — ใช้กับ <img> preview เท่านั้น */
  css: string;
  /**
   * ขั้นตอนประมวลผลพิกเซลตามลำดับเดียวกับ CSS filter string ข้างบน
   * ใช้ตอน export แทน ctx.filter เพราะ Safari บน iOS/macOS
   * ไม่รองรับ CanvasRenderingContext2D.filter (ปิดไว้โดยค่าเริ่มต้น)
   * ถ้าใช้ ctx.filter อย่างเดียว รูปสุดท้ายบน iPhone/iPad จะไม่มีฟิลเตอร์เลย
   */
  ops: FilterOp[];
}

export interface FrameColor {
  id: string;
  name: string;
  hex: string;
}

export const CATEGORIES: TemplateCategory[] = [
  "minimal",
  "dark",
  "polaroid",
  "y2k",
  "kawaii",
  "story",
  "photocard",
  "halloween",
];

/**
 * ฟอนต์สำหรับข้อความโพลารอยด์ (Google Fonts, โหลดผ่าน next/font/google
 * ใน app/layout.tsx) — family คือชื่อฟอนต์ที่ใช้วาดลง canvas
 * และแสดงตัวอย่างในปุ่มเลือกฟอนต์; อักขระไทยที่ฟอนต์ลายมืออังกฤษ
 * ไม่มีจะถอยไปใช้ Mali อัตโนมัติตอนวาด (ดู composeStrip)
 * Itim กับ Mali รองรับไทยโดยตรง
 */
export interface CaptionFont {
  id: string;
  name: string;
  family: string;
}

export const CAPTION_FONTS: CaptionFont[] = [
  { id: "caveat", name: "Caveat", family: "Caveat" },
  { id: "kalam", name: "Kalam", family: "Kalam" },
  { id: "patrick-hand", name: "Patrick Hand", family: "Patrick Hand" },
  { id: "shadows", name: "Shadows Into Light", family: "Shadows Into Light" },
  { id: "dancing", name: "Dancing Script", family: "Dancing Script" },
  { id: "indie", name: "Indie Flower", family: "Indie Flower" },
  { id: "itim", name: "Itim", family: "Itim" },
  { id: "mali", name: "Mali", family: "Mali" },
];

/** เซลล์รูปตามลำดับการถ่าย: ถ้าไม่ระบุ cells จะวาง 1x1 เรียงตามแถว */
export function photoCells(template: PhotoboothTemplate): TemplateCell[] {
  if (template.cells) return template.cells;
  return Array.from({ length: template.shots }, (_, i) => ({
    col: i % template.cols,
    row: Math.floor(i / template.cols),
  }));
}

function cellRect(
  template: PhotoboothTemplate,
  cell: TemplateCell,
  unitW: number,
  unitH: number,
) {
  const colSpan = cell.colSpan ?? 1;
  const rowSpan = cell.rowSpan ?? 1;
  return {
    x: template.padding + cell.col * (unitW + template.gap),
    y: template.padding + cell.row * (unitH + template.gap),
    w: colSpan * unitW + (colSpan - 1) * template.gap,
    h: rowSpan * unitH + (rowSpan - 1) * template.gap,
  };
}

/** ---------- Minimal: แถบ/ตารางเรียบ ๆ โทนพาสเทล (ของเดิม) ---------- */
const MINIMAL: PhotoboothTemplate[] = [
  {
    id: "classic-4",
    name: "Classic 4",
    desc: "The classic long strip with 4 shots stacked",
    category: "minimal",
    shots: 4,
    cols: 1,
    rows: 4,
    stripWidth: 600,
    stripHeight: 1784,
    gap: 16,
    padding: 24,
    footerHeight: 80,
  },
  {
    id: "trio-3",
    name: "Trio 3",
    desc: "A compact, cute 3-shot long strip",
    category: "minimal",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1402,
    gap: 16,
    padding: 24,
    footerHeight: 80,
  },
  {
    id: "duo-wide",
    name: "Duo Wide",
    desc: "2 wide shots — perfect for couples / besties",
    category: "minimal",
    shots: 2,
    cols: 2,
    rows: 1,
    stripWidth: 1200,
    stripHeight: 554,
    gap: 16,
    padding: 24,
    footerHeight: 80,
  },
  {
    id: "square-4",
    name: "Square 4",
    desc: "4 shots in a 2x2 grid, social-ready",
    category: "minimal",
    shots: 4,
    cols: 2,
    rows: 2,
    stripWidth: 900,
    stripHeight: 770,
    gap: 16,
    padding: 24,
    footerHeight: 80,
  },
  {
    id: "six-grid",
    name: "Six Grid",
    desc: "6 shots in a 2x3 grid — capture every moment",
    category: "minimal",
    shots: 6,
    cols: 2,
    rows: 3,
    stripWidth: 900,
    stripHeight: 1099,
    gap: 16,
    padding: 24,
    footerHeight: 80,
  },
];

/**
 * ---------- Dark: ฟีลรูปอ้างอิง A-L ----------
 * กรอบดำ รูปขาว ข้อความอยู่บนช่อง panel หรือท้ายแถบ
 * A/B = strip 3 ช็อต, C/D = strip 4 ช็อต, E-L = พิมพ์ 6x4 (4R)
 */
const DARK: PhotoboothTemplate[] = [
  {
    id: "dark-strip-3",
    name: "Dark Strip 3",
    desc: "Layout A/B — 3-shot black strip, like a real booth print",
    category: "dark",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1450,
    gap: 16,
    padding: 24,
    footerHeight: 80,
    defaultFrameId: "black",
  },
  {
    id: "dark-strip-4",
    name: "Dark Strip 4",
    desc: "Layout C/D — 4-shot black strip",
    category: "dark",
    shots: 4,
    cols: 1,
    rows: 4,
    stripWidth: 600,
    stripHeight: 1850,
    gap: 16,
    padding: 24,
    footerHeight: 80,
    defaultFrameId: "black",
  },
  {
    id: "dark-feature-4",
    name: "Dark Feature 4",
    desc: "Layout E — one photo top-left, text panel top-right, 3 photos below",
    category: "dark",
    shots: 4,
    cols: 3,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 0,
    cells: [
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
      { col: 2, row: 1 },
    ],
    panel: { col: 1, row: 0, colSpan: 2 },
    defaultFrameId: "black",
  },
  {
    id: "dark-grid-4",
    name: "Dark Grid 4",
    desc: "Layout F — 4 photos in a 2x2 grid on a 6x4 black print",
    category: "dark",
    shots: 4,
    cols: 2,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 80,
    defaultFrameId: "black",
  },
  {
    id: "dark-trio-panel",
    name: "Dark Trio Panel",
    desc: "Layout G — 2 photos on top, 1 photo + text panel below",
    category: "dark",
    shots: 3,
    cols: 2,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 0,
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
    ],
    panel: { col: 1, row: 1 },
    defaultFrameId: "black",
  },
  {
    id: "dark-trio-alt",
    name: "Dark Trio Alt",
    desc: "Layout H — text panel top-right, 1 photo top-left, 2 below",
    category: "dark",
    shots: 3,
    cols: 2,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 0,
    cells: [
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
    panel: { col: 1, row: 0 },
    defaultFrameId: "black",
  },
  {
    id: "dark-duo-panel",
    name: "Dark Duo Panel",
    desc: "Layout I — 2 photos stacked on the left, tall text panel on the right",
    category: "dark",
    shots: 2,
    cols: 2,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 0,
    cells: [
      { col: 0, row: 0 },
      { col: 0, row: 1 },
    ],
    panel: { col: 1, row: 0, rowSpan: 2 },
    defaultFrameId: "black",
  },
  {
    id: "dark-duo-header",
    name: "Dark Duo Header",
    desc: "Layout J — text panel on top, 2 wide photos below",
    category: "dark",
    shots: 2,
    cols: 2,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 0,
    cells: [
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
    panel: { col: 0, row: 0, colSpan: 2 },
    defaultFrameId: "black",
  },
  {
    id: "dark-duo-portrait",
    name: "Dark Duo Portrait",
    desc: "Layout K — portrait 6x4 print, 2 photos stacked",
    category: "dark",
    shots: 2,
    cols: 1,
    rows: 2,
    stripWidth: 800,
    stripHeight: 1200,
    gap: 16,
    padding: 24,
    footerHeight: 80,
    defaultFrameId: "black",
  },
  {
    id: "dark-single",
    name: "Dark Single",
    desc: "Layout L — one big photo on a 6x4 black print",
    category: "dark",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 1200,
    stripHeight: 800,
    gap: 16,
    padding: 24,
    footerHeight: 80,
    defaultFrameId: "black",
  },
];

/**
/** ---------- Polaroid: รูปใหญ่ + ช่องว่างด้านล่างสำหรับเขียนข้อความ ---------- */
const POLAROID: PhotoboothTemplate[] = [
  {
    id: "polaroid-classic",
    name: "Polaroid Classic",
    desc: "One big photo with a blank white space below for your own caption",
    category: "polaroid",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 800,
    stripHeight: 1000,
    gap: 16,
    padding: 32,
    footerHeight: 180,
    caption: true,
    defaultFrameId: "white",
  },
  {
    id: "polaroid-duo",
    name: "Polaroid Duo",
    desc: "Two photos stacked with a caption space below, like two Polaroids in one",
    category: "polaroid",
    shots: 2,
    cols: 1,
    rows: 2,
    stripWidth: 800,
    stripHeight: 1680,
    gap: 16,
    padding: 32,
    footerHeight: 180,
    caption: true,
    defaultFrameId: "white",
  },
];

/** ---------- Y2K: แถบเฟรมสำเร็จรูป ดำ/ขาว (PNG โปร่งใส + cellsPx) ---------- */
const Y2K: PhotoboothTemplate[] = [
  {
    id: "y2k-black-1",
    name: "Y2K Black Rect",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1847,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/y2k-black-1.png",
    cellsPx: [{ x: 35, y: 152, w: 530, h: 435 }, { x: 35, y: 638, w: 530, h: 436 }, { x: 35, y: 1124, w: 530, h: 436 }],
  },
  {
    id: "y2k-black-2",
    name: "Y2K Black Oval",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1844,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/y2k-black-2.png",
    cellsPx: [{ x: 23, y: 175, w: 554, h: 439 }, { x: 23, y: 702, w: 554, h: 439 }, { x: 23, y: 1229, w: 554, h: 439 }],
  },
  {
    id: "y2k-black-3",
    name: "Y2K Black Star",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1847,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/y2k-black-3.png",
    cellsPx: [{ x: 85, y: 208, w: 429, h: 413 }, { x: 85, y: 716, w: 429, h: 414 }, { x: 85, y: 1225, w: 429, h: 413 }],
  },
  {
    id: "y2k-black-4",
    name: "Y2K Black Star Pop",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1844,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/y2k-black-4.png",
    cellsPx: [{ x: 35, y: 152, w: 529, h: 435 }, { x: 35, y: 637, w: 529, h: 435 }, { x: 35, y: 1123, w: 529, h: 436 }],
  },
  {
    id: "y2k-white-1",
    name: "Y2K White Oval",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1847,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "white",
    frameOverlay: "/frames/y2k-white-1.png",
    cellsPx: [{ x: 22, y: 176, w: 555, h: 439 }, { x: 22, y: 703, w: 555, h: 439 }, { x: 22, y: 1231, w: 555, h: 439 }],
  },
  {
    id: "y2k-white-2",
    name: "Y2K White Rect",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1844,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "white",
    frameOverlay: "/frames/y2k-white-2.png",
    cellsPx: [{ x: 35, y: 152, w: 529, h: 436 }, { x: 35, y: 637, w: 529, h: 435 }, { x: 35, y: 1123, w: 529, h: 436 }],
  },
  {
    id: "y2k-white-3",
    name: "Y2K White Star",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1847,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "white",
    frameOverlay: "/frames/y2k-white-3.png",
    cellsPx: [{ x: 85, y: 208, w: 429, h: 413 }, { x: 85, y: 716, w: 429, h: 414 }, { x: 85, y: 1225, w: 429, h: 413 }],
  },
  {
    id: "y2k-white-4",
    name: "Y2K White Star Pop",
    desc: "Bold Y2K strip with 3 shots",
    category: "y2k",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 600,
    stripHeight: 1844,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "white",
    frameOverlay: "/frames/y2k-white-4.png",
    cellsPx: [{ x: 35, y: 152, w: 529, h: 435 }, { x: 35, y: 637, w: 529, h: 435 }, { x: 35, y: 1123, w: 529, h: 436 }],
  },
];

/** ---------- Kawaii: กรอบกริด 6 ช็อต (PNG โปร่งใส + cellsPx) ---------- */
const KAWAII: PhotoboothTemplate[] = [
  {
    id: "kawaii-icon",
    name: "Kawaii Doodle Grid",
    desc: "Cute grid frame with 6 shots",
    category: "kawaii",
    shots: 6,
    cols: 2,
    rows: 3,
    stripWidth: 800,
    stripHeight: 1009,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/kawaii-icon.png",
    cellsPx: [{ x: 81, y: 102, w: 311, h: 234 }, { x: 408, y: 102, w: 311, h: 234 }, { x: 81, y: 352, w: 311, h: 235 }, { x: 408, y: 352, w: 311, h: 235 }, { x: 81, y: 603, w: 311, h: 234 }, { x: 408, y: 603, w: 311, h: 234 }],
  },
  {
    id: "kawaii-bloom",
    name: "Kawaii Daisy Grid",
    desc: "Cute grid frame with 6 shots",
    category: "kawaii",
    shots: 6,
    cols: 2,
    rows: 3,
    stripWidth: 800,
    stripHeight: 1009,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "white",
    frameOverlay: "/frames/kawaii-bloom.png",
    cellsPx: [{ x: 80, y: 101, w: 312, h: 235 }, { x: 407, y: 101, w: 311, h: 235 }, { x: 80, y: 352, w: 312, h: 235 }, { x: 407, y: 352, w: 311, h: 235 }, { x: 80, y: 602, w: 312, h: 235 }, { x: 407, y: 602, w: 311, h: 235 }],
  },
];

/** ---------- Story: กรอบสตอรี่ลายตาราง + เทปแปะ (PNG โปร่งใส + cellsPx) ---------- */
const STORY: PhotoboothTemplate[] = [
  {
    id: "story-collage",
    name: "Story Collage",
    desc: "Grid story frame with 3 shots",
    category: "story",
    shots: 3,
    cols: 1,
    rows: 3,
    stripWidth: 1080,
    stripHeight: 1920,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/story-collage.png",
    cellsPx: [{ x: 317, y: 244, w: 446, h: 446 }, { x: 318, y: 767, w: 446, h: 446 }, { x: 319, y: 1291, w: 446, h: 446 }],
  },
];

/** ---------- Photocard: กรอบโฟโต้การ์ดลายตาราง BYS (PNG โปร่งใส + cellsPx) ---------- */
const PHOTOCARD: PhotoboothTemplate[] = [
  {
    id: "bys-photocard",
    name: "BYS Photocard",
    desc: "Checker photocard frame with 6 shots",
    category: "photocard",
    shots: 6,
    cols: 3,
    rows: 2,
    stripWidth: 1200,
    stripHeight: 960,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/bys-photocard.png",
    cellsPx: [{ x: 83, y: 133, w: 233, h: 316 }, { x: 483, y: 133, w: 233, h: 316 }, { x: 883, y: 133, w: 233, h: 316 }, { x: 83, y: 513, w: 233, h: 316 }, { x: 483, y: 513, w: 233, h: 316 }, { x: 883, y: 513, w: 233, h: 316 }],
  },
];

/** ---------- Halloween: การ์ดสตอรี่กะโหลก 4 แบบ + เฟรมฮาโลวีน 3 แบบ (PNG โปร่งใส + cellsPx) ---------- */
const HALLOWEEN: PhotoboothTemplate[] = [
  {
    id: "halloween-night",
    name: "Night Skull",
    desc: "Skull story card with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 800,
    stripHeight: 1247,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-night.png",
    cellsPx: [{ x: 1, y: 0, w: 797, h: 843 }],
  },
  {
    id: "halloween-rock",
    name: "Rock Skull",
    desc: "Skull story card with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 800,
    stripHeight: 1247,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-rock.png",
    cellsPx: [{ x: 1, y: 0, w: 591, h: 1247 }],
  },
  {
    id: "halloween-two",
    name: "Two Hearts",
    desc: "Skull story card with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 800,
    stripHeight: 1248,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-two.png",
    cellsPx: [{ x: 1, y: 413, w: 797, h: 772 }],
  },
  {
    id: "halloween-nightlove",
    name: "Night Love",
    desc: "Skull story card with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 800,
    stripHeight: 1248,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-nightlove.png",
    cellsPx: [{ x: 37, y: 0, w: 761, h: 1116 }],
  },
  {
    id: "halloween-ghost",
    name: "Halloween Ghost",
    desc: "Spooky ghost frame with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 900,
    stripHeight: 1463,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-ghost.png",
    cellsPx: [{ x: 72, y: 97, w: 651, h: 978 }],
  },
  {
    id: "halloween-witch",
    name: "Halloween Witch",
    desc: "Spooky witch frame with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 900,
    stripHeight: 1465,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-witch.png",
    cellsPx: [{ x: 74, y: 53, w: 746, h: 1035 }],
  },
  {
    id: "halloween-pumpkin",
    name: "Halloween Pumpkin",
    desc: "Spooky pumpkin frame with 1 shot",
    category: "halloween",
    shots: 1,
    cols: 1,
    rows: 1,
    stripWidth: 900,
    stripHeight: 1457,
    gap: 0,
    padding: 0,
    footerHeight: 0,
    defaultFrameId: "black",
    frameOverlay: "/frames/hw-pumpkin.png",
    cellsPx: [{ x: 115, y: 62, w: 739, h: 978 }],
  },
];

export const TEMPLATES: PhotoboothTemplate[] = [
  ...MINIMAL,
  ...DARK,
  ...POLAROID,
  ...Y2K,
  ...KAWAII,
  ...STORY,
  ...PHOTOCARD,
  ...HALLOWEEN,
];

export const FILTERS: PhotoFilter[] = [
  { id: "original", name: "Original", css: "none", ops: [] },
  {
    id: "pastel-pink",
    name: "Pastel Pink",
    css: "sepia(0.25) saturate(1.4) hue-rotate(300deg) brightness(1.08)",
    ops: [
      { kind: "sepia", value: 0.25 },
      { kind: "saturate", value: 1.4 },
      { kind: "hueRotate", value: -60 },
      { kind: "brightness", value: 1.08 },
    ],
  },
  {
    id: "warm",
    name: "Warm Glow",
    css: "sepia(0.3) saturate(1.3) brightness(1.06)",
    ops: [
      { kind: "sepia", value: 0.3 },
      { kind: "saturate", value: 1.3 },
      { kind: "brightness", value: 1.06 },
    ],
  },
  {
    id: "cool",
    name: "Cool Tone",
    css: "saturate(1.1) hue-rotate(15deg) brightness(1.02) contrast(0.95)",
    ops: [
      { kind: "saturate", value: 1.1 },
      { kind: "hueRotate", value: 15 },
      { kind: "brightness", value: 1.02 },
      { kind: "contrast", value: 0.95 },
    ],
  },
  {
    id: "mono",
    name: "Mono",
    css: "grayscale(1) contrast(1.05)",
    ops: [
      { kind: "grayscale", value: 1 },
      { kind: "contrast", value: 1.05 },
    ],
  },
  {
    id: "vintage",
    name: "Vintage Film",
    css: "sepia(0.5) contrast(0.9) brightness(1.05)",
    ops: [
      { kind: "sepia", value: 0.5 },
      { kind: "contrast", value: 0.9 },
      { kind: "brightness", value: 1.05 },
    ],
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    css: "saturate(1.6) contrast(1.1)",
    ops: [
      { kind: "saturate", value: 1.6 },
      { kind: "contrast", value: 1.1 },
    ],
  },
  {
    id: "soft",
    name: "Soft Dream",
    css: "brightness(1.12) saturate(0.9) contrast(0.9)",
    ops: [
      { kind: "brightness", value: 1.12 },
      { kind: "saturate", value: 0.9 },
      { kind: "contrast", value: 0.9 },
    ],
  },
];

export const FRAME_COLORS: FrameColor[] = [
  { id: "white", name: "White", hex: "#ffffff" },
  { id: "blush", name: "Pastel pink", hex: "#ffdce9" },
  { id: "cream", name: "Cream", hex: "#fff3d6" },
  { id: "mint", name: "Mint", hex: "#d9f2e3" },
  { id: "lavender", name: "Lavender", hex: "#e6deff" },
  { id: "sky", name: "Pastel blue", hex: "#d6efff" },
  { id: "black", name: "Black", hex: "#111827" },
  { id: "festive-red", name: "Festive red", hex: "#e11d48" },
  { id: "holly-green", name: "Holly green", hex: "#15803d" },
  { id: "pumpkin", name: "Pumpkin orange", hex: "#f97316" },
  { id: "gold", name: "Gold", hex: "#c9a227" },
];

export function frameById(id?: string): FrameColor {
  return FRAME_COLORS.find((c) => c.id === id) ?? FRAME_COLORS[0];
}

function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255 < 0.5;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return [(rn + m) * 255, (gn + m) * 255, (bn + m) * 255];
}

/**
 * ประมวลผลฟิลเตอร์ที่ระดับพิกเซล คืน canvas ใหม่
 * รูปต้นฉบับที่ใหญ่มากจะย่อลงเหลือด้านยาวสุด 1600px ก่อน
 * เพื่อไม่ให้มือถือประมวลผลช้าเกินไป
 */
function applyFilter(
  img: HTMLImageElement,
  filter: PhotoFilter,
): HTMLCanvasElement {
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (filter.ops.length === 0) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    for (const op of filter.ops) {
      if (op.kind === "sepia") {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r * (1 - op.value) + sr * op.value;
        g = g * (1 - op.value) + sg * op.value;
        b = b * (1 - op.value) + sb * op.value;
      } else if (op.kind === "saturate" || op.kind === "grayscale") {
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // saturate(f): gray + (v - gray) * f
        // grayscale(amount): gray + (v - gray) * (1 - amount)
        const f = op.kind === "grayscale" ? 1 - op.value : op.value;
        r = gray + (r - gray) * f;
        g = gray + (g - gray) * f;
        b = gray + (b - gray) * f;
      } else if (op.kind === "hueRotate") {
        const [h, s, v] = rgbToHsv(r, g, b);
        const [nr, ng, nb] = hsvToRgb((h + op.value + 360) % 360, s, v);
        r = nr;
        g = ng;
        b = nb;
      } else if (op.kind === "brightness") {
        r *= op.value;
        g *= op.value;
        b *= op.value;
      } else if (op.kind === "contrast") {
        r = (r - 127.5) * op.value + 127.5;
        g = (g - 127.5) * op.value + 127.5;
        b = (b - 127.5) * op.value + 127.5;
      }
      r = clamp255(r);
      g = clamp255(g);
      b = clamp255(b);
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** สติกเกอร์: x/y เป็นสัดส่วน 0-1 ของภาพ, size เป็น px ในพิกัดภาพ
 *  emoji = สติกเกอร์ตัวอักษร, image = สติกเกอร์รูปภาพ (URL ใน public/)
 *  rotation = องศาที่หมุน (0 = ไม่หมุน, หมุนตามเข็มนาฬิกาเป็นบวก) */
export interface EmojiSticker {
  emoji: string;
  x: number;
  y: number;
  size: number;
  image?: string;
  rotation?: number;
}

export interface ComposeOptions {
  photos: string[];
  template: PhotoboothTemplate;
  filter: PhotoFilter;
  frameColor: FrameColor;
  dateLocale?: string;
  /**
   * ข้อความที่ผู้ใช้พิมพ์เอง — โพลารอยด์: ข้อความใต้รูป (ว่างได้),
   * เทมเพลตอื่น: ข้อความท้ายแถบ/ใน panel (ค่าเริ่มต้น "photobooth")
   */
  captionText?: string;
  /**
   * ชื่อฟอนต์ Google Fonts ของข้อความนั้น
   * null = ฟอนต์เริ่มต้นของระบบ (sans-serif แบบเดิม) — ใช้กับเทมเพลตอื่น
   * ที่ผู้ใช้ยังไม่ได้เลือกฟอนต์ จะได้ไม่เปลี่ยนหน้าตาเดิมโดยไม่ตั้งใจ
   */
  captionFontFamily?: string | null;
  /** ขนาดฟอนต์ข้อความนั้น (px) — โพลารอยด์ค่าเริ่มต้น 44, เทมเพลตอื่น 26 */
  captionSize?: number;
  /** ใส่ วันที่ ต่อท้ายข้อความหรือไม่ (เทมเพลตอื่นเท่านั้น; โพลารอยด์ไม่มีวันที่) */
  includeDate?: boolean;
  /** ตำแหน่งข้อความที่ผู้ใช้ลากปรับเอง (px ในพิกัดภาพสุดท้าย, 0 = ตำแหน่งเริ่มต้น) */
  textOffsetX?: number;
  textOffsetY?: number;
  /** สติกเกอร์อีโมจิที่ผู้ใช้วางบนรูป (วาดทับข้อความ) */
  stickers?: EmojiSticker[];
  /** สีข้อความที่ผู้ใช้เลือกเอง — null = อัตโนมัติตามสีกรอบ (กรอบดำ = ขาว, อื่น = ชมพูเข้ม) */
  textColor?: string | null;
}

/**
 * จุดเริ่มต้นของข้อความบนภาพสุดท้าย (พิกัดภาพ, px)
 * ใช้ทั้งตอน export และตอนวาดข้อความลากได้บนพรีวิวให้ตรงกัน
 * - panel: กลางช่อง panel
 * - caption/footer: กลางช่องท้ายภาพ
 * - frameOverlay: กลางภาพ ห่างขอบล่าง 56px (เฟรมไม่มีช่องท้ายภาพแยก
 *   ข้อความจึงวาดทับเฟรมตรงนี้ แล้วผู้ใช้ลากย้ายได้เอง)
 */
export function getTextAnchor(template: PhotoboothTemplate): {
  x: number;
  y: number;
} {
  if (template.frameOverlay) {
    return {
      x: template.stripWidth / 2,
      y: template.stripHeight - 56,
    };
  }
  if (template.panel) {
    const photoAreaWidth = template.stripWidth - template.padding * 2;
    const photoAreaHeight =
      template.stripHeight - template.padding * 2 - template.footerHeight;
    const unitW =
      (photoAreaWidth - template.gap * (template.cols - 1)) / template.cols;
    const unitH =
      (photoAreaHeight - template.gap * (template.rows - 1)) / template.rows;
    const { x, y, w, h } = cellRect(template, template.panel, unitW, unitH);
    return { x: x + w / 2, y: y + h / 2 };
  }
  return {
    x: template.stripWidth / 2,
    y: template.stripHeight - template.footerHeight / 2,
  };
}

export function isDarkHexPublic(hex: string): boolean {
  return isDarkHex(hex);
}

/**
 * ความกว้างพื้นที่ข้อความ (px ในพิกัดภาพ) ใช้ให้ overlay บนพรีวิว
 * ตัดคำเหมือนตอน export: panel = กว้างช่อง panel, caption = กว้างช่องว่าง
 * ลบขอบ, footer = เต็มความกว้างภาพ (export ไม่ตัดคำ)
 */
export function getTextWrapWidth(template: PhotoboothTemplate): number {
  if (template.panel) {
    const photoAreaWidth = template.stripWidth - template.padding * 2;
    const photoAreaHeight =
      template.stripHeight - template.padding * 2 - template.footerHeight;
    const unitW =
      (photoAreaWidth - template.gap * (template.cols - 1)) / template.cols;
    const unitH =
      (photoAreaHeight - template.gap * (template.rows - 1)) / template.rows;
    return cellRect(template, template.panel, unitW, unitH).w - 16;
  }
  if (template.caption) {
    return template.stripWidth - template.padding * 2 - 32;
  }
  return template.stripWidth;
}

/** รอให้ฟอนต์ที่เลือกโหลดก่อนวาดลง canvas ไม่งั้นจะถอยไปใช้ฟอนต์สำรอง */
async function loadCustomFont(
  family: string | null | undefined,
  size: number,
): Promise<void> {
  if (!family) return;
  try {
    const fonts = (
      document as Document & {
        fonts?: { load: (font: string) => Promise<unknown> };
      }
    ).fonts;
    if (fonts) {
      await Promise.race([
        fonts.load(`${size}px "${family}"`),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }
  } catch {
    // โหลดฟอนต์ไม่สำเร็จก็ยังวาดด้วยฟอนต์สำรอง
  }
}

/** ตัดบรรทัดข้อความอัตโนมัติตามความกว้าง (ctx.font ต้องตั้งไว้ก่อนเรียก) */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    let current = "";
    for (const word of rawLine.split(" ")) {
      const trial = current ? `${current} ${word}` : word;
      if (ctx.measureText(trial).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = trial;
      }
    }
    lines.push(current);
  }
  return lines;
}

/** ประกอบรูปทั้งหมดเป็นภาพเดียวตามเทมเพลต + ฟิลเตอร์ + สีกรอบ คืนเป็น data URL (PNG) */
export async function composeStrip({
  photos,
  template,
  filter,
  frameColor,
  dateLocale = "en-US",
  captionText = "",
  captionFontFamily = null,
  captionSize = 26,
  includeDate = true,
  textOffsetX = 0,
  textOffsetY = 0,
  stickers = [],
  textColor: textColorParam = null,
}: ComposeOptions): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = template.stripWidth;
  canvas.height = template.stripHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");

  ctx.fillStyle = frameColor.hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photoAreaWidth = template.stripWidth - template.padding * 2;
  const photoAreaHeight =
    template.stripHeight - template.padding * 2 - template.footerHeight;
  const unitW =
    (photoAreaWidth - template.gap * (template.cols - 1)) / template.cols;
  const unitH =
    (photoAreaHeight - template.gap * (template.rows - 1)) / template.rows;

  const images = await Promise.all(photos.map((src) => loadImage(src)));
  const cells = photoCells(template);
  // ฟิลเตอร์ถูกประมวลผลที่พิกเซลก่อนวาด (ไม่ใช้ ctx.filter)
  const filtered = images.map((img) => applyFilter(img, filter));

  if (template.cellsPx) {
    // เทมเพลตเฟรม: วาดรูปตามตำแหน่งจริง (ไม่ตัดมุม — เฟรมกำหนดรูปทรงเอง)
    filtered.forEach((img, i) => {
      const r = template.cellsPx?.[i];
      if (!r) return;
      drawCover(ctx, img, r.x, r.y, r.w, r.h);
    });
  } else {
    filtered.forEach((img, i) => {
      const cell = cells[i];
      if (!cell) return;
      const { x, y, w, h } = cellRect(template, cell, unitW, unitH);
      ctx.save();
      roundRectPath(ctx, x, y, w, h, 18);
      ctx.clip();
      drawCover(ctx, img, x, y, w, h);
      ctx.restore();
    });
  }

  // เฟรมสำเร็จรูปวาดทับรูป — รูปโผล่เฉพาะช่องโปร่งใสของเฟรม
  if (template.frameOverlay) {
    try {
      const overlay = await loadImage(template.frameOverlay);
      ctx.drawImage(overlay, 0, 0, template.stripWidth, template.stripHeight);
    } catch {
      /* เฟรมโหลดไม่ได้ — ใช้รูปที่วาดไว้แทน */
    }
  }

  const dateText = new Date().toLocaleDateString(dateLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const textColor =
    textColorParam ?? (isDarkHex(frameColor.hex) ? "#ffffff" : "#be185d");

  const customText = captionText.trim();
  // ฟอนต์ที่ใช้วาด: ถ้าผู้ใช้เลือกฟอนต์ ใช้ฟอนต์นั้น (ถอยไป Mali สำหรับไทย)
  // ถ้าไม่เลือก (null) ใช้ฟอนต์ระบบแบบเดิมทุกประการ
  const customFont = captionFontFamily
    ? `${captionSize}px "${captionFontFamily}", "Mali", sans-serif`
    : null;
  // จุดกึ่งกลางข้อความหลังเลื่อนตามที่ผู้ใช้ลาก (กันไม่ให้หลุดขอบภาพ)
  const anchor = getTextAnchor(template);
  const anchorX = Math.min(
    Math.max(anchor.x + textOffsetX, 0),
    template.stripWidth,
  );
  const anchorY = Math.min(
    Math.max(anchor.y + textOffsetY, 0),
    template.stripHeight,
  );

  if (template.panel) {
    // ข้อความอยู่กลางช่อง panel (เช่น Layout E/G/H/I)
    const { x, y, w, h } = cellRect(template, template.panel, unitW, unitH);
    const titleSize = customFont ? captionSize : 44;
    const dateSize = customFont ? Math.round(captionSize * 0.6) : 26;
    await loadCustomFont(captionFontFamily, titleSize);
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = customFont ?? "700 44px sans-serif";
    if (customText) {
      const lines = wrapLines(ctx, customText, w - 16);
      const lineHeight = titleSize * 1.25;
      const blockHeight =
        lines.length * lineHeight + (includeDate ? dateSize + 12 : 0);
      const startY = anchorY - blockHeight / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        ctx.fillText(`♡  ${line}  ♡`, anchorX, startY + i * lineHeight);
      });
      if (includeDate) {
        ctx.font = customFont ?? "600 26px sans-serif";
        // ถ้าเลือกฟอนต์เอง วันที่ใช้ขนาดเล็กลงตามสัดส่วน
        if (customFont) {
          ctx.font = `${dateSize}px "${captionFontFamily}", "Mali", sans-serif`;
        }
        ctx.fillText(dateText, anchorX, startY + lines.length * lineHeight + 6);
      }
    } else if (includeDate) {
      ctx.font = customFont ?? "600 26px sans-serif";
      ctx.fillText(dateText, anchorX, anchorY);
    }
  } else if (template.caption) {
    // โพลารอยด์: วาดข้อความที่ผู้ใช้พิมพ์ลงช่องว่างด้านล่าง
    // ถ้าไม่พิมพ์อะไรเลย จะเว้นช่องว่างไว้เหมือนโพลารอยด์จริง
    if (customText) {
      await loadCustomFont(captionFontFamily, captionSize);
      const maxWidth = template.stripWidth - template.padding * 2 - 32;
      const lineHeight = captionSize * 1.3;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = customFont ?? `${captionSize}px sans-serif`;
      const lines = wrapLines(ctx, customText, maxWidth);
      const startY =
        anchorY - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, anchorX, startY + i * lineHeight);
      });
    }
  } else if (template.frameOverlay) {
    // เทมเพลตเฟรมสำเร็จรูป: ข้อความวาดทับเฟรมที่จุด anchor ท้ายภาพ
    // (วาดหลัง overlay จึงไม่ถูกเฟรมบัง; รูปแบบเดียวกับแถบท้ายภาพ
    // ของเทมเพลตทั่วไป — ไม่ใส่ทั้งสองอย่าง = ไม่มีข้อความ)
    if (customText || includeDate) {
      await loadCustomFont(captionFontFamily, captionSize);
      const body =
        customText && includeDate
          ? `${customText}  •  ${dateText}`
          : customText || dateText;
      ctx.fillStyle = textColor;
      ctx.font = customFont ?? "600 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`♡  ${body}  ♡`, anchorX, anchorY);
    }
  } else if (template.footerHeight > 0) {
    // แถบท้ายภาพ: ข้อความที่ผู้ใช้พิมพ์ + วันที่ (ถ้าเลือกใส่)
    // ไม่ใส่ทั้งสองอย่าง = เว้นท้ายแถบว่างไว้
    if (customText || includeDate) {
      await loadCustomFont(captionFontFamily, captionSize);
      const body =
        customText && includeDate
          ? `${customText}  •  ${dateText}`
          : customText || dateText;
      ctx.fillStyle = textColor;
      ctx.font = customFont ?? "600 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`♡  ${body}  ♡`, anchorX, anchorY);
    }
  }

  // สติกเกอร์วาดทับสุด — อีโมจิใช้ฟอนต์อีโมจิของเครื่อง
  // จะได้เป็นสีเหมือนบนจอ, รูปภาพวาดแบบคงสัดส่วนในกล่อง size x size
  // rotation หมุนรอบจุดกลางสติกเกอร์ (เหมือนที่เห็นบนพรีวิว)
  if (stickers.length > 0) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const sticker of stickers) {
      const size = Math.max(12, Math.min(400, sticker.size));
      const cx = Math.max(0, Math.min(1, sticker.x)) * template.stripWidth;
      const cy = Math.max(0, Math.min(1, sticker.y)) * template.stripHeight;
      ctx.save();
      ctx.translate(cx, cy);
      if (sticker.rotation) {
        ctx.rotate((sticker.rotation * Math.PI) / 180);
      }
      if (sticker.image) {
        try {
          const img = await loadImage(sticker.image);
          const scale = size / Math.max(img.width, img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } catch {
          /* รูปโหลดไม่ได้ — ข้ามสติกเกอร์ตัวนั้นไป */
        }
      } else {
        ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.fillText(sticker.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  return canvas.toDataURL("image/png");
}
