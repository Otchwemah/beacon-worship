#!/usr/bin/env python3
"""
Beacon Worship — brand asset generator (app icons + macOS DMG background).

Standalone branding tool. It is NOT part of the npm build and adds no npm dependency.
Requires Pillow:  python3 -m pip install Pillow

Usage (from the repo root):
    python3 scripts/branding/generate-brand-assets.py

Reads the user-supplied master lockup and writes the icons the app actually consumes:

    public/icon.png       1024x1024  generic / Linux / Electron window icon
    public/512x512.png     512x512   duplicate of icon.png (kept in sync, upstream had it too)
    public/icon.ico        multi-res Windows taskbar / installer icon
    public/icon.icns       macOS app / Dock icon
    public/dmg.png         540x380 macOS DMG installer background

`scripts/postBuild.js` copies public/ -> build/public/, which is where
config/building/electron-builder.yaml points (win.icon: build/public/icon.ico,
mac.icon: build/public/icon.icns, linux.icon: build/public, dmg.background:
build/public/dmg.png). So public/ is the single source of truth.

Design notes
------------
* The master is a square lockup: icon artwork + a "BEACON WORSHIP" wordmark below it.
  App icons use the ICON ONLY — a wordmark is illegible at 16-32px and app icons
  conventionally carry the mark alone. The icon/wordmark split is auto-detected from
  the empty horizontal band between them, so this script keeps working if the logo
  is revised.
* The background stays OPAQUE. In this artwork the cross is a cut-out that connects to
  the background through the book's centre gap, so knocking the background out to
  transparent would erase the cross.
* Windows/Linux get a full-bleed square tile (the platform norm).
* macOS gets Apple's rounded-rect "squircle" with the standard 1024-canvas / 824-content
  grid and transparent outer margin, so it sits natively in the Dock.
"""

import io
import struct
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

REPO = Path(__file__).resolve().parents[2]
MASTER = REPO / "public" / "assets" / "beacon-worship-logo.png"
PUBLIC = REPO / "public"

# Apple macOS icon grid: 1024 canvas, 824 content, ~185 corner radius.
MAC_CANVAS, MAC_CONTENT, MAC_RADIUS = 1024, 824, 185
SQUARE_FILL = 0.82  # artwork height as a fraction of the square tile
MAC_FILL = 0.80  # artwork height as a fraction of the macOS content tile
ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
# Windows uses 16px (title bar) and 24/32px (taskbar) constantly. At those sizes the
# padding that looks right at 256px wastes most of the canvas, so small sizes are
# rendered with the artwork nearly full-bleed to stay recognisable.
ICO_SMALL_MAX = 32
ICO_SMALL_FILL = 0.96

# macOS DMG installer window. Size and icon centres must match the `dmg` section of
# config/building/electron-builder.yaml (contents at x=140,y=150 and x=400,y=150).
DMG_W, DMG_H = 540, 380
DMG_ICON_Y = 150
DMG_ICON_X = (140, 400)
BRAND_GOLD = (219, 172, 100)
BRAND_TEAL = (71, 148, 149)

# Only used for the small install hint; the wordmark itself comes from the logo image
# so its typography is always brand-accurate rather than font-dependent.
FONT_CANDIDATES = [
    "/usr/lib/R/library/grDevices/fonts/Montserrat/static/Montserrat-Medium.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/local/lib/python3.13/site-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf",
]


