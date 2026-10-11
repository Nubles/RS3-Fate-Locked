#!/usr/bin/env python3
"""Build public/rs3_world_map.webp (+ _lo placeholder) from the RS3 world map tiles.

Data source: the RuneScape Wiki maps project by mejrs — cache-rendered RS3 map
squares at https://github.com/mejrs/layers_rs3 (map_squares/-1/2/0_{x}_{y}.png:
zoom 2 = one 256 px tile per 64x64-tile map square, plane 0, y increasing north).

The image covers whole map squares X 26..91, Y 31..64 (see utils/mapCoords.ts
MAP_BOUNDS). That box holds the Gielinor mainland (incl. Tirannwn/Prifddinas,
Menaphos, the Wilderness, Fort Forinthry and the Daemonheim peninsula) and,
far to the south-east, Anachronia. Between them is open sea. The Arc
(squares ~25..43, 172..190) is far north and stays list-only, and Havenhythe is
not in the mejrs tile set yet (it postdates the last tile render).

Instanced/unused map squares inside the box (dungeon instances and test areas
packed beside the mainland) are dropped: only squares 4-connected to the
mainland or Anachronia by non-black tiles are kept, and everything else is
painted sea blue. The mapping is linear and square-aligned:
    pixel_x = (tileX - 26*64) * 3
    pixel_y = (65*64 - tileY) * 3      (3 px per game tile)

Usage:
    python3 scripts/build-rs3-map.py [tile_cache_dir]
Requires Pillow. Downloads missing tiles from raw.githubusercontent.com.
"""
import os
import sys
import tempfile
import urllib.request
from collections import deque

from PIL import Image

SQ_X0, SQ_X1 = 26, 91  # inclusive map-square columns
SQ_Y0, SQ_Y1 = 31, 64  # inclusive map-square rows (y = north)
PX_PER_SQUARE = 192    # 3 px per game tile
LO_WIDTH = 1280
SEA = (96, 118, 154)
SEEDS = [(50, 50), (85, 36)]  # Lumbridge, Anachronia
# The two landmasses' extents; instanced squares packed next to them (player
# instances north-east of the mainland, Kerapac/test areas north of
# Anachronia) are flood-connected through sea tiles, so clip to these boxes.
AREAS = [((26, 60), (35, 64)), ((78, 89), (31, 41))]


def in_areas(x, y):
    return any(a <= x <= b and c <= y <= d for (a, b), (c, d) in AREAS)
URL = 'https://raw.githubusercontent.com/mejrs/layers_rs3/refs/heads/master/map_squares/-1/2/0_{x}_{y}.png'

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'rs3_world_map.webp')
OUT_LO = os.path.join(ROOT, 'public', 'rs3_world_map_lo.webp')


def fetch(cache, x, y):
    path = os.path.join(cache, f'0_{x}_{y}.png')
    if not os.path.exists(path):
        try:
            with urllib.request.urlopen(URL.format(x=x, y=y)) as r:
                data = r.read()
        except Exception:
            return None
        with open(path, 'wb') as f:
            f.write(data)
    return Image.open(path).convert('RGBA')


def mostly_black(im):
    small = im.convert('RGB').resize((32, 32))
    px = list(small.get_flattened_data() if hasattr(small, 'get_flattened_data') else small.getdata())
    return sum(1 for p in px if max(p) < 12) > len(px) * 0.6


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'rs3-map-tiles')
    os.makedirs(cache, exist_ok=True)
    tiles = {}
    for x in range(SQ_X0, SQ_X1 + 1):
        for y in range(SQ_Y0, SQ_Y1 + 1):
            im = fetch(cache, x, y)
            if im is not None and not mostly_black(im):
                tiles[(x, y)] = im

    keep, q = set(), deque(s for s in SEEDS if s in tiles)
    keep.update(q)
    while q:
        x, y = q.popleft()
        for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if n in tiles and n not in keep and in_areas(*n):
                keep.add(n)
                q.append(n)

    cols, rows = SQ_X1 - SQ_X0 + 1, SQ_Y1 - SQ_Y0 + 1
    full = Image.new('RGB', (cols * 256, rows * 256), SEA)
    for (x, y) in keep:
        bg = Image.new('RGBA', (256, 256), SEA + (255,))
        bg.alpha_composite(tiles[(x, y)])
        full.paste(bg.convert('RGB'), ((x - SQ_X0) * 256, (SQ_Y1 - y) * 256))

    w, h = cols * PX_PER_SQUARE, rows * PX_PER_SQUARE
    out = full.resize((w, h), Image.LANCZOS)
    out.save(OUT, 'WEBP', quality=88, method=6)
    lo = out.resize((LO_WIDTH, round(h * LO_WIDTH / w)), Image.LANCZOS)
    lo.save(OUT_LO, 'WEBP', quality=60, method=6)
    print(f'kept {len(keep)} squares; {OUT} {w}x{h} ({os.path.getsize(OUT)} B); '
          f'{OUT_LO} {lo.size} ({os.path.getsize(OUT_LO)} B)')


if __name__ == '__main__':
    main()
