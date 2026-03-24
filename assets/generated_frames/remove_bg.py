"""
Remove backgrounds from all Voti animation frames and turnaround images.
Uses rembg (U2Net model) for robust background removal.
Saves results to v2_nobg/ preserving folder structure.
"""

import os
import sys
from pathlib import Path
from rembg import remove
from PIL import Image

BASE = Path(__file__).parent
SRC = BASE / "v2"
DST = BASE / "v2_nobg"

def process_image(src_path: Path, dst_path: Path):
    """Remove background from a single image."""
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    if dst_path.exists():
        print(f"  SKIP (exists): {dst_path.name}")
        return

    img = Image.open(src_path)
    result = remove(img)
    result.save(dst_path)
    print(f"  OK: {dst_path.name}")


def process_animations():
    """Process all animation frames (10 expressions × 6 frames)."""
    anim_src = SRC / "animations"
    anim_dst = DST / "animations"

    for folder in sorted(anim_src.iterdir()):
        if not folder.is_dir():
            continue
        print(f"\n[animations/{folder.name}]")
        for frame in sorted(folder.glob("*.png")):
            process_image(frame, anim_dst / folder.name / frame.name)


def process_turnaround(subfolder: str):
    """Process turnaround images (selected best variants only)."""
    src_dir = SRC / subfolder
    dst_dir = DST / subfolder

    # Find which images were used in the Aseprite files
    # The selected images follow the pattern: body_XXdeg.png or body_XXdeg_vN.png
    # We process ALL of them and let the user pick
    print(f"\n[{subfolder}]")
    for img in sorted(src_dir.glob("*.png")):
        process_image(img, dst_dir / img.name)


if __name__ == "__main__":
    print("=== Removing backgrounds from Voti assets ===")
    print(f"Source: {SRC}")
    print(f"Destination: {DST}")

    # First download the model
    print("\nLoading rembg model (first run downloads ~180MB)...")

    # Process animations (most important for web)
    process_animations()

    # Process turnarounds
    process_turnaround("fullbody")
    process_turnaround("head")

    print("\n=== Done! ===")
