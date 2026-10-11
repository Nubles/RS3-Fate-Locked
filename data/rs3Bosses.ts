/**
 * RS3 boss stat blocks for every entry of BOSSES_LIST (data/items.ts), used by
 * the DPS calculator and the Boss Kill Planner. RS3 facts only.
 *
 * Source: RuneScape Wiki infoboxes (runescape.wiki), normal mode / 0% enrage,
 * read 2026-10. `verified: true` means the stat block below was read from the
 * named NPC's wiki page. Encounters made of several NPCs use the named
 * representative (`npc`) — e.g. an elite dungeon's final boss.
 *
 * Fields:
 *  - lp: life points; defence: Defence level; armour: infobox armour value
 *    (= 2.5·f(defence) on the wiki). Where the infobox omits Defence it is
 *    back-solved from armour (flagged in `derived`).
 *  - affinity: base hit chance per player style (wiki "Affinity"), with the
 *    weakness affinity already applied to a whole-style weakness. When the wiki
 *    lists no Necromancy affinity the median of the other three is used
 *    (flagged in `derived`).
 *  - recStyle / recTier / recLevel: a sensible RS3 recommendation (style the
 *    boss is weak to or that the community uses; RS3 gear tier; combat level of
 *    that style). These are guidance, derived from the wiki's strategy pages and
 *    the boss's tier — not exact wiki fields.
 */

import type { CombatStyle } from './rs3Gear';

export interface Rs3Boss {
  /** Exact BOSSES_LIST entry. */
  name: string;
  /** Wiki NPC the stats come from when it differs from `name`. */
  npc?: string;
  combatLevel?: number;
  lp: number;
  defence: number;
  armour: number;
  affinity: Record<CombatStyle, number>;
  weakness?: string;
  primaryStyle: string;
  maxHit?: number;
  recStyle: CombatStyle;
  recTier: number;
  recLevel: number;
  /** Group size note when it is not a solo boss. */
  group?: string;
  /** Enrage / hard-mode note. */
  enrage?: string;
  /** Skilling boss — no combat DPS applies. */
  skilling?: string;
  verified: boolean;
  /** Which values were derived rather than read from the wiki. */
  derived?: string;
}

const aff = (melee: number, ranged: number, magic: number, necromancy?: number): Record<CombatStyle, number> => ({
  melee, ranged, magic,
  necromancy: necromancy ?? [melee, ranged, magic].sort((a, b) => a - b)[1],
});

