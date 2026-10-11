/**
 * RS3 item tier ↔ Fate equipment tier (1..EQUIPMENT_TIER_MAX) ladder, so real
 * RS3 gear can be gated by the tier the player has unlocked per slot.
 *
 * The ladder mirrors the Codex "Equipment Tiers" table (components/
 * ReferenceModal.tsx): T1 = RS3 tier 1–10 … T9 = tier 92–95+. Items in the
 * curated dataset (data/rs3Gear.ts) carry their RS3 tier, so their Fate tier is
 * `fateTierForRs3Tier(tier)` unless the item pins a Codex override. A name-based
 * classifier (`canonicalTierFromName`) is kept for free-text item names.
 *
 * Pure + tested.
 */

import { EQUIPMENT_TIER_MAX } from '../config/rules';

/** Highest RS3 item tier each Fate tier allows (index = Fate tier; 0 = locked). */
export const RS3_TIER_CAP: readonly number[] = [0, 10, 30, 50, 65, 75, 80, 88, 90, 100];

/** Human labels for each Fate tier's RS3 band (index = Fate tier). */
export const RS3_TIER_BAND_LABEL: readonly string[] = [
  'Locked', 'tier 1–10', 'tier 11–30', 'tier 31–50', 'tier 51–65', 'tier 66–75',
  'tier 76–80', 'tier 81–88', 'tier 89–90', 'tier 91–95+',
];

/** Fate equipment tier needed to use an RS3 item of the given item tier. */
export const fateTierForRs3Tier = (rs3Tier: number): number => {
  for (let f = 1; f <= EQUIPMENT_TIER_MAX; f++) if (rs3Tier <= RS3_TIER_CAP[f]) return f;
  return EQUIPMENT_TIER_MAX;
};

/** Highest RS3 item tier a Fate tier unlocks (0 when the slot is locked). */
export const maxRs3TierForFate = (fate: number): number =>
  RS3_TIER_CAP[Math.max(0, Math.min(EQUIPMENT_TIER_MAX, Math.floor(fate)))] ?? 0;

/**
 * Canonical RS3 material → Fate tier, mirroring the Codex's "Equipment Tiers"
 * table so the two views agree. Matches by item name. Returns null for items
 * whose material we can't recognise (uniques, cosmetics, quest items) — the
 * caller then falls back to the power-score estimate. Rules are ordered
 * most-specific / highest-tier first so ambiguous words resolve correctly
 * (e.g. "Black dragonhide" → T4 before plain "Black" metal → T2; "Elite
 * tectonic" → T9 before "Tectonic" → T8; "Elder rune +5" → T8 before plain
 * "Elder rune" → T6 before plain "Rune" → T3).
 *
 * Codex reference (keep in sync with components/ReferenceModal.tsx), by RS3
 * item tier (the level needed to wield/wear):
 *   T1 Bronze/Iron (1-10)             T2 Steel/Black/Mithril (20-30)
 *   T3 Adamant/Rune (40-50)           T4 Granite/Orikalkum/Dragon (55-65)
 *   T5 Necronium/Barrows/GWD1 (70-75) T6 Bane/Torva/Pernix/Virtus/Elder rune (80)
 *   T7 Tier 85-88 (Tetsu, Death Lotus, Seasinger's, refined anima core)
 *   T8 Tier 90 (Malevolent/Sirenic/Tectonic, Masterwork, Noxious, Drygore)
 *   T9 Tier 92-95+ (Trimmed masterwork, Elite Sirenic/Tectonic/Dracolich,
 *      Vestments of havoc, Zaros godsword, Eldritch crossbow, FSoA)
 */
/**
 * Iconic non-material items pinned to a tier so famous gear reads correctly even
 * though its name carries no material word. Checked before the material ladder,
 * ordered most-specific first.
 */
