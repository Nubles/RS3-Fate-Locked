/**
 * Gatherable-resource gating for the chunk activity panel.
 *
 * A chunk's `objects` list mixes inert scenery (banks, anvils, altars) with
 * real gathering nodes — trees, ore rocks, fishing spots. This module pulls the
 * gatherables out and tags each with the Skill + level needed to harvest it, so
 * the panel can show them green (can gather now) or red/struck-through (locked),
 * exactly the way shops gate on a merchant category and monsters on Slayer.
 *
 * A node is usable when the run's unlocked skill TIER actually reaches the
 * node's required level (cap model — tier N unlocks levels 1…N×10) AND the
 * player's current level meets it. So 99 Woodcutting at tier 3 still can't cut
 * yews (level 70 needs tier 7), exactly as the tier system intends.
 *
 * Facts (which node needs which level) are RuneScape 3 skilling requirements
 * (post-2018 Mining & Smithing rework; runescape.wiki), re-expressed here; the
 * node *names* come from our chunk-content dataset, which is Old School
 * chunk-picker data. The mainland geography is shared, but a handful of OSRS
 * node types have no RS3 counterpart (amethyst, lovakite, sulphur, anglerfish,
 * Sailing trees, Kourend altars, …) and are deliberately left ungated.
 */
import type { UnlockState } from '../types';
import { tierForLevel } from './skillTiers';

export interface ResourceReq {
  skill: string;
  level: number;
}

// Old School-only node types present in the chunk data. They are not RS3
// resources, so they resolve to null (ungated) instead of falling through to
// a generic "tree" / "fishing spot" rule with a wrong RS3 level.
const OSRS_ONLY = new RegExp([
  // Woodcutting: Kourend/Varlamore/Sailing trees, Fremennik juniper
  'redwood', 'mature juniper', 'camphor', 'ironwood', 'rosewood', 'jatoba',
  // Mining
  'amethyst', 'nickel rocks', 'basalt rock', 'lovakite', 'volcanic sulphur', 'lead rocks',
  'daeyalt', 'dense essence', 'dig site specimen',
  // Fishing
  'sacred eel', 'dark crab', 'anglerfish', 'minnow', 'lantern\\)', 'aerial fishing',
  'tempoross', 'civitas illa fortis', 'stranglewood', 'nasty token', 'ominous fishing',
  // Runecrafting
  '\\(kourend\\)', 'dark altar', 'temple of the eye',
].join('|'), 'i');

