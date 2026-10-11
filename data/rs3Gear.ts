/**
 * Curated RuneScape 3 equipment dataset for the Equipment Lab (Gear / DPS tabs)
 * and the Boss Kill Planner. RS3 facts only — sourced from the RuneScape Wiki
 * (runescape.wiki), checked item-by-item for a representative sample (see the
 * `// ✓ wiki` markers). Everything the app needs at runtime lives in this file,
 * so the tools work fully offline; nothing is fetched.
 *
 * Only the *identity* of each item is stored here (name, slot, RS3 tier, style,
 * hand class / armour class). Its numeric stats are derived from the tier with
 * the RS3 Wiki formulas in utils/gearStats.ts, which reproduce the wiki's
 * listed values exactly (e.g. Death guard T80 accuracy 1924, Malevolent
 * cuirass armour 500.9 / damage 33.7, Rune platebody armour 195.5, Torva gloves
 * damage 12.5). Explicit per-item overrides are used where the wiki splits
 * accuracy and damage tiers (Blade of Nymora, Wand of the Cywir elders…).
 *
 * Wiki-verified (2026-10) sample: Death guard T10–90 + Skull lantern T10–90,
 * Omni guard T95, Dark Shard of Leng T95, Zaros godsword T92, Eldritch crossbow
 * T92 (2h), Blightbound crossbow T92 (mh), Wyvern crossbow T85 (2h), Bow of
 * the Last Guardian T95, Fractured Staff of Armadyl T95, Roar of Awakening T95,
 * Noxious staff T90, Seismic wand T90, Staff of Sliske T92, Inquisitor staff
 * T80, Armadyl battlestaff T77, Polypore staff T75, Abyssal wand T75, Abyssal
 * vine whip T75, Bane T75 (80 to wear), Necronium T70, Orikalkum T60, Elder
 * rune T80 → +5 T85 (90 to wear), Tetsu / Death Lotus T83 tank (85 to wear),
 * Ganodermic T75 tank, Royal d'hide T65 tank, Mystic T50 tank, Imphide T10,
 * Malevolent / Trimmed masterwork / Elite sirenic, Deathwarden T10–90 tank,
 * Deathdealer T70–90 power, Robes of the First Necromancer T95 power, Araxyte
 * arrows T90, Wen arrows T95, Ascension bolts T90, Bakriminel bolts T75.
 * Items without a ✓ follow the standard RS3 material ladder and are
 * best-effort.
 */

export type CombatStyle = 'melee' | 'ranged' | 'magic' | 'necromancy';
export const COMBAT_STYLES: CombatStyle[] = ['melee', 'ranged', 'magic', 'necromancy'];

/** Weapon hand class. */
export type HandClass = 'main-hand' | 'off-hand' | 'two-hand';
/** RS3 armour class: tank (armour + LP), power (damage bonus), hybrid. */
export type ArmourClass = 'tank' | 'power' | 'hybrid';
export type AmmoType = 'arrow' | 'bolt';

export interface Rs3ItemDef {
  name: string;
  /** One of EQUIPMENT_SLOTS (data/items.ts). Off-hand weapons live in 'Shield'. */
  slot: string;
  /** RS3 item tier (drives damage/accuracy/armour). */
  tier: number;
  /** Combat style, or 'all' for style-neutral utility items. */
  style: CombatStyle | 'all';
  /** Level needed to wield/wear when it differs from the tier (e.g. Bane 75 → 80). */
  req?: number;
  hand?: HandClass;
  armour?: ArmourClass;
  /** Weapon accuracy tier when the wiki lists it separately from damage tier. */
  accTier?: number;
  /** Ranged weapons: which ammo they fire; omit for weapons with no ammo cap (chargebows, thrown). */
  ammo?: AmmoType;
  /** Ammo items: what kind. */
  ammoKind?: AmmoType;
  /** Weapon speed in game ticks (display only — RS3 abilities run on the 1.8s GCD). */
  speed?: number;
  /** Fate tier override where the Codex table places an item differently from its raw tier. */
  fate?: number;
  /** Short note: passive / caveat. */
  note?: string;
}

// ── Builders ─────────────────────────────────────────────────────────────────

