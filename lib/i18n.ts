export type Language = "en" | "th";

export interface Dict {
  tagline: string;
  privacyNote: string;
  steps: [string, string, string];
  chooseTemplateTitle: string;
  chooseTemplateDesc: string;
  goToCamera: string;
  selected: string;
  shots: string;
  frameNote: string;
  cameraTitle: string;
  cameraDesc: string;
  cameraOpening: string;
  cameraError: string;
  retryCamera: string;
  shootingAuto: string;
  captured: string;
  ready: string;
  taken: string;
  remaining: string;
  shotOf: string;
  startShoot: string;
  shootMore: string;
  changeTemplate: string;
  retakeLast: string;
  noCameraUpload: string;
  shotLabel: string;
  resultTitle: string;
  resultDesc: string;
  composing: string;
  filterTitle: string;
  frameTitle: string;
  download: string;
  share: string;
  shareFallback: string;
  shareText: string;
  saveToPhotosHint: string;
  retakeAll: string;
  restart: string;
  templateDesc: Record<string, string>;
  frameColorName: Record<string, string>;
  categoryAll: string;
  categoryNames: Record<string, string>;
  categoryDesc: Record<string, string>;
  categoryTitle: string;
  categoryDescText: string;
  backToCategories: string;
  captionTitle: string;
  captionPlaceholder: string;
  captionFontTitle: string;
  captionSizeTitle: string;
  footerTextTitle: string;
  footerTextPlaceholder: string;
  includeDate: string;
  fontDefault: string;
  customColorTitle: string;
  hueTitle: string;
  templates: string;
  textPositionTitle: string;
  dragTextHint: string;
  resetPosition: string;
  stickerTitle: string;
  stickerPlaceholder: string;
  addSticker: string;
  stickerHint: string;
  stickerSizeTitle: string;
  removeSticker: string;
}

