import { describe, it, expect } from 'vitest';
import {
  CHUNK_TILES, MAP_IMAGE, MAP_BOUNDS,
  tileToPixel, pixelToTile, tileToChunk, chunkOriginTile, tileToPercent,
} from './mapCoords';

/**
 * The map's chunk grid must equal the canonical RS3 map-square grid
 * (cx = x >> 6, cy = y >> 6) — that is what makes our painted REGION_CHUNKS,
 * the hover readout and public/chunk-content.json all agree. These tests pin
 * the calibration so a future "small adjustment" can't silently shear the
 * grid off the region boundaries again.
 */
describe('map calibration', () => {
  it('bounds are chunk-aligned (multiples of 64)', () => {
    expect(MAP_BOUNDS.tileMinX % CHUNK_TILES).toBe(0);
    expect(MAP_BOUNDS.tileMinY % CHUNK_TILES).toBe(0);
    expect(MAP_BOUNDS.tileMaxX % CHUNK_TILES).toBe(0);
    expect(MAP_BOUNDS.tileMaxY % CHUNK_TILES).toBe(0);
  });

  it('covers RS3 map squares x 26..91, y 31..64 (mainland + Anachronia)', () => {
    expect(MAP_BOUNDS).toEqual({ tileMinX: 1664, tileMinY: 1984, tileMaxX: 5888, tileMaxY: 4160 });
  });

  it('covers 66x34 chunks at a clean 3.0 px/tile', () => {
    const tilesW = MAP_BOUNDS.tileMaxX - MAP_BOUNDS.tileMinX;
    const tilesH = MAP_BOUNDS.tileMaxY - MAP_BOUNDS.tileMinY;
    expect(tilesW / CHUNK_TILES).toBe(66);
    expect(tilesH / CHUNK_TILES).toBe(34);
    expect(MAP_IMAGE.width / tilesW).toBe(3);
    expect(MAP_IMAGE.height / tilesH).toBe(3);
  });
});

describe('coordinate conversions', () => {
  it('maps known landmarks to their canonical regions', () => {
    // Lumbridge Castle courtyard → region (50,50); Falador centre → (46,52);
    // East Ardougne market → (41,51).
    expect(tileToChunk({ tx: 3222, ty: 3218 })).toEqual({ cx: 50, cy: 50 });
    expect(tileToChunk({ tx: 2965, ty: 3380 })).toEqual({ cx: 46, cy: 52 });
    expect(tileToChunk({ tx: 2662, ty: 3305 })).toEqual({ cx: 41, cy: 51 });
  });

  it('puts the RS3-only areas inside the image', () => {
    // Daemonheim (Dungeoneering tutor, 3452,3720) and Anachronia base camp
    // (~5444,2347) are both on the map now.
    for (const t of [{ tx: 3452, ty: 3720 }, { tx: 5444, ty: 2347 }]) {
      const p = tileToPercent(t);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(100);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(100);
    }
    expect(tileToChunk({ tx: 3452, ty: 3720 })).toEqual({ cx: 53, cy: 58 });
  });

  it('tileToPixel puts the bottom-left bound at the image bottom-left', () => {
    const bl = tileToPixel({ tx: MAP_BOUNDS.tileMinX, ty: MAP_BOUNDS.tileMinY });
    expect(bl).toEqual({ px: 0, py: MAP_IMAGE.height });
    const tr = tileToPixel({ tx: MAP_BOUNDS.tileMaxX, ty: MAP_BOUNDS.tileMaxY });
    expect(tr).toEqual({ px: MAP_IMAGE.width, py: 0 });
  });

  it('pixelToTile inverts tileToPixel', () => {
    for (const t of [
      { tx: 3222, ty: 3218 },
      { tx: MAP_BOUNDS.tileMinX, ty: MAP_BOUNDS.tileMinY },
      { tx: 4000, ty: 4200 },
    ]) {
      const round = pixelToTile(tileToPixel(t));
      expect(round.tx).toBeCloseTo(t.tx, 6);
      expect(round.ty).toBeCloseTo(t.ty, 6);
    }
  });

  it('chunkOriginTile is the inverse of tileToChunk at chunk corners', () => {
    const origin = chunkOriginTile({ cx: 50, cy: 50 });
    expect(origin).toEqual({ tx: 3200, ty: 3200 });
    expect(tileToChunk(origin)).toEqual({ cx: 50, cy: 50 });
  });

  it('tileToPercent stays within 0-100 for in-bounds tiles', () => {
    const p = tileToPercent({ tx: 3222, ty: 3218 });
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(100);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(100);
  });
});