type PieceNames = Partial<Record<'Head' | 'Body' | 'Legs' | 'Gloves' | 'Boots', string>>;

const set = (
  style: CombatStyle, tier: number, armour: ArmourClass, pieces: PieceNames,
  extra: Partial<Rs3ItemDef> = {},
): Rs3ItemDef[] =>
  (Object.entries(pieces) as [string, string][]).map(([slot, name]) => ({
    name, slot, tier, style, armour, ...extra,
  }));

/** Standard five-piece metal armour (helm/platebody/platelegs/gauntlets/boots). */
const metal = (mat: string, tier: number, extra: Partial<Rs3ItemDef> = {}) =>
  set('melee', tier, 'tank', {
    Head: `${mat} full helm`, Body: `${mat} platebody`, Legs: `${mat} platelegs`,
    Gloves: `${mat} gauntlets`, Boots: `${mat} armoured boots`,
  }, extra);

const dhide = (colour: string, tier: number) =>
  set('ranged', tier, 'tank', {
    Head: `${colour} dragonhide coif`, Body: `${colour} dragonhide body`, Legs: `${colour} dragonhide chaps`,
    Gloves: `${colour} dragonhide vambraces`, Boots: `${colour} dragonhide boots`,
  });

/** Dual-wield pair: main-hand + "Off-hand …" in the Shield slot. */
const pair = (
  style: CombatStyle, tier: number, main: string, off: string,
  extra: Partial<Rs3ItemDef> = {},
): Rs3ItemDef[] => [
  { name: main, slot: 'Weapon', tier, style, hand: 'main-hand', speed: 4, ...extra },
  { name: off, slot: 'Shield', tier, style, hand: 'off-hand', speed: 4, ...extra },
];

const twoH = (style: CombatStyle, tier: number, name: string, extra: Partial<Rs3ItemDef> = {}): Rs3ItemDef =>
  ({ name, slot: 'Weapon', tier, style, hand: 'two-hand', speed: 6, ...extra });

const NECRO_TIERS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

// ── Armour ───────────────────────────────────────────────────────────────────

const MELEE_ARMOUR: Rs3ItemDef[] = [
  ...metal('Bronze', 1),
  ...metal('Iron', 10),
  ...metal('Steel', 20),
  ...metal('Mithril', 30),
  ...metal('Adamant', 40),
  ...metal('Rune', 50), // ✓ wiki: platebody 195.5 armour, 750 LP; full helm 170.0 / 500 LP
  ...metal('Orikalkum', 60), // ✓ wiki T60 tank
  ...set('melee', 60, 'tank', { Head: 'Dragon full helm', Body: 'Dragon platebody', Legs: 'Dragon platelegs' }),
  ...metal('Necronium', 70), // ✓ wiki T70, 70 Defence
  ...set('melee', 70, 'power', {
    Head: 'Bandos helmet', Body: 'Bandos chestplate', Legs: 'Bandos tassets', Gloves: 'Bandos gloves', Boots: 'Bandos boots',
  }),
  ...set('melee', 70, 'tank', { Head: "Dharok's helm", Body: "Dharok's platebody", Legs: "Dharok's platelegs" }, { note: 'Barrows set effect not modelled' }),
  ...metal('Bane', 75, { req: 80, fate: 6 }), // ✓ wiki T75, 80 Defence (Codex: T6)
  ...set('melee', 80, 'power', {
    Head: 'Torva full helm', Body: 'Torva platebody', Legs: 'Torva platelegs', Gloves: 'Torva gloves', Boots: 'Torva boots',
  }), // ✓ wiki: body 389.6 armour / 30.0 dmg; gloves & boots 84.7 / 12.5
  ...metal('Elder rune', 80, { req: 90 }), // ✓ wiki T80 tank, 442.5 body armour
  ...metal('Elder rune', 85, { req: 90, fate: 8 }).map((i) => ({ ...i, name: `${i.name} + 5` })), // ✓ wiki +5 = T85
  ...set('melee', 83, 'tank', { Head: 'Tetsu helm', Body: 'Tetsu body', Legs: 'Tetsu platelegs' }, { req: 85 }), // ✓ wiki
  ...set('melee', 90, 'power', { Head: 'Malevolent helm', Body: 'Malevolent cuirass', Legs: 'Malevolent greaves' }), // ✓ wiki
  ...set('melee', 90, 'power', {
    Head: 'Masterwork helm', Body: 'Masterwork platebody', Legs: 'Masterwork platelegs', Gloves: 'Masterwork gloves', Boots: 'Masterwork boots',
  }),
  ...set('melee', 92, 'power', {
    Head: 'Trimmed masterwork helm', Body: 'Trimmed masterwork platebody', Legs: 'Trimmed masterwork platelegs',
    Gloves: 'Trimmed masterwork gloves', Boots: 'Trimmed masterwork boots',
  }), // ✓ wiki: body T92 power, 526.0 armour, 34.5 dmg
];

