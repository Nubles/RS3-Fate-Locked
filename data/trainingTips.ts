/**
 * Curated RuneScape 3 training method tips, keyed by skill name (exactly as
 * in SKILLS_LIST). Each entry covers a [from, to) level band with a canonical
 * RS3 method for that range. Tips are filtered at render time to the player's
 * current → required range so the popover stays relevant.
 *
 * Aimed at Ironman-style play: methods rely on self-sufficiency rather than
 * the Grand Exchange. Region/unlock notes kept brief — the wiki link covers
 * everything we don't.
 */

export interface TrainingTip {
  from: number;   // minimum player level to use this method
  to: number;     // use until this level (exclusive, 99 = "to max")
  method: string;
  note?: string;  // short parenthetical caveat / unlock requirement
}

export const TRAINING_TIPS: Record<string, TrainingTip[]> = {
  Agility: [
    { from: 1,  to: 10, method: 'Burthorpe Agility Course' },
    { from: 10, to: 35, method: 'Gnome Stronghold Agility Course' },
    { from: 30, to: 52, method: 'Anachronia Agility Course (beginner/novice sections)' },
    { from: 35, to: 52, method: 'Barbarian Outpost Agility Course', note: 'Needs the Alfred Grimhand\'s Barcrawl miniquest' },
    { from: 52, to: 65, method: 'Wilderness Agility Course', note: 'Wilderness — risky' },
    { from: 65, to: 77, method: 'Het\'s Oasis or Anachronia course (advanced)' },
    { from: 77, to: 85, method: 'Hefin Agility Course (Prifddinas)', note: 'Needs Plague\'s End' },
    { from: 85, to: 99, method: 'Advanced Gnome course or full Anachronia course', note: 'Best xp/hr' },
  ],
  Attack: [
    { from: 1,  to: 20, method: 'Quest rewards, then cows/goblins in Lumbridge' },
    { from: 20, to: 60, method: 'Slayer tasks (Vannaka/Chaeldar) on Attack' },
    { from: 60, to: 80, method: 'Slayer tasks or Ice/Fire giants with ability rotations' },
    { from: 80, to: 99, method: 'Abyssal demons / high-level Slayer', note: 'Use overload/super potions & Turmoil' },
  ],
  Constitution: [
    { from: 1, to: 99, method: 'Passive: ~1/3 of all combat XP', note: 'Starts at level 10; no direct training method' },
  ],
  Mining: [
    { from: 1,  to: 10, method: 'Copper & tin (Lumbridge Swamp)' },
    { from: 10, to: 20, method: 'Iron ore' },
    { from: 20, to: 30, method: 'Coal' },
    { from: 30, to: 40, method: 'Mithril ore' },
    { from: 40, to: 50, method: 'Adamantite or luminite (Dwarven Mine / Anachronia)' },
    { from: 50, to: 60, method: 'Runite ore' },
    { from: 60, to: 70, method: 'Orichalcite or drakolith' },
    { from: 70, to: 80, method: 'Necrite or phasmatite' },
    { from: 80, to: 89, method: 'Banite (Wilderness / Daemonheim mines)' },
    { from: 89, to: 99, method: 'Seren stones (Prifddinas) or light/dark animica (90+)', note: 'Seren stones need Plague\'s End' },
  ],
  Strength: [
    { from: 1,  to: 20, method: 'Quest rewards, then cows/goblins in Lumbridge' },
    { from: 20, to: 60, method: 'Slayer tasks on Strength' },
    { from: 60, to: 80, method: 'Slayer tasks or Ice/Fire giants with ability rotations' },
    { from: 80, to: 99, method: 'Abyssal demons / high-level Slayer', note: 'Use overload/super potions & Turmoil' },
  ],
  Smithing: [
    { from: 1,  to: 10, method: 'Bronze items, upgrading to +1…+5' },
    { from: 10, to: 20, method: 'Iron items' },
    { from: 20, to: 30, method: 'Steel items' },
    { from: 30, to: 40, method: 'Mithril items' },
    { from: 40, to: 50, method: 'Adamant burial armour (Artisans\' Workshop)' },
    { from: 50, to: 60, method: 'Rune burial armour or rune +3 items' },
    { from: 60, to: 70, method: 'Orikalkum items' },
    { from: 70, to: 80, method: 'Necronium items' },
    { from: 80, to: 90, method: 'Bane items' },
    { from: 90, to: 99, method: 'Elder rune items (+5)', note: 'Best xp; ore-intensive' },
  ],
  Defence: [
    { from: 1,  to: 20, method: 'Quest rewards, then cows/goblins in Lumbridge' },
    { from: 20, to: 70, method: 'Slayer tasks on Defence (or tank style)', note: 'Multi-skill XP' },
    { from: 70, to: 99, method: 'High-level Slayer with Defence abilities', note: 'Combine with Necromancy/Constitution' },
  ],
  Herblore: [
    { from: 1,  to: 22, method: 'Attack & Strength potions', note: 'Grow guam/tarromin at herb patches' },
    { from: 22, to: 38, method: 'Restore & Energy potions' },
    { from: 38, to: 45, method: 'Prayer potions' },
    { from: 45, to: 55, method: 'Super attack potions' },
    { from: 55, to: 66, method: 'Super strength & Super restore (63) potions' },
    { from: 66, to: 81, method: 'Super defence / Super ranging potions' },
    { from: 81, to: 88, method: 'Saradomin brews' },
    { from: 88, to: 96, method: 'Extreme potions' },
    { from: 96, to: 99, method: 'Overloads', note: 'Needs every extreme + torstol' },
  ],
  Fishing: [
    { from: 1,  to: 20, method: 'Shrimp/anchovies (Lumbridge Swamp)' },
    { from: 20, to: 48, method: 'Trout/salmon fly fishing (Barbarian Village)' },
    { from: 48, to: 68, method: 'Barbarian Fishing (Otto\'s Grotto)', note: 'Also trains Strength & Agility' },
    { from: 68, to: 82, method: 'Deep Sea Fishing hub (swarm & jellyfish)' },
    { from: 82, to: 94, method: 'Minnows at the Fishing Guild' },
    { from: 94, to: 99, method: 'Fishing Frenzy (Deep Sea Fishing hub)', note: 'Best xp/hr' },
  ],
  Ranged: [
    { from: 1,  to: 20, method: 'Quest rewards, then cows/goblins in Lumbridge' },
    { from: 20, to: 55, method: 'Slayer tasks with bows/thrown weapons' },
    { from: 55, to: 80, method: 'Chinchompas in multi-combat areas', note: 'Box-trap them yourself (53 Hunter)' },
    { from: 80, to: 99, method: 'Abyssal demons / high-level Slayer' },
  ],
  Thieving: [
    { from: 1,  to: 21, method: 'Pickpocket men/farmers; bake & silk stalls' },
    { from: 21, to: 50, method: 'Pyramid Plunder (Sophanem)', note: 'Needs Icthlarin\'s Little Helper' },
    { from: 50, to: 75, method: 'Shifting tombs (Menaphos) or Pyramid Plunder' },
    { from: 75, to: 83, method: 'Pyramid Plunder / safecracking' },
    { from: 83, to: 91, method: 'Crux Eqal knights' },
    { from: 91, to: 99, method: 'Prifddinas clan workers (Elves)', note: 'Needs Plague\'s End' },
  ],
  Cooking: [
    { from: 1,  to: 15, method: 'Shrimp / anchovies' },
    { from: 15, to: 35, method: 'Trout / salmon' },
    { from: 35, to: 68, method: 'Jugs of wine', note: 'Fast; cannot burn' },
    { from: 40, to: 62, method: 'Lobster / swordfish (useful food)' },
    { from: 62, to: 80, method: 'Monkfish' },
    { from: 80, to: 93, method: 'Sharks' },
    { from: 93, to: 99, method: 'Rocktails or sailfish (99)' },
  ],
  Prayer: [
    { from: 1,  to: 30, method: 'Bury bones and scatter ashes from combat' },
    { from: 30, to: 75, method: 'Ectofuntus (Port Phasmatys)', note: '4× bury XP; needs Morytania' },
    { from: 50, to: 99, method: 'Chaos Altar (Wilderness)', note: 'Wilderness — risky' },
    { from: 75, to: 99, method: 'Gilded altar in POH', note: 'Needs 75 Construction' },
  ],
  Crafting: [
    { from: 1,  to: 20, method: 'Leather items & pottery' },
    { from: 20, to: 40, method: 'Cut gems (sapphire → ruby)' },
    { from: 40, to: 54, method: 'Green/blue dragonhide bodies' },
    { from: 54, to: 66, method: 'Battlestaves (water/earth/fire)' },
    { from: 60, to: 80, method: 'Black/royal dragonhide bodies' },
    { from: 80, to: 99, method: 'Cut dragonstones / onyx or glassblowing', note: 'Gem bag from Dungeoneering helps' },
  ],
  Firemaking: [
    { from: 1,  to: 15, method: 'Regular logs on bonfires' },
    { from: 15, to: 30, method: 'Oak logs' },
    { from: 30, to: 45, method: 'Willow logs' },
    { from: 45, to: 60, method: 'Maple logs' },
    { from: 60, to: 75, method: 'Yew logs' },
    { from: 75, to: 90, method: 'Magic logs on bonfires' },
    { from: 90, to: 99, method: 'Elder logs or curly roots', note: 'Bonfires give a max life point boost' },
  ],
  Magic: [
    { from: 1,  to: 25, method: 'Combat spells on cows/goblins' },
    { from: 25, to: 55, method: 'Varrock/Camelot teleports & Superheat Item (43)' },
    { from: 55, to: 99, method: 'High Level Alchemy on drops', note: 'Needs a nature rune supply' },
    { from: 65, to: 99, method: 'Lunar utility spells (Superglass Make, Plank Make 86)', note: 'Needs Lunar Diplomacy' },
    { from: 70, to: 99, method: 'High-level Slayer with Magic' },
  ],
  Fletching: [
    { from: 1,  to: 10, method: 'Arrow shafts & headless arrows' },
    { from: 10, to: 20, method: 'Oak shortbows' },
    { from: 20, to: 40, method: 'Willow shortbows' },
    { from: 40, to: 70, method: 'Maple shortbows / longbows' },
    { from: 52, to: 99, method: 'Darts & bolts from Smithing', note: 'Fastest; metal-intensive' },
    { from: 70, to: 80, method: 'Yew shortbows / longbows' },
    { from: 80, to: 90, method: 'Magic shortbows / longbows' },
    { from: 90, to: 99, method: 'Elder shortbows / longbows' },
  ],
  Woodcutting: [
    { from: 1,  to: 10, method: 'Regular trees' },
    { from: 10, to: 20, method: 'Oak trees' },
    { from: 20, to: 30, method: 'Willow trees' },
    { from: 30, to: 50, method: 'Teak trees (Karamja)' },
    { from: 50, to: 68, method: 'Acadia trees (Menaphos)' },
    { from: 68, to: 90, method: 'Ivy (AFK, no logs)' },
    { from: 80, to: 90, method: 'Magic trees' },
    { from: 90, to: 99, method: 'Elder trees or crystal trees (94)', note: 'Crystal trees need Prifddinas' },
  ],
  Runecrafting: [
    { from: 1,  to: 50, method: 'The Runespan (Wizards\' Tower)', note: 'No essence needed' },
    { from: 1,  to: 40, method: 'Spirit runes in the City of Um', note: 'Necrotic runes; needs Necromancy!' },
    { from: 40, to: 77, method: 'Flesh/bone runes or Abyss runs (nature 44, law 54, death 65)' },
    { from: 50, to: 99, method: 'Runespan high level (Wizards\' Tower)' },
    { from: 77, to: 90, method: 'Blood runes via the Abyss' },
    { from: 90, to: 99, method: 'Soul runes via the Abyss or miasma runes' },
  ],
  Slayer: [
    { from: 1,  to: 20, method: 'Turael/Spria/Jacquelyn tasks' },
    { from: 20, to: 40, method: 'Mazchna tasks (Canifis)' },
    { from: 40, to: 70, method: 'Vannaka tasks (Edgeville Dungeon)' },
    { from: 50, to: 85, method: 'Chaeldar / Sumona tasks', note: 'Chaeldar needs Lost City' },
    { from: 75, to: 90, method: 'Duradel / Kuradal tasks' },
    { from: 90, to: 99, method: 'Laniakea (Anachronia) or Morvran (Prifddinas)', note: 'Best xp; Morvran needs Plague\'s End' },
  ],
  Farming: [
    { from: 1,  to: 15, method: 'Allotments & herbs (guam)' },
    { from: 15, to: 99, method: 'Tree & fruit tree runs every few hours', note: 'Passive; huge xp' },
    { from: 17, to: 99, method: 'Player-owned farm (Manor Farm)' },
    { from: 42, to: 99, method: 'Ranch Out of Time (Anachronia)', note: 'Needs Anachronia' },
    { from: 60, to: 99, method: 'Herb runs between tree runs' },
    { from: 90, to: 99, method: 'Elder trees & spirit trees' },
  ],
  Construction: [
    { from: 1,  to: 33, method: 'Fort Forinthry building projects' },
    { from: 33, to: 52, method: 'Oak larders' },
    { from: 40, to: 99, method: 'Construction Contracts (Fort Forinthry)', note: 'Rewards & good xp' },
    { from: 52, to: 74, method: 'Teak garden benches / teak tables' },
    { from: 74, to: 99, method: 'Mahogany tables', note: 'Plank-heavy; make planks at a sawmill' },
  ],
  Hunter: [
    { from: 1,  to: 19, method: 'Bird snares (crimson swifts → copper longtails)' },
    { from: 19, to: 29, method: 'Tropical wagtails (Feldip Hills)' },
    { from: 29, to: 53, method: 'Swamp lizards / orange salamanders (net traps)' },
    { from: 53, to: 63, method: 'Grey chinchompas (box traps)' },
    { from: 63, to: 77, method: 'Carnivorous chinchompas (Feldip Hills)' },
    { from: 77, to: 90, method: 'Grenwalls or crystal impling hunting' },
    { from: 90, to: 99, method: 'Tortles / Big Game Hunter (Anachronia)' },
  ],
  Summoning: [
    { from: 1,  to: 16, method: 'Spirit wolf / dreadfowl / spirit spider pouches' },
    { from: 16, to: 40, method: 'Granite crab & spirit kalphite pouches' },
    { from: 40, to: 52, method: 'Bull ant / Bronze-Iron minotaur pouches' },
    { from: 52, to: 68, method: 'Spirit terrorbird & abyssal parasite pouches' },
    { from: 68, to: 88, method: 'Bunyip / war tortoise / obsidian golem pouches' },
    { from: 88, to: 99, method: 'Geyser titan / abyssal titan / pack yak pouches', note: 'Charms come from combat; Ironman-limited' },
  ],
  Dungeoneering: [
    { from: 1,  to: 50, method: 'Daemonheim floors (small/medium, complexity 6)' },
    { from: 50, to: 99, method: 'Large Daemonheim floors on the highest floor available' },
    { from: 30, to: 99, method: 'Sinkholes (D&D) for bonus xp', note: 'Twice a day' },
    { from: 80, to: 99, method: 'Elite Dungeons', note: 'Combat-heavy; great xp' },
  ],
  Divination: [
    { from: 1,  to: 10, method: 'Pale wisps' },
    { from: 10, to: 20, method: 'Flickering wisps' },
    { from: 20, to: 30, method: 'Bright wisps' },
    { from: 30, to: 40, method: 'Glowing wisps' },
    { from: 40, to: 50, method: 'Sparkling wisps' },
    { from: 50, to: 60, method: 'Gleaming wisps' },
    { from: 60, to: 70, method: 'Vibrant wisps' },
    { from: 70, to: 80, method: 'Lustrous / elder (75) wisps or Hall of Memories', note: 'Hall of Memories needs 70' },
    { from: 80, to: 90, method: 'Brilliant / radiant (85) wisps' },
    { from: 90, to: 99, method: 'Luminous / incandescent (95) wisps' },
  ],
  Invention: [
    { from: 1,  to: 27, method: 'Disassemble items & discover blueprints', note: 'Needs 80 Crafting, Smithing & Divination to start' },
    { from: 27, to: 99, method: 'Siphon augmented gear at item level 10+' },
    { from: 40, to: 99, method: 'Manufacture devices & gizmos from your parts' },
    { from: 60, to: 99, method: 'Disassemble high-level Slayer/combat drops' },
  ],
  Archaeology: [
    { from: 1,  to: 5,  method: 'Archaeology tutorial (Archaeology Guild)' },
    { from: 5,  to: 20, method: 'Kharid-et dig site' },
    { from: 20, to: 42, method: 'Infernal Source dig site' },
    { from: 42, to: 60, method: 'Everlight dig site' },
    { from: 60, to: 70, method: 'Senntisten dig site' },
    { from: 70, to: 76, method: 'Stormguard Citadel dig site' },
    { from: 76, to: 90, method: 'Warforge dig site' },
    { from: 90, to: 99, method: 'Orthen dig site', note: 'Restore artefacts for bonus XP' },
  ],
  Necromancy: [
    { from: 1,  to: 5,  method: 'Necromancy! quest' },
    { from: 5,  to: 26, method: 'Lesser communion rituals', note: 'Build up 400 souls for talent tier 3' },
    { from: 26, to: 27, method: 'Finish Kili Row and Rune Mythos' },
    { from: 27, to: 90, method: 'Combat (Slayer), upgrading gear every 10 levels' },
    { from: 60, to: 90, method: 'Greater rituals (ensoul / communion)' },
    { from: 90, to: 99, method: 'Powerful rituals', note: 'Fastest but active; combat is the AFK option' },
  ],
};