// Ordered most-specific → least: the first matching rule wins, so "Magic tree"
// is tested before the bare "tree" fallback, "Coal rocks" before "rocks".
const RESOURCE_RULES: [RegExp, ResourceReq][] = [
  // ── Woodcutting (RS3 levels) ────────────────────────────────────────────
  [/eternal magic tree/i, { skill: 'Woodcutting', level: 100 }],
  [/elder tree(?! patch)/i, { skill: 'Woodcutting', level: 90 }],
  [/magic tree/i, { skill: 'Woodcutting', level: 80 }],
  [/blisterwood/i, { skill: 'Woodcutting', level: 76 }],
  [/yew tree/i, { skill: 'Woodcutting', level: 70 }],
  [/mahogany tree/i, { skill: 'Woodcutting', level: 60 }],
  [/eucalyptus tree/i, { skill: 'Woodcutting', level: 58 }],
  [/arctic pine/i, { skill: 'Woodcutting', level: 54 }],
  [/acadia tree/i, { skill: 'Woodcutting', level: 50 }],
  [/hollow tree/i, { skill: 'Woodcutting', level: 45 }],
  [/maple tree/i, { skill: 'Woodcutting', level: 40 }],
  [/teak tree/i, { skill: 'Woodcutting', level: 30 }],
  [/willow tree/i, { skill: 'Woodcutting', level: 20 }],
  [/oak tree/i, { skill: 'Woodcutting', level: 10 }],
  [/achey tree/i, { skill: 'Woodcutting', level: 1 }],
  // Generic trees (incl. evergreen, jungle, banana, palm, tropical, dead) — lvl 1.
  // Farming "… tree patch" nodes are pulled out upstream before this runs, so a
  // bare \btree\b here only ever sees real Woodcutting trees.
  [/\btree\b/i, { skill: 'Woodcutting', level: 1 }],

  // ── Mining (only explicitly-named mineable rocks — bare "rocks"/"rock"/
  //    handholds are ambiguous Agility/scenery and stay ungated) ───────────
  [/(light|dark) animica/i, { skill: 'Mining', level: 90 }],
  [/seren stone/i, { skill: 'Mining', level: 89 }],
  [/banite rocks?/i, { skill: 'Mining', level: 80 }],
  [/necrite rocks?|phasmatite rocks?/i, { skill: 'Mining', level: 70 }],
  [/orichalcite rocks?|drakolith rocks?/i, { skill: 'Mining', level: 60 }],
  [/runite rocks/i, { skill: 'Mining', level: 50 }],
  [/sandstone rocks|mineral deposit/i, { skill: 'Mining', level: 50 }],
  [/granite rocks/i, { skill: 'Mining', level: 45 }],
  [/adamantite rocks|luminite rocks?/i, { skill: 'Mining', level: 40 }],
  [/gold rocks/i, { skill: 'Mining', level: 40 }],
  [/gem rocks?\b/i, { skill: 'Mining', level: 40 }], // Shilo Village / Lunar Isle gem rocks
  [/mithril rocks/i, { skill: 'Mining', level: 30 }],
  [/coal rocks?\b/i, { skill: 'Mining', level: 20 }],
  [/silver rocks/i, { skill: 'Mining', level: 20 }],
  [/iron rocks|limestone rocks?/i, { skill: 'Mining', level: 10 }],
  [/(copper|tin|clay) rocks/i, { skill: 'Mining', level: 1 }],

  // ── Fishing (by the spot's method / catch) ──────────────────────────────
  [/fishing spot \(karambwan\)/i, { skill: 'Fishing', level: 65 }],
  [/fishing spot \(lava eel\)/i, { skill: 'Fishing', level: 53 }],
  [/fishing spot \(barbarian\)/i, { skill: 'Fishing', level: 48 }], // leaping trout
  [/fishing spot \(cage, harpoon\)/i, { skill: 'Fishing', level: 35 }], // tuna 35 / lobster 40 / swordfish 50
  [/fishing spot \(harpoon\)/i, { skill: 'Fishing', level: 35 }],
  [/fishing spot \(lure, bait\)/i, { skill: 'Fishing', level: 20 }],
  [/fishing spot \(big net, harpoon\)/i, { skill: 'Fishing', level: 16 }], // mackerel 16 / bass 46 / shark 76
  [/fishing spot \(karambwanji\)/i, { skill: 'Fishing', level: 5 }],
  [/fishing spot/i, { skill: 'Fishing', level: 1 }], // small net / bait / swamp / location spots

  // ── Thieving (named market stalls; RS3 stall requirements. Bank/quest
  //    chests are excluded below) ─────────────────────────────────────────
  [/gem stall/i, { skill: 'Thieving', level: 75 }],
  [/scimitar stall/i, { skill: 'Thieving', level: 65 }],
  [/spice stall/i, { skill: 'Thieving', level: 65 }],
  [/magic stall/i, { skill: 'Thieving', level: 65 }],
  [/silver stall/i, { skill: 'Thieving', level: 50 }],
  [/fish stall/i, { skill: 'Thieving', level: 42 }],
  [/fur stall/i, { skill: 'Thieving', level: 35 }],
  [/seed stall/i, { skill: 'Thieving', level: 27 }],
  [/wine stall|market stall \(wine\)/i, { skill: 'Thieving', level: 22 }],
  [/silk stall/i, { skill: 'Thieving', level: 20 }],
  [/(fruit|veg|vegetable) stall/i, { skill: 'Thieving', level: 2 }],
  [/(baker'?s|cake|bread) stall/i, { skill: 'Thieving', level: 5 }],
  [/tea stall/i, { skill: 'Thieving', level: 5 }],
  [/(crafting|craft|crossbow) stall/i, { skill: 'Thieving', level: 5 }],
  [/general stall|food stall/i, { skill: 'Thieving', level: 5 }],
  [/\bstall\b/i, { skill: 'Thieving', level: 5 }], // generic market stall fallback

  // ── Runecrafting altars (RS3 levels; Prayer altars and travel portals are
  //    excluded below; the basic rune altars are reached via "Mysterious ruins")
  [/time altar/i, { skill: 'Runecrafting', level: 100 }],
  [/soul altar/i, { skill: 'Runecrafting', level: 90 }],
  [/blood altar/i, { skill: 'Runecrafting', level: 77 }],
  [/death altar/i, { skill: 'Runecrafting', level: 65 }],
  [/law altar/i, { skill: 'Runecrafting', level: 54 }],
  [/nature altar/i, { skill: 'Runecrafting', level: 44 }],
  [/astral altar/i, { skill: 'Runecrafting', level: 40 }],
  [/cosmic altar/i, { skill: 'Runecrafting', level: 27 }],
  [/body altar/i, { skill: 'Runecrafting', level: 20 }],
  [/mysterious ruins|\brift\b/i, { skill: 'Runecrafting', level: 1 }],
  // Agility courses are classified in utils/skillChunkNodes (their
  // obstacle objects are named "… Rooftop Course", excluded from trees above).
];

// Keyword-bearing nodes that are NOT the gatherable they look like: spirit
// trees / mushtrees are travel nodes; "(Prayer)" altars and travel portals
// are not Runecrafting.
const NOT_A_RESOURCE = /spirit tree|mushtree|rooftop course|\(prayer\)|altar of (guthix|zamorak|saradomin)|exposed altar|chaos altar|\bportal\b/i;

/** The Skill + level needed to gather this object, or null if it's inert. */
export const resourceReqFor = (objectName: string): ResourceReq | null => {
  if (NOT_A_RESOURCE.test(objectName) || OSRS_ONLY.test(objectName)) return null;
  for (const [re, req] of RESOURCE_RULES) if (re.test(objectName)) return req;
  return null;
};

/**
 * Usable when the unlocked tier reaches the node's level (cap model) AND the
 * current level meets it. e.g. yews (60) need tier ≥ 6 and level ≥ 60.
 */
export const resourceUsable = (req: ResourceReq, unlocks: UnlockState): boolean => {
  const tier = unlocks.skills?.[req.skill] ?? 0;
  const level = unlocks.levels?.[req.skill] ?? 1;
  return tier >= tierForLevel(req.level) && level >= req.level;
};
