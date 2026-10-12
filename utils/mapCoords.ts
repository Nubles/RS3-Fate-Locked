// Game-tile / pixel / chunk coordinate utilities for the world map.
//
// The base image is the RS3 world map, stitched from the cache-rendered map
// squares of the RuneScape Wiki maps project (mejrs/layers_rs3, zoom 2,
// plane 0) by scripts/build-rs3-map.py. It covers the Gielinor mainland
// (incl. Prifddinas, Menaphos, Fort Forinthry, the Wilderness and the
// Daemonheim peninsula) and Anachronia, plus INSETS (see MAP_INSETS below):
// areas that sit far outside that box in game coordinates — The Arc,
// Havenhythe, Mazcab, the Lost Grove and Ashdale — drawn into open sea at a
// whole-map-square offset. tileToPixel / pixelToTile route their tiles through
// the inset, so canonical chunk coords work everywhere.
//
// Axes:
//   Game tile X increases east (right).  Image pixel X increases right. Same direction.
//   Game tile Y increases north (up).    Image pixel Y increases down.  Flipped.
//
// A "chunk" here is the 64x64-tile map square that the RuneScape Wiki draws
// grid lines on — the same boundaries as in-game region IDs
// (regionId = (x >> 6) << 8 | (y >> 6)).

export const CHUNK_TILES = 64;

export const MAP_IMAGE = {
  // RS3 world map (mejrs/layers_rs3 tiles, see scripts/build-rs3-map.py),
  // WebP. Cropped to a whole number of map squares (see MAP_BOUNDS below), so
  // the chunk grid lines up exactly with the canonical region grid.
  src: `${import.meta.env.BASE_URL}rs3_world_map.webp`,
  /** Tiny (~25 KB) low-res placeholder shown instantly while `src` streams in. */
  srcLo: `${import.meta.env.BASE_URL}rs3_world_map_lo.webp`,
  width: 12672,
  height: 6528,
} as const;

// tileMinX/tileMinY = game tile at the image's BOTTOM-LEFT pixel;
// tileMaxX/tileMaxY = game tile at the TOP-RIGHT pixel.
//
// The image is map squares X 26..91, Y 31..64 — 66 columns x 34 rows =
// 4224x2176 tiles, at 192 px/square = a clean 3.0 px/tile on 12672x6528.
// Every bound lands on a square boundary (a multiple of 64):
//   X: tiles 1664..5888 (squares 26..91)    Y: tiles 1984..4160 (squares 31..64)
// So chunk coords equal canonical region coords (cx = x >> 6, cy = y >> 6),
// which is what public/chunk-content.json and data/regionChunks.ts are keyed by.
export const MAP_BOUNDS = {
  tileMinX: 1664,
  tileMinY: 1984,
  tileMaxX: 5888,
  tileMaxY: 4160,
} as const;

const TILE_WIDTH = MAP_BOUNDS.tileMaxX - MAP_BOUNDS.tileMinX;
const TILE_HEIGHT = MAP_BOUNDS.tileMaxY - MAP_BOUNDS.tileMinY;

export interface TileCoord { tx: number; ty: number }
export interface PixelCoord { px: number; py: number }
export interface ChunkCoord { cx: number; cy: number }

/**
 * An area drawn into open sea on the image. `src` is its box of canonical map
 * squares (inclusive); it is drawn at src + (dx, dy) squares, at the same
 * 3 px/tile scale, so the chunk grid stays aligned. Must match INSETS in
 * scripts/build-rs3-map.py, which renders the image.
 */
export interface MapInset {
  name: string;
  src: { x0: number; x1: number; y0: number; y1: number };
  dx: number;
  dy: number;
}

export const MAP_INSETS: readonly MapInset[] = [
  { name: 'The Arc', src: { x0: 26, x1: 41, y0: 171, y1: 188 }, dx: 40, dy: -125 },
  { name: 'Havenhythe', src: { x0: 52, x1: 60, y0: 19, y1: 28 }, dx: 8, dy: 12 },
  { name: 'Mazcab', src: { x0: 63, x1: 70, y0: 10, y1: 15 }, dx: 21, dy: 45 },
  { name: 'Lost Grove', src: { x0: 20, x1: 22, y0: 86, y1: 89 }, dx: 8, dy: -51 },
  { name: 'Ashdale', src: { x0: 37, x1: 40, y0: 140, y1: 143 }, dx: -4, dy: -106 },
];