const RANGED_ARMOUR: Rs3ItemDef[] = [
  ...set('ranged', 1, 'tank', { Head: 'Leather cowl', Body: 'Leather body', Legs: 'Leather chaps', Gloves: 'Leather vambraces', Boots: 'Leather boots' }),
  ...set('ranged', 10, 'tank', { Head: 'Hard leather cowl', Body: 'Hard leather body', Legs: 'Hard leather chaps', Gloves: 'Hard leather vambraces', Boots: 'Hard leather boots' }),
  ...set('ranged', 20, 'tank', { Head: 'Studded leather coif', Body: 'Studded leather body', Legs: 'Studded leather chaps', Gloves: 'Studded leather vambraces', Boots: 'Studded leather boots' }),
  ...set('ranged', 30, 'tank', { Head: 'Snakeskin bandana', Body: 'Snakeskin body', Legs: 'Snakeskin chaps', Gloves: 'Snakeskin vambraces', Boots: 'Snakeskin boots' }),
  ...dhide('Green', 40),
  ...dhide('Blue', 50),
  ...dhide('Red', 55),
  ...dhide('Black', 60),
  ...dhide('Royal', 65), // ✓ wiki T65 tank, 298.7 armour / 975 LP
  ...set('ranged', 70, 'power', {
    Head: 'Armadyl helmet', Body: 'Armadyl chestplate', Legs: 'Armadyl chainskirt', Gloves: 'Armadyl gloves', Boots: 'Armadyl boots',
  }),
  ...set('ranged', 70, 'tank', { Head: "Karil's coif", Body: "Karil's top", Legs: "Karil's skirt" }, { note: 'Barrows set effect not modelled' }),
  ...set('ranged', 80, 'power', {
    Head: 'Pernix cowl', Body: 'Pernix body', Legs: 'Pernix chaps', Gloves: 'Pernix gloves', Boots: 'Pernix boots',
  }),
  ...set('ranged', 83, 'tank', { Head: 'Death Lotus hood', Body: 'Death Lotus chestplate', Legs: 'Death Lotus chaps' }, { req: 85 }), // ✓ wiki
  ...set('ranged', 90, 'power', { Head: 'Sirenic mask', Body: 'Sirenic hauberk', Legs: 'Sirenic chaps' }),
  ...set('ranged', 92, 'power', { Head: 'Elite sirenic mask', Body: 'Elite sirenic hauberk', Legs: 'Elite sirenic chaps' }), // ✓ wiki
];

