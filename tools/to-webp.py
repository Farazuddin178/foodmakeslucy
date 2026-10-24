"""Compress rendered plates: tools/.build/*.png -> assets/plates/*.webp (alpha kept)."""
import sys
from pathlib import Path
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
for png in sorted(src.glob("*.png")):
    dst = out / (png.stem + ".webp")
    Image.open(png).save(dst, "WEBP", quality=86, method=6)
    print(dst.name, dst.stat().st_size // 1024, "KB")
