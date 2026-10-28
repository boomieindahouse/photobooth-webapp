import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  CATEGORIES,
  TEMPLATES,
  frameById,
  photoCells,
  type PhotoboothTemplate,
  type TemplateCategory,
} from "@/lib/photobooth";
import type { Dict } from "@/lib/i18n";

interface Props {
  t: Dict;
  selected: PhotoboothTemplate;
  onSelect: (template: PhotoboothTemplate) => void;
}

/**
 * พรีวิวแถบเล็ก ๆ ตามกริดจริงของเทมเพลต (รองรับเซลล์ผสมขนาด + panel)
 * ขนาด fit ในกล่อง 150x132 เสมอ — เดิม Duo Wide คำนวณได้ 286px
 * จนล้นการ์ด 2 คอลัมน์ ทำให้ข้อความถูกตัดและทับการ์ดข้าง ๆ
 */
function MiniStrip({ template }: { template: PhotoboothTemplate }) {
  const ratio = template.stripWidth / template.stripHeight;
  let width = 132 * ratio;
  let height = 132;
  if (width > 150) {
    width = 150;
    height = 150 / ratio;
  }
  if (width < 56) width = 56;
  // เทมเพลตเฟรมสำเร็จรูป: พรีวิวด้วยรูปเฟรมจริงแทนกริดจำลอง
  if (template.frameOverlay) {
    return (
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-pink-100"
        style={{ width, height }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.frameOverlay}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  // เทมเพลตออกแบบเอง (cellsPx ไม่มี PNG เฟรม): พรีวิวตามตำแหน่ง/ทรงจริง
  if (template.cellsPx) {
    const bg =
      template.bg ?? template.bgGradient?.[0] ?? frameById(template.defaultFrameId).hex;
    const shapeRadius = (shape?: string) =>
      shape === "circle" || shape === "ellipse"
        ? "50%"
        : shape === "arch"
          ? "50% 50% 6px 6px"
          : shape === "heart" || shape === "blob"
            ? "40%"
            : "6px";
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-pink-100"
        style={{ width, height, backgroundColor: bg }}
      >
        {template.cellsPx.map((c, i) => (
          <div
            key={i}
            className="absolute bg-pink-200"
            style={{
              left: `${(c.x / template.stripWidth) * 100}%`,
              top: `${(c.y / template.stripHeight) * 100}%`,
              width: `${(c.w / template.stripWidth) * 100}%`,
              height: `${(c.h / template.stripHeight) * 100}%`,
              borderRadius: shapeRadius(c.shape),
              transform: c.rotate ? `rotate(${c.rotate}deg)` : undefined,
            }}
          />
        ))}
      </div>
    );
  }
  const frame = frameById(template.defaultFrameId);
  const isDark = frame.id === "black";
  const cells = photoCells(template);
  return (
    <div
      className="flex shrink-0 flex-col rounded-lg p-1.5 shadow-sm ring-1 ring-pink-100"
      style={{ width, height, gap: 3, backgroundColor: frame.hex }}
    >
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
          gridTemplateRows: `repeat(${template.rows}, 1fr)`,
          gap: 3,
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            className={isDark ? "rounded-[4px] bg-white" : "rounded-[4px] bg-pink-200"}
            style={{
              gridColumn: `${cell.col + 1} / span ${cell.colSpan ?? 1}`,
              gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
            }}
          />
        ))}
        {template.panel && (
          <div
            className="flex items-center justify-center rounded-[4px] text-[8px] font-medium"
            style={{
              gridColumn: `${template.panel.col + 1} / span ${template.panel.colSpan ?? 1}`,
              gridRow: `${template.panel.row + 1} / span ${template.panel.rowSpan ?? 1}`,
              color: isDark ? "#ffffff" : "#be185d",
            }}
          >
            ♡
          </div>
        )}
      </div>
      <div
        className="text-center text-[8px] font-medium"
        style={{ color: isDark ? "#ffffff" : "#f472b6" }}
      >
        ♡ photobooth
      </div>
    </div>
  );
}

function TemplateCard({
  t,
  template,
  selected,
  onSelect,
}: {
  t: Dict;
  template: PhotoboothTemplate;
  selected: PhotoboothTemplate;
  onSelect: (template: PhotoboothTemplate) => void;
}) {
  const active = template.id === selected.id;
  return (
    <button
      key={template.id}
      type="button"
      onClick={() => onSelect(template)}
      className={`flex min-w-0 items-center gap-4 overflow-hidden rounded-3xl border-2 p-4 text-left transition ${active
          ? "border-pink-400 bg-pink-50 shadow-md shadow-pink-100"
          : "border-pink-100 bg-white hover:border-pink-200 hover:bg-pink-50/50"
        }`}
    >
      <MiniStrip template={template} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-800">{template.name}</span>
          {active && (
            <span className="rounded-full bg-violet-400 px-2 py-0.5 text-[11px] font-medium text-white">
              {t.selected}
            </span>
          )}
        </span>
        <span className="mt-1 block break-words text-sm leading-snug text-gray-500">
          {t.templateDesc[template.id] ?? template.desc}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-700">
          <Icon icon="lucide:camera" width={14} height={14} aria-hidden="true" />
          {template.shots} {t.shots}
        </span>
      </span>
    </button>
  );
}

export default function TemplatePicker({ t, selected, onSelect }: Props) {
  // หมวดหมู่ก่อนเสมอ — ผู้ใช้ไม่ต้องเลื่อนผ่านเทมเพลตทั้งหมด 27 แบบ
  // กดการ์ดหมวดหมู่แล้วค่อยเห็นเฉพาะเทมเพลตในหมวดนั้น
  const [category, setCategory] = useState<TemplateCategory | null>(null);

  // หน้าเลือกเทมเพลตในหมวดที่กดมา
  if (category) {
    const templates = TEMPLATES.filter((tpl) => tpl.category === category);
    return (
      <div>
        {/* ปุ่มย้อนกลับต้องเห็นชัด — เดิมเป็นตัวหนังสือสีชมพูตัวเล็ก
            กลมกลืนกับพื้นหลังจนหาไม่เจอ จึงทำเป็นปุ่มเต็มแถวสีม่วง */}
        <button
          type="button"
          onClick={() => setCategory(null)}
          className="flex w-full items-center justify-center rounded-full bg-violet-400 py-3 text-base font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-500 active:scale-[0.98]"
        >
          {t.backToCategories}
        </button>
        <h2 className="mt-2 text-lg font-medium text-gray-800">
          {t.categoryNames[category] ?? category}
          <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
            {templates.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t.categoryDesc[category] ?? t.chooseTemplateDesc}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              t={t}
              template={template}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">{t.frameNote}</p>
      </div>
    );
  }

  // หน้าแรก: การ์ดหมวดหมู่เท่านั้น
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-800">
        {t.chooseTemplateTitle}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{t.categoryDescText}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const templates = TEMPLATES.filter((tpl) => tpl.category === cat);
          const preview = templates[0];
          const hasSelected = templates.some((tpl) => tpl.id === selected.id);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition ${hasSelected
                  ? "border-pink-400 bg-pink-50 shadow-md shadow-pink-100"
                  : "border-pink-100 bg-white hover:border-pink-200 hover:bg-pink-50/50"
                }`}
            >
              {preview && <MiniStrip template={preview} />}
              <span className="font-medium text-gray-800">
                {t.categoryNames[cat] ?? cat}
              </span>
              <span className="text-xs leading-snug text-gray-500">
                {t.categoryDesc[cat]}
              </span>
              <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-700">
                {templates.length} {t.templates}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">{t.frameNote}</p>
    </div>
  );
}