const MAGIC_ARMOUR: Rs3ItemDef[] = [
  ...set('magic', 1, 'tank', { Head: 'Wizard hat', Body: 'Wizard robe top', Legs: 'Wizard robe skirt', Boots: 'Wizard boots' }),
  ...set('magic', 10, 'tank', { Head: 'Imphide hood', Body: 'Imphide robe top', Legs: 'Imphide robe bottom', Gloves: 'Imphide gloves', Boots: 'Imphide boots' }), // ✓ wiki T10
  ...set('magic', 20, 'tank', { Head: 'Spider silk hood', Body: 'Spider silk robe top', Legs: 'Spider silk robe bottom', Gloves: 'Spider silk gloves', Boots: 'Spider silk boots' }),
  ...set('magic', 40, 'tank', { Head: 'Splitbark helm', Body: 'Splitbark body', Legs: 'Splitbark legs', Gloves: 'Splitbark gauntlets', Boots: 'Splitbark boots' }),
  ...set('magic', 50, 'tank', { Head: 'Mystic hat', Body: 'Mystic robe top', Legs: 'Mystic robe bottom', Gloves: 'Mystic gloves', Boots: 'Mystic boots' }), // ✓ wiki T50 tank
  ...set('magic', 70, 'power', {
    Head: 'Hood of subjugation', Body: 'Garb of subjugation', Legs: 'Gown of subjugation', Gloves: 'Gloves of subjugation', Boots: 'Boots of subjugation',
  }),
  ...set('magic', 70, 'tank', { Head: "Ahrim's hood", Body: "Ahrim's robe top", Legs: "Ahrim's robe skirt" }, { note: 'Barrows set effect not modelled' }),
  ...set('magic', 75, 'tank', { Head: 'Ganodermic visor', Body: 'Ganodermic poncho', Legs: 'Ganodermic leggings' }), // ✓ wiki T75 tank
  ...set('magic', 80, 'power', {
    Head: 'Virtus mask', Body: 'Virtus robe top', Legs: 'Virtus robe legs', Gloves: 'Virtus gloves', Boots: 'Virtus boots',
  }),
  ...set('magic', 83, 'tank', { Head: "Seasinger's hood", Body: "Seasinger's robe top", Legs: "Seasinger's robe bottom" }, { req: 85 }),
  ...set('magic', 90, 'power', { Head: 'Tectonic mask', Body: 'Tectonic robe top', Legs: 'Tectonic robe bottom' }),
  ...set('magic', 92, 'power', { Head: 'Elite tectonic mask', Body: 'Elite tectonic robe top', Legs: 'Elite tectonic robe bottom' }),
];

const NECRO_ARMOUR: Rs3ItemDef[] = [
  // ✓ wiki (Necromancy equipment): Deathwarden tank T10–90, Deathdealer power T70–90.
  ...NECRO_TIERS.flatMap((t) => set('necromancy', t, 'tank', {
    Head: `Deathwarden hood (tier ${t})`, Body: `Deathwarden robe top (tier ${t})`, Legs: `Deathwarden robe bottom (tier ${t})`,
    Gloves: `Deathwarden gloves (tier ${t})`, Boots: `Deathwarden boots (tier ${t})`,
  }, { req: t === 10 ? 1 : t })),
  ...[70, 80, 90].flatMap((t) => set('necromancy', t, 'power', {
    Head: `Deathdealer hood (tier ${t})`, Body: `Deathdealer robe top (tier ${t})`, Legs: `Deathdealer robe bottom (tier ${t})`,
    Gloves: `Deathdealer gloves (tier ${t})`, Boots: `Deathdealer boots (tier ${t})`,
  })),
  ...set('necromancy', 95, 'power', {
    Head: "First Necromancer's hood", Body: "First Necromancer's robe top", Legs: "First Necromancer's robe bottom",
    Gloves: "First Necromancer's gauntlets", Boots: "First Necromancer's boots",
  }), // ✓ wiki "Robes of the First Necromancer" T95 power
  ...set('necromancy', 95, 'power', {
    Head: 'Vestments of havoc hood', Body: 'Vestments of havoc robe top', Legs: 'Vestments of havoc robe bottom',
  }, { note: 'T95 (wiki); armour class assumed power' }),
];

// ── Weapons ──────────────────────────────────────────────────────────────────

