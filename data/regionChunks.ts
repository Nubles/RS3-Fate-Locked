import type { ChunkCoord } from '../utils/mapCoords';

// Per-region chunk assignments used to colour the world map.
// Source of truth: the One Chunk Man "Chunk Picker" (source-chunk/chunk-picker-v2,
// gh-pages — chunkpicker-chunkinfo-export.json). Each canonical region ID (the
// mainland grid is shared by RS3 and OSRS) is
// converted to our chunk coords (cx = id >> 8, cy = id & 255 — i.e. regionX,
// regionY), so they line up 1:1 with our calibrated map (see utils/mapCoords.ts).
//  - Mainlands: the picker's `rollingChunks` kingdom grouping (border chunks
//    shared by two kingdoms assigned once, by a fixed priority). Islands the
//    picker counts as part of a kingdom (Lunar Isle -> Fremennik, Crandor ->
//    Karamja, Mos Le'Harmless -> Morytania, Void Knights' Outpost -> Asgarnia,
//    Feldip Hills -> Kandarin, ...) are included.
//  - Islands & Others: Ape Atoll, which the picker buckets into a mainland by
//    access route -> moved here to match our region model.
// RS3 conversion: the base map image is the shared Gielinor mainland, so the
// OSRS-only areas were removed (Kourend & Kebos, Varlamore, the Sailing
// islands of The Open Seas, Fossil Island, the Isle of Souls and Lithkren).
// RS3-only continents (Daemonheim, Anachronia, The Arc) and RS3-only areas
// (Menaphos, Prifddinas, Everlight, …) aren't on the image, so they have no
// chunks and are shown as list-only regions on the map page.
// A few access-only anomalies (e.g. the Isle of Souls block the picker files under
// Misthalin) are dropped. Refine any of this with the authoring tool, then Export.
// Exported for utils/chunkLocations (entity location lookups app-wide).
export const REGION_CHUNKS: Record<string, ChunkCoord[]> = {
  'Asgarnia': [
    { cx: 41, cy: 40 }, { cx: 41, cy: 41 }, { cx: 46, cy: 48 }, { cx: 47, cy: 49 }, { cx: 45, cy: 50 }, { cx: 46, cy: 50 }, { cx: 45, cy: 51 }, { cx: 46, cy: 51 },
    { cx: 43, cy: 52 }, { cx: 44, cy: 52 }, { cx: 45, cy: 52 }, { cx: 46, cy: 52 }, { cx: 44, cy: 53 }, { cx: 45, cy: 53 }, { cx: 46, cy: 53 }, { cx: 43, cy: 54 },
    { cx: 44, cy: 54 }, { cx: 45, cy: 54 }, { cx: 46, cy: 54 }, { cx: 43, cy: 55 }, { cx: 44, cy: 55 }, { cx: 45, cy: 55 }, { cx: 46, cy: 55 }, { cx: 44, cy: 56 },
    { cx: 45, cy: 56 }, { cx: 44, cy: 57 }, { cx: 45, cy: 57 }, { cx: 45, cy: 58 },
  ],
  'Fremennik': [
    { cx: 40, cy: 56 }, { cx: 40, cy: 57 }, { cx: 41, cy: 57 }, { cx: 42, cy: 57 }, { cx: 43, cy: 57 }, { cx: 39, cy: 58 }, { cx: 41, cy: 58 }, { cx: 42, cy: 58 },
    { cx: 43, cy: 58 }, { cx: 44, cy: 58 }, { cx: 34, cy: 59 }, { cx: 36, cy: 59 }, { cx: 37, cy: 59 }, { cx: 39, cy: 59 }, { cx: 42, cy: 59 }, { cx: 43, cy: 59 },
    { cx: 44, cy: 59 }, { cx: 45, cy: 59 }, { cx: 32, cy: 60 }, { cx: 33, cy: 60 }, { cx: 36, cy: 60 }, { cx: 37, cy: 60 }, { cx: 39, cy: 60 }, { cx: 40, cy: 60 },
    { cx: 41, cy: 60 }, { cx: 43, cy: 60 }, { cx: 44, cy: 60 }, { cx: 32, cy: 61 }, { cx: 33, cy: 61 }, { cx: 44, cy: 61 }, { cx: 45, cy: 61 }, { cx: 38, cy: 62 },
    { cx: 41, cy: 62 }, { cx: 44, cy: 62 }, { cx: 35, cy: 63 }, { cx: 41, cy: 63 },
    { cx: 36, cy: 58 },
  ],
  'Kandarin': [
    { cx: 38, cy: 44 }, { cx: 39, cy: 44 }, { cx: 40, cy: 44 }, { cx: 38, cy: 45 }, { cx: 39, cy: 45 }, { cx: 40, cy: 45 }, { cx: 38, cy: 46 }, { cx: 39, cy: 46 },
    { cx: 40, cy: 46 }, { cx: 41, cy: 46 }, { cx: 36, cy: 47 }, { cx: 37, cy: 47 }, { cx: 38, cy: 47 }, { cx: 39, cy: 47 }, { cx: 40, cy: 47 }, { cx: 41, cy: 47 },
    { cx: 36, cy: 48 }, { cx: 37, cy: 48 }, { cx: 38, cy: 48 }, { cx: 39, cy: 48 }, { cx: 40, cy: 48 }, { cx: 41, cy: 48 }, { cx: 37, cy: 49 }, { cx: 38, cy: 49 },
    { cx: 39, cy: 49 }, { cx: 40, cy: 49 }, { cx: 41, cy: 49 }, { cx: 38, cy: 50 }, { cx: 39, cy: 50 }, { cx: 40, cy: 50 }, { cx: 41, cy: 50 }, { cx: 38, cy: 51 },
    { cx: 39, cy: 51 }, { cx: 40, cy: 51 }, { cx: 41, cy: 51 }, { cx: 42, cy: 51 }, { cx: 36, cy: 52 }, { cx: 37, cy: 52 }, { cx: 38, cy: 52 }, { cx: 39, cy: 52 },
    { cx: 40, cy: 52 }, { cx: 41, cy: 52 }, { cx: 42, cy: 52 }, { cx: 36, cy: 53 }, { cx: 37, cy: 53 }, { cx: 38, cy: 53 }, { cx: 39, cy: 53 }, { cx: 40, cy: 53 },
    { cx: 41, cy: 53 }, { cx: 42, cy: 53 }, { cx: 43, cy: 53 }, { cx: 35, cy: 54 }, { cx: 36, cy: 54 }, { cx: 37, cy: 54 }, { cx: 38, cy: 54 }, { cx: 39, cy: 54 },
    { cx: 40, cy: 54 }, { cx: 41, cy: 54 }, { cx: 42, cy: 54 }, { cx: 35, cy: 55 }, { cx: 36, cy: 55 }, { cx: 37, cy: 55 }, { cx: 38, cy: 55 }, { cx: 39, cy: 55 },
    { cx: 41, cy: 55 }, { cx: 42, cy: 55 }, { cx: 35, cy: 56 }, { cx: 36, cy: 56 }, { cx: 37, cy: 56 }, { cx: 39, cy: 56 }, { cx: 41, cy: 56 }, { cx: 42, cy: 56 },
    { cx: 43, cy: 56 }, { cx: 36, cy: 57 },
  ],
  'Karamja': [
    { cx: 43, cy: 45 }, { cx: 44, cy: 45 }, { cx: 45, cy: 45 }, { cx: 46, cy: 45 }, { cx: 43, cy: 46 }, { cx: 44, cy: 46 }, { cx: 45, cy: 46 }, { cx: 46, cy: 46 },
    { cx: 43, cy: 47 }, { cx: 44, cy: 47 }, { cx: 45, cy: 47 }, { cx: 46, cy: 47 }, { cx: 43, cy: 48 }, { cx: 44, cy: 48 }, { cx: 45, cy: 48 }, { cx: 42, cy: 49 },
    { cx: 43, cy: 49 }, { cx: 44, cy: 49 }, { cx: 45, cy: 49 }, { cx: 46, cy: 49 }, { cx: 42, cy: 50 }, { cx: 43, cy: 50 }, { cx: 44, cy: 50 }, { cx: 43, cy: 51 },
    { cx: 44, cy: 51 },
    { cx: 42, cy: 46 },
  ],
  'Kharidian Desert': [
    { cx: 51, cy: 42 }, { cx: 52, cy: 42 }, { cx: 49, cy: 43 }, { cx: 50, cy: 43 }, { cx: 51, cy: 43 }, { cx: 52, cy: 43 }, { cx: 53, cy: 43 }, { cx: 47, cy: 44 },
    { cx: 48, cy: 44 }, { cx: 49, cy: 44 }, { cx: 50, cy: 44 }, { cx: 51, cy: 44 }, { cx: 52, cy: 44 }, { cx: 53, cy: 44 }, { cx: 49, cy: 45 }, { cx: 50, cy: 45 },
    { cx: 51, cy: 45 }, { cx: 52, cy: 45 }, { cx: 53, cy: 45 }, { cx: 54, cy: 45 }, { cx: 49, cy: 46 }, { cx: 50, cy: 46 }, { cx: 51, cy: 46 }, { cx: 52, cy: 46 },
    { cx: 53, cy: 46 }, { cx: 54, cy: 46 }, { cx: 49, cy: 47 }, { cx: 50, cy: 47 }, { cx: 51, cy: 47 }, { cx: 52, cy: 47 }, { cx: 53, cy: 47 }, { cx: 54, cy: 47 },
    { cx: 50, cy: 48 }, { cx: 51, cy: 48 }, { cx: 52, cy: 48 }, { cx: 53, cy: 48 }, { cx: 54, cy: 48 }, { cx: 51, cy: 49 }, { cx: 52, cy: 49 }, { cx: 53, cy: 49 },
    { cx: 54, cy: 49 }, { cx: 52, cy: 50 }, { cx: 53, cy: 50 }, { cx: 52, cy: 51 }, { cx: 53, cy: 51 },
  ],
  'Misthalin': [
    { cx: 48, cy: 49 }, { cx: 49, cy: 49 }, { cx: 50, cy: 49 }, { cx: 47, cy: 50 }, { cx: 48, cy: 50 }, { cx: 49, cy: 50 }, { cx: 50, cy: 50 }, { cx: 51, cy: 50 },
    { cx: 47, cy: 51 }, { cx: 48, cy: 51 }, { cx: 49, cy: 51 }, { cx: 50, cy: 51 }, { cx: 51, cy: 51 }, { cx: 47, cy: 52 }, { cx: 48, cy: 52 }, { cx: 49, cy: 52 },
    { cx: 50, cy: 52 }, { cx: 51, cy: 52 }, { cx: 52, cy: 52 }, { cx: 53, cy: 52 }, { cx: 47, cy: 53 }, { cx: 48, cy: 53 }, { cx: 49, cy: 53 }, { cx: 50, cy: 53 },
    { cx: 51, cy: 53 }, { cx: 52, cy: 53 }, { cx: 53, cy: 53 }, { cx: 47, cy: 54 }, { cx: 48, cy: 54 }, { cx: 49, cy: 54 }, { cx: 50, cy: 54 }, { cx: 51, cy: 54 },
    { cx: 52, cy: 54 }, { cx: 53, cy: 54 }, { cx: 47, cy: 55 }, { cx: 48, cy: 55 }, { cx: 49, cy: 55 }, { cx: 50, cy: 55 }, { cx: 51, cy: 55 }, { cx: 52, cy: 55 },
  ],
  'Morytania': [
    { cx: 59, cy: 44 }, { cx: 57, cy: 45 }, { cx: 57, cy: 46 }, { cx: 58, cy: 46 }, { cx: 59, cy: 46 }, { cx: 60, cy: 46 }, { cx: 57, cy: 47 }, { cx: 58, cy: 47 },
    { cx: 59, cy: 47 }, { cx: 60, cy: 47 }, { cx: 55, cy: 49 }, { cx: 56, cy: 49 }, { cx: 57, cy: 49 }, { cx: 54, cy: 50 }, { cx: 55, cy: 50 }, { cx: 56, cy: 50 },
    { cx: 57, cy: 50 }, { cx: 58, cy: 50 }, { cx: 54, cy: 51 }, { cx: 55, cy: 51 }, { cx: 56, cy: 51 }, { cx: 57, cy: 51 }, { cx: 58, cy: 51 }, { cx: 54, cy: 52 },
    { cx: 55, cy: 52 }, { cx: 56, cy: 52 }, { cx: 57, cy: 52 }, { cx: 58, cy: 52 }, { cx: 54, cy: 53 }, { cx: 55, cy: 53 }, { cx: 56, cy: 53 }, { cx: 57, cy: 53 },
    { cx: 58, cy: 53 }, { cx: 54, cy: 54 }, { cx: 55, cy: 54 }, { cx: 56, cy: 54 }, { cx: 57, cy: 54 }, { cx: 58, cy: 54 }, { cx: 53, cy: 55 }, { cx: 54, cy: 55 },
    { cx: 55, cy: 55 }, { cx: 56, cy: 55 }, { cx: 57, cy: 55 }, { cx: 59, cy: 55 },
  ],
  'Tirannwn': [
    { cx: 33, cy: 47 }, { cx: 34, cy: 47 }, { cx: 35, cy: 47 }, { cx: 33, cy: 48 }, { cx: 34, cy: 48 }, { cx: 35, cy: 48 }, { cx: 33, cy: 49 }, { cx: 34, cy: 49 },
    { cx: 35, cy: 49 }, { cx: 36, cy: 49 }, { cx: 33, cy: 50 }, { cx: 34, cy: 50 }, { cx: 35, cy: 50 }, { cx: 36, cy: 50 }, { cx: 33, cy: 51 }, { cx: 34, cy: 51 },
    { cx: 35, cy: 51 }, { cx: 36, cy: 51 }, { cx: 37, cy: 51 }, { cx: 33, cy: 52 }, { cx: 34, cy: 52 }, { cx: 35, cy: 52 }, { cx: 33, cy: 53 }, { cx: 34, cy: 53 },
    { cx: 35, cy: 53 },
  ],
  'Wilderness': [
    { cx: 46, cy: 56 }, { cx: 47, cy: 56 }, { cx: 48, cy: 56 }, { cx: 49, cy: 56 }, { cx: 50, cy: 56 }, { cx: 51, cy: 56 }, { cx: 52, cy: 56 }, { cx: 46, cy: 57 },
    { cx: 47, cy: 57 }, { cx: 48, cy: 57 }, { cx: 49, cy: 57 }, { cx: 50, cy: 57 }, { cx: 51, cy: 57 }, { cx: 52, cy: 57 }, { cx: 46, cy: 58 }, { cx: 47, cy: 58 },
    { cx: 48, cy: 58 }, { cx: 49, cy: 58 }, { cx: 50, cy: 58 }, { cx: 51, cy: 58 }, { cx: 52, cy: 58 }, { cx: 46, cy: 59 }, { cx: 47, cy: 59 }, { cx: 48, cy: 59 },
    { cx: 49, cy: 59 }, { cx: 50, cy: 59 }, { cx: 51, cy: 59 }, { cx: 52, cy: 59 }, { cx: 46, cy: 60 }, { cx: 47, cy: 60 }, { cx: 48, cy: 60 }, { cx: 49, cy: 60 },
    { cx: 50, cy: 60 }, { cx: 51, cy: 60 }, { cx: 52, cy: 60 }, { cx: 46, cy: 61 }, { cx: 47, cy: 61 }, { cx: 48, cy: 61 }, { cx: 49, cy: 61 }, { cx: 50, cy: 61 },
    { cx: 51, cy: 61 }, { cx: 52, cy: 61 }, { cx: 52, cy: 62 }, { cx: 53, cy: 62 }, { cx: 54, cy: 62 }, { cx: 52, cy: 63 }, { cx: 53, cy: 63 }, { cx: 54, cy: 63 },
    { cx: 52, cy: 64 }, { cx: 53, cy: 64 }, { cx: 54, cy: 64 },
  ],
  'Islands & Others': [
    { cx: 42, cy: 42 }, { cx: 43, cy: 42 }, { cx: 45, cy: 42 }, { cx: 42, cy: 43 }, { cx: 43, cy: 43 },
  ],
};
