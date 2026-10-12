import type { ChunkCoord } from '../utils/mapCoords';

// Per-continent chunk assignments used to colour the RS3 world map.
// Chunk coords are canonical RS3 map squares (cx = x >> 6, cy = y >> 6), the
// same keys as public/chunk-content.json and the grid of the map image
// (utils/mapCoords.ts; image built from the RuneScape Wiki maps project's
// cache-rendered tiles by mejrs — see scripts/build-rs3-map.py).
//  - Shared mainland: the original continent grouping (border squares shared
//    by two kingdoms assigned once). Islands counted as part of a kingdom
//    (Lunar Isle -> Fremennik, Crandor -> Karamja, Mos Le'Harmless -> Morytania,
//    Void Knights' Outpost -> Asgarnia, Feldip Hills -> Kandarin, ...) included.
//  - RS3 changes, checked square-by-square against the RS3 tiles: Menaphos
//    (walled city + port, x 48..50, y 40..43) in the Kharidian Desert,
//    Prifddinas (x 33..35, y 51..54) in Tirannwn, Fort Forinthry (x 51..52,
//    y 55) in Misthalin, the Wilderness clipped to RS3's coastline (incl. its
//    north-east corner, x 53, y 59..61), and Fremennik islands north of the
//    mainland (Acheron mammoth / banite / penguin islands).
//  - RS3-only continents now on the map: Daemonheim (the peninsula north-east
//    of the Wilderness; the dungeon floors are instanced) and Anachronia (far
//    south-east, x 80..89, y 31..41).
//  - Areas drawn as insets in open sea (utils/mapCoords.ts MAP_INSETS; their
//    chunks keep their canonical coords): The Arc (x 27..40, y 173..187),
//    Havenhythe (x 52..59, y 20..28), Mazcab (x 64..69, y 10..14) and Ashdale
//    (x 38..39, y 141..142) under 'Islands & Others', and the Lost Grove
//    (x 20..22, y 86..89) under Tirannwn. Land squares found from the tiles.
//  - Small coastal islands/rocks and the Soul Wars island (Islands & Others)
//    are painted too, so every land square on the image has a continent.
//  - Still off the map: instanced places (Zanaris, Puro-Puro, the Abyss,
//    Dorgesh-Kaan, Daemonheim floors, ...) — list-only in components/RegionMap.tsx.
// Refine with the map's authoring tool, then Export.
// Exported for utils/chunkLocations (entity location lookups app-wide).
export const REGION_CHUNKS: Record<string, ChunkCoord[]> = {
  'Asgarnia': [
    { cx: 40, cy: 39 }, { cx: 41, cy: 39 }, { cx: 42, cy: 39 }, { cx: 40, cy: 40 }, { cx: 41, cy: 40 }, { cx: 42, cy: 40 }, { cx: 41, cy: 41 }, { cx: 46, cy: 48 },
    { cx: 47, cy: 49 }, { cx: 45, cy: 50 }, { cx: 46, cy: 50 }, { cx: 45, cy: 51 }, { cx: 46, cy: 51 }, { cx: 43, cy: 52 }, { cx: 44, cy: 52 }, { cx: 45, cy: 52 },
    { cx: 46, cy: 52 }, { cx: 44, cy: 53 }, { cx: 45, cy: 53 }, { cx: 46, cy: 53 }, { cx: 43, cy: 54 }, { cx: 44, cy: 54 }, { cx: 45, cy: 54 }, { cx: 46, cy: 54 },
    { cx: 43, cy: 55 }, { cx: 44, cy: 55 }, { cx: 45, cy: 55 }, { cx: 46, cy: 55 }, { cx: 44, cy: 56 }, { cx: 45, cy: 56 }, { cx: 44, cy: 57 }, { cx: 45, cy: 57 },
    { cx: 45, cy: 58 },
  ],
  'Fremennik': [
    { cx: 40, cy: 56 }, { cx: 40, cy: 57 }, { cx: 41, cy: 57 }, { cx: 42, cy: 57 }, { cx: 43, cy: 57 }, { cx: 36, cy: 58 }, { cx: 39, cy: 58 }, { cx: 41, cy: 58 },
    { cx: 42, cy: 58 }, { cx: 43, cy: 58 }, { cx: 44, cy: 58 }, { cx: 31, cy: 59 }, { cx: 34, cy: 59 }, { cx: 36, cy: 59 }, { cx: 37, cy: 59 }, { cx: 39, cy: 59 },
    { cx: 42, cy: 59 }, { cx: 43, cy: 59 }, { cx: 44, cy: 59 }, { cx: 45, cy: 59 }, { cx: 32, cy: 60 }, { cx: 33, cy: 60 }, { cx: 36, cy: 60 }, { cx: 37, cy: 60 },
    { cx: 38, cy: 60 }, { cx: 39, cy: 60 }, { cx: 40, cy: 60 }, { cx: 41, cy: 60 }, { cx: 42, cy: 60 }, { cx: 43, cy: 60 }, { cx: 44, cy: 60 }, { cx: 45, cy: 60 },
    { cx: 32, cy: 61 }, { cx: 33, cy: 61 }, { cx: 40, cy: 61 }, { cx: 43, cy: 61 }, { cx: 44, cy: 61 }, { cx: 45, cy: 61 }, { cx: 35, cy: 62 }, { cx: 36, cy: 62 },
    { cx: 37, cy: 62 }, { cx: 38, cy: 62 }, { cx: 39, cy: 62 }, { cx: 41, cy: 62 }, { cx: 42, cy: 62 }, { cx: 44, cy: 62 }, { cx: 35, cy: 63 }, { cx: 36, cy: 63 },
    { cx: 37, cy: 63 }, { cx: 38, cy: 63 }, { cx: 39, cy: 63 }, { cx: 41, cy: 63 }, { cx: 35, cy: 64 }, { cx: 36, cy: 64 },
  ],
  'Kandarin': [
    { cx: 35, cy: 41 }, { cx: 37, cy: 43 }, { cx: 38, cy: 43 }, { cx: 37, cy: 44 }, { cx: 38, cy: 44 }, { cx: 39, cy: 44 }, { cx: 40, cy: 44 }, { cx: 38, cy: 45 },
    { cx: 39, cy: 45 }, { cx: 40, cy: 45 }, { cx: 38, cy: 46 }, { cx: 39, cy: 46 }, { cx: 40, cy: 46 }, { cx: 41, cy: 46 }, { cx: 36, cy: 47 }, { cx: 37, cy: 47 },
    { cx: 38, cy: 47 }, { cx: 39, cy: 47 }, { cx: 40, cy: 47 }, { cx: 41, cy: 47 }, { cx: 36, cy: 48 }, { cx: 37, cy: 48 }, { cx: 38, cy: 48 }, { cx: 39, cy: 48 },
    { cx: 40, cy: 48 }, { cx: 41, cy: 48 }, { cx: 37, cy: 49 }, { cx: 38, cy: 49 }, { cx: 39, cy: 49 }, { cx: 40, cy: 49 }, { cx: 41, cy: 49 }, { cx: 38, cy: 50 },
    { cx: 39, cy: 50 }, { cx: 40, cy: 50 }, { cx: 41, cy: 50 }, { cx: 38, cy: 51 }, { cx: 39, cy: 51 }, { cx: 40, cy: 51 }, { cx: 41, cy: 51 }, { cx: 42, cy: 51 },
    { cx: 36, cy: 52 }, { cx: 37, cy: 52 }, { cx: 38, cy: 52 }, { cx: 39, cy: 52 }, { cx: 40, cy: 52 }, { cx: 41, cy: 52 }, { cx: 42, cy: 52 }, { cx: 36, cy: 53 },
    { cx: 37, cy: 53 }, { cx: 38, cy: 53 }, { cx: 39, cy: 53 }, { cx: 40, cy: 53 }, { cx: 41, cy: 53 }, { cx: 42, cy: 53 }, { cx: 43, cy: 53 }, { cx: 35, cy: 54 },
    { cx: 36, cy: 54 }, { cx: 37, cy: 54 }, { cx: 38, cy: 54 }, { cx: 39, cy: 54 }, { cx: 40, cy: 54 }, { cx: 41, cy: 54 }, { cx: 42, cy: 54 }, { cx: 35, cy: 55 },
    { cx: 36, cy: 55 }, { cx: 37, cy: 55 }, { cx: 38, cy: 55 }, { cx: 39, cy: 55 }, { cx: 40, cy: 55 }, { cx: 41, cy: 55 }, { cx: 42, cy: 55 }, { cx: 33, cy: 56 },
    { cx: 34, cy: 56 }, { cx: 35, cy: 56 }, { cx: 36, cy: 56 }, { cx: 37, cy: 56 }, { cx: 38, cy: 56 }, { cx: 39, cy: 56 }, { cx: 41, cy: 56 }, { cx: 42, cy: 56 },
    { cx: 43, cy: 56 }, { cx: 33, cy: 57 }, { cx: 34, cy: 57 }, { cx: 35, cy: 57 }, { cx: 36, cy: 57 }, { cx: 38, cy: 57 }, { cx: 39, cy: 57 }, { cx: 33, cy: 58 },
    { cx: 34, cy: 58 }, { cx: 35, cy: 58 },
  ],
  'Karamja': [
    { cx: 44, cy: 40 }, { cx: 43, cy: 45 }, { cx: 44, cy: 45 }, { cx: 45, cy: 45 }, { cx: 46, cy: 45 }, { cx: 42, cy: 46 }, { cx: 43, cy: 46 }, { cx: 44, cy: 46 },
    { cx: 45, cy: 46 }, { cx: 46, cy: 46 }, { cx: 43, cy: 47 }, { cx: 44, cy: 47 }, { cx: 45, cy: 47 }, { cx: 46, cy: 47 }, { cx: 43, cy: 48 }, { cx: 44, cy: 48 },
    { cx: 45, cy: 48 }, { cx: 42, cy: 49 }, { cx: 43, cy: 49 }, { cx: 44, cy: 49 }, { cx: 45, cy: 49 }, { cx: 46, cy: 49 }, { cx: 42, cy: 50 }, { cx: 43, cy: 50 },
    { cx: 44, cy: 50 }, { cx: 43, cy: 51 }, { cx: 44, cy: 51 },
  ],
  'Kharidian Desert': [
    { cx: 49, cy: 40 }, { cx: 50, cy: 40 }, { cx: 51, cy: 40 }, { cx: 47, cy: 41 }, { cx: 48, cy: 41 }, { cx: 49, cy: 41 }, { cx: 50, cy: 41 }, { cx: 51, cy: 41 },
    { cx: 52, cy: 41 }, { cx: 48, cy: 42 }, { cx: 49, cy: 42 }, { cx: 50, cy: 42 }, { cx: 51, cy: 42 }, { cx: 52, cy: 42 }, { cx: 53, cy: 42 }, { cx: 48, cy: 43 },
    { cx: 49, cy: 43 }, { cx: 50, cy: 43 }, { cx: 51, cy: 43 }, { cx: 52, cy: 43 }, { cx: 53, cy: 43 }, { cx: 47, cy: 44 }, { cx: 48, cy: 44 }, { cx: 49, cy: 44 },
    { cx: 50, cy: 44 }, { cx: 51, cy: 44 }, { cx: 52, cy: 44 }, { cx: 53, cy: 44 }, { cx: 47, cy: 45 }, { cx: 48, cy: 45 }, { cx: 49, cy: 45 }, { cx: 50, cy: 45 },
    { cx: 51, cy: 45 }, { cx: 52, cy: 45 }, { cx: 53, cy: 45 }, { cx: 54, cy: 45 }, { cx: 47, cy: 46 }, { cx: 49, cy: 46 }, { cx: 50, cy: 46 }, { cx: 51, cy: 46 },
    { cx: 52, cy: 46 }, { cx: 53, cy: 46 }, { cx: 54, cy: 46 }, { cx: 49, cy: 47 }, { cx: 50, cy: 47 }, { cx: 51, cy: 47 }, { cx: 52, cy: 47 }, { cx: 53, cy: 47 },
    { cx: 54, cy: 47 }, { cx: 50, cy: 48 }, { cx: 51, cy: 48 }, { cx: 52, cy: 48 }, { cx: 53, cy: 48 }, { cx: 54, cy: 48 }, { cx: 51, cy: 49 }, { cx: 52, cy: 49 },
    { cx: 53, cy: 49 }, { cx: 54, cy: 49 }, { cx: 52, cy: 50 }, { cx: 53, cy: 50 }, { cx: 52, cy: 51 }, { cx: 53, cy: 51 },
  ],
  'Misthalin': [
    { cx: 48, cy: 48 }, { cx: 49, cy: 48 }, { cx: 48, cy: 49 }, { cx: 49, cy: 49 }, { cx: 50, cy: 49 }, { cx: 47, cy: 50 }, { cx: 48, cy: 50 }, { cx: 49, cy: 50 },
    { cx: 50, cy: 50 }, { cx: 51, cy: 50 }, { cx: 47, cy: 51 }, { cx: 48, cy: 51 }, { cx: 49, cy: 51 }, { cx: 50, cy: 51 }, { cx: 51, cy: 51 }, { cx: 47, cy: 52 },
    { cx: 48, cy: 52 }, { cx: 49, cy: 52 }, { cx: 50, cy: 52 }, { cx: 51, cy: 52 }, { cx: 52, cy: 52 }, { cx: 53, cy: 52 }, { cx: 47, cy: 53 }, { cx: 48, cy: 53 },
    { cx: 49, cy: 53 }, { cx: 50, cy: 53 }, { cx: 51, cy: 53 }, { cx: 52, cy: 53 }, { cx: 53, cy: 53 }, { cx: 47, cy: 54 }, { cx: 48, cy: 54 }, { cx: 49, cy: 54 },
    { cx: 50, cy: 54 }, { cx: 51, cy: 54 }, { cx: 52, cy: 54 }, { cx: 53, cy: 54 }, { cx: 47, cy: 55 }, { cx: 48, cy: 55 }, { cx: 49, cy: 55 }, { cx: 50, cy: 55 },
    { cx: 51, cy: 55 }, { cx: 52, cy: 55 },
  ],
  'Morytania': [
    { cx: 59, cy: 44 }, { cx: 57, cy: 45 }, { cx: 58, cy: 45 }, { cx: 59, cy: 45 }, { cx: 56, cy: 46 }, { cx: 57, cy: 46 }, { cx: 58, cy: 46 }, { cx: 59, cy: 46 },
    { cx: 60, cy: 46 }, { cx: 57, cy: 47 }, { cx: 58, cy: 47 }, { cx: 59, cy: 47 }, { cx: 60, cy: 47 }, { cx: 58, cy: 48 }, { cx: 55, cy: 49 }, { cx: 56, cy: 49 },
    { cx: 57, cy: 49 }, { cx: 58, cy: 49 }, { cx: 59, cy: 49 }, { cx: 54, cy: 50 }, { cx: 55, cy: 50 }, { cx: 56, cy: 50 }, { cx: 57, cy: 50 }, { cx: 58, cy: 50 },
    { cx: 59, cy: 50 }, { cx: 54, cy: 51 }, { cx: 55, cy: 51 }, { cx: 56, cy: 51 }, { cx: 57, cy: 51 }, { cx: 58, cy: 51 }, { cx: 59, cy: 51 }, { cx: 54, cy: 52 },
    { cx: 55, cy: 52 }, { cx: 56, cy: 52 }, { cx: 57, cy: 52 }, { cx: 58, cy: 52 }, { cx: 54, cy: 53 }, { cx: 55, cy: 53 }, { cx: 56, cy: 53 }, { cx: 57, cy: 53 },
    { cx: 58, cy: 53 }, { cx: 54, cy: 54 }, { cx: 55, cy: 54 }, { cx: 56, cy: 54 }, { cx: 57, cy: 54 }, { cx: 58, cy: 54 }, { cx: 53, cy: 55 }, { cx: 54, cy: 55 },
    { cx: 55, cy: 55 }, { cx: 56, cy: 55 }, { cx: 57, cy: 55 }, { cx: 59, cy: 55 },
  ],
  'Tirannwn': [
    { cx: 33, cy: 47 }, { cx: 34, cy: 47 }, { cx: 35, cy: 47 }, { cx: 33, cy: 48 }, { cx: 34, cy: 48 }, { cx: 35, cy: 48 }, { cx: 33, cy: 49 }, { cx: 34, cy: 49 },
    { cx: 35, cy: 49 }, { cx: 36, cy: 49 }, { cx: 33, cy: 50 }, { cx: 34, cy: 50 }, { cx: 35, cy: 50 }, { cx: 36, cy: 50 }, { cx: 37, cy: 50 }, { cx: 33, cy: 51 },
    { cx: 34, cy: 51 }, { cx: 35, cy: 51 }, { cx: 36, cy: 51 }, { cx: 37, cy: 51 }, { cx: 33, cy: 52 }, { cx: 34, cy: 52 }, { cx: 35, cy: 52 }, { cx: 33, cy: 53 },
    { cx: 34, cy: 53 }, { cx: 35, cy: 53 }, { cx: 34, cy: 54 }, { cx: 21, cy: 86 }, { cx: 20, cy: 87 }, { cx: 21, cy: 87 }, { cx: 22, cy: 87 }, { cx: 20, cy: 88 },
    { cx: 21, cy: 88 }, { cx: 22, cy: 88 }, { cx: 20, cy: 89 }, { cx: 21, cy: 89 }, { cx: 22, cy: 89 },
  ],
  'Wilderness': [
    { cx: 46, cy: 56 }, { cx: 47, cy: 56 }, { cx: 48, cy: 56 }, { cx: 49, cy: 56 }, { cx: 50, cy: 56 }, { cx: 51, cy: 56 }, { cx: 52, cy: 56 }, { cx: 46, cy: 57 },
    { cx: 47, cy: 57 }, { cx: 48, cy: 57 }, { cx: 49, cy: 57 }, { cx: 50, cy: 57 }, { cx: 51, cy: 57 }, { cx: 52, cy: 57 }, { cx: 46, cy: 58 }, { cx: 47, cy: 58 },
    { cx: 48, cy: 58 }, { cx: 49, cy: 58 }, { cx: 50, cy: 58 }, { cx: 51, cy: 58 }, { cx: 52, cy: 58 }, { cx: 46, cy: 59 }, { cx: 47, cy: 59 }, { cx: 48, cy: 59 },
    { cx: 49, cy: 59 }, { cx: 50, cy: 59 }, { cx: 51, cy: 59 }, { cx: 52, cy: 59 }, { cx: 53, cy: 59 }, { cx: 46, cy: 60 }, { cx: 47, cy: 60 }, { cx: 48, cy: 60 },
    { cx: 49, cy: 60 }, { cx: 50, cy: 60 }, { cx: 51, cy: 60 }, { cx: 52, cy: 60 }, { cx: 53, cy: 60 }, { cx: 46, cy: 61 }, { cx: 47, cy: 61 }, { cx: 48, cy: 61 },
    { cx: 49, cy: 61 }, { cx: 50, cy: 61 }, { cx: 51, cy: 61 }, { cx: 52, cy: 61 }, { cx: 53, cy: 61 }, { cx: 51, cy: 62 }, { cx: 52, cy: 62 }, { cx: 53, cy: 62 },
  ],
  'Islands & Others': [
    { cx: 65, cy: 10 }, { cx: 64, cy: 11 }, { cx: 65, cy: 11 }, { cx: 66, cy: 11 }, { cx: 67, cy: 11 }, { cx: 68, cy: 11 }, { cx: 69, cy: 11 }, { cx: 64, cy: 12 },
    { cx: 65, cy: 12 }, { cx: 66, cy: 12 }, { cx: 67, cy: 12 }, { cx: 68, cy: 12 }, { cx: 69, cy: 12 }, { cx: 64, cy: 13 }, { cx: 65, cy: 13 }, { cx: 66, cy: 13 },
    { cx: 67, cy: 13 }, { cx: 68, cy: 13 }, { cx: 69, cy: 13 }, { cx: 64, cy: 14 }, { cx: 65, cy: 14 }, { cx: 66, cy: 14 }, { cx: 67, cy: 14 }, { cx: 68, cy: 14 },
    { cx: 69, cy: 14 }, { cx: 42, cy: 42 }, { cx: 43, cy: 42 }, { cx: 45, cy: 42 }, { cx: 42, cy: 43 }, { cx: 43, cy: 43 }, { cx: 28, cy: 48 }, { cx: 29, cy: 48 },
    { cx: 30, cy: 48 }, { cx: 27, cy: 49 }, { cx: 28, cy: 49 }, { cx: 29, cy: 49 }, { cx: 30, cy: 49 }, { cx: 31, cy: 49 }, { cx: 27, cy: 50 }, { cx: 28, cy: 50 },
    { cx: 29, cy: 50 }, { cx: 30, cy: 50 }, { cx: 31, cy: 50 }, { cx: 27, cy: 51 }, { cx: 28, cy: 51 }, { cx: 29, cy: 51 }, { cx: 30, cy: 51 }, { cx: 31, cy: 51 },
    { cx: 38, cy: 141 }, { cx: 39, cy: 141 }, { cx: 38, cy: 142 }, { cx: 39, cy: 142 },
  ],
  'Daemonheim': [
    { cx: 53, cy: 56 }, { cx: 54, cy: 56 }, { cx: 53, cy: 57 }, { cx: 54, cy: 57 }, { cx: 55, cy: 57 }, { cx: 53, cy: 58 }, { cx: 54, cy: 58 }, { cx: 54, cy: 59 },
  ],
  'Anachronia': [
    { cx: 82, cy: 31 }, { cx: 83, cy: 32 }, { cx: 84, cy: 32 }, { cx: 85, cy: 32 }, { cx: 87, cy: 32 }, { cx: 88, cy: 32 }, { cx: 82, cy: 33 }, { cx: 83, cy: 33 },
    { cx: 84, cy: 33 }, { cx: 85, cy: 33 }, { cx: 86, cy: 33 }, { cx: 87, cy: 33 }, { cx: 88, cy: 33 }, { cx: 89, cy: 33 }, { cx: 82, cy: 34 }, { cx: 83, cy: 34 },
    { cx: 84, cy: 34 }, { cx: 85, cy: 34 }, { cx: 86, cy: 34 }, { cx: 87, cy: 34 }, { cx: 88, cy: 34 }, { cx: 89, cy: 34 }, { cx: 82, cy: 35 }, { cx: 83, cy: 35 },
    { cx: 84, cy: 35 }, { cx: 85, cy: 35 }, { cx: 86, cy: 35 }, { cx: 87, cy: 35 }, { cx: 88, cy: 35 }, { cx: 89, cy: 35 }, { cx: 80, cy: 36 }, { cx: 81, cy: 36 },
    { cx: 82, cy: 36 }, { cx: 83, cy: 36 }, { cx: 84, cy: 36 }, { cx: 85, cy: 36 }, { cx: 86, cy: 36 }, { cx: 87, cy: 36 }, { cx: 88, cy: 36 }, { cx: 89, cy: 36 },
    { cx: 80, cy: 37 }, { cx: 81, cy: 37 }, { cx: 82, cy: 37 }, { cx: 83, cy: 37 }, { cx: 84, cy: 37 }, { cx: 85, cy: 37 }, { cx: 86, cy: 37 }, { cx: 87, cy: 37 },
    { cx: 88, cy: 37 }, { cx: 89, cy: 37 }, { cx: 82, cy: 38 }, { cx: 83, cy: 38 }, { cx: 84, cy: 38 }, { cx: 85, cy: 38 }, { cx: 86, cy: 38 }, { cx: 87, cy: 38 },
    { cx: 88, cy: 38 }, { cx: 89, cy: 38 }, { cx: 82, cy: 39 }, { cx: 83, cy: 39 }, { cx: 84, cy: 39 }, { cx: 85, cy: 39 }, { cx: 86, cy: 39 }, { cx: 87, cy: 39 },
    { cx: 88, cy: 39 }, { cx: 89, cy: 39 }, { cx: 85, cy: 40 }, { cx: 86, cy: 40 }, { cx: 87, cy: 40 },
  ],
  'The Arc': [
    { cx: 36, cy: 173 }, { cx: 35, cy: 174 }, { cx: 36, cy: 174 }, { cx: 35, cy: 175 }, { cx: 36, cy: 175 }, { cx: 32, cy: 176 }, { cx: 33, cy: 176 }, { cx: 32, cy: 177 },
    { cx: 33, cy: 177 }, { cx: 34, cy: 177 }, { cx: 32, cy: 178 }, { cx: 33, cy: 178 }, { cx: 34, cy: 178 }, { cx: 35, cy: 178 }, { cx: 34, cy: 179 }, { cx: 35, cy: 179 },
    { cx: 27, cy: 180 }, { cx: 28, cy: 180 }, { cx: 29, cy: 180 }, { cx: 30, cy: 180 }, { cx: 38, cy: 180 }, { cx: 39, cy: 180 }, { cx: 40, cy: 180 }, { cx: 27, cy: 181 },
    { cx: 28, cy: 181 }, { cx: 29, cy: 181 }, { cx: 30, cy: 181 }, { cx: 31, cy: 181 }, { cx: 38, cy: 181 }, { cx: 39, cy: 181 }, { cx: 40, cy: 181 }, { cx: 28, cy: 182 },
    { cx: 29, cy: 182 }, { cx: 30, cy: 182 }, { cx: 30, cy: 184 }, { cx: 31, cy: 184 }, { cx: 32, cy: 184 }, { cx: 31, cy: 185 }, { cx: 27, cy: 186 }, { cx: 28, cy: 186 },
    { cx: 27, cy: 187 }, { cx: 28, cy: 187 },
  ],
  'Havenhythe': [
    { cx: 55, cy: 20 }, { cx: 56, cy: 20 }, { cx: 57, cy: 20 }, { cx: 58, cy: 20 }, { cx: 54, cy: 21 }, { cx: 55, cy: 21 }, { cx: 56, cy: 21 }, { cx: 57, cy: 21 },
    { cx: 58, cy: 21 }, { cx: 59, cy: 21 }, { cx: 53, cy: 22 }, { cx: 54, cy: 22 }, { cx: 55, cy: 22 }, { cx: 56, cy: 22 }, { cx: 57, cy: 22 }, { cx: 58, cy: 22 },
    { cx: 59, cy: 22 }, { cx: 52, cy: 23 }, { cx: 53, cy: 23 }, { cx: 54, cy: 23 }, { cx: 55, cy: 23 }, { cx: 56, cy: 23 }, { cx: 57, cy: 23 }, { cx: 58, cy: 23 },
    { cx: 59, cy: 23 }, { cx: 53, cy: 24 }, { cx: 54, cy: 24 }, { cx: 55, cy: 24 }, { cx: 56, cy: 24 }, { cx: 57, cy: 24 }, { cx: 58, cy: 24 }, { cx: 59, cy: 24 },
    { cx: 53, cy: 25 }, { cx: 54, cy: 25 }, { cx: 55, cy: 25 }, { cx: 56, cy: 25 }, { cx: 57, cy: 25 }, { cx: 58, cy: 25 }, { cx: 59, cy: 25 }, { cx: 53, cy: 26 },
    { cx: 54, cy: 26 }, { cx: 55, cy: 26 }, { cx: 56, cy: 26 }, { cx: 57, cy: 26 }, { cx: 58, cy: 26 }, { cx: 59, cy: 26 }, { cx: 52, cy: 27 }, { cx: 53, cy: 27 },
    { cx: 54, cy: 27 }, { cx: 55, cy: 27 }, { cx: 56, cy: 27 }, { cx: 57, cy: 27 }, { cx: 58, cy: 27 }, { cx: 53, cy: 28 }, { cx: 54, cy: 28 }, { cx: 55, cy: 28 },
    { cx: 56, cy: 28 }, { cx: 57, cy: 28 },
  ],
};
