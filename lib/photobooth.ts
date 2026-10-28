export type TemplateCategory = "minimal" | "dark" | "festival" | "meme";
export interface TemplateCell { col: number; row: number; colSpan?: number; rowSpan?: number; }
/** Grid template model: plain templates omit cells (1x1 row-major); mixed-size layouts (ref Layout E/G/H/I) give explicit cells; panel is a non-photo cell that gets the photobooth + date text on export. */
export interface PhotoboothTemplate { id: string; name: string; desc: string; category: TemplateCategory; shots: number; cols: number; rows: number; stripWidth: number; stripHeight: number; gap: number; padding: number; footerHeight: number; cells?: TemplateCell[]; panel?: TemplateCell; defaultFrameId?: string; }
export interface PhotoFilter { id: string; name: string; css: string; }
export interface FrameColor { id: string; name: string; hex: string; }
export const CATEGORIES: TemplateCategory[] = ["minimal", "dark", "festival", "meme"];
export function photoCells(template: PhotoboothTemplate): TemplateCell[] { if (template.cells) return template.cells; return Array.from({ length: template.shots }, (_, i) => ({ col: i % template.cols, row: Math.floor(i / template.cols) })); }
function cellRect(template: PhotoboothTemplate, cell: TemplateCell, unitW: number, unitH: number) { const cs = cell.colSpan ?? 1; const rs = cell.rowSpan ?? 1; return { x: template.padding + cell.col * (unitW + template.gap), y: template.padding + cell.row * (unitH + template.gap), w: cs * unitW + (cs - 1) * template.gap, h: rs * unitH + (rs - 1) * template.gap }; }
const MINIMAL: PhotoboothTemplate[] = [
  { id: "classic-4", name: "Classic 4", desc: "The classic long strip with 4 shots stacked", category: "minimal", shots: 4, cols: 1, rows: 4, stripWidth: 600, stripHeight: 1784, gap: 16, padding: 24, footerHeight: 80 },
  { id: "trio-3", name: "Trio 3", desc: "A compact, cute 3-shot long strip", category: "minimal", shots: 3, cols: 1, rows: 3, stripWidth: 600, stripHeight: 1402, gap: 16, padding: 24, footerHeight: 80 },
  { id: "duo-wide", name: "Duo Wide", desc: "2 wide shots — perfect for couples / besties", category: "minimal", shots: 2, cols: 2, rows: 1, stripWidth: 1200, stripHeight: 554, gap: 16, padding: 24, footerHeight: 80 },
  { id: "square-4", name: "Square 4", desc: "4 shots in a 2x2 grid, social-ready", category: "minimal", shots: 4, cols: 2, rows: 2, stripWidth: 900, stripHeight: 770, gap: 16, padding: 24, footerHeight: 80 },
  { id: "six-grid", name: "Six Grid", desc: "6 shots in a 2x3 grid — capture every moment", category: "minimal", shots: 6, cols: 2, rows: 3, stripWidth: 900, stripHeight: 1099, gap: 16, padding: 24, footerHeight: 80 },
];
const DARK: PhotoboothTemplate[] = [
  { id: "dark-strip-3", name: "Dark Strip 3", desc: "Layout A/B — 3-shot black strip, like a real booth print", category: "dark", shots: 3, cols: 1, rows: 3, stripWidth: 600, stripHeight: 1450, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
  { id: "dark-strip-4", name: "Dark Strip 4", desc: "Layout C/D — 4-shot black strip", category: "dark", shots: 4, cols: 1, rows: 4, stripWidth: 600, stripHeight: 1850, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
  { id: "dark-feature-4", name: "Dark Feature 4", desc: "Layout E — one photo top-left, text panel top-right, 3 photos below", category: "dark", shots: 4, cols: 3, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }], panel: { col: 1, row: 0, colSpan: 2 }, defaultFrameId: "black" },
  { id: "dark-grid-4", name: "Dark Grid 4", desc: "Layout F — 4 photos in a 2x2 grid on a 6x4 black print", category: "dark", shots: 4, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
  { id: "dark-trio-panel", name: "Dark Trio Panel", desc: "Layout G — 2 photos on top, 1 photo + text panel below", category: "dark", shots: 3, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 0, row: 1 }], panel: { col: 1, row: 1 }, defaultFrameId: "black" },
  { id: "dark-trio-alt", name: "Dark Trio Alt", desc: "Layout H — text panel top-right, 1 photo top-left, 2 below", category: "dark", shots: 3, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }], panel: { col: 1, row: 0 }, defaultFrameId: "black" },
  { id: "dark-duo-panel", name: "Dark Duo Panel", desc: "Layout I — 2 photos stacked on the left, tall text panel on the right", category: "dark", shots: 2, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 0, row: 1 }], panel: { col: 1, row: 0, rowSpan: 2 }, defaultFrameId: "black" },
  { id: "dark-duo-header", name: "Dark Duo Header", desc: "Layout J — text panel on top, 2 wide photos below", category: "dark", shots: 2, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 1 }, { col: 1, row: 1 }], panel: { col: 0, row: 0, colSpan: 2 }, defaultFrameId: "black" },
  { id: "dark-duo-portrait", name: "Dark Duo Portrait", desc: "Layout K — portrait 6x4 print, 2 photos stacked", category: "dark", shots: 2, cols: 1, rows: 2, stripWidth: 800, stripHeight: 1200, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
  { id: "dark-single", name: "Dark Single", desc: "Layout L — one big photo on a 6x4 black print", category: "dark", shots: 1, cols: 1, rows: 1, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
];
const FESTIVAL: PhotoboothTemplate[] = [
  { id: "christmas-strip", name: "Christmas Strip", desc: "4-shot strip in a festive red frame", category: "festival", shots: 4, cols: 1, rows: 4, stripWidth: 600, stripHeight: 1784, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "festive-red" },
  { id: "valentine-duo", name: "Valentine Duo", desc: "2 wide shots in a blush pink frame", category: "festival", shots: 2, cols: 2, rows: 1, stripWidth: 1200, stripHeight: 554, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "blush" },
  { id: "halloween-grid", name: "Halloween Grid", desc: "4 shots in a 2x2 grid, black + orange frame feel", category: "festival", shots: 4, cols: 2, rows: 2, stripWidth: 900, stripHeight: 770, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "black" },
  { id: "newyear-feature", name: "New Year Feature", desc: "Layout E style in a gold frame — celebrate the new year", category: "festival", shots: 4, cols: 3, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }], panel: { col: 1, row: 0, colSpan: 2 }, defaultFrameId: "gold" },
  { id: "songkran-trio", name: "Songkran Trio", desc: "3-shot strip in a splash blue frame", category: "festival", shots: 3, cols: 1, rows: 3, stripWidth: 600, stripHeight: 1402, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "sky" },
];
const MEME: PhotoboothTemplate[] = [
  { id: "pet-strip", name: "Pet Strip", desc: "4-shot strip for you + your dog or cat", category: "meme", shots: 4, cols: 1, rows: 4, stripWidth: 600, stripHeight: 1784, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "cream" },
  { id: "pet-duo", name: "Pet Duo", desc: "2 wide shots — you and your pet side by side", category: "meme", shots: 2, cols: 2, rows: 1, stripWidth: 1200, stripHeight: 554, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "cream" },
  { id: "pet-grid", name: "Pet Grid", desc: "4 shots in a 2x2 grid — every silly face counts", category: "meme", shots: 4, cols: 2, rows: 2, stripWidth: 900, stripHeight: 770, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "mint" },
  { id: "pet-trio-panel", name: "Pet Trio Panel", desc: "Layout H style — 3 shots + a panel for your pet's name", category: "meme", shots: 3, cols: 2, rows: 2, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 0, cells: [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }], panel: { col: 1, row: 0 }, defaultFrameId: "lavender" },
  { id: "pet-single", name: "Pet Single", desc: "One big shot — your pet is the star", category: "meme", shots: 1, cols: 1, rows: 1, stripWidth: 1200, stripHeight: 800, gap: 16, padding: 24, footerHeight: 80, defaultFrameId: "blush" },
];
export const TEMPLATES: PhotoboothTemplate[] = [...MINIMAL, ...DARK, ...FESTIVAL, ...MEME];
export const FILTERS: PhotoFilter[] = [
  { id: "original", name: "Original", css: "none" },
  { id: "pastel-pink", name: "Pastel Pink", css: "sepia(0.25) saturate(1.4) hue-rotate(300deg) brightness(1.08)" },
  { id: "warm", name: "Warm Glow", css: "sepia(0.3) saturate(1.3) brightness(1.06)" },
  { id: "cool", name: "Cool Tone", css: "saturate(1.1) hue-rotate(15deg) brightness(1.02) contrast(0.95)" },
  { id: "mono", name: "Mono", css: "grayscale(1) contrast(1.05)" },
  { id: "vintage", name: "Vintage Film", css: "sepia(0.5) contrast(0.9) brightness(1.05)" },
  { id: "vivid", name: "Vivid Pop", css: "saturate(1.6) contrast(1.1)" },
  { id: "soft", name: "Soft Dream", css: "brightness(1.12) saturate(0.9) contrast(0.9)" },
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
export function frameById(id?: string): FrameColor { return FRAME_COLORS.find((c) => c.id === id) ?? FRAME_COLORS[0]; }
function isDarkHex(hex: string): boolean { const h = hex.replace("#", ""); const r = parseInt(h.slice(0, 2), 16); const g = parseInt(h.slice(2, 4), 16); const b = parseInt(h.slice(4, 6), 16); return (r * 0.299 + g * 0.587 + b * 0.114) / 255 < 0.5; }
function loadImage(src: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Failed to load image")); img.src = src; }); }
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) { const imgRatio = img.width / img.height; const boxRatio = w / h; let sw = img.width; let sh = img.height; let sx = 0; let sy = 0; if (imgRatio > boxRatio) { sw = img.height * boxRatio; sx = (img.width - sw) / 2; } else { sh = img.width / boxRatio; sy = (img.height - sh) / 2; } ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); }
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export interface ComposeOptions { photos: string[]; template: PhotoboothTemplate; filter: PhotoFilter; frameColor: FrameColor; dateLocale?: string; }
export async function composeStrip({ photos, template, filter, frameColor, dateLocale = "en-US" }: ComposeOptions): Promise<string> {
  const canvas = document.createElement("canvas"); canvas.width = template.stripWidth; canvas.height = template.stripHeight; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not create canvas");
  ctx.fillStyle = frameColor.hex; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const photoAreaWidth = template.stripWidth - template.padding * 2; const photoAreaHeight = template.stripHeight - template.padding * 2 - template.footerHeight;
  const unitW = (photoAreaWidth - template.gap * (template.cols - 1)) / template.cols; const unitH = (photoAreaHeight - template.gap * (template.rows - 1)) / template.rows;
  const images = await Promise.all(photos.map((src) => loadImage(src))); const cells = photoCells(template);
  images.forEach((img, i) => { const cell = cells[i]; if (!cell) return; const { x, y, w, h } = cellRect(template, cell, unitW, unitH); ctx.save(); roundRectPath(ctx, x, y, w, h, 18); ctx.clip(); try { (ctx as CanvasRenderingContext2D & { filter?: string }).filter = filter.css === "none" ? "none" : filter.css; } catch { /* older browsers ignore ctx.filter */ } drawCover(ctx, img, x, y, w, h); ctx.restore(); });
  const dateText = new Date().toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" }); const textColor = isDarkHex(frameColor.hex) ? "#ffffff" : "#be185d";
  if (template.panel) { const { x, y, w, h } = cellRect(template, template.panel, unitW, unitH); ctx.fillStyle = textColor; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "700 44px sans-serif"; ctx.fillText("♡  photobooth  ♡", x + w / 2, y + h / 2 - 22); ctx.font = "600 26px sans-serif"; ctx.fillText(dateText, x + w / 2, y + h / 2 + 26); } else if (template.footerHeight > 0) { ctx.fillStyle = textColor; ctx.font = "600 26px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`♡  photobooth  •  ${dateText}  ♡`, template.stripWidth / 2, template.stripHeight - template.footerHeight / 2); }
  return canvas.toDataURL("image/png");
}