const NAMED_TIERS: [RegExp, number][] = [
  // tier 92-95+ weapons
  [/zaros godsword|eldritch crossbow|fractured staff of armadyl|staff of sliske|seren godbow|omni guard|soulbound lantern|roar of awakening|ode to deceit/, 9],
  // tier 90 weapons
  [/noxious|drygore|ascension crossbow|bow of the last guardian|cywir|wand of the praesul|imperium core|blade of (nymora|avaryss)|death guard \(tier 90\)|skull lantern \(tier 90\)/, 8],
  // tier 85-88 weapons / off-hands
  [/superior (statius|vesta|morrigan|zuriel)|abyssal scourge|ripper claw|camel staff/, 7],
  // tier 80
  [/chaotic|attuned crystal|zaryte bow|virtus (wand|book)/, 6],
  // tier 70-75
  [/abyssal (whip|vine whip|wand|orb)|dark bow|armadyl battlestaff|(armadyl|bandos|saradomin|zamorak) godsword|saradomin sword|zamorakian spear|staff of light|polypore staff|ganodermic|enhanced excalibur/, 5],
  // capes
  [/tzkal-zuk|igneous kal|completionist|max cape/, 9],
  [/tokhaar-kal/, 8],
  [/fire cape|tzhaar-kal/, 5],
  // hands / boots / jewellery
  [/(razorback|kerapac's wrist|cinderbane) gauntlets|kerapac's wrist wraps/, 8],
  [/(glacor|steadfast|ragefire|blood) boots|nightmare gauntlets|goliath gloves|swift gloves|spellcaster gloves/, 7],
  [/amulet of souls|essence of finality|reaper necklace|conjurer's raising/, 8],
  [/brawler|berserker ring|archers' ring|seers' ring|warrior ring|onyx ring|amulet of fury/, 5],
  [/amulet of glory/, 3],
  [/amulet of (strength|power|defence|accuracy)/, 2],
  [/barrows gloves|culinaromancer's gloves 10/, 5],
  // shields / defenders
  [/(arcane|divine|elysian|spectral) spirit shield/, 6],
  [/dragon defender|dragonfire shield/, 4],
  [/rune defender/, 3],
  // head / body uniques
  [/slayer helmet|full slayer helmet/, 3],
  [/void knight|elite void/, 3],
  [/helm of neitiznot|fighter torso/, 3],
  [/3rd age|third age/, 5],
  [/gilded/, 3], // gilded armour = rune stats
];

/** God-name / decorative prefixes used by clue-scroll cosmetics. */
const COSMETIC_PREFIX = /(armadyl|bandos|saradomin|zamorak|guthix|ancient|gilded)/;

/**
 * Tier purely from a base material word (metal / dragonhide / bow wood / robe),
 * or null. Used both for the main ladder and to re-tier god-themed clue
 * cosmetics by what they actually are (e.g. "Armadyl d'hide" → blessed d'hide,
 * not God Wars). RS3 dragonhide tiers: green 40, blue 50, red 55, black 60,
 * royal 65; uncoloured (blessed/god) d'hide → T3.
 */
const materialTier = (s: string): number | null => {
  const dh = '(d.?hide|dragonhide|dragon\\s*leather)';
  const bow = '(short|long|shield|comp(osite)?)?\\s*bow';
  // dragonhide by colour
  if (new RegExp(`(royal|black|red)\\s*${dh}`).test(s)) return 4;
  if (new RegExp(`(blue|green)\\s*${dh}`).test(s)) return 3;
  if (new RegExp(dh).test(s)) return 3;
  // bows by wood (magic 50, yew 40, maple 30, willow 20, oak 10)
  if (new RegExp(`(magic|yew)\\s*${bow}`).test(s)) return 3;
  if (new RegExp(`(maple|willow)\\s*${bow}`).test(s)) return 2;
  if (new RegExp(`oak\\s*${bow}`).test(s)) return 1;
  // robes / staves
  if (/mystic/.test(s)) return 3;
  if (/batwing|splitbark|battlestaff/.test(s)) return 2;
  if (/wizard|spider silk|carapace/.test(s)) return 1;
  // metals (RS3 metal ladder)
  if (/elder rune.*\+\s*[45]/.test(s)) return 8;
  if (/elder rune/.test(s)) return 6;
  if (/\bbane\b/.test(s)) return 6;
  if (/necronium/.test(s)) return 5;
  if (/orikalkum|\bgranite\b/.test(s)) return 4;
  if (/\bdragon\b/.test(s)) return 4;
  if (/\brun(e|ite)\b/.test(s)) return 3;
  if (/adamant(ite)?/.test(s)) return 3;
  if (/mithril/.test(s)) return 2;
  if (/steel/.test(s)) return 2;
  if (/\bblack\b/.test(s)) return 2;
  if (/studded/.test(s)) return 2;
  if (/bronze|\biron\b|wooden|\bleather\b|hard leather|training/.test(s)) return 1;
  return null;
};

export const canonicalTierFromName = (name: string): number | null => {
  const s = name.toLowerCase();

  // Named uniques first (so e.g. "Dragon defender" beats the generic "Dragon").
  for (const [re, tier] of NAMED_TIERS) if (re.test(s)) return tier;

  // God-themed / decorative clue-scroll cosmetics (e.g. "Armadyl rune helm",
  // "Bandos d'hide body") reskin a base material set — tier by the material,
  // not the god. Real GWD armour ("Bandos chestplate") has no material word,
  // so it falls through to the God Wars rule below.
  if (COSMETIC_PREFIX.test(s)) {
    const m = materialTier(s);
    if (m != null) return m;
  }

  // T9 — tier 92-95+ (elite / trimmed / T95 Necromancy)
  if (/(trimmed masterwork|elite (sirenic|tectonic|dracolich)|vestments of havoc|tumeken's resplendence|first necromancer)/.test(s)) return 9;

  // T8 — tier 90
  if (/(malevolent|sirenic|tectonic|masterwork|dracolich|deathwarden|deathdealer|teralith|tempest|primeval|cryptbloom)/.test(s)) return 8;

  // T7 — tier 85-88
  if (/(tetsu|death lotus|seasinger|refined anima core|superior (statius|vesta|morrigan|zuriel))/.test(s)) return 7;

  // T8 also: Elder rune +4/+5 (tier 90 after upgrading)
  if (/elder rune.*\+\s*[45]/.test(s)) return 8;

  // T6 — tier 80
  if (/(torva|pernix|virtus|anima core|elder rune)/.test(s)) return 6;

  // T5 — tier 70-75: Barrows, God Wars 1 armour, Necronium
  if (/(ahrim|karil|dharok|guthan|torag|verac|akrisae|linza|bandos|armadyl|subjugation|statius|vesta|morrigan|zuriel)/.test(s)) return 5;

  // Everything else by base material (metal / dragonhide / bow / robe).
  return materialTier(s);
};

