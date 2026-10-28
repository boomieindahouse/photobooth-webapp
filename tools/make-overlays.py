"""สร้าง PNG โปร่งใสสำหรับเทมเพลตเฟรม + วัดตำแหน่งช่องรูป (กริด)

วิธี:
- Y2K: sheet 4167x4167 มี 4 แถบ วางบนพื้นเทา — ตัดแถบจาก mask
  "ไม่ใช่สีเทา" แล้ว key สีเทาในแถบออก (ช่องวงรี/ดาวจึงคงรูปทรง)
- Kawaii (mini-icon / bloom): ช่องรูปเป็นลายตารางหมากรุก — หา
  bounding box ของตารางแต่ละช่อง (จาก mask สี่เหลี่ยมเทา + closing)
  แล้วเจาะช่องนั้นให้โปร่งใสทั้งช่อง (ช่องเป็นสี่เหลี่ยมอยู่แล้ว)
ผลลัพธ์: public/frames/*.png + frames.json (พารามิเตอร์กริดที่ค้นได้)
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "frames")
os.makedirs(OUT, exist_ok=True)


def dist(a, b):
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    return np.sqrt(((a - b) ** 2).sum(axis=-1))


def find_grid_params(strip_w, strip_h, holes, cols, rows):
    """ค้นหา padding/gap ที่ทำให้เซลล์กริดคลุม holes ทุกช่อง (overshoot น้อยสุด)

    holes: list ของ (x0, y0, x1, y1) ในพิกัด strip (เรียงตามแถวแล้วคอลัมน์)
    คืน (padding, gap) หรือ None ถ้าหาไม่ได้
    """
    best = None
    for padding in range(2, 120):
        for gap in range(0, 160):
            uw = (strip_w - 2 * padding - gap * (cols - 1)) / cols
            uh = (strip_h - 2 * padding - gap * (rows - 1)) / rows
            if uw <= 0 or uh <= 0:
                continue
            ok = True
            overshoot = 0
            for idx, (x0, y0, x1, y1) in enumerate(holes):
                col = idx % cols
                row = idx // cols
                cx = padding + col * (uw + gap)
                cy = padding + row * (uh + gap)
                if cx > x0 + 1 or cy > y0 + 1 or cx + uw < x1 - 1 or cy + uh < y1 - 1:
                    ok = False
                    break
                overshoot += (x0 - cx) + (y0 - cy) + (cx + uw - x1) + (cy + uh - y1)
            if ok and (best is None or overshoot < best[0]):
                best = (overshoot, padding, gap)
    if best is None:
        return None
    return best[1], best[2]


def save_overlay(img_rgba, name, width):
    w, h = img_rgba.size
    scale = width / w
    resized = img_rgba.resize((width, round(h * scale)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    resized.save(path, optimize=True)
    return path, resized.size


def process_y2k(jpg_path, prefix, out_w=600):
    im = Image.open(jpg_path).convert("RGB")
    arr = np.asarray(im).astype(float)
    bg = arr[10, 10]  # พื้นหลังเทานอกแถบ
    non_grey = dist(arr, bg) > 45
    lab, n = ndimage.label(non_grey)
    boxes = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < 20000:
            continue
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max(), len(xs)))
    boxes.sort(key=lambda b: b[0])
    assert len(boxes) == 4, f"{jpg_path}: เจอ {len(boxes)} แถบ {boxes}"
    results = []
    for si, (x0, y0, x1, y1, _) in enumerate(boxes):
        crop = im.crop((x0, y0, x1 + 1, y1 + 1))
        carr = np.asarray(crop).astype(float)
        # สีเทาช่องรูป = สีพื้นหลัง (เทาเดียวกัน) — key ออกแบบไล่ระดับ
        d = dist(carr, bg)
        alpha = np.clip((d - 25) / 30, 0, 1) * 255
        alpha = ndimage.gaussian_filter(alpha, 1.0)
        rgba = np.dstack([np.asarray(crop), alpha.astype(np.uint8)])
        # หา holes จาก mask เทา (ก่อนเบลอ) เรียงบนลงล่าง
        grey = d < 25
        lab2, n2 = ndimage.label(grey)
        comps = []
        for i in range(1, n2 + 1):
            ys, xs = np.where(lab2 == i)
            if len(xs) < 3000:
                continue
            comps.append((len(xs), int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
        comps.sort(reverse=True)
        holes = [(x0, y0, x1, y1) for _, x0, y0, x1, y1 in comps[:3]]
        holes.sort(key=lambda b: b[1])
        assert len(holes) == 3, f"แถบ {si}: เจอ {len(holes)} ช่อง {holes}"
        name = f"{prefix}-{si + 1}.png"
        path, (w, h) = save_overlay(Image.fromarray(rgba, "RGBA"), name, out_w)
        s = out_w / crop.size[0]
        holes_s = [
            (round(x0 * s), round(y0 * s), round(x1 * s), round(y1 * s))
            for (x0, y0, x1, y1) in holes
        ]
        cells = [
            (max(0, x0 - 3), max(0, y0 - 3), min(w, x1 + 3), min(h, y1 + 3))
            for (x0, y0, x1, y1) in holes_s
        ]
        results.append(
            {
                "name": name,
                "size": [w, h],
                "holes": holes_s,
                "cellsPx": cells,
                "bytes": os.path.getsize(path),
            }
        )
        print(f"Y2K {name}: {w}x{h} holes={holes_s}")
    return results


def process_kawaii(jpg_path, prefix, out_w=800):
    im = Image.open(jpg_path).convert("RGB")
    # ทำงานบนภาพย่อเพื่อหา bbox ช่องตาราง
    small_w = 800
    small = im.resize((small_w, round(im.size[1] * small_w / im.size[0])), Image.LANCZOS)
    arr = np.asarray(small).astype(float)
    # สี่เหลี่ยมเทาของตาราง: R≈G≈B และอยู่ช่วง 150-215 (ไม่ใช่ขาวล้วน/ดำ)
    greyish = (
        (np.abs(arr[:, :, 0] - arr[:, :, 1]) < 12)
        & (np.abs(arr[:, :, 1] - arr[:, :, 2]) < 12)
        & (arr[:, :, 0] > 140)
        & (arr[:, :, 0] < 220)
    )
    # ช่องตาราง = พื้นที่ที่มีสี่เหลี่ยมเทา; แถบดำ/ช่องว่างขาวระหว่างช่อง
    # ไม่มีสี่เหลี่ยมเทาเลย — หา separator จาก projection ของ mask เทา
    def separators(profile, min_w=10, thresh=0.05):
        bands = []
        in_band = False
        start_i = 0
        for i, v in enumerate(profile):
            if v < thresh and not in_band:
                in_band = True
                start_i = i
            elif v >= thresh and in_band:
                in_band = False
                if i - start_i >= min_w:
                    bands.append((start_i, i - 1))
        if in_band and len(profile) - start_i >= min_w:
            bands.append((start_i, len(profile) - 1))
        return bands
    col_prof = greyish.mean(axis=0)
    row_prof = greyish.mean(axis=1)
    col_bands = separators(col_prof)
    row_bands = separators(row_prof)
    # ช่อง = ช่วงระหว่าง separator bands (ต้องได้อย่างน้อย 2 คอลัมน์ x 3 แถว)
    # ช่วงระหว่าง band ที่ติดกัน = ช่องรูป (ไม่รวม band ขอบนอก)
    col_intervals = [(col_bands[i][1] + 1, col_bands[i + 1][0] - 1)
                     for i in range(len(col_bands) - 1)]
    row_intervals = [(row_bands[i][1] + 1, row_bands[i + 1][0] - 1)
                     for i in range(len(row_bands) - 1)]
    col_starts = [a for a, _ in col_intervals]
    col_ends = [b for _, b in col_intervals]
    row_starts = [a for a, _ in row_intervals]
    row_ends = [b for _, b in row_intervals]
    # เลือกช่วงที่มีสี่เหลี่ยมเทาจริง (กัน margin นอกกรอบ)
    boxes = []
    for r in range(len(row_starts)):
        for c in range(len(col_starts)):
            x0, x1 = col_starts[c], col_ends[c]
            y0, y1 = row_starts[r], row_ends[r]
            # ช่องจริงกว้าง/สูงเกิน 100px — ตัดแถบ fringe แคบ ๆ ระหว่าง band ทิ้ง
            if (x1 - x0 >= 100 and y1 - y0 >= 100
                    and greyish[y0:y1 + 1, x0:x1 + 1].mean() > 0.08):
                boxes.append((x0, y0, x1, y1))
    assert len(boxes) == 6, f"{jpg_path}: เจอ {len(boxes)} ช่อง {boxes} col_bands={col_bands} row_bands={row_bands}"
    boxes.sort(key=lambda b: (b[1], b[0]))
    rgba_full = np.dstack([np.asarray(im), np.full(im.size[::-1], 255, np.uint8)])
    s_full = im.size[0] / small_w
    holes_full = [
        (round(x0 * s_full), round(y0 * s_full), round(x1 * s_full), round(y1 * s_full))
        for (x0, y0, x1, y1) in boxes
    ]
    # เจาะช่อง: alpha 0 ใน bbox, feather ขอบ 4px (ที่ความละเอียดเต็ม)
    alpha = np.full(im.size[::-1], 255, np.uint8)
    for (x0, y0, x1, y1) in holes_full:
        alpha[y0 : y1 + 1, x0 : x1 + 1] = 0
    alpha_f = ndimage.gaussian_filter(alpha.astype(float), 1.5)
    rgba = np.dstack([np.asarray(im), alpha_f.astype(np.uint8)])
    name = f"{prefix}.png"
    path, (w, h) = save_overlay(Image.fromarray(rgba, "RGBA"), name, out_w)
    s = out_w / im.size[0]
    holes_s = [
        (round(x0 * s), round(y0 * s), round(x1 * s), round(y1 * s))
        for (x0, y0, x1, y1) in holes_full
    ]
    cells = [
        (max(0, x0 - 3), max(0, y0 - 3), min(w, x1 + 3), min(h, y1 + 3))
        for (x0, y0, x1, y1) in holes_s
    ]
    print(f"Kawaii {name}: {w}x{h} holes={holes_s}")
    return {"name": name, "size": [w, h], "holes": holes_s, "cellsPx": cells,
            "bytes": os.path.getsize(path)}


def main():
    out = {}
    out["y2k_black"] = process_y2k(
        "/tmp/y2k/6fc37e2f-da0f-4a5c-95bd-f411aadab04a.jpg", "y2k-black")
    out["y2k_white"] = process_y2k(
        "/tmp/y2k/180ffd0e-0f46-45ab-93d6-68a579302018.jpg", "y2k-white")
    out["kawaii_icon"] = process_kawaii("/tmp/newsets/artworki_01.jpg", "kawaii-icon")
    out["kawaii_bloom"] = process_kawaii("/tmp/newsets/artworki_07.jpg", "kawaii-bloom")
    with open(os.path.join(OUT, "frames.json"), "w") as f:
        json.dump(out, f, indent=2)
    print("done")


if __name__ == "__main__":
    main()
