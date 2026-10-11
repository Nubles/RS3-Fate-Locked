/**
 * RS3 combat / DPS engine (ability-based). Pure + side-effect free.
 *
 * Formulas from the RuneScape Wiki (checked 2026-10):
 *
 *  Ability damage (https://runescape.wiki/w/Ability_damage, scaling as of the
 *  2 March 2026 update), with L = relevant level incl. boosts, t = weapon tier,
 *  b = style damage bonus from armour/jewellery, cap = Strength level (melee),
 *  spell tier (magic), ammo tier (ranged) or none (Necromancy):
 *    g(L)  = 145 · ln(1 + 0.6·L/145) / ln(1.6)
 *    2h:   ⌊2.5·g⌋ + ⌊1.25·g⌋ + ⌊14.4·min(t, cap) + 1.5·b⌋
 *    MH:   ⌊2.5·g⌋ + ⌊9.6·min(t, cap) + b⌋
 *    OH:   ⌊0.5·(⌊2.5·g⌋ + ⌊9.6·min(t, cap) + b⌋)⌋        (dual wield = MH + OH)
 *
 *  Hit chance (https://runescape.wiki/w/Hit_chance):
 *    f(x)  = x³/1250 + 4x + 40
 *    accuracy a = ⌊f(level)⌋ + round(2.5·f(weapon tier))  (rounding matches the wiki's listed T92/T95 values)
 *    armour rating d = ⌊armour + f(target Defence)⌋
 *    H = min(1, affinity/100 · a/d)
 *
 * DPS model (an assumption — RS3 has no single "DPS" number): every 1.8s global
 * cooldown deals on average `rotation.mult` × ability damage, times hit chance.
 * Presets: basic-only 1.0×, Revolution bar 1.5×, an advanced manual rotation
 * (thresholds/ultimates/adrenaline management) 2.4×. Crits, bleeds, perks,
 * prayers and boss damage reduction are folded into that multiplier rather than
 * modelled individually.
 */

import type { CombatStyle } from '../data/rs3Gear';
import { accuracyFn, weaponAccuracy } from './gearStats';

export type Style = CombatStyle;

/** Seconds per global cooldown (3 ticks). */
export const GCD_SECONDS = 1.8;

// ── Ability damage ───────────────────────────────────────────────────────────

/** The wiki's level-scaling term g(L) for ability damage. */
export const damageLevelFn = (level: number): number =>
  level <= 0 ? 0 : (145 * Math.log(1 + (0.6 * level) / 145)) / Math.log(1.6);

const capped = (tier: number, cap: number): number => Math.min(tier, cap);

export const abilityDamage2h = (level: number, tier: number, cap: number, bonus: number): number => {
  const g = damageLevelFn(level);
  return Math.floor(2.5 * g) + Math.floor(1.25 * g) + Math.floor(14.4 * capped(tier, cap) + 1.5 * bonus);
};

export const abilityDamageMain = (level: number, tier: number, cap: number, bonus: number): number => {
  const g = damageLevelFn(level);
  return Math.floor(2.5 * g) + Math.floor(9.6 * capped(tier, cap) + bonus);
};

export const abilityDamageOff = (level: number, tier: number, cap: number, bonus: number): number =>
  Math.floor(0.5 * abilityDamageMain(level, tier, cap, bonus));

export type WeaponSetup =
  | { kind: 'two-hand'; tier: number; accTier?: number }
  | { kind: 'dual'; mainTier: number; mainAccTier?: number; offTier: number }
  | { kind: 'main-hand'; tier: number; accTier?: number }
  | { kind: 'none' };

/** Total ability damage (AD) for a weapon setup. */
export const abilityDamage = (setup: WeaponSetup, level: number, cap: number, bonus: number): number => {
  switch (setup.kind) {
    case 'two-hand': return abilityDamage2h(level, setup.tier, cap, bonus);
    case 'dual': return abilityDamageMain(level, setup.mainTier, cap, bonus) + abilityDamageOff(level, setup.offTier, cap, bonus);
    case 'main-hand': return abilityDamageMain(level, setup.tier, cap, bonus);
    default: return abilityDamageMain(level, 0, cap, bonus); // unarmed: level term only
  }
};

const setupAccTier = (s: WeaponSetup): number =>
  s.kind === 'two-hand' || s.kind === 'main-hand' ? s.accTier ?? s.tier : s.kind === 'dual' ? s.mainAccTier ?? s.mainTier : 0;

