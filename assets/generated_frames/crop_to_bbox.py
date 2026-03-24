"""
Crop all v2_nobg images using Otsu + morphological segmentation.

Strategy:
  1. Per frame: Otsu on alpha → morph close → dilate → largest contour → bbox + center
  2. Per group: compute MAX width and MAX height across all frames
  3. Center-crop each frame on its own content, using group max dimensions
  → All frames same size, character always centered

Groups:
  - Each animation folder (10 × 6 frames) → per-folder max
  - Fullbody turnaround (all angles) → shared max
  - Head turnaround (all angles) → shared max

Output: v2_nobg_cut/ with same structure
"""

import cv2
import numpy as np
from pathlib import Path
import shutil

PADDING = 8

BASE = Path(__file__).parent / "v2_nobg"
OUT = Path(__file__).parent / "v2_nobg_cut"

KERNEL = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))


def segment_frame(img_path):
    """Segment a single frame. Returns (bbox, center, img) or None."""
    img = cv2.imread(str(img_path), cv2.IMREAD_UNCHANGED)
    if img is None or img.shape[2] < 4:
        return None

    alpha = img[:, :, 3]

    # Otsu threshold on alpha
    _, mask = cv2.threshold(alpha, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological close to fill holes
    closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, KERNEL, iterations=2)

    # Dilate to capture edge pixels
    dilated = cv2.dilate(closed, KERNEL, iterations=1)

    # Find largest contour
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    x, y, bw, bh = cv2.boundingRect(largest)
    cx = x + bw // 2
    cy = y + bh // 2

    return {
        "bbox": (x, y, bw, bh),
        "center": (cx, cy),
        "img": img,
        "path": img_path,
    }


def center_crop(img, cx, cy, crop_w, crop_h):
    """Crop centered on (cx, cy) with given dimensions. Pads with transparent if needed."""
    h, w = img.shape[:2]
    x1 = cx - crop_w // 2
    y1 = cy - crop_h // 2
    x2 = x1 + crop_w
    y2 = y1 + crop_h

    pad_left = max(0, -x1)
    pad_top = max(0, -y1)
    pad_right = max(0, x2 - w)
    pad_bottom = max(0, y2 - h)

    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(w, x2)
    y2 = min(h, y2)

    cropped = img[y1:y2, x1:x2]

    if pad_left or pad_top or pad_right or pad_bottom:
        cropped = cv2.copyMakeBorder(
            cropped, pad_top, pad_bottom, pad_left, pad_right,
            cv2.BORDER_CONSTANT, value=[0, 0, 0, 0]
        )

    return cropped


def clean_alpha(img):
    """Zero out faint alpha artifacts (below Otsu threshold)."""
    alpha = img[:, :, 3]
    _, mask = cv2.threshold(alpha, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    faint = mask == 0
    img[faint] = [0, 0, 0, 0]
    return img


def process_group(name, png_paths, out_base, rel_base):
    """Process a group of images: segment → max size → center crop."""
    # Step 1: Segment all frames
    results = []
    for p in png_paths:
        r = segment_frame(p)
        if r:
            results.append(r)

    if not results:
        print(f"  {name}: SKIP (no content)")
        return

    # Step 2: Find max width and height across group
    max_w = max(r["bbox"][2] for r in results) + PADDING * 2
    max_h = max(r["bbox"][3] for r in results) + PADDING * 2

    print(f"  {name}: {len(results)} frames → {max_w}x{max_h}")

    # Step 3: Center-crop each frame
    for r in results:
        cx, cy = r["center"]
        img = clean_alpha(r["img"].copy())
        cropped = center_crop(img, cx, cy, max_w, max_h)

        rel = r["path"].relative_to(rel_base)
        out_path = out_base / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(out_path), cropped)


def main():
    print(f"Padding: {PADDING}px\n")

    # Clean output
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # === Animations (per-folder) ===
    print("=== Animations (per-folder max) ===")
    anim_base = BASE / "animations"
    for anim_dir in sorted(anim_base.iterdir()):
        if not anim_dir.is_dir():
            continue
        pngs = sorted(anim_dir.glob("frame*.png"))
        if pngs:
            process_group(anim_dir.name, pngs, OUT / "animations", anim_base)

    # === Fullbody turnaround (shared max) ===
    print("\n=== Fullbody (shared max) ===")
    body_pngs = sorted((BASE / "fullbody").rglob("*.png"))
    process_group("fullbody", body_pngs, OUT / "fullbody", BASE / "fullbody")

    # === Head turnaround (shared max) ===
    print("\n=== Head (shared max) ===")
    head_pngs = sorted((BASE / "head").rglob("*.png"))
    process_group("head", head_pngs, OUT / "head", BASE / "head")

    print("\n=== DONE ===")


if __name__ == "__main__":
    main()