const MELEE_WEAPONS: Rs3ItemDef[] = [
  ...pair('melee', 1, 'Bronze longsword', 'Off-hand bronze longsword'),
  ...pair('melee', 10, 'Iron longsword', 'Off-hand iron longsword'),
  ...pair('melee', 20, 'Steel longsword', 'Off-hand steel longsword'),
  ...pair('melee', 30, 'Mithril longsword', 'Off-hand mithril longsword'),
  ...pair('melee', 40, 'Adamant longsword', 'Off-hand adamant longsword'),
  ...pair('melee', 50, 'Rune longsword', 'Off-hand rune longsword'),
  ...pair('melee', 60, 'Dragon longsword', 'Off-hand dragon longsword'), // ✓ wiki T60 mh
  ...pair('melee', 70, 'Necronium longsword', 'Off-hand necronium longsword'),
  { name: 'Abyssal whip', slot: 'Weapon', tier: 70, style: 'melee', hand: 'main-hand', speed: 4 },
  { name: 'Abyssal vine whip', slot: 'Weapon', tier: 75, style: 'melee', hand: 'main-hand', speed: 4 }, // ✓ wiki
  ...pair('melee', 75, 'Bane longsword', 'Off-hand bane longsword', { req: 80, fate: 6 }), // ✓ wiki T75 / 80 Attack
  ...pair('melee', 80, 'Chaotic rapier', 'Off-hand chaotic rapier'),
  ...pair('melee', 80, 'Elder rune longsword', 'Off-hand elder rune longsword', { req: 90 }),
  ...pair('melee', 85, 'Elder rune longsword + 5', 'Off-hand elder rune longsword + 5', { req: 90, fate: 8 }),
  ...pair('melee', 80, 'Blade of Nymora', 'Blade of Avaryss', { accTier: 90, req: 90, fate: 8 }), // ✓ wiki dmg T80 / acc T90
  ...pair('melee', 90, 'Drygore rapier', 'Off-hand drygore rapier'),
  ...pair('melee', 95, 'Dark Shard of Leng', 'Dark Sliver of Leng'), // ✓ wiki T95 mh
  twoH('melee', 1, 'Bronze 2h sword'),
  twoH('melee', 10, 'Iron 2h sword'),
  twoH('melee', 20, 'Steel 2h sword'),
  twoH('melee', 30, 'Mithril 2h sword'),
  twoH('melee', 40, 'Adamant 2h sword'),
  twoH('melee', 50, 'Rune 2h sword'),
  twoH('melee', 60, 'Dragon 2h sword'),
  twoH('melee', 75, 'Armadyl godsword'),
  twoH('melee', 80, 'Chaotic maul'),
  twoH('melee', 90, 'Noxious scythe'),
  twoH('melee', 92, 'Zaros godsword'), // ✓ wiki T92 2h, 1324.8 ability damage
];

