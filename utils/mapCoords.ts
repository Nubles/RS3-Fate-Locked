// Game-tile / pixel / chunk coordinate utilities for the world map.
//
// The base image is the RS3 world map, stitched from the cache-rendered map
// squares of the RuneScape Wiki maps project (mejrs/layers_rs3, zoom 2,
// plane 0) by scripts/build-rs3-map.py. It covers the Gielinor mainland
// (incl. Prifddinas, Menaphos, Fort Forinthry, the Wilderness and the
// Daemonheim peninsula) and Anachronia. The Arc (far north) and Havenhythe
// (not in the tile set yet) are list-only regions in components/RegionMap.tsx.
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

export const tileToPixel = ({ tx, ty }: TileCoord): PixelCoord => ({
  px: ((tx - MAP_BOUNDS.tileMinX) / TILE_WIDTH) * MAP_IMAGE.width,
  py: ((MAP_BOUNDS.tileMaxY - ty) / TILE_HEIGHT) * MAP_IMAGE.height,
});

export const pixelToTile = ({ px, py }: PixelCoord): TileCoord => ({
  tx: MAP_BOUNDS.tileMinX + (px / MAP_IMAGE.width) * TILE_WIDTH,
  ty: MAP_BOUNDS.tileMaxY - (py / MAP_IMAGE.height) * TILE_HEIGHT,
});

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