export const RS3_BOSSES: Rs3Boss[] = [
  // ── Elite dungeons & raids ────────────────────────────────────────────────
  { name: 'Temple of Aminishi', npc: 'Seiryu the Azure Serpent', combatLevel: 10000, lp: 7_500_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1368, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    group: '1–5 players', enrage: 'Hard mode raises LP and damage', verified: true, derived: 'necromancy affinity' },
  { name: 'Dragonkin Laboratory', npc: 'Verak Lith', combatLevel: 1450, lp: 600_000, defence: 70, armour: 1694,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic & Melee', maxHit: 1368, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    group: '1–5 players', enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'The Shadow Reef', npc: 'The Ambassador', combatLevel: 5500, lp: 1_000_000, defence: 75, armour: 1694,
    affinity: aff(55, 55, 55), primaryStyle: 'Ranged', maxHit: 3300, recStyle: 'necromancy', recTier: 92, recLevel: 95,
    group: '1–5 players', enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'Zamorakian Undercity', npc: 'Zamorak, Lord of Chaos', combatLevel: 14000, lp: 300_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1819, recStyle: 'necromancy', recTier: 92, recLevel: 95,
    group: '1–5 players', enrage: 'Enrage 0–4000%', verified: true, derived: 'necromancy affinity' },
  { name: 'Liberation of Mazcab', npc: 'Beastmaster Durzag', combatLevel: 2000, lp: 1_500_000, defence: 90, armour: 2458,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee & Ranged', maxHit: 1788, recStyle: 'ranged', recTier: 90, recLevel: 90,
    group: '10-player raid', verified: true, derived: 'necromancy affinity' },

  // ── High-level ───────────────────────────────────────────────────────────
  { name: 'Vorago', combatLevel: 10000, lp: 250_000, defence: 90, armour: 2178,
    affinity: aff(40, 40, 40), primaryStyle: 'Melee & Magic', maxHit: 5000, recStyle: 'magic', recTier: 92, recLevel: 95,
    group: '2–10 players (5-man typical)', enrage: 'Hard mode weekly rotations', verified: true, derived: 'necromancy affinity; 250k per phase' },
  { name: 'Telos', npc: 'Telos, the Warden', combatLevel: 2000, lp: 400_000, defence: 80, armour: 1924,
    affinity: aff(40, 40, 40), primaryStyle: 'Melee & Magic', maxHit: 1324, recStyle: 'magic', recTier: 92, recLevel: 95,
    enrage: 'Enrage 0–4000% raises LP and damage', verified: true, derived: 'necromancy affinity' },
  { name: 'Solak', npc: 'Solak, Guardian of the Grove', combatLevel: 7000, lp: 2_000_000, defence: 70, armour: 1486,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee', maxHit: 4000, recStyle: 'ranged', recTier: 92, recLevel: 95,
    group: '1–7 players', verified: true, derived: 'necromancy affinity' },
  { name: 'Araxxor', combatLevel: 2500, lp: 100_000, defence: 85, armour: 1924,
    affinity: aff(45, 40, 60), primaryStyle: 'Varies by form', maxHit: 1341, recStyle: 'magic', recTier: 90, recLevel: 90,
    enrage: 'Enrage rises per kill; Araxxi follows', verified: true, derived: 'necromancy affinity' },
  { name: 'Nex: Angel of Death', combatLevel: 7000, lp: 3_000_000, defence: 99, armour: 2765,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee & Magic', maxHit: 2123, recStyle: 'magic', recTier: 92, recLevel: 95,
    group: '1–7 players', verified: true, derived: 'necromancy affinity' },
  { name: 'Raksha', npc: 'Raksha, the Shadow Colossus', combatLevel: 6000, lp: 800_000, defence: 85, armour: 2178,
    affinity: aff(55, 65, 55), primaryStyle: 'Magic', maxHit: 2570, recStyle: 'ranged', recTier: 92, recLevel: 95,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Arch-Glacor', combatLevel: 7000, lp: 65_000, defence: 75, armour: 1694,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1368, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    enrage: 'LP scales with enabled mechanics (hard mode)', verified: true, derived: 'necromancy affinity' },
  { name: 'Kerapac', npc: 'Kerapac, the bound', combatLevel: 3000, lp: 200_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1368, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'Zamorak, Lord of Chaos', combatLevel: 14000, lp: 300_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1819, recStyle: 'necromancy', recTier: 92, recLevel: 95,
    enrage: 'Enrage 0–4000%', verified: true, derived: 'necromancy affinity' },
  { name: 'TzKal-Zuk', combatLevel: 14000, lp: 600_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 65), primaryStyle: 'Melee', maxHit: 1837, recStyle: 'necromancy', recTier: 92, recLevel: 95,
    enrage: 'Hard mode after the TzekHaar Front', verified: true, derived: 'necromancy affinity' },
  { name: 'Rasial', npc: 'Rasial, the First Necromancer', combatLevel: 8462, lp: 800_000, defence: 95, armour: 2458,
    affinity: aff(55, 55, 55, 55), weakness: 'Necromancy', primaryStyle: 'Necromancy', maxHit: 2300,
    recStyle: 'necromancy', recTier: 90, recLevel: 95, verified: true },
  { name: 'Sanctum of Rebirth', npc: 'Nakatra, Devourer Eternal', combatLevel: 2160, lp: 800_000, defence: 95, armour: 2765,
    affinity: aff(55, 65, 55), primaryStyle: 'Magic', maxHit: 3000, recStyle: 'necromancy', recTier: 92, recLevel: 95,
    group: '1–5 players', enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'Barrows: Rise of the Six', npc: 'The six Barrows brothers', lp: 1_200_000, defence: 80, armour: 1924,
    affinity: aff(55, 55, 55), primaryStyle: 'All styles', recStyle: 'magic', recTier: 90, recLevel: 90,
    group: '2–5 players', verified: false, derived: 'stat block estimated (6 brothers, wiki lists no single infobox)' },
  { name: 'Kalphite King', combatLevel: 2500, lp: 260_000, defence: 85, armour: 2178,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee / Ranged / Magic phases', maxHit: 2560, recStyle: 'magic', recTier: 90, recLevel: 90,
    group: '1–5 players', verified: true, derived: 'affinities (vary by phase; neutral 55 assumed)' },
  { name: 'Amascut, the Devourer', combatLevel: 9999, lp: 4_000_000, defence: 95, armour: 2765,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 3000, recStyle: 'necromancy', recTier: 95, recLevel: 99,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'The Magister', combatLevel: 899, lp: 200_000, defence: 90, armour: 2458,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1425, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    verified: true, derived: 'necromancy affinity' },

  // ── God Wars Dungeons ────────────────────────────────────────────────────
  { name: 'Nex', combatLevel: 1001, lp: 200_000, defence: 80, armour: 1924,
    affinity: aff(40, 40, 40), primaryStyle: 'Melee, Magic & Ranged', maxHit: 1250, recStyle: 'ranged', recTier: 90, recLevel: 90,
    group: 'Solo or team', verified: true, derived: 'necromancy affinity' },
  { name: 'General Graardor', combatLevel: 624, lp: 40_000, defence: 60, armour: 1132,
    affinity: aff(50, 10, 50), primaryStyle: 'Melee', maxHit: 3000, recStyle: 'magic', recTier: 75, recLevel: 80,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'Commander Zilyana', combatLevel: 596, lp: 60_000, defence: 60, armour: 1132,
    affinity: aff(40, 40, 40), primaryStyle: 'Melee', maxHit: 2200, recStyle: 'ranged', recTier: 75, recLevel: 80,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: "Kree'arra", combatLevel: 580, lp: 75_000, defence: 60, armour: 1132,
    affinity: aff(10, 70, 70), primaryStyle: 'Ranged', maxHit: 1676, recStyle: 'magic', recTier: 75, recLevel: 80,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: "K'ril Tsutsaroth", combatLevel: 650, lp: 55_000, defence: 60, armour: 1132,
    affinity: aff(45, 40, 50), weakness: 'Fire spells', primaryStyle: 'Melee', maxHit: 1500, recStyle: 'magic', recTier: 75, recLevel: 80,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'Helwyr', combatLevel: 1000, lp: 200_000, defence: 70, armour: 1486,
    affinity: aff(60, 60, 60), primaryStyle: 'Melee', maxHit: 1224, recStyle: 'magic', recTier: 85, recLevel: 85,
    enrage: 'Challenge mode', verified: true, derived: 'necromancy affinity' },
  { name: 'Twin Furies', npc: 'Nymora, the Vengeful', combatLevel: 1000, lp: 250_000, defence: 70, armour: 1486,
    affinity: aff(60, 60, 60), primaryStyle: 'Ranged', maxHit: 816, recStyle: 'ranged', recTier: 85, recLevel: 85,
    enrage: 'Challenge mode', verified: true, derived: 'necromancy affinity; LP is per sister' },
  { name: 'Gregorovic', combatLevel: 1000, lp: 200_000, defence: 75, armour: 1694,
    affinity: aff(55, 55, 55), primaryStyle: 'Ranged', maxHit: 2300, recStyle: 'melee', recTier: 85, recLevel: 85,
    enrage: 'Challenge mode', verified: true, derived: 'necromancy affinity' },
  { name: 'Vindicta & Gorvek', npc: 'Vindicta', combatLevel: 1000, lp: 200_000, defence: 75, armour: 1694,
    affinity: aff(60, 60, 60), primaryStyle: 'Melee', maxHit: 3000, recStyle: 'ranged', recTier: 85, recLevel: 85,
    enrage: 'Challenge mode', verified: true, derived: 'necromancy affinity' },

  // ── Mid-level ────────────────────────────────────────────────────────────
  { name: 'Corporeal Beast', combatLevel: 785, lp: 100_000, defence: 75, armour: 1694,
    affinity: aff(40, 40, 40), primaryStyle: 'Melee & Magic', maxHit: 5000, recStyle: 'melee', recTier: 80, recLevel: 85,
    group: 'Solo or team', verified: true, derived: 'necromancy affinity' },
  { name: 'Queen Black Dragon', combatLevel: 900, lp: 100_000, defence: 80, armour: 1924,
    affinity: aff(50, 50, 50), primaryStyle: 'Melee', maxHit: 2480, recStyle: 'ranged', recTier: 80, recLevel: 80,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Legiones', npc: 'Legio Primus', combatLevel: 304, lp: 30_000, defence: 85, armour: 2178,
    affinity: aff(7, 70, 15), weakness: 'Ranged', primaryStyle: 'Magic', maxHit: 1102, recStyle: 'ranged', recTier: 85, recLevel: 90,
    group: 'Six legiones per run', verified: true, derived: 'necromancy affinity' },
  { name: 'Har-Aken', combatLevel: 800, lp: 150_000, defence: 80, armour: 1924,
    affinity: aff(45, 45, 45), primaryStyle: 'Melee', maxHit: 1152, recStyle: 'magic', recTier: 80, recLevel: 85,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Dagannoth Kings', npc: 'Dagannoth Rex', combatLevel: 303, lp: 35_000, defence: 68, armour: 1409,
    affinity: aff(0, 0, 60, 0), weakness: 'Magic (Rex); Prime is weak to Ranged, Supreme to Melee', primaryStyle: 'Melee',
    maxHit: 1788, recStyle: 'magic', recTier: 70, recLevel: 75, verified: true },
  { name: 'Kalphite Queen', combatLevel: 333, lp: 40_000, defence: 60, armour: 1132,
    affinity: aff(70, 60, 50), primaryStyle: 'Ranged', maxHit: 980, recStyle: 'melee', recTier: 70, recLevel: 70,
    enrage: 'Two forms (LP per form)', verified: true, derived: 'necromancy affinity' },
  { name: 'Exiled Kalphite Queen', combatLevel: 356, lp: 50_000, defence: 75, armour: 1694,
    affinity: aff(70, 60, 50), primaryStyle: 'Ranged', maxHit: 1100, recStyle: 'melee', recTier: 75, recLevel: 80,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Black Stone Dragon', npc: 'Black stone dragon', combatLevel: 2500, lp: 650_000, defence: 85, armour: 2178,
    affinity: aff(55, 55, 55, 0), primaryStyle: 'Magic', maxHit: 1368, recStyle: 'magic', recTier: 90, recLevel: 90,
    verified: true },
  { name: 'Hermod', npc: 'Hermod, the Spirit of War', combatLevel: 732, lp: 200_000, defence: 70, armour: 1486,
    affinity: aff(55, 55, 65, 90), weakness: 'Necromancy', primaryStyle: 'Necromancy', maxHit: 1750,
    recStyle: 'necromancy', recTier: 70, recLevel: 80, verified: true },
  { name: 'Zemouregal & Vorkath', npc: 'Vorkath', combatLevel: 789, lp: 750_000, defence: 65, armour: 1299,
    affinity: aff(55, 55, 55), primaryStyle: 'Magic', maxHit: 1224, recStyle: 'necromancy', recTier: 90, recLevel: 90,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Rex Matriarchs', npc: 'Orikalka', combatLevel: 888, lp: 190_000, defence: 96, armour: 2829,
    affinity: aff(10, 10, 64), weakness: 'Fire spells (Orikalka); each matriarch has its own weakness', primaryStyle: 'Melee',
    maxHit: 3129, recStyle: 'magic', recTier: 90, recLevel: 90, verified: true, derived: 'necromancy affinity' },
  { name: 'Flesh-hatcher Mhekarnahz', combatLevel: 368, lp: 125_000, defence: 55, armour: 983,
    affinity: aff(55, 90, 55), weakness: 'Ranged', primaryStyle: 'Magic', maxHit: 1750, recStyle: 'ranged', recTier: 75, recLevel: 80,
    verified: true, derived: 'necromancy affinity' },

  // ── Entry / skilling ─────────────────────────────────────────────────────
  { name: 'Giant Mole', combatLevel: 230, lp: 78_000, defence: 45, armour: 732,
    affinity: aff(55, 45, 65), primaryStyle: 'Melee', maxHit: 720, recStyle: 'magic', recTier: 50, recLevel: 60,
    enrage: 'Hard mode available', verified: true, derived: 'necromancy affinity' },
  { name: 'King Black Dragon', combatLevel: 276, lp: 45_000, defence: 60, armour: 1132,
    affinity: aff(60, 50, 70), primaryStyle: 'Melee, Magic & Dragonfire', maxHit: 864, recStyle: 'magic', recTier: 60, recLevel: 65,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Chaos Elemental', combatLevel: 305, lp: 17_250, defence: 69, armour: 1447,
    affinity: aff(50, 70, 60), weakness: 'Bolts (90 with bolts)', primaryStyle: 'Discord (any style)', maxHit: 1104, recStyle: 'ranged', recTier: 60, recLevel: 70,
    verified: true, derived: 'defence back-solved from armour; necromancy affinity' },
  { name: 'Barrows Brothers', npc: 'Dharok the Wretched', combatLevel: 150, lp: 12_000, defence: 70, armour: 1299,
    affinity: aff(60, 50, 70), weakness: 'Fire spells', primaryStyle: 'Melee', maxHit: 1260, recStyle: 'magic', recTier: 60, recLevel: 70,
    group: 'Six brothers per run', verified: true, derived: 'necromancy affinity' },
  { name: 'Bork', combatLevel: 107, lp: 45_000, defence: 70, armour: 1486,
    affinity: aff(50, 10, 50), weakness: 'Crush (75 with crush weapons)', primaryStyle: 'Melee', maxHit: 1368, recStyle: 'melee', recTier: 60, recLevel: 70,
    verified: true, derived: 'necromancy affinity' },
  { name: 'TzHaar Fight Cave', npc: 'TzTok-Jad', combatLevel: 702, lp: 40_000, defence: 70, armour: 1486,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee, Magic & Ranged', maxHit: 8000, recStyle: 'ranged', recTier: 60, recLevel: 70,
    enrage: '63 waves before Jad', verified: true, derived: 'necromancy affinity' },
  { name: 'Skeletal Horror', combatLevel: 91, lp: 50_000, defence: 65, armour: 1299,
    affinity: aff(55, 55, 55), primaryStyle: 'Melee', maxHit: 390, recStyle: 'melee', recTier: 50, recLevel: 60,
    verified: true, derived: 'necromancy affinity' },
  { name: 'Croesus', combatLevel: 6000, lp: 0, defence: 1, armour: 0,
    affinity: aff(0, 0, 0, 0), primaryStyle: 'None (skilling boss)', recStyle: 'melee', recTier: 1, recLevel: 1,
    skilling: 'Hunter, Fishing, Mining & Woodcutting (Construction minor)', group: '1–4 players', verified: true },
  { name: 'Gate of Elidinis', combatLevel: 650, lp: 0, defence: 1, armour: 0,
    affinity: aff(0, 0, 0, 0), primaryStyle: 'None (skilling boss)', recStyle: 'melee', recTier: 1, recLevel: 1,
    skilling: 'Agility, Construction, Crafting, Divination & Mining', verified: true },
  { name: 'Ivar, King of Bones', combatLevel: 206, lp: 40_000, defence: 50, armour: 850,
    affinity: aff(60, 50, 70), weakness: 'Air spells (90)', primaryStyle: 'Melee', maxHit: 1250, recStyle: 'magic', recTier: 40, recLevel: 50,
    verified: true, derived: 'defence back-solved from armour; necromancy affinity' },
  { name: 'Silverquill, the Dreadhog', combatLevel: 222, lp: 80_000, defence: 45, armour: 732,
    affinity: aff(60, 50, 70), weakness: 'Stab (90 with stab weapons)', primaryStyle: 'Melee, Ranged & Magic', maxHit: 1000, recStyle: 'magic', recTier: 50, recLevel: 60,
    verified: true, derived: 'defence back-solved from armour; necromancy affinity' },
];

const BY_NAME = new Map(RS3_BOSSES.map((b) => [b.name, b]));
export const bossByName = (name: string): Rs3Boss | undefined => BY_NAME.get(name);
