/**
 * Chunk-grounded view of a skill's trainable content for the Map Gathering tab.
 *
 * Scans the whole chunk dataset — objects, NPCs and monsters — and classifies
 * each entity to a skill + level, so the tab can show *everywhere* you can
 * train a skill on the map:
 *   • objects  → resourceReqFor (trees, ores, RC altars, stalls) + farming
 *     patches + use-stations
 *   • NPCs/monsters → resourceReqFor for fishing spots (NPCs in RS3), plus
 *     curated Divination-wisp, Hunter-creature and Thieving-pickpocket tables
 *     with RS3-wiki levels (these never appear as objects)
 *
 * Levels are grouped by the tier that unlocks them (cap model), matching the
 * resource gate. Names are the RS3 cache names in our chunk-content dataset.
 * Agility has no chunk nodes: RS3 course obstacles carry generic names (see
 * the Agility shortcuts panel for level-gated shortcuts instead).
 */
import { chunkContentService, EntityKind } from '../services/ChunkContentService';
import { resourceReqFor } from './chunkResources';
import { tierForLevel } from './skillTiers';

export interface SkillChunkNode {
  name: string;
  level: number;
  tier: number;
  chunks: number;
  kind: EntityKind;
  /** A use-station (anvil, range, altar…) — usable from level 1, no level gate. */
  station?: boolean;
}

interface Req { skill: string; level: number; station?: boolean }

// Production-skill training stations: usable from level 1 (the bar/food/item
// you bring sets the real level), so they carry no level gate. Excludes broken/
// placeholder variants below.
const STATION_RULES: [RegExp, string][] = [
  [/\banvil\b/i, 'Smithing'],
  [/\bfurnace\b|\bforge\b/i, 'Smithing'],
  [/cooking range|cooking spot|^range$|^cooker$|gnome cooker|^stove$|simple stove|cooking pot|clay oven/i, 'Cooking'],
  [/spinning wheel|\bloom\b|potter'?s wheel|pottery oven|potter'?s oven/i, 'Crafting'],
  [/\bbonfire\b|\bbrazier\b|^campfire$|fire pit/i, 'Firemaking'],
  [/gilded altar|chaos altar \(prayer\)|altar of (guthix|zamorak|saradomin)|exposed altar|ectofuntus|^altar$/i, 'Prayer'],
  [/\bsawmill\b|workbench/i, 'Construction'],
];
const NOT_STATION = /broken|space|half-built|rusted|cart wheel|experimental|\bbank\b/i;

const stationReq = (name: string): Req | null => {
  if (NOT_STATION.test(name)) return null;
  for (const [re, skill] of STATION_RULES) if (re.test(name)) return { skill, level: 1, station: true };
  return null;
};

// Farming patches — usable from low levels (the crop sets the real level), so
// they're surfaced at level 1. Excludes look-alikes like "Patched Wall".
const FARMING_PATCH = /\b(allotment|herb|flower|hops|bush|tree|fruit tree|hardwood|cactus|mushroom|belladonna|seaweed|calquat|spirit tree|elder tree|crystal tree|vine|grapevine|vinery)\b.*patch|^bush$|grapevine|giant seaweed/i;
const NOT_PATCH = /wall|barren|dry patch|mud patch|muddy|soil patch|firm snow|weedy|new farming/i;

// Entities that trip the keyword rules but aren't real gathering targets:
// combat/utility look-alikes (a "Butterfly ray" is a fish; a "Guard dog" is a
// dog; combat gnomes/elves aren't pickpocketable; named combat warriors aren't
// the Al Kharid thieving warrior).
const NOT_NODE = /butterfly ray|guard dog|guard captain|\bgnome (archer|mage|troop|driver|guard|banker|coach|trainer|child)|mounted|terrorbird|elder gnome|woman-at-arms|corrupted warrior|tutor|salesman|saleswoman|shopkeeper|barman|bartender|referee|wise old man|odd old man|strange old man|weird old man|mysterious old man|doorman|tracker gnome/i;

