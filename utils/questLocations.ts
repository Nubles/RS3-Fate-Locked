/**
 * Quest locations — where a quest takes the player, and whether those places
 * are unlocked.
 *
 * Two sources, best first:
 *   1. Chunk evidence: the chunk-content dataset may record, per chunk, which
 *      quests **start** there ('first') or have a **step** there ('step').
 *      Joining that to our sub-area unlock model shows the precise sub-areas a
 *      quest needs and can loosen the continent-coarse region gate (if every
 *      chunk the quest visits is unlocked, it isn't region-locked).
 *   2. The quest's authored RS3 `regions` (data/questData.ts — the continent it
 *      starts in first), each placed at a representative chunk of that
 *      continent so the UI can still list and jump to them.
 *
 * Quest chunk data comes from the RuneScape Wiki quest table
 * (scripts/rs3-wiki/quests.json, merged by sync-chunk-content.mjs: the start
 * NPC's / start coordinates' chunk is 'first', named places are 'step'). Quests
 * it can't place resolve through their authored regions. That fallback is
 * reported with `hasData: false`, so it never loosens the region gate:
 * refineQuestRegion only grants access on real chunk evidence.
 */
import { chunkContentService, EntityLocation } from '../services/ChunkContentService';
import { placeOf, chunkUnlocked, chunkForPlace, placeUnlocked, ChunkPlace } from './chunkLocations';
import { QUEST_DATA } from '../data/questData';
import { UnlockState } from '../types';

export interface QuestPlace extends ChunkPlace {
  unlocked: boolean;
  /** Does the quest start in this place, or just pass through it? */
  role: 'first' | 'step';
}

export interface QuestLocationInfo {
  /** True only when the places come from chunk evidence (not authored regions). */
  hasData: boolean;
  /** Where the places came from. */
  source: 'chunks' | 'regions' | 'none';
  /** Deduped places: start places first, then locked-before-unlocked. */
  places: QuestPlace[];
  /** Subset where the quest starts. */
  startPlaces: QuestPlace[];
  /** Places still locked for this run. */
  lockedPlaces: QuestPlace[];
  /** True when the quest has chunk data and every place it touches is unlocked. */
  allUnlocked: boolean;
}

const sortPlaces = (places: QuestPlace[]) => places.sort((a, b) =>
  Number(b.role === 'first') - Number(a.role === 'first') ||
  Number(a.unlocked) - Number(b.unlocked) || // locked first, so blockers lead
  a.label.localeCompare(b.label));

const NONE: QuestLocationInfo = { hasData: false, source: 'none', places: [], startPlaces: [], lockedPlaces: [], allUnlocked: false };

/**
 * Pure core: fold raw chunk locations into deduped, lock-tagged places.
 * Exported for unit testing without the (async, fetch-backed) service.
 */
export function summariseQuestPlaces(
  locations: EntityLocation[],
  unlocks: UnlockState,
): QuestLocationInfo {
  if (locations.length === 0) return NONE;
  const seen = new Map<string, QuestPlace>();
  for (const loc of locations) {
    const place = placeOf(loc.cx, loc.cy);
    const role: 'first' | 'step' = loc.role ?? 'step';
    const unlocked = chunkUnlocked(loc.cx, loc.cy, unlocks);
    const existing = seen.get(place.label);
    if (!existing) {
      seen.set(place.label, { ...place, unlocked, role });
    } else if (role === 'first') {
      existing.role = 'first'; // a start beats a mere step for the same place
    }
  }
  const places = sortPlaces([...seen.values()]);
  const startPlaces = places.filter(p => p.role === 'first');
  const lockedPlaces = places.filter(p => !p.unlocked);
  return { hasData: true, source: 'chunks', places, startPlaces, lockedPlaces, allUnlocked: lockedPlaces.length === 0 };
}

/**
 * Fallback: the quest's authored RS3 regions as places (the first listed
 * region is where it starts), each anchored at a representative chunk.
 * Regions with no chunk on the map are skipped. Never counts as chunk data.
 */
export function regionQuestPlaces(regions: string[], unlocks: UnlockState): QuestLocationInfo {
  const places: QuestPlace[] = [];
  regions.forEach((region, i) => {
    const c = chunkForPlace(region);
    if (!c || places.some(p => p.label === region)) return;
    places.push({
      cx: c.cx, cy: c.cy, subArea: null, region, label: region,
      unlocked: placeUnlocked(region, unlocks),
      role: i === 0 ? 'first' : 'step',
    });
  });
  if (places.length === 0) return NONE;
  sortPlaces(places);
  return {
    hasData: false,
    source: 'regions',
    places,
    startPlaces: places.filter(p => p.role === 'first'),
    lockedPlaces: places.filter(p => !p.unlocked),
    allUnlocked: false,
  };
}

const questByName = (name: string) =>
  QUEST_DATA[name] ?? Object.values(QUEST_DATA).find(q => q.name === name);

/** Chunk evidence for the quest when the dataset has it, else its authored regions. */
export function questLocations(questName: string, unlocks: UnlockState): QuestLocationInfo {
  const hit = chunkContentService.entityLocations(questName, ['quest']);
  if (hit?.locations.length) return summariseQuestPlaces(hit.locations, unlocks);
  return regionQuestPlaces(questByName(questName)?.regions ?? [], unlocks);
}

/**
 * Is the quest's region requirement met, refined by chunk evidence?
 *   • 'authored' — all gated continents in `regions` are unlocked (old behaviour)
 *   • 'chunks'   — continents aren't all unlocked, but every chunk the quest
 *                  visits is in an unlocked sub-area, so it's reachable anyway
 *   • 'locked'   — neither; some place the quest needs is still locked
 */
export function refineQuestRegion(
  authoredMet: boolean,
  info: QuestLocationInfo,
): { met: boolean; via: 'authored' | 'chunks' | 'locked' } {
  if (authoredMet) return { met: true, via: 'authored' };
  if (info.hasData && info.allUnlocked) return { met: true, via: 'chunks' };
  return { met: false, via: 'locked' };
}
