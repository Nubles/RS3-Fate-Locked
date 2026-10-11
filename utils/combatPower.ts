/**
 * Combat-power model for the Equipment Lab.
 *
 * Fate Locked has no real item stats — equipment is abstracted as a tier (0–9)
 * per slot and skills as a tier (0–10). This is the quick, abstract summary; the
 * real-item RS3 numbers live in the Gear / DPS tabs (data/rs3Gear.ts,
 * utils/dps.ts). Here we derive a consistent set of 0–100 "power" ratings from the
 * tiers the player has unlocked. Each axis blends the relevant gear slots with
 * the relevant skills (50/50), giving a stable, explainable readout that grows
 * as a run progresses.
 *
 * Pure and side-effect free — safe in useMemo and unit tests.
 */

import { UnlockState } from '../types';
import { EQUIPMENT_TIER_MAX } from '../config/rules';

const SKILL_TIER_MAX = 10;

/**
 * RS3 gear names for equipment tiers 1..9 (index 0 = T1), matching the Codex
 * "Equipment Tiers" table: T1 Bronze/Iron (1-10) … T9 tier 92-95 gear.
 */
export const TIER_LABELS = [
  'Iron', 'Mithril', 'Rune', 'Dragon', 'Barrows', 'Bane', 'Tetsu', 'Tectonic', 'Masterwork',
] as const;

export type PowerAxisKey = 'melee' | 'ranged' | 'magic' | 'necromancy' | 'defence' | 'prayer';

export interface PowerAxisDef {
  key: PowerAxisKey;
  label: string;
  slots: string[];
  skills: string[];
}

/** Which slots + skills feed each axis. Slots may appear in several axes. */
export const POWER_AXES: PowerAxisDef[] = [
  { key: 'melee',   label: 'Melee',   slots: ['Weapon', 'Body', 'Legs', 'Gloves', 'Boots'], skills: ['Attack', 'Strength'] },
  { key: 'ranged',  label: 'Ranged',  slots: ['Weapon', 'Body', 'Legs', 'Ammo', 'Boots'],   skills: ['Ranged'] },
  { key: 'magic',   label: 'Magic',   slots: ['Weapon', 'Body', 'Legs', 'Neck'],             skills: ['Magic'] },
  { key: 'necromancy', label: 'Necromancy', slots: ['Weapon', 'Shield', 'Body', 'Legs', 'Pocket'], skills: ['Necromancy'] },
  { key: 'defence', label: 'Defence', slots: ['Head', 'Body', 'Legs', 'Shield', 'Gloves', 'Boots', 'Cape'], skills: ['Defence', 'Constitution'] },
  { key: 'prayer',  label: 'Prayer',  slots: ['Neck', 'Cape', 'Ring'],                       skills: ['Prayer'] },
];

export interface PowerRating {
  key: PowerAxisKey;
  label: string;
  /** 0–100. */
  value: number;
}

const avg = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const ratingFor = (def: PowerAxisDef, u: UnlockState): number => {
  const gearNorm = avg(def.slots.map((s) => (u.equipment?.[s] || 0) / EQUIPMENT_TIER_MAX));
  const skillNorm = avg(def.skills.map((s) => (u.skills?.[s] || 0) / SKILL_TIER_MAX));
  return Math.round(100 * (0.5 * gearNorm + 0.5 * skillNorm));
};

/** Per-axis 0–100 power ratings derived from the current unlocks. */
export const computeCombatPower = (u: UnlockState): PowerRating[] =>
  POWER_AXES.map((def) => ({ key: def.key, label: def.label, value: ratingFor(def, u) }));

/** Single headline rating: the mean of the axes (0–100). */
export const overallCombatPower = (u: UnlockState): number => {
  const ratings = computeCombatPower(u);
  return Math.round(avg(ratings.map((r) => r.value)));
};
