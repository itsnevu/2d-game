#!/usr/bin/env python3
"""Bake a 4x4 character sheet into the game's 6 hero sprite sheets.

Source: character-assets/wilder_hero_source_sheet.png (1254x1254, 4 cols x 4 rows,
opaque light-gray background). Source rows = front / side / side-alt / back.

Output frames are 48x48 in the engine's 4-row layout: row0=down, row1=right,
row2=left, row3=up. Each output sheet matches the existing asset grid exactly, so
NO engine/renderer code changes are needed. Run from the repo root:

    python3 scripts/bake-hero-from-sheet.py

Notes / design decisions (see also memory: wilder-hero-sprite-bake):
- The 4x4 grid is NOT pixel-aligned to even quarters, so we detect real content
  bands (column/row projections of alpha) and slice on band intersections.
- down  <- source row 0 (front)
- up    <- source row 3 (back)
- left  <- source row 1 (faces left), used as-is
- right <- source row 1, horizontally mirrored (guarantees clean L/R opposites)
- dodge sheet is a single STATIC frame repeated: the dodge roll is a fast slide
  with no roll animation (only one usable asset), per the art constraint.
"""
import os
from collections import deque
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "character-assets", "wilder_hero_source_sheet.png")
DST = os.path.join(ROOT, "client", "src", "assets")
TILE = 48
BOTTOM_MARGIN = 3   # px of empty space below feet inside the 48px cell
TARGET_H = 45       # scaled content height (incl. backpack sword); ~existing 41-42 + sword
MAX_W = 46

# Per-sheet column -> source-frame-index map. Source has 4 frames/direction.
SHEETS = {
    'hero_walk.png':   [0, 1, 2, 3, 2, 1],          # 6 cols, ping-pong loop
    'hero_sprint.png': [0, 1, 2, 3, 0, 1, 2, 3],    # 8 cols, straight loop
    'hero_idle.png':   [0, 1, 2, 3],                # 4 cols, gentle bob
    'hero_crouch.png': [0, 1, 2],                   # 3 cols (engine uses cols 1,2)
    'hero_swim.png':   [0, 1, 2, 3, 2, 1],          # 6 cols, ping-pong
    'hero_dodge.png':  [0, 0, 0, 0, 0, 0, 0],       # 7 cols, STATIC (fast slide)
}
ROW_ORDER = ['down', 'right', 'left', 'up']  # engine row order

def remove_bg(im):
    """Flood-fill from the borders, erasing the light-gray background + its fringe."""
    im = im.convert("RGBA")
    W, H = im.size
    px = im.load()
    BG = (240, 240, 240)
    def dist(p): return abs(p[0]-BG[0]) + abs(p[1]-BG[1]) + abs(p[2]-BG[2])
    REMOVE = 60
    visited = bytearray(W*H)
    q = deque((x, y) for x in range(W) for y in (0, H-1))
    q.extend((x, y) for y in range(H) for x in (0, W-1))
    while q:
        x, y = q.popleft()
        idx = y*W + x
        if visited[idx]:
            continue
        visited[idx] = 1
        p = px[x, y]
        if dist(p) > REMOVE:
            continue
        px[x, y] = (p[0], p[1], p[2], 0)
        if x > 0:   q.append((x-1, y))
        if x < W-1: q.append((x+1, y))
        if y > 0:   q.append((x, y-1))
        if y < H-1: q.append((x, y+1))
    return im

def content_bands(im, frac=0.02):
    a = np.array(im)[:, :, 3]
    def bands(proj):
        thresh = proj.max() * frac
        runs = []; inrun = False; start = 0
        for i, v in enumerate(proj):
            if v > thresh and not inrun: start = i; inrun = True
            elif v <= thresh and inrun: runs.append((start, i)); inrun = False
        if inrun: runs.append((start, len(proj)))
        return runs
    xb, yb = bands(a.sum(axis=0)), bands(a.sum(axis=1))
    assert len(xb) == 4 and len(yb) == 4, f"expected 4x4 bands, got {len(xb)}x{len(yb)}"
    return xb, yb

def fit_frame(sprite):
    bbox = sprite.getbbox()
    if not bbox:
        return Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    s = sprite.crop(bbox)
    bw, bh = s.size
    scale = TARGET_H / bh
    if round(bw*scale) > MAX_W:
        scale = MAX_W / bw
    nw, nh = max(1, round(bw*scale)), max(1, round(bh*scale))
    s = s.resize((nw, nh), Image.LANCZOS)
    frame = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    frame.alpha_composite(s, ((TILE - nw)//2, TILE - BOTTOM_MARGIN - nh))
    return frame

def main():
    clean = remove_bg(Image.open(SRC))
    xb, yb = content_bands(clean)
    def cell(col, row):
        x0, x1 = xb[col]; y0, y1 = yb[row]
        return clean.crop((x0, y0, x1, y1))
    banks = {
        'down':  [fit_frame(cell(c, 0)) for c in range(4)],
        'up':    [fit_frame(cell(c, 3)) for c in range(4)],
        'left':  [fit_frame(cell(c, 1)) for c in range(4)],
    }
    banks['right'] = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in banks['left']]
    for name, colmap in SHEETS.items():
        sheet = Image.new("RGBA", (len(colmap)*TILE, 4*TILE), (0, 0, 0, 0))
        for ri, dirn in enumerate(ROW_ORDER):
            for ci, srcidx in enumerate(colmap):
                sheet.alpha_composite(banks[dirn][srcidx], (ci*TILE, ri*TILE))
        sheet.save(os.path.join(DST, name))
        print(f"  wrote {name} {sheet.size}")

if __name__ == "__main__":
    main()