const RANGED_WEAPONS: Rs3ItemDef[] = [
  twoH('ranged', 1, 'Shortbow', { ammo: 'arrow' }),
  twoH('ranged', 10, 'Oak shortbow', { ammo: 'arrow' }),
  twoH('ranged', 20, 'Willow shortbow', { ammo: 'arrow' }),
  twoH('ranged', 30, 'Maple shortbow', { ammo: 'arrow' }),
  twoH('ranged', 40, 'Yew shortbow', { ammo: 'arrow' }),
  twoH('ranged', 50, 'Magic shortbow', { ammo: 'arrow' }),
  twoH('ranged', 70, 'Dark bow', { ammo: 'arrow' }),
  twoH('ranged', 80, 'Zaryte bow', { ammo: 'arrow' }),
  twoH('ranged', 85, 'Wyvern crossbow', { ammo: 'bolt' }), // ✓ wiki T85 2h
  twoH('ranged', 90, 'Noxious longbow', { ammo: 'arrow' }),
  twoH('ranged', 92, 'Seren godbow', { note: 'Chargebow — no ammo cap' }),
  twoH('ranged', 92, 'Eldritch crossbow', { ammo: 'bolt' }), // ✓ wiki T92 2h
  twoH('ranged', 95, 'Bow of the Last Guardian', { ammo: 'arrow' }), // ✓ wiki T95 2h
  ...pair('ranged', 10, 'Iron crossbow', 'Off-hand iron crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 20, 'Steel crossbow', 'Off-hand steel crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 30, 'Mithril crossbow', 'Off-hand mithril crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 40, 'Adamant crossbow', 'Off-hand adamant crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 50, 'Rune crossbow', 'Off-hand rune crossbow', { ammo: 'bolt' }), // ✓ wiki T50
  ...pair('ranged', 60, 'Dragon crossbow', 'Off-hand dragon crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 80, 'Chaotic crossbow', 'Off-hand chaotic crossbow', { ammo: 'bolt' }),
  { name: 'Shadow glaive', slot: 'Weapon', tier: 80, accTier: 90, style: 'ranged', hand: 'main-hand', speed: 4, req: 90, fate: 8, note: 'Thrown — no ammo cap' }, // ✓ wiki
  { name: 'Off-hand shadow glaive', slot: 'Shield', tier: 80, accTier: 90, style: 'ranged', hand: 'off-hand', speed: 4, req: 90, fate: 8, note: 'Thrown — no ammo cap' },
  ...pair('ranged', 90, 'Ascension crossbow', 'Off-hand Ascension crossbow', { ammo: 'bolt' }),
  ...pair('ranged', 92, 'Blightbound crossbow', 'Off-hand Blightbound crossbow', { ammo: 'bolt' }), // ✓ wiki T92 mh
];

const MAGIC_WEAPONS: Rs3ItemDef[] = [
  twoH('magic', 5, 'Staff of air'), // ✓ wiki T5 2h
  twoH('magic', 30, 'Air battlestaff'), // ✓ wiki T30
  twoH('magic', 40, 'Mystic air staff'), // ✓ wiki T40
  twoH('magic', 75, 'Polypore staff'), // ✓ wiki T75
  twoH('magic', 77, 'Armadyl battlestaff'), // ✓ wiki T77
  twoH('magic', 80, 'Chaotic staff'),
  twoH('magic', 80, 'Inquisitor staff', { note: 'Susceptibility bonus vs some bosses not modelled' }), // ✓ wiki T80 2h
  twoH('magic', 90, 'Noxious staff'), // ✓ wiki T90 2h
  twoH('magic', 92, 'Staff of Sliske'), // ✓ wiki T92 2h
  twoH('magic', 95, 'Fractured Staff of Armadyl'), // ✓ wiki T95 2h
  ...pair('magic', 75, 'Abyssal wand', 'Abyssal orb'), // ✓ wiki wand T75
  ...pair('magic', 80, 'Virtus wand', 'Virtus book'),
  ...pair('magic', 80, 'Wand of the Cywir elders', 'Orb of the Cywir elders', { accTier: 90, req: 90, fate: 8 }), // ✓ wiki dmg T80 / acc T90
  ...pair('magic', 90, 'Seismic wand', 'Seismic singularity'), // ✓ wiki wand T90
  ...pair('magic', 95, 'Roar of Awakening', 'Ode to Deceit'), // ✓ wiki T95
];

const NECRO_WEAPONS: Rs3ItemDef[] = [
  // ✓ wiki: Death guard / Skull lantern tiers 10–90 (Death guard T10 wields at level 1).
  ...NECRO_TIERS.flatMap((t) => pair('necromancy', t, `Death guard (tier ${t})`, `Skull lantern (tier ${t})`, { req: t === 10 ? 1 : t, speed: 3 })),
  ...pair('necromancy', 95, 'Omni guard', 'Soulbound lantern', { speed: 3 }), // ✓ wiki T95, 2765 acc
];

const AMMO: Rs3ItemDef[] = [
  ...([
    ['Bronze', 1], ['Iron', 10], ['Steel', 20], ['Mithril', 30], ['Adamant', 40], ['Rune', 50], ['Dragon', 60],
  ] as [string, number][]).flatMap(([m, t]) => [
    { name: `${m} arrows`, slot: 'Ammo', tier: t, style: 'ranged' as const, ammoKind: 'arrow' as const },
    { name: `${m} bolts`, slot: 'Ammo', tier: t, style: 'ranged' as const, ammoKind: 'bolt' as const },
  ]),
  { name: 'Bakriminel bolts', slot: 'Ammo', tier: 75, style: 'ranged', ammoKind: 'bolt' }, // ✓ wiki T75
  { name: 'Araxyte arrows', slot: 'Ammo', tier: 90, style: 'ranged', ammoKind: 'arrow' }, // ✓ wiki T90
  { name: 'Ascension bolts', slot: 'Ammo', tier: 90, style: 'ranged', ammoKind: 'bolt' }, // ✓ wiki T90
  { name: 'Wen arrows', slot: 'Ammo', tier: 95, style: 'ranged', ammoKind: 'arrow' }, // ✓ wiki T95
];

/** Melee shields (defensive off-hands). They give armour, not damage. */
const SHIELDS: Rs3ItemDef[] = ([
  ['Bronze', 1], ['Iron', 10], ['Steel', 20], ['Mithril', 30], ['Adamant', 40], ['Rune', 50], ['Dragon', 60],
] as [string, number][]).map(([m, t]) => ({
  name: `${m} kiteshield`, slot: 'Shield', tier: t, style: 'melee' as const, armour: 'tank' as const,
})); // ✓ wiki: Rune kiteshield 170.0 armour

/**
 * Utility slots. Their RS3 value is passives (prayer, perks, set effects) that
 * this model does not simulate, so they carry no stats here — they are listed
 * so the Gear view can show what each Fate tier opens up. Fate tiers follow
 * the Codex named-item table (utils/gearTiers.ts NAMED_TIERS).
 */
const UTILITY: Rs3ItemDef[] = [
  { name: 'Amulet of strength', slot: 'Neck', tier: 1, style: 'all', fate: 2 },
  { name: 'Amulet of glory', slot: 'Neck', tier: 1, style: 'all', fate: 3, note: 'Teleports' },
  { name: 'Amulet of fury', slot: 'Neck', tier: 1, style: 'all', fate: 5 },
  { name: 'Amulet of souls', slot: 'Neck', tier: 1, style: 'all', fate: 8, note: 'Soul split heal boost' },
  { name: 'Essence of Finality amulet', slot: 'Neck', tier: 1, style: 'all', fate: 8, note: 'Stores a special attack' },
  { name: 'Reaper necklace', slot: 'Neck', tier: 1, style: 'all', fate: 8, note: 'Damage boost per Reaper task' },
  { name: 'Ring of wealth', slot: 'Ring', tier: 1, style: 'all', fate: 2 },
  { name: 'Onyx ring', slot: 'Ring', tier: 1, style: 'all', fate: 5 },
  { name: 'Berserker ring', slot: 'Ring', tier: 1, style: 'all', fate: 5 },
  { name: "Champion's ring", slot: 'Ring', tier: 1, style: 'all', fate: 6 },
  { name: 'Ring of death', slot: 'Ring', tier: 1, style: 'all', fate: 8 },
  { name: 'Team cape', slot: 'Cape', tier: 1, style: 'all', fate: 1 },
  { name: 'Obsidian cape', slot: 'Cape', tier: 1, style: 'all', fate: 3 },
  { name: 'Fire cape', slot: 'Cape', tier: 1, style: 'all', fate: 5 },
  { name: 'TokHaar-Kal-Ket', slot: 'Cape', tier: 1, style: 'all', fate: 8 },
  { name: 'Igneous Kal-Ket', slot: 'Cape', tier: 1, style: 'all', fate: 9 },
  { name: 'Scrimshaw of cruelty', slot: 'Pocket', tier: 1, style: 'all', fate: 4 },
  { name: 'Superior scrimshaw of cruelty', slot: 'Pocket', tier: 1, style: 'all', fate: 6 },
  { name: "Erethdor's grimoire", slot: 'Pocket', tier: 1, style: 'all', fate: 8, note: 'Crit chance/damage passive' },
  { name: 'Wisdom aura', slot: 'Aura', tier: 1, style: 'all', fate: 1 },
  { name: 'Inspiration aura', slot: 'Aura', tier: 1, style: 'all', fate: 4 },
  { name: 'Berserker aura', slot: 'Aura', tier: 1, style: 'all', fate: 6 },
  { name: 'Mahjarrat aura', slot: 'Aura', tier: 1, style: 'all', fate: 7 },
  { name: 'Equilibrium aura', slot: 'Aura', tier: 1, style: 'all', fate: 8 },
];

export const RS3_GEAR: Rs3ItemDef[] = [
  ...MELEE_ARMOUR, ...RANGED_ARMOUR, ...MAGIC_ARMOUR, ...NECRO_ARMOUR,
  ...MELEE_WEAPONS, ...RANGED_WEAPONS, ...MAGIC_WEAPONS, ...NECRO_WEAPONS,
  ...AMMO, ...SHIELDS, ...UTILITY,
];

/** Stable id from the item name. */
export const gearId = (name: string): string =>
  name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Stable numeric id from the item name (FNV-1a, offset past any legacy item
 * ids). The saved Gear-mode loadout (GameState.loadout) stores numeric ids, so
 * this keeps RS3 loadouts persistable without a schema change; legacy OSRS ids
 * from older saves simply resolve to nothing.
 */
export const gearNumericId = (name: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 100_000_000 + (h % 1_900_000_000);
};