// Inclusive on the far edges so a chunk's top/right corner (cy + 1) * 64 in
// the last row/column still routes through its inset. Insets sit far apart
// from each other and from the mainland, so the shared edge is never ambiguous.
const insetForTile = (tx: number, ty: number): MapInset | undefined =>
  MAP_INSETS.find(i =>
    tx >= i.src.x0 * CHUNK_TILES && tx <= (i.src.x1 + 1) * CHUNK_TILES &&
    ty >= i.src.y0 * CHUNK_TILES && ty <= (i.src.y1 + 1) * CHUNK_TILES);

const insetForDrawnTile = (tx: number, ty: number): MapInset | undefined =>
  MAP_INSETS.find(i =>
    tx >= (i.src.x0 + i.dx) * CHUNK_TILES && tx < (i.src.x1 + 1 + i.dx) * CHUNK_TILES &&
    ty >= (i.src.y0 + i.dy) * CHUNK_TILES && ty < (i.src.y1 + 1 + i.dy) * CHUNK_TILES);

/** The inset a chunk is drawn in, if any. */
export const insetOfChunk = ({ cx, cy }: ChunkCoord): MapInset | undefined =>
  insetForTile((cx + 0.5) * CHUNK_TILES, (cy + 0.5) * CHUNK_TILES);

const linearTileToPixel = (tx: number, ty: number): PixelCoord => ({
  px: ((tx - MAP_BOUNDS.tileMinX) / TILE_WIDTH) * MAP_IMAGE.width,
  py: ((MAP_BOUNDS.tileMaxY - ty) / TILE_HEIGHT) * MAP_IMAGE.height,
});

export const tileToPixel = ({ tx, ty }: TileCoord): PixelCoord => {
  const i = insetForTile(tx, ty);
  return i
    ? linearTileToPixel(tx + i.dx * CHUNK_TILES, ty + i.dy * CHUNK_TILES)
    : linearTileToPixel(tx, ty);
};

export const pixelToTile = ({ px, py }: PixelCoord): TileCoord => {
  const tx = MAP_BOUNDS.tileMinX + (px / MAP_IMAGE.width) * TILE_WIDTH;
  const ty = MAP_BOUNDS.tileMaxY - (py / MAP_IMAGE.height) * TILE_HEIGHT;
  const i = insetForDrawnTile(tx, ty);
  return i ? { tx: tx - i.dx * CHUNK_TILES, ty: ty - i.dy * CHUNK_TILES } : { tx, ty };
};

/** Where an inset is drawn, in image pixels (for its border and label). */
export const insetPixelRect = (i: MapInset) => {
  const tl = linearTileToPixel((i.src.x0 + i.dx) * CHUNK_TILES, (i.src.y1 + 1 + i.dy) * CHUNK_TILES);
  const br = linearTileToPixel((i.src.x1 + 1 + i.dx) * CHUNK_TILES, (i.src.y0 + i.dy) * CHUNK_TILES);
  return { x: tl.px, y: tl.py, w: br.px - tl.px, h: br.py - tl.py };
};

export const tileToChunk = ({ tx, ty }: TileCoord): ChunkCoord => ({
  cx: Math.floor(tx / CHUNK_TILES),
  cy: Math.floor(ty / CHUNK_TILES),
});

export const chunkOriginTile = ({ cx, cy }: ChunkCoord): TileCoord => ({
  tx: cx * CHUNK_TILES,
  ty: cy * CHUNK_TILES,
});

// Percent-of-image (0-100), for overlays using viewBox="0 0 100 100".
export const tileToPercent = (t: TileCoord) => {
  const { px, py } = tileToPixel(t);
  return { x: (px / MAP_IMAGE.width) * 100, y: (py / MAP_IMAGE.height) * 100 };
};