// ── Hit chance ───────────────────────────────────────────────────────────────

export const playerAccuracy = (level: number, weaponAccTier: number): number =>
  Math.floor(accuracyFn(level)) + weaponAccuracy(weaponAccTier);

export const armourRating = (defence: number, armour: number): number =>
  Math.floor(armour + accuracyFn(defence));

export const hitChance = (affinity: number, accuracy: number, rating: number, modifier = 0): number => {
  if (rating <= 0) return 1;
  return Math.max(0, Math.min(1, (affinity / 100) * (accuracy / rating) + modifier));
};

// ── Presets ──────────────────────────────────────────────────────────────────

export interface Rotation { id: string; label: string; mult: number; blurb: string }
export const ROTATIONS: Rotation[] = [
  { id: 'basic', label: 'Basic', mult: 1.0, blurb: 'Basics + auto-attacks only (~100% AD per GCD)' },
  { id: 'revolution', label: 'Revolution', mult: 1.5, blurb: 'Revolution bar with thresholds (~150% AD per GCD)' },
  { id: 'advanced', label: 'Advanced', mult: 2.4, blurb: 'Manual rotation, ultimates & adrenaline (~240% AD per GCD)' },
];

/** Level boosts: flat + pct of base level. RS3 overloads: 3+15%, elder overloads: 5+17%. */
export interface Potion { id: string; label: string; flat: number; pct: number }
export const POTIONS: Potion[] = [
  { id: 'none', label: 'No boost', flat: 0, pct: 0 },
  { id: 'overload', label: 'Overload', flat: 3, pct: 0.15 },
  { id: 'elder', label: 'Elder overload', flat: 5, pct: 0.17 },
];

export const boostedLevel = (base: number, potionId: string): number => {
  const p = POTIONS.find((x) => x.id === potionId) ?? POTIONS[0];
  return base + p.flat + Math.floor(p.pct * base);
};

const pick = <T extends { id: string }>(list: T[], id: string): T => list.find((x) => x.id === id) ?? list[0];

// ── Full calculation ─────────────────────────────────────────────────────────

export interface DpsInput {
  style: Style;
  /** Base levels (unboosted). accuracy = Attack for melee, else the style skill; damage = Strength for melee. */
  levels: { accuracy: number; damage: number };
  weapon: WeaponSetup;
  /** Style damage bonus (b) from armour. */
  damageBonus: number;
  /** Ranged: tier of equipped ammo (undefined = no ammo cap, e.g. chargebow/thrown). Magic: spell tier. */
  capTier?: number;
  rotationId: string;
  potionId: string;
  target: { affinity: number; defence: number; armour: number; lp: number };
}

export interface DpsResult {
  abilityDamage: number;
  accuracy: number;
  armourRating: number;
  hitChance: number;
  /** Expected damage per second. */
  dps: number;
  /** Seconds to kill (Infinity if no damage). */
  ttk: number;
  /** Effective weapon-tier cap actually applied. */
  cap: number;
  accLevel: number;
  dmgLevel: number;
}

export const computeDps = (input: DpsInput): DpsResult => {
  const accLevel = boostedLevel(input.levels.accuracy, input.potionId);
  const dmgLevel = boostedLevel(input.levels.damage, input.potionId);

  let cap = Infinity;
  if (input.style === 'melee') cap = dmgLevel;
  else if (input.style === 'magic') cap = input.capTier ?? dmgLevel;
  else if (input.style === 'ranged') cap = input.capTier ?? Infinity;

  const ad = abilityDamage(input.weapon, dmgLevel, cap, input.damageBonus);
  const acc = playerAccuracy(accLevel, setupAccTier(input.weapon));
  const rating = armourRating(input.target.defence, input.target.armour);
  const hc = hitChance(input.target.affinity, acc, rating);
  const rot = pick(ROTATIONS, input.rotationId);
  const dps = (ad * hc * rot.mult) / GCD_SECONDS;
  const ttk = dps > 0 && input.target.lp > 0 ? input.target.lp / dps : Infinity;
  return { abilityDamage: ad, accuracy: acc, armourRating: rating, hitChance: hc, dps, ttk, cap, accLevel, dmgLevel };
};

/** "m:ss" / "h:mm:ss" formatting for TTK. */
export const formatDuration = (s: number): string => {
  if (!isFinite(s)) return '—';
  const t = Math.round(s);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};
