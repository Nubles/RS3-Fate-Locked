/**
 * Chunk-derived quest locations — refine a quest's region requirement using the
 * actual chunks the quest touches, instead of only its hand-authored (and
 * continent-coarse) `regions` list.
 *
 * The chunk-content dataset records, per chunk, which quests **start** there
 * ('first') or have a **step** there ('step'). Joining that to our sub-area
 * unlock model lets us:
 *   • show the precise sub-areas a quest needs (Ardougne, not all of Kandarin),
 *     each green/red by its real unlock state, and
 *   • loosen the region gate: if every chunk a quest visits sits in an unlocked
 *     sub-area, the quest isn't region-locked even when its authored continent
 *     isn't fully unlocked.
 *
 * The loosening is deliberately conservative — it only ever *grants* region
 * access when chunk evidence fully supports it, so it can't mark a quest
 * available that the player can't actually reach.
 *
 * Content data: ChunkContentService (credit: source-chunk/chunk-picker-v2).
 * That dataset was built from the Old School map, so it only knows the quests
 * RS3 shares with OSRS (the mainland chunk grid is the same in both games).
 * RS3 titles that differ are translated via CHUNK_QUEST_ALIASES; RS3-only
 * quests (Necromancy, Elder God Wars, Fort Forinthry, Menaphos, Anachronia…)
 * simply have no chunk data and fall back to their authored continent.
 */
import { chunkContentService, EntityLocation } from '../services/ChunkContentService';
import { placeOf, chunkUnlocked, ChunkPlace } from './chunkLocations';
import { UnlockState } from '../types';

export interface QuestPlace extends ChunkPlace {
  unlocked: boolean;
  /** Does the quest start in this place, or just pass through it? */
  role: 'first' | 'step';
}

export interface QuestLocationInfo {
  /** False when the dataset has no chunk record for this quest. */
  hasData: boolean;
  /** Deduped places: start places first, then locked-before-unlocked. */
  places: QuestPlace[];
  /** Subset where the quest starts. */
  startPlaces: QuestPlace[];
  /** Places still locked for this run. */
  lockedPlaces: QuestPlace[];
  /** True when the quest has data and every place it touches is unlocked. */
  allUnlocked: boolean;
}

/**
 * Pure core: fold raw chunk locations into deduped, lock-tagged places.
 * Exported for unit testing without the (async, fetch-backed) service.
 */
export function summariseQuestPlaces(
  locations: EntityLocation[],
  unlocks: UnlockState,
): QuestLocationInfo {
  if (locations.length === 0) {
    return { hasData: false, places: [], startPlaces: [], lockedPlaces: [], allUnlocked: false };
  }
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
  const places = [...seen.values()].sort((a, b) =>
    Number(b.role === 'first') - Number(a.role === 'first') ||
    Number(a.unlocked) - Number(b.unlocked) || // locked first, so blockers lead
    a.label.localeCompare(b.label));
  const startPlaces = places.filter(p => p.role === 'first');
  const lockedPlaces = places.filter(p => !p.unlocked);
  return { hasData: true, places, startPlaces, lockedPlaces, allUnlocked: lockedPlaces.length === 0 };
}

/**
 * RS3 quest title → the title the (OSRS-derived) chunk dataset uses for the
 * same quest. `null` marks an RS3 quest whose title collides with a DIFFERENT
 * OSRS quest, so its chunk data must not be used.
 */
export const CHUNK_QUEST_ALIASES: Record<string, string | null> = {
  'Dragon Slayer': 'Dragon Slayer I',
  'Desert Treasure': 'Desert Treasure I',
  'Monkey Madness': 'Monkey Madness I',
  'A Fairy Tale I - Growing Pains': 'Fairytale I - Growing Pains',
  'A Fairy Tale II - Cure a Queen': 'Fairytale II - Cure a Queen',
  'Rag and Bone Man': 'Rag and Bone Man I',
  'Rat Catchers': 'Ratcatchers',
  'The Darkness of Hallowvale': 'Darkness of Hallowvale',
  'Bar Crawl': 'Alfred Grimhand\'s Barcrawl',
  // RS3's Sins of the Father (Elder God Wars, Anachronia) is not OSRS's
  // Darkmeyer quest of the same name.
  'Sins of the Father': null,
};

/** The chunk-dataset title for an RS3 quest (null = no usable chunk data). */
export function chunkQuestName(questName: string): string | null {
  if (questName in CHUNK_QUEST_ALIASES) return CHUNK_QUEST_ALIASES[questName];
  // Every RS3 RFD subquest lives under the single OSRS "Recipe for Disaster" entry.
  if (questName.startsWith('Recipe for Disaster: ')) return 'Recipe for Disaster';
  return questName;
}

/** Reverse lookup: chunk-dataset (OSRS) quest title → RS3 quest title. */
const RS3_BY_CHUNK_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(CHUNK_QUEST_ALIASES)
    .filter((e): e is [string, string] => e[1] !== null)
    .map(([rs3, chunk]) => [chunk, rs3]),
);
export function rs3QuestName(chunkName: string): string {
  return RS3_BY_CHUNK_NAME[chunkName] ?? chunkName;
}

/** Look the quest up in the (already-initialised) chunk index, then summarise. */
export function questLocations(questName: string, unlocks: UnlockState): QuestLocationInfo {
  const lookup = chunkQuestName(questName);
  const hit = lookup ? chunkContentService.entityLocations(lookup, ['quest']) : null;
  return summariseQuestPlaces(hit?.locations ?? [], unlocks);
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