/** Map skill name → RuneScape Wiki training guide page title. */
export function getWikiTrainingUrl(skill: string): string {
  return `https://runescape.wiki/w/${encodeURIComponent(`${skill} training`.replace(/ /g, '_'))}`;
}

/**
 * Cumulative XP at key levels (official RS3 values — the regular-skill curve
 * is identical to the classic one up to 99). Used to display "~123K XP to go".
 */
const XP_AT_LEVEL: Record<number, number> = {
  1: 0, 5: 388, 10: 1_154, 15: 2_411, 20: 4_470,
  25: 7_842, 30: 13_363, 35: 22_406, 40: 37_224, 45: 61_512,
  50: 101_333, 55: 166_636, 60: 273_742, 65: 449_428, 70: 737_627,
  75: 1_210_421, 80: 1_986_068, 85: 3_258_594, 90: 5_346_332,
  95: 8_771_558, 99: 13_034_431,
};

/** RS3 elite-skill curve (Invention): 99 = 36,073,511 XP. */
const ELITE_XP_AT_LEVEL: Record<number, number> = {
  1: 0, 5: 3_980, 10: 11_275, 15: 28_134, 20: 65_209,
  25: 143_025, 30: 277_713, 35: 509_259, 40: 854_383, 45: 1_381_488,
  50: 2_100_917, 55: 3_120_508, 60: 4_435_275, 65: 6_205_407, 70: 8_399_751,
  75: 11_245_538, 80: 14_672_812, 85: 18_992_239, 90: 24_080_695,
  95: 30_350_318, 99: 36_073_511,
};

const ELITE_SKILLS = new Set(['Invention']);

/**
 * Linear interpolation using the sparse XP table — accurate enough for UX.
 * Pass `skill` so elite skills (Invention) use their own, steeper curve.
 */
export function xpAtLevel(level: number, skill?: string): number {
  const table = skill && ELITE_SKILLS.has(skill) ? ELITE_XP_AT_LEVEL : XP_AT_LEVEL;
  if (level <= 1) return 0;
  if (level >= 99) return table[99];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let lo = 1, hi = 99;
  for (const k of keys) {
    if (k <= level) lo = k;
    else { hi = k; break; }
  }
  if (lo === hi) return table[lo] ?? 0;
  const t = (level - lo) / (hi - lo);
  return Math.round((table[lo] ?? 0) + t * ((table[hi] ?? 0) - (table[lo] ?? 0)));
}

export function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000)     return `${Math.round(xp / 1_000)}K`;
  return String(xp);
}