def detect_background(im):
    """Median-ish background colour sampled from the four corners."""
    w, h = im.size
    samples = [im.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
    return tuple(sorted(c[i] for c in samples)[len(samples) // 2] for i in range(3))


def detect_icon_bbox(im, bg):
    """Bounding box of the icon artwork, excluding the wordmark below it."""
    w, h = im.size
    flat = Image.new("RGB", im.size, bg)
    mask = ImageChops.difference(im, flat).convert("L").point(lambda p: 255 if p > 28 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise SystemExit("Could not find any artwork in the master image.")
    left, top, right, bottom = bbox
    px = mask.load()

    # find empty horizontal bands inside the artwork
    bands, start = [], None
    for y in range(top, bottom + 1):
        occupied = any(px[x, y] for x in range(left, right, 3))
        if not occupied and start is None:
            start = y
        elif occupied and start is not None:
            if y - start > 5:
                bands.append((start, y - 1))
            start = None

    # a band in the lower part separates the icon from the wordmark
    for a, b in bands:
        if a > top + (bottom - top) * 0.55:
            # icon = everything above the band; wordmark = everything BELOW it.
            # Using the band end (not its start) keeps the empty gap out of the
            # wordmark crop, otherwise the gap offsets the text when it is placed.
            return mask.crop((0, 0, w, a)).getbbox(), (b + 1, bottom)
    return bbox, None


def fit(art, target):
    """Scale so the longest side is `target`, preserving aspect ratio."""
    w, h = art.size
    scale = target / max(w, h)
    return art.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)


def square_icon(art, size, bg, fill=SQUARE_FILL):
    canvas = Image.new("RGB", (size, size), bg)
    a = fit(art, round(size * fill))
    canvas.paste(a, ((size - a.width) // 2, (size - a.height) // 2))
    return canvas


def mac_icon(art, bg, canvas_size=MAC_CANVAS, fill=MAC_FILL):
    """Rounded-rect tile on a transparent canvas, per Apple's icon grid."""
    ratio = canvas_size / MAC_CANVAS
    content = round(MAC_CONTENT * ratio)
    radius = round(MAC_RADIUS * ratio)
    margin = (canvas_size - content) // 2

    tile = Image.new("RGBA", (content, content), (0, 0, 0, 0))
    mask = Image.new("L", (content, content), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, content - 1, content - 1], radius=radius, fill=255)
    tile.paste(Image.new("RGBA", (content, content), bg + (255,)), (0, 0), mask)

    a = fit(art, round(content * fill)).convert("RGBA")
    tile.alpha_composite(a, ((content - a.width) // 2, (content - a.height) // 2))

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    canvas.alpha_composite(tile, (margin, margin))
    return canvas


def load_font(size):
    from PIL import ImageFont

    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def keyed_wordmark(im, bg, wordmark_rows):
    """The wordmark with its background keyed out.

    Safe here (unlike the icon): the wordmark is bright text on a dark field with no
    cut-outs, so removing the background cannot erase part of the artwork. This lets it
    sit on the DMG gradient without a visible rectangle.
    """
    top, bottom = wordmark_rows
    w, h = im.size
    flat = Image.new("RGB", im.size, bg)
    mask = ImageChops.difference(im, flat).convert("L").point(lambda p: 255 if p > 28 else 0)
    bbox = mask.crop((0, top, w, min(h, bottom + 1))).getbbox()
    if not bbox:
        return None
    left, _, right, _ = bbox
    crop = im.crop((left, top, right, bottom + 1)).convert("RGB")

    cw, ch = crop.size
    alpha = Image.new("L", (cw, ch), 0)
    src, dst = crop.load(), alpha.load()
    for y in range(ch):
        for x in range(cw):
            r, g, b = src[x, y]
            diff = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            dst[x, y] = min(255, diff * 2)
    out = crop.convert("RGBA")
    out.putalpha(alpha)
    return out


def dmg_background(art, bg, wordmark):
    """540x380 installer background.

    Finder draws the two icons centred at (140,150) and (400,150) plus their labels
    below, so branding goes above y~80 and the hint below y~270 to avoid collisions.
    """
    from PIL import ImageDraw

    canvas = Image.new("RGB", (DMG_W, DMG_H), bg)
    d = ImageDraw.Draw(canvas)
    top = tuple(min(255, c + 8) for c in bg)
    deep = (11, 17, 25)
    for y in range(DMG_H):
        t = y / (DMG_H - 1)
        d.line([(0, y), (DMG_W, y)], fill=tuple(round(top[i] + (deep[i] - top[i]) * t) for i in range(3)))

    # wordmark across the top
    if wordmark is not None:
        wm = wordmark.copy()
        target_w = 300
        wm = wm.resize((target_w, max(1, round(wm.height * target_w / wm.width))), Image.LANCZOS)
        canvas.paste(wm, ((DMG_W - wm.width) // 2, 32), wm)

    # gold drag arrow between the two icon positions
    cx, cy = DMG_W // 2, DMG_ICON_Y
    d.line([(cx - 26, cy), (cx + 16, cy)], fill=BRAND_GOLD, width=4)
    d.polygon([(cx + 14, cy - 11), (cx + 30, cy), (cx + 14, cy + 11)], fill=BRAND_GOLD)

    # hint + attribution, below Finder's icon labels
    hint = load_font(15)
    small = load_font(10)
    text = "Drag Beacon Worship to Applications to install"
    tw = d.textlength(text, font=hint)
    d.text(((DMG_W - tw) / 2, 288), text, font=hint, fill=(233, 238, 245))

    note = "Independent build based on FreeShow  ·  GPL-3.0"
    nw = d.textlength(note, font=small)
    d.text(((DMG_W - nw) / 2, 318), note, font=small, fill=(120, 133, 148))

    # thin brand rule under the wordmark
    d.line([(DMG_W / 2 - 60, 72), (DMG_W / 2 + 60, 72)], fill=BRAND_TEAL, width=1)
    return canvas


def build_ico(art, bg):
    """Assemble a multi-size .ico with per-size padding.

    Pillow's Image.save(sizes=[...]) resizes one master uniformly, which cannot give
    small sizes a tighter crop. So each size is rendered independently and packed into
    the ICO container here (PNG-compressed entries, which Pillow itself also emits).
    """
    images = []
    for s in ICO_SIZES:
        fill = ICO_SMALL_FILL if s <= ICO_SMALL_MAX else SQUARE_FILL
        buf = io.BytesIO()
        square_icon(art, s, bg, fill=fill).save(buf, format="PNG", optimize=True)
        images.append((s, buf.getvalue()))

    out = io.BytesIO()
    out.write(struct.pack("<HHH", 0, 1, len(images)))  # reserved, type=icon, count
    offset = 6 + 16 * len(images)
    for s, data in images:
        dim = 0 if s >= 256 else s  # 0 means 256 in the ICO directory
        out.write(struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(data), offset))
        offset += len(data)
    for _, data in images:
        out.write(data)
    return out.getvalue()


def main():
    if not MASTER.exists():
        raise SystemExit(f"Master logo not found: {MASTER}")
    im = Image.open(MASTER).convert("RGB")
    bg = detect_background(im)
    bbox, wordmark = detect_icon_bbox(im, bg)
    art = im.crop(bbox)

    print(f"master        : {MASTER.relative_to(REPO)} {im.size}")
    print(f"background    : {bg}")
    print(f"icon bbox     : {bbox} -> {art.size}")
    print(f"wordmark rows : {wordmark} (excluded from icons)")

    png1024 = square_icon(art, 1024, bg)
    png1024.save(PUBLIC / "icon.png", optimize=True)
    square_icon(art, 512, bg).save(PUBLIC / "512x512.png", optimize=True)
    print("wrote public/icon.png (1024) and public/512x512.png (512)")

    (PUBLIC / "icon.ico").write_bytes(build_ico(art, bg))
    print(f"wrote public/icon.ico sizes={ICO_SIZES} (<= {ICO_SMALL_MAX}px use fill {ICO_SMALL_FILL})")

    mac = mac_icon(art, bg)
    mac.save(PUBLIC / "icon.icns")
    print("wrote public/icon.icns (1024 squircle master)")

    wordmark = keyed_wordmark(im, bg, wordmark) if wordmark else None
    dmg_background(art, bg, wordmark).save(PUBLIC / "dmg.png", optimize=True)
    print(f"wrote public/dmg.png ({DMG_W}x{DMG_H})")


if __name__ == "__main__":
    main()
