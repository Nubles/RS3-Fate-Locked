/**
 * Derives an "estimated tier" (1..EQUIPMENT_TIER_MAX) for every real item, per
 * slot, so real gear can be gated by the fate-lock tier the player has unlocked.
 *
 * Not every RS3 item name carries a recognisable tier, so as a fallback we compute a transparent power
 * score from each item's bonuses and split each slot's items into equal-sized
 * quantile buckets. This is automatic (no manual data), monotonic (a stronger
 * item never lands in a lower tier than a weaker one in the same slot), and the
 * weights live here so the mapping can be retuned without touching the UI.
 *
 * Pure + tested.
 */

import { GearBonuses } from './gearStats';
import { EQUIPMENT_TIER_MAX } from '../config/rules';

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
  [/superior (statius|vesta|morrigan|zuriel)|abyssal (wand|orb)|abyssal scourge|ripper claw|shadow glaive|camel staff/, 7],
  // tier 80
  [/chaotic|attuned crystal|zaryte bow|virtus (wand|book)/, 6],
  // tier 70-75
  [/abyssal whip|dark bow|armadyl battlestaff|(armadyl|bandos|saradomin|zamorak) godsword|saradomin sword|zamorakian spear|staff of light|polypore staff|ganodermic|enhanced excalibur/, 5],
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

/** The combat style an item is built for (or 'armour' if it has no offence). */
export type GearStyle = 'melee' | 'ranged' | 'magic' | 'armour';

export const itemStyle = (b: GearBonuses): GearStyle => {
  const melee = Math.max(b.stab, b.slash, b.crush) + Math.max(b.meleeStr, 0);
  const ranged = Math.max(b.ranged, 0) + Math.max(b.rangedStr, 0);
  const magic = Math.max(b.magic, 0) + 8 * Math.max(b.magicStr, 0);
  const best = Math.max(melee, ranged, magic);
  if (best <= 0) return 'armour';
  if (best === magic) return 'magic';
  if (best === ranged) return 'ranged';
  return 'melee';
};

/** Strength of an item within its own style (offence + a defence contribution). */
export const stylePower = (b: GearBonuses, style: GearStyle = itemStyle(b)): number => {
  const defence =
    b.defStab + b.defSlash + b.defCrush + b.defMagic + b.defRanged + 2 * Math.max(b.prayer, 0);
  let off = 0;
  if (style === 'melee') off = Math.max(b.stab, b.slash, b.crush) + Math.max(b.meleeStr, 0);
  else if (style === 'ranged') off = Math.max(b.ranged, 0) + Math.max(b.rangedStr, 0);
  else if (style === 'magic') off = Math.max(b.magic, 0) + 12 * Math.max(b.magicStr, 0);
  return off + 0.5 * Math.max(0, defence);
};

export interface TierAnchor { tier: number; power: number }
export type TierAnchors = Record<GearStyle, TierAnchor[]>;

/**
 * Build, per style, a (tier → representative power) curve from the items whose
 * tier we know canonically. Unrecognised items are then placed against these
 * anchors, so the fallback is tied to the real material ladder instead of a
 * free-floating per-slot rank. The curve is forced monotonic in tier.
 */
export const buildTierAnchors = (
  known: { tier: number; bonuses: GearBonuses }[],
): TierAnchors => {
  const groups: Record<GearStyle, Record<number, number[]>> = {
    melee: {}, ranged: {}, magic: {}, armour: {},
  };
  for (const it of known) {
    const st = itemStyle(it.bonuses);
    (groups[st][it.tier] ||= []).push(stylePower(it.bonuses, st));
  }
  const out: TierAnchors = { melee: [], ranged: [], magic: [], armour: [] };
  for (const st of Object.keys(groups) as GearStyle[]) {
    const anchors = Object.entries(groups[st])
      .map(([t, arr]) => {
        // 75th percentile: spans the real strength range of each tier so strong
        // unrecognised items don't all saturate to the top tier, while staying
        // robust to a single low outlier (which max would not be).
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = Math.min(sorted.length - 1, Math.ceil(0.75 * (sorted.length - 1)));
        return { tier: Number(t), power: sorted[idx] };
      })
      .sort((a, b) => a.tier - b.tier);
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].power < anchors[i - 1].power) anchors[i].power = anchors[i - 1].power;
    }
    out[st] = anchors;
  }
  return out;
};

/** Estimate an item's tier from its stats, anchored to the canonical ladder. */
export const anchoredTier = (
  b: GearBonuses,
  anchors: TierAnchors,
  tierMax: number = EQUIPMENT_TIER_MAX,
): number => {
  const st = itemStyle(b);
  const list = (anchors[st]?.length ? anchors[st] : anchors.melee.length ? anchors.melee : anchors.armour);
  if (!list || list.length === 0) return 1;
  const p = stylePower(b, st);
  // Below/above the known range → clamp to the end tiers.
  if (p <= list[0].power) return Math.max(1, list[0].tier);
  if (p >= list[list.length - 1].power) return Math.min(tierMax, list[list.length - 1].tier);
  // Otherwise interpolate the tier between the two surrounding anchors, so gaps
  // in the canonical ladder still produce a strength-appropriate tier.
  for (let i = 0; i < list.length - 1; i++) {
    const lo = list[i], hi = list[i + 1];
    if (p >= lo.power && p < hi.power) {
      const span = hi.power - lo.power || 1;
      const tier = Math.round(lo.tier + ((p - lo.power) / span) * (hi.tier - lo.tier));
      return Math.min(tierMax, Math.max(1, tier));
    }
  }
  return Math.min(tierMax, Math.max(1, list[list.length - 1].tier));
};

/** Single scalar "power" for an item, from its bonuses. Higher = stronger. */
export const powerScore = (b: GearBonuses): number => {
  const offence =
    Math.max(b.stab, b.slash, b.crush, b.ranged, b.magic) +
    Math.max(b.meleeStr, 0) +
    Math.max(b.rangedStr, 0) +
    8 * Math.max(b.magicStr, 0);
  const defence =
    b.defStab + b.defSlash + b.defCrush + b.defMagic + b.defRanged +
    2 * Math.max(b.prayer, 0);
  return offence + 0.6 * Math.max(0, defence);
};

/**
 * Assign tiers 1..EQUIPMENT_TIER_MAX to a slot's items by quantile of score.
 * Returns a Map of item id → tier. Ties are broken by sorted position, so the
 * result is always monotonic in score. With fewer items than tiers the upper
 * tiers simply go unused.
 */
export const assignTiersForSlot = (
  items: { id: number; score: number }[],
  tierMax: number = EQUIPMENT_TIER_MAX,
): Map<number, number> => {
  const out = new Map<number, number>();
  const n = items.length;
  if (n === 0) return out;
  const sorted = [...items].sort((a, b) => a.score - b.score);
  sorted.forEach((item, i) => {
    // rank fraction in [0,1) → tier in 1..tierMax
    const tier = Math.min(tierMax, Math.floor((i / n) * tierMax) + 1);
    out.set(item.id, tier);
  });
  return out;
};
