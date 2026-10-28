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
  templates: string;
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
  cropTitle: string;
  cropHint: string;
  cropZoom: string;
  cropConfirm: string;
  cropUseOriginal: string;
  cropCancel: string;
  cropError: string;
  tapToRecrop: string;
  shotLabel: string;
  resultTitle: string;
  resultDesc: string;
  composing: string;
  filterTitle: string;
  filterGroup: Record<string, string>;
  frameTitle: string;
  tabFilterFrame: string;
  tabTextFonts: string;
  tabStickers: string;
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
  textPositionTitle: string;
  dragTextHint: string;
  resetPosition: string;
  stickerTitle: string;
  stickerPlaceholder: string;
  addSticker: string;
  stickerHint: string;
  stickerSizeTitle: string;
  stickerRotateTitle: string;
  removeSticker: string;
  textColorTitle: string;
  textColorAuto: string;
  catStickerTitle: string;
  catStickerHint: string;
}

export const translations: Record<Language, Dict> = {
  en: {
    tagline: "A cute, minimal photobooth — right on your phone or iPad.",
    privacyNote:
      "All photos are processed on your device only. Nothing is uploaded or stored on a server.",
    steps: ["Choose template", "Take photos", "Edit & download"],
    chooseTemplateTitle: "1. Choose a template",
    chooseTemplateDesc:
      "Pick a strip style just like a real photobooth, then let's take some photos.",
    goToCamera: "Go to camera",
    selected: "Selected",
    shots: "shots",
    templates: "templates",
    frameNote: "You can pick a frame color later — pastel, dark, and festive frames to choose from.",
    cameraTitle: "2. Take photos",
    cameraDesc:
      "Tap start and the camera will count down 3-2-1, then shoot continuously until all shots are done — just like a real booth.",
    cameraOpening: "Opening camera…",
    cameraError:
      "Couldn't open the camera — please allow camera access, or upload photos instead below.",
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
    noCameraUpload: "Upload photos instead",
    cropTitle: "Crop your photo",
    cropHint: "Drag to move, pinch or slide to zoom — the frame matches the photo slot in your template.",
    cropZoom: "Zoom",
    cropConfirm: "Use this crop",
    cropUseOriginal: "Use full photo without cropping",
    cropCancel: "Cancel",
    cropError: "Couldn't load this photo",
    tapToRecrop: "Tap a photo to crop that shot again",
    shotLabel: "Shot",
    resultTitle: "3. Edit & download",
    resultDesc:
      "Try different filters and frame colors — the preview updates instantly.",
    composing: "Composing your strip…",
    filterTitle: "Filter / Tone",
    filterGroup: {
      classic: "Classic",
      analog: "Analog & Film",
      digicam: "Y2K Digi-cam",
      mood: "Mood",
      glitch: "Experimental",
    },
    frameTitle: "Frame color",
    tabFilterFrame: "Filter & Frame",
    tabTextFonts: "Text & Fonts",
    tabStickers: "Stickers",
    download: "Download photo (PNG)",
    share: "↗ Share photo",
    shareFallback: "This device can't share files directly, so I downloaded the photo for you instead.",
    shareText: "Our photobooth photo ♡",
    saveToPhotosHint:
      "On iPhone/iPad the photo opens in a new tab — long-press it (or tap Share) and choose Save to Files to save it in Files, or Save to Photos.",
    retakeAll: "↺ Retake all",
    restart: "♡ Start over",
    templateDesc: {
      "classic-4": "The classic long strip with 4 shots stacked",
      "trio-3": "A compact, cute 3-shot long strip",
      "duo-wide": "2 wide shots — perfect for couples / besties",
      "square-4": "4 shots in a 2x2 grid, social-ready",
      "six-grid": "6 shots in a 2x3 grid — capture every moment",
      "dark-strip-3": "Layout A/B — 3-shot black strip, like a real booth print",
      "dark-strip-4": "Layout C/D — 4-shot black strip",
      "dark-feature-4": "Layout E — one photo top-left, text panel top-right, 3 below",
      "dark-grid-4": "Layout F — 4 photos in a 2x2 grid on a 6x4 black print",
      "dark-trio-panel": "Layout G — 2 photos on top, 1 photo + text panel below",
      "dark-trio-alt": "Layout H — text panel top-right, 1 photo top-left, 2 below",
      "dark-duo-panel": "Layout I — 2 photos stacked left, tall text panel right",
      "dark-duo-header": "Layout J — text panel on top, 2 wide photos below",
      "dark-duo-portrait": "Layout K — portrait 6x4 print, 2 photos stacked",
      "dark-single": "Layout L — one big photo on a 6x4 black print",
      "christmas-strip": "4-shot strip in a festive red frame",
      "valentine-duo": "2 wide shots in a blush pink frame",
      "halloween-grid": "4 shots in a 2x2 grid, black + orange frame feel",
      "newyear-feature": "Layout E style in a gold frame — celebrate the new year",
      "songkran-trio": "3-shot strip in a splash blue frame",
      "pet-strip": "4-shot strip for you + your dog or cat",
      "pet-duo": "2 wide shots — you and your pet side by side",
      "pet-grid": "4 shots in a 2x2 grid — every silly face counts",
      "pet-trio-panel": "Layout H style — 3 shots + a panel for your pet's name",
      "pet-single": "One big shot — your pet is the star",
      "polaroid-classic": "One big photo with a blank white space below for your own caption",
      "polaroid-duo": "Two photos stacked with a caption space below, like two Polaroids in one",
      "ed-cover": "Magazine cover, one tilted 4:5 portrait",
      "ed-duo": "Asymmetric spread, big + small overlapping photos",
      "ed-trio": "Editorial grid, wide top photo + two squares",
      "dr-cloud": "Two soft blob photos on a pastel gradient",
      "dr-heart": "Heart photo + circle photo, pastel dream",
      "dr-boba": "Three circle photos in a playful triangle",
      "ar-film": "35mm film strip, 4 wide cinematic frames",
      "ar-receipt": "Receipt strip, 3 photos with barcode",
      "ar-stamp": "Postage stamp photo with postmark",
      "cy-window": "Tilted OS windows with title bars, Y2K pop",
      "cy-pixel": "Arch photo with pixel confetti, year 2000",
    },
    frameColorName: {
      white: "White",
      blush: "Pastel pink",
      cream: "Cream",
      mint: "Mint",
      lavender: "Lavender",
      sky: "Pastel blue",
      black: "Black",
      "festive-red": "Festive red",
      "holly-green": "Holly green",
      pumpkin: "Pumpkin orange",
      gold: "Gold",
      custom: "Custom",
    },
    categoryAll: "All",
    categoryNames: {
      minimal: "Minimal",
      dark: "Dark Booth",
      polaroid: "Polaroid",
      y2k: "Y2K",
      kawaii: "Kawaii",
      story: "Story",
      photocard: "Photocard",
      halloween: "Halloween",
      editorial: "Editorial",
      dream: "Dream Pop",
      archive: "Archive",
      cyber: "Cyber Pop",
    },
    categoryDesc: {
      minimal: "Clean, cute, pastel strips",
      dark: "Real booth prints with a black frame",
      polaroid: "Big photo + space for your own caption",
      y2k: "Bold Y2K strips in black and white",
      kawaii: "Cute doodle grids with 6 shots",
      story: "Tall grid story frame with 3 shots",
      photocard: "Checker photocard frame with 6 shots",
      halloween: "Spooky skull cards and Halloween frames, 1 shot each",
      editorial: "Magazine-minimal layouts, big type, asymmetric grids",
      dream: "Soft pastel gradients, cloud blobs and heart shapes",
      archive: "35mm film strips, receipts and postage stamps",
      cyber: "Tilted pop windows, pixel sparkles, Y2K chrome",
    },
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
    stickerHint: "Tap a sticker on the photo to select it, drag to move it, pinch with two fingers to resize and rotate. One finger on the sticker and the other anywhere on the photo works too. Tap × on a selected sticker to remove it.",
    stickerSizeTitle: "Sticker size",
    stickerRotateTitle: "Sticker rotation",
    removeSticker: "Remove selected sticker",
    textColorTitle: "Text color",
    textColorAuto: "Auto",
    catStickerTitle: "Cat stickers",
    catStickerHint: "Tap a cat to place it on the photo.",
  },
  th: {
    tagline: "โฟโต้บูธแนวมินิมอลน่ารัก ๆ ถ่ายได้เลยบนมือถือหรือไอแพด",
    privacyNote:
      "รูปทั้งหมดประมวลผลบนเครื่องของคุณเท่านั้น ไม่มีการอัปโหลดหรือเก็บไว้บนเซิร์ฟเวอร์",
    steps: ["เลือกเทมเพลต", "ถ่ายรูป", "แต่งรูป & ดาวน์โหลด"],
    chooseTemplateTitle: "1. เลือกเทมเพลต",
    chooseTemplateDesc:
      "เลือกสไตล์แถบรูปเหมือนตู้โฟโต้บูธจริง แล้วค่อยไปถ่ายรูปกัน",
    goToCamera: "ไปถ่ายรูป",
    selected: "เลือกแล้ว",
    shots: "ช็อต",
    templates: "แบบ",
    frameNote: "สีกรอบเลือกได้อีกทีตอนแต่งรูป — มีทั้งพาสเทล สีเข้ม และสีเทศกาล",
    cameraTitle: "2. ถ่ายรูป",
    cameraDesc:
      "กดเริ่มถ่าย กล้องจะนับถอยหลัง 3-2-1 แล้วถ่ายต่อเนื่องจนครบจำนวนช็อต เหมือนตู้จริงเลย",
    cameraOpening: "กำลังเปิดกล้อง…",
    cameraError:
      "เปิดกล้องไม่ได้ — กรุณาอนุญาตให้เว็บใช้กล้อง (หรือเลือกอัปโหลดรูปแทนด้านล่าง)",
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
    noCameraUpload: "อัปโหลดรูปจากเครื่องแทน",
    cropTitle: "ครอปรูปของคุณ",
    cropHint: "ลากเพื่อเลื่อนรูป บีบหรือเลื่อนสไลด์เพื่อซูม — กรอบตรงกับช่องรูปของเทมเพลตพอดี",
    cropZoom: "ซูม",
    cropConfirm: "ใช้รูปที่ครอป",
    cropUseOriginal: "ใช้รูปเต็มโดยไม่ครอป",
    cropCancel: "ยกเลิก",
    cropError: "โหลดรูปนี้ไม่ได้",
    tapToRecrop: "แตะที่รูปเพื่อครอปช็อตนั้นใหม่อีกครั้ง",
    shotLabel: "ช็อตที่",
    resultTitle: "3. แต่งรูป & ดาวน์โหลด",
    resultDesc: "ลองเปลี่ยนฟิลเตอร์กับสีกรอบได้เลย พรีวิวจะอัปเดตทันที",
    composing: "กำลังประกอบแถบรูป…",
    filterTitle: "ฟิลเตอร์ / โทนสี",
    filterGroup: {
      classic: "คลาสสิก",
      analog: "อนาล็อก & ฟิล์ม",
      digicam: "ดิจิแคม Y2K",
      mood: "มู้ด & อารมณ์",
      glitch: "เอ็กซ์เพอริเมนต์",
    },
    frameTitle: "สีกรอบ",
    tabFilterFrame: "ฟิลเตอร์และกรอบ",
    tabTextFonts: "ข้อความและฟอนต์",
    tabStickers: "สติกเกอร์",
    download: "ดาวน์โหลดรูป (PNG)",
    share: "↗ แชร์รูป",
    shareFallback: "อุปกรณ์นี้แชร์ไฟล์ตรง ๆ ไม่ได้ เลยดาวน์โหลดรูปให้แทนแล้ว",
    shareText: "รูปโฟโต้บูธของเรา ♡",
    saveToPhotosHint:
      "บน iPhone/iPad รูปจะเปิดในแท็บใหม่ — กดค้างที่รูป (หรือกด Share) แล้วเลือก Save to Files / บันทึกไปยังไฟล์ เพื่อเก็บเข้าแอป Files หรือ Save to Photos / บันทึกรูปภาพ",
    retakeAll: "↺ ถ่ายใหม่ทั้งหมด",
    restart: "♡ เริ่มใหม่",
    templateDesc: {
      "classic-4": "แถบยาว 4 ช็อต แบบตู้คลาสสิก",
      "trio-3": "แถบยาว 3 ช็อต กระชับ น่ารัก",
      "duo-wide": "2 ช็อตแนวนอน สำหรับคู่รัก / เพื่อนซี้",
      "square-4": "4 ช็อตตาราง 2x2 โพสต์ลงโซเชียลพอดี",
      "six-grid": "6 ช็อตตาราง 2x3 เก็บทุกโมเมนต์",
      "dark-strip-3": "Layout A/B — แถบดำ 3 ช็อต แบบงานพิมพ์ตู้จริง",
      "dark-strip-4": "Layout C/D — แถบดำ 4 ช็อต",
      "dark-feature-4": "Layout E — รูปใหญ่ซ้ายบน ช่องข้อความขวาบน รูปเล็ก 3 ช็อตข้างล่าง",
      "dark-grid-4": "Layout F — 4 ช็อตตาราง 2x2 บนงานพิมพ์ 6x4 กรอบดำ",
      "dark-trio-panel": "Layout G — รูป 2 ช็อตบน รูป 1 ช็อต + ช่องข้อความข้างล่าง",
      "dark-trio-alt": "Layout H — ช่องข้อความขวาบน รูปซ้ายบน รูป 2 ช็อตข้างล่าง",
      "dark-duo-panel": "Layout I — รูป 2 ช็อตซ้อนซ้าย ช่องข้อความสูงทางขวา",
      "dark-duo-header": "Layout J — ช่องข้อความด้านบน รูปแนวนอน 2 ช็อตข้างล่าง",
      "dark-duo-portrait": "Layout K — งานพิมพ์แนวตั้ง 6x4 รูปซ้อน 2 ช็อต",
      "dark-single": "Layout L — รูปใหญ่ 1 ช็อตบนงานพิมพ์ 6x4 กรอบดำ",
      "christmas-strip": "แถบ 4 ช็อตในกรอบแดงเทศกาล",
      "valentine-duo": "รูปแนวนอน 2 ช็อตในกรอบชมพู",
      "halloween-grid": "4 ช็อตตาราง 2x2 ฟีลกรอบดำ + ส้ม",
      "newyear-feature": "สไตล์ Layout E ในกรอบทอง ฉลองปีใหม่",
      "songkran-trio": "แถบ 3 ช็อตในกรอบฟ้าสาดน้ำ",
      "pet-strip": "แถบ 4 ช็อตสำหรับคุณ + หมาแมว",
      "pet-duo": "รูปแนวนอน 2 ช็อต คุณกับสัตว์เลี้ยงข้างกัน",
      "pet-grid": "4 ช็อตตาราง 2x2 เก็บทุกหน้าตลก",
      "pet-trio-panel": "สไตล์ Layout H — 3 ช็อต + ช่องใส่ชื่อสัตว์เลี้ยง",
      "pet-single": "รูปใหญ่ 1 ช็อต สัตว์เลี้ยงเป็นพระเอก",
      "polaroid-classic": "รูปใหญ่ 1 ช็อต มีช่องว่างสีขาวด้านล่างให้เขียนข้อความเอง",
      "polaroid-duo": "รูปซ้อน 2 ช็อต มีช่องเขียนข้อความด้านล่าง เหมือนโพลารอยด์ 2 ใบในภาพเดียว",
      "ed-cover": "ปกแมกกาซีน รูปแนวตั้ง 4:5 เอียงนิด ๆ",
      "ed-duo": "เลย์เอาต์เหลื่อมกัน รูปใหญ่ + รูปเล็กซ้อนทับ",
      "ed-trio": "กริดเอดิทอเรียล รูปบนกว้าง + รูปล่างสี่เหลี่ยม 2 ช็อต",
      "dr-cloud": "รูปทรงก้อนเมฆ 2 ช็อต บนกราเดียนต์พาสเทล",
      "dr-heart": "รูปหัวใจ + รูปวงกลม ฟีลฝันพาสเทล",
      "dr-boba": "รูปวงกลม 3 ช็อต วางเป็นสามเหลี่ยมเล่น ๆ",
      "ar-film": "แถบฟิล์ม 35 มม. รูปแนวนอนซีนีม่า 4 ช็อต",
      "ar-receipt": "แถบใบเสร็จ รูป 3 ช็อต มีบาร์โค้ด",
      "ar-stamp": "รูปแสตมป์พร้อมตราประทับไปรษณีย์",
      "cy-window": "หน้าต่าง OS เอียง ๆ มีแถบชื่อหน้าต่าง สไตล์ Y2K",
      "cy-pixel": "รูปซุ้มโค้งกับคอนเฟตตี้พิกเซล ปี 2000",
    },
    frameColorName: {
      white: "ขาว",
      blush: "ชมพูพาสเทล",
      cream: "ครีม",
      mint: "มิ้นต์",
      lavender: "ลาเวนเดอร์",
      sky: "ฟ้าพาสเทล",
      black: "ดำ",
      "festive-red": "แดงเทศกาล",
      "holly-green": "เขียวฮอลลี่",
      pumpkin: "ส้มฟักทอง",
      gold: "ทอง",
      custom: "กำหนดเอง",
    },
    categoryAll: "ทั้งหมด",
    categoryNames: {
      minimal: "มินิมอล",
      dark: "ตู้ดำคลาสสิก",
      polaroid: "โพลารอยด์",
      y2k: "Y2K",
      kawaii: "คาวาอี้",
      story: "สตอรี่",
      photocard: "โฟโต้การ์ด",
      halloween: "ฮาโลวีน",
      editorial: "เอดิทอเรียล",
      dream: "ดรีมป๊อป",
      archive: "อาร์ไคฟ์",
      cyber: "ไซเบอร์ป๊อป",
    },
    categoryDesc: {
      minimal: "แถบเรียบ ๆ น่ารัก โทนพาสเทล",
      dark: "งานพิมพ์ตู้จริง กรอบดำ",
      polaroid: "รูปใหญ่ + ช่องว่างเขียนข้อความเอง",
      y2k: "แถบสไตล์ Y2K สีดำและขาว",
      kawaii: "กรอบลายดูเดิลน่ารัก ถ่ายได้ 6 ช็อต",
      story: "กรอบสตอรี่แนวตั้งลายตาราง ถ่ายได้ 3 ช็อต",
      photocard: "กรอบโฟโต้การ์ดลายตาราง ถ่ายได้ 6 ช็อต",
      halloween: "การ์ดกะโหลกและกรอบฮาโลวีนสุดหลอน ถ่ายได้ 1 ช็อต",
      editorial: "เลย์เอาต์แมกกาซีนมินิมอล ตัวหนังสือแน่น กริดเหลื่อมกัน",
      dream: "กราเดียนต์พาสเทลนุ่ม ๆ ทรงก้อนเมฆและหัวใจ",
      archive: "แถบฟิล์ม 35 มม. ใบเสร็จ และแสตมป์",
      cyber: "หน้าต่างป๊อปเอียง ๆ ประกายพิกเซล สไตล์ Y2K",
    },
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
    stickerHint: "แตะสติกเกอร์บนรูปเพื่อเลือก ลากเพื่อย้ายตำแหน่ง ใช้สองนิ้วบีบเพื่อปรับขนาดและหมุน นิ้วนึงอยู่บนสติกเกอร์ อีกนิ้วแตะตรงไหนของรูปก็ได้ แตะ × ที่สติกเกอร์ที่เลือกเพื่อลบ",
    stickerSizeTitle: "ขนาดสติกเกอร์",
    stickerRotateTitle: "หมุนสติกเกอร์",
    removeSticker: "ลบสติกเกอร์ที่เลือก",
    textColorTitle: "สีข้อความ",
    textColorAuto: "Auto",
    catStickerTitle: "สติกเกอร์แมว",
    catStickerHint: "แตะหน้าแมวเพื่อวางบนรูป",
  },
};