// Ordered curated NPC/monster rules (Hunter first so e.g. "Snowy knight" — a
// butterfly — isn't mistaken for a Thieving "knight"). First match wins.
// Levels are RS3 values (runescape.wiki Hunter/Thieving level up tables).
const NPC_RULES: [RegExp, Req][] = [
  // ── Divination: wisps (enriched variants share the level) ──
  [/\bpale wisp/i, { skill: 'Divination', level: 1 }],
  [/flickering wisp/i, { skill: 'Divination', level: 10 }],
  [/bright wisp/i, { skill: 'Divination', level: 20 }],
  [/glowing wisp/i, { skill: 'Divination', level: 30 }],
  [/sparkling wisp/i, { skill: 'Divination', level: 40 }],
  [/gleaming wisp/i, { skill: 'Divination', level: 50 }],
  [/vibrant wisp/i, { skill: 'Divination', level: 60 }],
  [/lustrous wisp/i, { skill: 'Divination', level: 70 }],
  [/elder wisp/i, { skill: 'Divination', level: 75 }],
  [/brilliant wisp/i, { skill: 'Divination', level: 80 }],
  [/radiant wisp/i, { skill: 'Divination', level: 85 }],
  [/luminous wisp/i, { skill: 'Divination', level: 90 }],
  [/incandescent wisp/i, { skill: 'Divination', level: 95 }],
  // ── Hunter: birds ──
  [/crimson swift/i, { skill: 'Hunter', level: 1 }],
  [/golden warbler/i, { skill: 'Hunter', level: 5 }],
  [/copper longtail/i, { skill: 'Hunter', level: 9 }],
  [/cerulean twitch/i, { skill: 'Hunter', level: 11 }],
  [/tropical wagtail/i, { skill: 'Hunter', level: 19 }],
  // ── Hunter: butterflies / moths ──
  [/ruby harvest/i, { skill: 'Hunter', level: 15 }],
  [/sapphire glacialis/i, { skill: 'Hunter', level: 25 }],
  [/snowy knight/i, { skill: 'Hunter', level: 35 }],
  [/black warlock/i, { skill: 'Hunter', level: 45 }],
  [/\bbutterfly\b/i, { skill: 'Hunter', level: 15 }],
  // ── Hunter: kebbits ──
  [/polar kebbit/i, { skill: 'Hunter', level: 1 }],
  [/common kebbit/i, { skill: 'Hunter', level: 3 }],
  [/feldip weasel/i, { skill: 'Hunter', level: 7 }],
  [/desert devil/i, { skill: 'Hunter', level: 13 }],
  [/wild kebbit/i, { skill: 'Hunter', level: 23 }],
  [/barb-tailed kebbit/i, { skill: 'Hunter', level: 33 }],
  [/prickly kebbit/i, { skill: 'Hunter', level: 37 }],
  [/spotted kebbit/i, { skill: 'Hunter', level: 43 }],
  [/razor-backed kebbit/i, { skill: 'Hunter', level: 49 }],
  [/sabre-toothed kebbit/i, { skill: 'Hunter', level: 51 }],
  [/dark kebbit/i, { skill: 'Hunter', level: 57 }],
  [/dashing kebbit/i, { skill: 'Hunter', level: 69 }],
  // ── Hunter: salamanders / lizards ──
  [/swamp lizard/i, { skill: 'Hunter', level: 29 }],
  [/orange salamander/i, { skill: 'Hunter', level: 47 }],
  [/red salamander/i, { skill: 'Hunter', level: 59 }],
  [/black salamander/i, { skill: 'Hunter', level: 67 }],
  // ── Hunter: beasts ──
  [/spined larupia/i, { skill: 'Hunter', level: 31 }],
  [/horned graahk/i, { skill: 'Hunter', level: 41 }],
  [/sabre-toothed kyatt/i, { skill: 'Hunter', level: 55 }],
  [/\bpawya\b/i, { skill: 'Hunter', level: 66 }],
  [/\bgrenwall\b/i, { skill: 'Hunter', level: 77 }],
  [/ornate tortle/i, { skill: 'Hunter', level: 96 }],
  [/\btortle\b/i, { skill: 'Hunter', level: 90 }],
  [/draconic jadinko/i, { skill: 'Hunter', level: 80 }],
  [/common jadinko/i, { skill: 'Hunter', level: 70 }],
  // ── Hunter: chinchompas / skillchompas ──
  [/crystal skillchompa/i, { skill: 'Hunter', level: 97 }],
  [/crimson skillchompa/i, { skill: 'Hunter', level: 89 }],
  [/azure skillchompa/i, { skill: 'Hunter', level: 68 }],
  [/viridian skillchompa/i, { skill: 'Hunter', level: 46 }],
  [/cobalt skillchompa/i, { skill: 'Hunter', level: 27 }],
  [/giant chinchompa/i, { skill: 'Hunter', level: 96 }],
  [/carnivorous chinchompa|red chinchompa/i, { skill: 'Hunter', level: 63 }],
  [/chinchompa/i, { skill: 'Hunter', level: 53 }],
  // ── Hunter: other ──
  [/\bferret\b/i, { skill: 'Hunter', level: 27 }],
  [/crystal impling/i, { skill: 'Hunter', level: 95 }],
  [/\bimpling\b/i, { skill: 'Hunter', level: 17 }],

  // ── Thieving: pickpocket targets (RS3 wiki levels) ──
  [/master farmer|chief farmer|martin the master/i, { skill: 'Thieving', level: 38 }],
  [/^farmer\b|farmer \(|fred the farmer|farmer (brumty|fromund|gricoller|hayfield)/i, { skill: 'Thieving', level: 10 }],
  [/h\.?a\.?m\.? member/i, { skill: 'Thieving', level: 15 }],
  [/^rogue enforcer/i, { skill: 'Thieving', level: 62 }],
  [/^rogue\b/i, { skill: 'Thieving', level: 32 }],
  [/cave goblin/i, { skill: 'Thieving', level: 36 }],
  [/crux eqal knight/i, { skill: 'Thieving', level: 83 }],
  [/crux eqal druid/i, { skill: 'Thieving', level: 42 }],
  [/desert bandit|pollnivnian bandit|^bandit$|^bandit \(/i, { skill: 'Thieving', level: 53 }],
  [/menaphite thug/i, { skill: 'Thieving', level: 65 }],
  [/^watchman/i, { skill: 'Thieving', level: 65 }],
  [/wizards'? tower mage/i, { skill: 'Thieving', level: 64 }],
  [/^archaeologist\b/i, { skill: 'Thieving', level: 78 }],
  // Prifddinas clan workers (91–98).
  [/iorwerth worker/i, { skill: 'Thieving', level: 91 }],
  [/ithell worker/i, { skill: 'Thieving', level: 92 }],
  [/cadarn worker/i, { skill: 'Thieving', level: 93 }],
  [/amlodd worker/i, { skill: 'Thieving', level: 94 }],
  [/hefin worker/i, { skill: 'Thieving', level: 95 }],
  [/crwys worker/i, { skill: 'Thieving', level: 96 }],
  [/meilyr worker/i, { skill: 'Thieving', level: 97 }],
  [/trahaearn worker/i, { skill: 'Thieving', level: 98 }],
  // Only the canonical pickpocket knights (generic "Knight" = Black/White
  // Knights, not pickpocketable).
  [/knight of ardougne/i, { skill: 'Thieving', level: 55 }],
  [/^paladin/i, { skill: 'Thieving', level: 70 }],
  [/^hero\b/i, { skill: 'Thieving', level: 80 }],
  [/\bgnome\b/i, { skill: 'Thieving', level: 75 }],
  // Only the explicitly thieving-tagged Al Kharid warrior (other "Warrior (…)"
  // are combat NPCs).
  [/warrior \(thieving\)|^warrior \(al kharid\)/i, { skill: 'Thieving', level: 25 }],
  [/^guard\b|guard \(|town guard|bank guard|jail guard/i, { skill: 'Thieving', level: 40 }],
  [/^(wo)?man\b|^man \(|poor looking (man|woman)|well-dressed man|pompous merchant/i, { skill: 'Thieving', level: 1 }],
];

const npcReq = (name: string): Req | null => {
  if (NOT_NODE.test(name)) return null;
  for (const [re, req] of NPC_RULES) if (re.test(name)) return req;
  return null;
};

const reqFor = (name: string, kind: EntityKind): Req | null => {
  if (kind === 'object') {
    const r = resourceReqFor(name);
    if (r) return r;
    if (FARMING_PATCH.test(name) && !NOT_PATCH.test(name)) return { skill: 'Farming', level: 1 };
    return stationReq(name);
  }
  // npc | monster — RS3 fishing spots are NPCs ("Fishing spot (net, bait)").
  if (/^fishing spot/i.test(name)) return resourceReqFor(name);
  return npcReq(name);
};

/** Gatherable/trainable nodes for `skill` present in the chunk data, by level. */
export const skillChunkNodes = (skill: string): SkillChunkNode[] => {
  if (!chunkContentService.ready) return [];
  const seen = new Set<string>();
  const out: SkillChunkNode[] = [];
  for (const kind of ['object', 'npc', 'monster'] as EntityKind[]) {
    for (const hit of chunkContentService.entitiesOfKind(kind)) {
      const req = reqFor(hit.name, kind);
      if (!req || req.skill !== skill) continue;
      const key = hit.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ name: hit.name, level: req.level, tier: tierForLevel(req.level), chunks: hit.locations.length, kind, station: req.station });
    }
  }
  return out.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
};

/** Level-graded gathering nodes grouped by the tier that unlocks them (stations excluded). */
export const skillChunkNodesByTier = (skill: string): Record<number, SkillChunkNode[]> => {
  const grouped: Record<number, SkillChunkNode[]> = {};
  for (const node of skillChunkNodes(skill)) if (!node.station) (grouped[node.tier] ??= []).push(node);
  return grouped;
};

/** Use-stations for a skill (anvils, ranges, altars…) — usable from level 1. */
export const skillStations = (skill: string): SkillChunkNode[] =>
  skillChunkNodes(skill).filter(n => n.station).sort((a, b) => a.name.localeCompare(b.name));