export const translations: Record<Language, Dict> = {
  en: {
    tagline: "A cute, minimal photobooth — right on your phone or iPad.",
    privacyNote: "All photos are processed on your device only. Nothing is uploaded or stored on a server.",
    steps: ["Choose template", "Take photos", "Edit & download"],
    chooseTemplateTitle: "1. Choose a template",
    chooseTemplateDesc: "Pick a strip style just like a real photobooth, then let's take some photos.",
    goToCamera: "Go to camera",
    selected: "Selected",
    shots: "shots",
    frameNote: "You can pick a frame color later — pastel, dark, and festive frames to choose from.",
    cameraTitle: "2. Take photos",
    cameraDesc: "Tap start and the camera will count down 3-2-1, then shoot continuously until all shots are done — just like a real booth.",
    cameraOpening: "Opening camera…",
    cameraError: "Couldn't open the camera — please allow camera access, or upload photos instead below.",
    retryCamera: "Try camera again",
    shootingAuto: "Shooting automatically… hold that smile ♡",
    captured: "Got it!",
    ready: "Ready to shoot",
    taken: "taken",
    remaining: "left",
    shotOf: "Shot",
    startShoot: "Start shooting",
    shootMore: "Shoot more",
    changeTemplate: "← Change template",
    retakeLast: "↺ Retake last shot",
    noCameraUpload: "No camera? Upload photos instead",
    shotLabel: "Shot",
    resultTitle: "3. Edit & download",
    resultDesc: "Try different filters and frame colors — the preview updates instantly.",
    composing: "Composing your strip…",
    filterTitle: "Filter / Tone",
    frameTitle: "Frame color",
    download: "Download photo (PNG)",
    share: "↗ Share photo (opens your device's share menu on mobile)",
    shareFallback: "This device can't share files directly, so I downloaded the photo for you instead.",
    shareText: "Our photobooth photo ♡",
    saveToPhotosHint: "On iPhone/iPad the photo opens in a new tab — long-press it (or tap Share) and choose Save to Photos.",
    retakeAll: "↺ Retake all",
    restart: "♡ Start over / Change template",
    templateDesc: { "classic-4": "The classic long strip with 4 shots stacked", "trio-3": "A compact, cute 3-shot long strip", "duo-wide": "2 wide shots — perfect for couples / besties", "square-4": "4 shots in a 2x2 grid, social-ready", "six-grid": "6 shots in a 2x3 grid — capture every moment", "dark-strip-3": "Layout A/B — 3-shot black strip, like a real booth print", "dark-strip-4": "Layout C/D — 4-shot black strip", "dark-feature-4": "Layout E — one photo top-left, text panel top-right, 3 below", "dark-grid-4": "Layout F — 4 photos in a 2x2 grid on a 6x4 black print", "dark-trio-panel": "Layout G — 2 photos on top, 1 photo + text panel below", "dark-trio-alt": "Layout H — text panel top-right, 1 photo top-left, 2 below", "dark-duo-panel": "Layout I — 2 photos stacked left, tall text panel right", "dark-duo-header": "Layout J — text panel on top, 2 wide photos below", "dark-duo-portrait": "Layout K — portrait 6x4 print, 2 photos stacked", "dark-single": "Layout L — one big photo on a 6x4 black print", "christmas-strip": "4-shot strip in a festive red frame", "valentine-duo": "2 wide shots in a blush pink frame", "halloween-grid": "4 shots in a 2x2 grid, black + orange frame feel", "newyear-feature": "Layout E style in a gold frame — celebrate the new year", "songkran-trio": "3-shot strip in a splash blue frame", "pet-strip": "4-shot strip for you + your dog or cat", "pet-duo": "2 wide shots — you and your pet side by side", "pet-grid": "4 shots in a 2x2 grid — every silly face counts", "pet-trio-panel": "Layout H style — 3 shots + a panel for your pet's name", "pet-single": "One big shot — your pet is the star", "polaroid-classic": "One big photo with a blank white space below for your own caption", "polaroid-duo": "Two photos stacked with a caption space below, like two Polaroids in one" },
    frameColorName: { white: "White", blush: "Pastel pink", cream: "Cream", mint: "Mint", lavender: "Lavender", sky: "Pastel blue", black: "Black", "festive-red": "Festive red", "holly-green": "Holly green", pumpkin: "Pumpkin orange", gold: "Gold", custom: "Custom" },
    categoryAll: "All",
    templates: "templates",
    categoryNames: { minimal: "Minimal", dark: "Dark Booth", festival: "Festival", meme: "Meme Pets", polaroid: "Polaroid" },
    categoryDesc: { minimal: "Clean, cute, pastel strips", dark: "Real booth prints with a black frame", festival: "Seasonal frames for every occasion", meme: "Silly shots with your dog or cat", polaroid: "Big photo + space for your own caption" },
    categoryTitle: "Choose a category",
    categoryDescText: "Pick a style first — then choose a template inside it.",
    backToCategories: "← All categories",
    captionTitle: "Polaroid caption",
    captionPlaceholder: "Write something cute here… (leave blank for a blank Polaroid)",
    captionFontTitle: "Caption font",
    captionSizeTitle: "Text size",
    footerTextTitle: "Strip text",
    footerTextPlaceholder: "Type your own text…",
    includeDate: "Include date",
    fontDefault: "Default",
    customColorTitle: "Custom color",
    hueTitle: "Slide to adjust hue",
    textPositionTitle: "Text position",
    dragTextHint: "Drag the text on the photo to move it, or use the sliders below.",
    resetPosition: "Reset position",
    stickerTitle: "Emoji stickers",
    stickerPlaceholder: "Type an emoji from your keyboard…",
    addSticker: "Add",
    stickerHint: "Tap a sticker on the photo to select it, drag to move it, pinch with two fingers to resize.",
    stickerSizeTitle: "Sticker size",
    removeSticker: "Remove selected sticker",
  },
  th: {
    tagline: "โฟโต้บูธแนวมินิมอลน่ารัก ๆ ถ่ายได้เลยบนมือถือหรือไอแพด",
    privacyNote: "รูปทั้งหมดประมวลผลบนเครื่องของคุณเท่านั้น ไม่มีการอัปโหลดหรือเก็บไว้บนเซิร์ฟเวอร์",
    steps: ["เลือกเทมเพลต", "ถ่ายรูป", "แต่งรูป & ดาวน์โหลด"],
    chooseTemplateTitle: "1. เลือกเทมเพลต",
    chooseTemplateDesc: "เลือกสไตล์แถบรูปเหมือนตู้โฟโต้บูธจริง แล้วค่อยไปถ่ายรูปกัน",
    goToCamera: "ไปถ่ายรูป",
    selected: "เลือกแล้ว",
    shots: "ช็อต",
    frameNote: "สีกรอบเลือกได้อีกทีตอนแต่งรูป — มีทั้งพาสเทล สีเข้ม และสีเทศกาล",
    cameraTitle: "2. ถ่ายรูป",
    cameraDesc: "กดเริ่มถ่าย กล้องจะนับถอยหลัง 3-2-1 แล้วถ่ายต่อเนื่องจนครบจำนวนช็อต เหมือนตู้จริงเลย",
    cameraOpening: "กำลังเปิดกล้อง…",
    cameraError: "เปิดกล้องไม่ได้ — กรุณาอนุญาตให้เว็บใช้กล้อง (หรือเลือกอัปโหลดรูปแทนด้านล่าง)",
    retryCamera: "ลองเปิดกล้องอีกครั้ง",
    shootingAuto: "กำลังถ่ายอัตโนมัติ… อย่าเพิ่งขยับนะ ♡",
    captured: "ได้รูปแล้ว!",
    ready: "พร้อมถ่ายแล้ว",
    taken: "ถ่ายแล้ว",
    remaining: "เหลือ",
    shotOf: "ช็อตที่",
    startShoot: "เริ่มถ่ายเลย",
    shootMore: "ถ่ายต่ออีก",
    changeTemplate: "← เปลี่ยนเทมเพลต",
    retakeLast: "↺ ถ่ายช็อตสุดท้ายใหม่",
    noCameraUpload: "ไม่มีกล้อง? อัปโหลดรูปจากเครื่องแทน",
    shotLabel: "ช็อตที่",
    resultTitle: "3. แต่งรูป & ดาวน์โหลด",
    resultDesc: "ลองเปลี่ยนฟิลเตอร์กับสีกรอบได้เลย พรีวิวจะอัปเดตทันที",
    composing: "กำลังประกอบแถบรูป…",
    filterTitle: "ฟิลเตอร์ / โทนสี",
    frameTitle: "สีกรอบ",
    download: "⬇️ ดาวน์โหลดรูป (PNG)",
    share: "↗ แชร์รูป (บนมือถือจะเปิดเมนูแชร์ของเครื่อง)",
    shareFallback: "อุปกรณ์นี้แชร์ไฟล์ตรง ๆ ไม่ได้ เลยดาวน์โหลดรูปให้แทนแล้ว",
    shareText: "รูปโฟโต้บูธของเรา ♡",
    saveToPhotosHint: "บน iPhone/iPad รูปจะเปิดในแท็บใหม่ — กดค้างที่รูป (หรือกด Share) แล้วเลือก Save to Photos / บันทึกรูปภาพ",
    retakeAll: "↺ ถ่ายใหม่ทั้งหมด",
    restart: "♡ เริ่มใหม่ / เปลี่ยนเทมเพลต",
    templateDesc: { "classic-4": "แถบยาว 4 ช็อต แบบตู้คลาสสิก", "trio-3": "แถบยาว 3 ช็อต กระชับ น่ารัก", "duo-wide": "2 ช็อตแนวนอน สำหรับคู่รัก / เพื่อนซี้", "square-4": "4 ช็อตตาราง 2x2 โพสต์ลงโซเชียลพอดี", "six-grid": "6 ช็อตตาราง 2x3 เก็บทุกโมเมนต์", "dark-strip-3": "Layout A/B — แถบดำ 3 ช็อต แบบงานพิมพ์ตู้จริง", "dark-strip-4": "Layout C/D — แถบดำ 4 ช็อต", "dark-feature-4": "Layout E — รูปใหญ่ซ้ายบน ช่องข้อความขวาบน รูปเล็ก 3 ช็อตข้างล่าง", "dark-grid-4": "Layout F — 4 ช็อตตาราง 2x2 บนงานพิมพ์ 6x4 กรอบดำ", "dark-trio-panel": "Layout G — รูป 2 ช็อตบน รูป 1 ช็อต + ช่องข้อความข้างล่าง", "dark-trio-alt": "Layout H — ช่องข้อความขวาบน รูปซ้ายบน รูป 2 ช็อตข้างล่าง", "dark-duo-panel": "Layout I — รูป 2 ช็อตซ้อนซ้าย ช่องข้อความสูงทางขวา", "dark-duo-header": "Layout J — ช่องข้อความด้านบน รูปแนวนอน 2 ช็อตข้างล่าง", "dark-duo-portrait": "Layout K — งานพิมพ์แนวตั้ง 6x4 รูปซ้อน 2 ช็อต", "dark-single": "Layout L — รูปใหญ่ 1 ช็อตบนงานพิมพ์ 6x4 กรอบดำ", "christmas-strip": "แถบ 4 ช็อตในกรอบแดงเทศกาล", "valentine-duo": "รูปแนวนอน 2 ช็อตในกรอบชมพู", "halloween-grid": "4 ช็อตตาราง 2x2 ฟีลกรอบดำ + ส้ม", "newyear-feature": "สไตล์ Layout E ในกรอบทอง ฉลองปีใหม่", "songkran-trio": "แถบ 3 ช็อตในกรอบฟ้าสาดน้ำ", "pet-strip": "แถบ 4 ช็อตสำหรับคุณ + หมาแมว", "pet-duo": "รูปแนวนอน 2 ช็อต คุณกับสัตว์เลี้ยงข้างกัน", "pet-grid": "4 ช็อตตาราง 2x2 เก็บทุกหน้าตลก", "pet-trio-panel": "สไตล์ Layout H — 3 ช็อต + ช่องใส่ชื่อสัตว์เลี้ยง", "pet-single": "รูปใหญ่ 1 ช็อต สัตว์เลี้ยงเป็นพระเอก", "polaroid-classic": "รูปใหญ่ 1 ช็อต มีช่องว่างสีขาวด้านล่างให้เขียนข้อความเอง", "polaroid-duo": "รูปซ้อน 2 ช็อต มีช่องเขียนข้อความด้านล่าง เหมือนโพลารอยด์ 2 ใบในภาพเดียว" },
    frameColorName: { white: "ขาว", blush: "ชมพูพาสเทล", cream: "ครีม", mint: "มิ้นต์", lavender: "ลาเวนเดอร์", sky: "ฟ้าพาสเทล", black: "ดำ", "festive-red": "แดงเทศกาล", "holly-green": "เขียวฮอลลี่", pumpkin: "ส้มฟักทอง", gold: "ทอง", custom: "กำหนดเอง" },
    categoryAll: "ทั้งหมด",
    templates: "แบบ",
    categoryNames: { minimal: "มินิมอล", dark: "ตู้ดำคลาสสิก", festival: "เทศกาล", meme: "มีมหมาแมว", polaroid: "โพลารอยด์" },
    categoryDesc: { minimal: "แถบเรียบ ๆ น่ารัก โทนพาสเทล", dark: "งานพิมพ์ตู้จริง กรอบดำ", festival: "กรอบตามเทศกาลต่าง ๆ", meme: "ถ่ายตลก ๆ กับหมาแมว", polaroid: "รูปใหญ่ + ช่องว่างเขียนข้อความเอง" },
    categoryTitle: "เลือกหมวดหมู่",
    categoryDescText: "เลือกสไตล์ก่อน แล้วค่อยเลือกเทมเพลตข้างในหมวดนั้น",
    backToCategories: "← หมวดหมู่ทั้งหมด",
    captionTitle: "ข้อความโพลารอยด์",
    captionPlaceholder: "พิมพ์ข้อความน่ารัก ๆ ตรงนี้… (เว้นว่างไว้ก็ได้ จะได้โพลารอยด์เปล่า ๆ)",
    captionFontTitle: "ฟอนต์ข้อความ",
    captionSizeTitle: "ขนาดข้อความ",
    footerTextTitle: "ข้อความบนแถบรูป",
    footerTextPlaceholder: "พิมพ์ข้อความของคุณ…",
    includeDate: "ใส่ วันที่",
    fontDefault: "ค่าเริ่มต้น",
    customColorTitle: "เลือกสีเอง",
    hueTitle: "รูดเพื่อปรับเฉดสี",
    textPositionTitle: "ตำแหน่งข้อความ",
    dragTextHint: "ลากข้อความบนรูปเพื่อย้ายตำแหน่ง หรือรูดสไลด์ด้านล่าง",
    resetPosition: "รีเซ็ตตำแหน่ง",
    stickerTitle: "สติกเกอร์อีโมจิ",
    stickerPlaceholder: "พิมพ์อีโมจิจากคีย์บอร์ดเครื่อง…",
    addSticker: "เพิ่ม",
    stickerHint: "แตะสติกเกอร์บนรูปเพื่อเลือก ลากเพื่อย้ายตำแหน่ง ใช้สองนิ้วบีบเพื่อปรับขนาด",
    stickerSizeTitle: "ขนาดสติกเกอร์",
    removeSticker: "ลบสติกเกอร์ที่เลือก",
  },
};
