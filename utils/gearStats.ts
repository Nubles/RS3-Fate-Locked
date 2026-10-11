/**
 * RS3 equipment stats, derived from item tier with the RuneScape Wiki formulas.
 * Pure + tested.
 *
 * Sources (runescape.wiki, checked 2026-10):
 *  - Hit chance: level/tier accuracy function f(x) = x³/1250 + 4x + 40, weapon
 *    accuracy = 2.5·f(tier). Reproduces the wiki's listed weapon accuracies
 *    (T80 1924, T90 2458, T92 2577, T95 2765) and boss armour values.
 *  - Armour: slot multiplier × f(effective tier), where power armour counts as
 *    tank armour 5 tiers lower and hybrid 15 tiers lower (wiki "Armour").
 *    (matches the wiki to ±0.1 — its own rounding differs per item). Multipliers
 *    fitted to wiki values: helm 0.5, body 0.575, legs 0.55,
 *    gloves/boots 0.125, shield 0.5 (Rune platebody 195.5, Rune full helm 170.0,
 *    Malevolent cuirass 500.9 / helm 435.6 / greaves 479.1, Torva gloves 84.7).
 *  - Life points (tank): 15/tier body & legs, 10/tier helm, 5/tier gloves/boots
 *    (Rune platebody 750, Tetsu body 1245, Deathwarden T90 1350, Torva gloves 375);
 *    power armour gets the LP of tank armour 5 tiers lower, except tier 90+
 *    power sets which have none (Malevolent / Trimmed masterwork: 0).
 *  - Damage bonus (power armour): body 0.375·t, legs 0.3125·t, helm 0.25·t,
 *    gloves/boots 0.15625·t (Malevolent cuirass 33.7, greaves 28.1, helm 22.5,
 *    Torva body 30.0, Torva gloves 12.5, Trimmed masterwork body 34.5).
 *  - Weapon (ability) damage: main-hand 9.6·t, off-hand 4.8·t, two-hand 14.4·t
 *    (Death guard T80 768, Omni guard T95 912, Zaros godsword T92 1324.8).
 */

import { Rs3ItemDef, CombatStyle, gearId, gearNumericId } from '../data/rs3Gear';
import { fateTierForRs3Tier } from './gearTiers';

/** The wiki's accuracy/armour level function f(x). Unrounded. */
export const accuracyFn = (x: number): number => (x * x * x) / 1250 + 4 * x + 40;

/** Weapon accuracy from (accuracy) tier: floor(2.5·f(t)). */
export const weaponAccuracy = (tier: number): number => (tier > 0 ? Math.round(2.5 * accuracyFn(tier)) : 0);

const round1 = (x: number): number => Math.floor(x * 10 + 1e-6) / 10;
/** Armour is shown to 0.1; the wiki's own rounding varies by ±0.1 between items. */
const nearest1 = (x: number): number => Math.round(x * 10) / 10;

const ARMOUR_MULT: Record<string, number> = {
  Head: 0.5, Body: 0.575, Legs: 0.55, Gloves: 0.125, Boots: 0.125, Shield: 0.5,
};
const LP_PER_TIER: Record<string, number> = { Head: 10, Body: 15, Legs: 15, Gloves: 5, Boots: 5, Shield: 0 };
const DMG_PER_TIER: Record<string, number> = { Head: 0.25, Body: 0.375, Legs: 0.3125, Gloves: 0.15625, Boots: 0.15625 };

export interface GearStats {
  /** Weapon accuracy (0 for non-weapons). */
  accuracy: number;
  /** Weapon ability damage contribution (9.6t / 4.8t / 14.4t). */
  weaponDamage: number;
  /** Armour value. */
  armour: number;
  /** Life points bonus. */
  lp: number;
  /** Style damage bonus (the `b` term of the ability-damage formula). */
  damageBonus: number;
}

export const ZERO_STATS: GearStats = { accuracy: 0, weaponDamage: 0, armour: 0, lp: 0, damageBonus: 0 };

/** Normalised RS3 item with derived stats + its Fate tier. */
export interface GearItem extends Rs3ItemDef {
  /** Stable numeric id (what GameState.loadout stores). */
  id: number;
  /** URL-safe slug of the name. */
  key: string;
  /** Fate equipment tier (1..9) needed to use it. */
  fateTier: number;
  stats: GearStats;
}

export const armourValue = (slot: string, tier: number, cls: Rs3ItemDef['armour']): number => {
  const mult = ARMOUR_MULT[slot];
  if (!mult || !cls) return 0;
  const eff = cls === 'power' ? tier - 5 : cls === 'hybrid' ? tier - 15 : tier;
  return eff > 0 ? nearest1(mult * accuracyFn(eff)) : 0;
};

export const lpBonus = (slot: string, tier: number, cls: Rs3ItemDef['armour']): number => {
  const per = LP_PER_TIER[slot] ?? 0;
  if (!per || !cls || cls === 'hybrid') return 0;
  if (cls === 'power') return tier >= 90 ? 0 : per * Math.max(0, tier - 5);
  return per * tier;
};

export const armourDamageBonus = (slot: string, tier: number, cls: Rs3ItemDef['armour']): number =>
  cls === 'power' ? round1((DMG_PER_TIER[slot] ?? 0) * tier) : 0;

export const weaponDamage = (tier: number, hand: Rs3ItemDef['hand']): number =>
  hand === 'two-hand' ? round1(14.4 * tier) : hand === 'off-hand' ? round1(4.8 * tier) : hand === 'main-hand' ? round1(9.6 * tier) : 0;

export const deriveStats = (d: Rs3ItemDef): GearStats => ({
  accuracy: d.hand ? weaponAccuracy(d.accTier ?? d.tier) : 0,
  weaponDamage: weaponDamage(d.tier, d.hand),
  armour: armourValue(d.slot, d.tier, d.armour),
  lp: lpBonus(d.slot, d.tier, d.armour),
  damageBonus: armourDamageBonus(d.slot, d.tier, d.armour),
});

export const toGearItem = (d: Rs3ItemDef): GearItem => ({
  ...d,
  id: gearNumericId(d.name),
  key: gearId(d.name),
  fateTier: d.fate ?? fateTierForRs3Tier(d.tier),
  stats: deriveStats(d),
});

/** Sum the stats of a set of equipped items. */
export const sumStats = (items: (GearItem | undefined)[]): GearStats => {
  const total: GearStats = { ...ZERO_STATS };
  for (const it of items) {
    if (!it) continue;
    (Object.keys(total) as (keyof GearStats)[]).forEach((k) => { total[k] += it.stats[k] || 0; });
  }
  total.armour = nearest1(total.armour);
  total.damageBonus = round1(total.damageBonus);
  return total;
};

/** Damage bonus a loadout gives to one style (armour only counts for its own style). */
export const styleDamageBonus = (items: (GearItem | undefined)[], style: CombatStyle): number =>
  round1(items.reduce((a, it) => a + (it && (it.style === style || it.style === 'all') ? it.stats.damageBonus : 0), 0));

export const STAT_ROWS: { key: keyof GearStats; label: string }[] = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'weaponDamage', label: 'Weapon damage' },
  { key: 'damageBonus', label: 'Damage bonus' },
  { key: 'armour', label: 'Armour' },
  { key: 'lp', label: 'Life points' },
];
