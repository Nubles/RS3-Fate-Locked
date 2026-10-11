/**
 * RS3 loadout builder + Boss Kill Planner engine. Pure + side-effect free.
 *
 *  - `bestLoadout` picks, for one combat style, the strongest real RS3 item per
 *    slot that the player's unlocked Fate tier allows (data/rs3Gear.ts gated
 *    via utils/gearTiers.ts), choosing between a two-hander and dual-wield /
 *    main-hand by actual ability damage.
 *  - `planBoss` runs every style against an RS3 boss (data/rs3Bosses.ts) with
 *    the ability-damage / hit-chance engine in utils/dps.ts, keeps the fastest,
 *    and rates readiness from gear tier vs the boss's recommended tier, the
 *    style level vs its recommended level, and the hard skill/quest gates in
 *    data/activityRequirements.ts.
 */

import { RS3_GEAR, CombatStyle, COMBAT_STYLES } from '../data/rs3Gear';
import type { Rs3Boss } from '../data/rs3Bosses';
import type { ActivityReq } from '../data/activityRequirements';
import { GearItem, toGearItem, styleDamageBonus } from './gearStats';
import { computeDps, DpsResult, WeaponSetup, abilityDamage, boostedLevel } from './dps';

export const ALL_GEAR: GearItem[] = RS3_GEAR.map(toGearItem);

export const ARMOUR_SLOTS = ['Head', 'Body', 'Legs', 'Gloves', 'Boots'] as const;
export const UTILITY_SLOTS = ['Neck', 'Ring', 'Cape', 'Pocket', 'Aura'] as const;

/** The skill whose level drives accuracy / damage for a style. */
export const STYLE_SKILLS: Record<CombatStyle, { accuracy: string; damage: string }> = {
  melee: { accuracy: 'Attack', damage: 'Strength' },
  ranged: { accuracy: 'Ranged', damage: 'Ranged' },
  magic: { accuracy: 'Magic', damage: 'Magic' },
  necromancy: { accuracy: 'Necromancy', damage: 'Necromancy' },
};

export const STYLE_LABEL: Record<CombatStyle, string> = {
  melee: 'Melee', ranged: 'Ranged', magic: 'Magic', necromancy: 'Necromancy',
};

/** Items a slot's unlocked Fate tier allows (0 = locked → nothing). */
export const allowedItems = (slot: string, fateTier: number, items: GearItem[] = ALL_GEAR): GearItem[] =>
  items.filter((i) => i.slot === slot && i.fateTier <= fateTier);

export interface Loadout {
  style: CombatStyle;
  slots: Record<string, GearItem | undefined>;
  weapon: WeaponSetup;
  /** Ranged ammo tier cap (undefined = no cap). */
  capTier?: number;
  damageBonus: number;
  /** Tier of the main weapon (0 if unarmed). */
  weaponTier: number;
}

const byStrength = (a: GearItem, b: GearItem) =>
  b.stats.damageBonus - a.stats.damageBonus || b.stats.armour - a.stats.armour || b.tier - a.tier;

const highestTier = (list: GearItem[]): GearItem | undefined =>
  [...list].sort((a, b) => b.tier - a.tier || (b.accTier ?? b.tier) - (a.accTier ?? a.tier))[0];

/** Weapon setup for a chosen main/off/2h combination. */
export const weaponSetupOf = (main?: GearItem, off?: GearItem): WeaponSetup => {
  if (main?.hand === 'two-hand') return { kind: 'two-hand', tier: main.tier, accTier: main.accTier };
  if (main && off?.hand === 'off-hand') return { kind: 'dual', mainTier: main.tier, mainAccTier: main.accTier, offTier: off.tier };
  if (main) return { kind: 'main-hand', tier: main.tier, accTier: main.accTier };
  return { kind: 'none' };
};

/** Ranged ammo cap for a weapon given the best allowed ammo (undefined = uncapped). */
export const rangedCap = (weapon: GearItem | undefined, ammoItems: GearItem[]): { cap?: number; ammo?: GearItem } => {
  if (!weapon?.ammo) return { cap: undefined };
  const ammo = highestTier(ammoItems.filter((a) => a.ammoKind === weapon.ammo));
  return { cap: ammo ? ammo.tier : 0, ammo };
};

/**
 * Best loadout for a style within the unlocked Fate tiers.
 * `levels` (base levels) decide the melee/magic weapon caps when ranking weapons.
 */
export const bestLoadout = (
  equipment: Record<string, number>,
  style: CombatStyle,
  levels: Record<string, number> = {},
  items: GearItem[] = ALL_GEAR,
): Loadout => {
  const tierOf = (slot: string) => equipment[slot] || 0;
  const slots: Record<string, GearItem | undefined> = {};

  for (const slot of ARMOUR_SLOTS) {
    slots[slot] = allowedItems(slot, tierOf(slot), items).filter((i) => i.style === style).sort(byStrength)[0];
  }
  for (const slot of UTILITY_SLOTS) {
    slots[slot] = [...allowedItems(slot, tierOf(slot), items)].sort((a, b) => b.fateTier - a.fateTier)[0];
  }
  const damageBonus = styleDamageBonus(Object.values(slots), style);

  const weapons = allowedItems('Weapon', tierOf('Weapon'), items).filter((i) => i.style === style);
  const offs = allowedItems('Shield', tierOf('Shield'), items).filter((i) => i.style === style && i.hand === 'off-hand');
  const ammoItems = allowedItems('Ammo', tierOf('Ammo'), items);

  const sk = STYLE_SKILLS[style];
  const dmgLevel = levels[sk.damage] || 1;
  const levelCap = style === 'melee' || style === 'magic' ? dmgLevel : Infinity;

  // Candidate setups: every 2h; every MH paired with its best OH (and alone).
  type Cand = { main?: GearItem; off?: GearItem; cap?: number; ammo?: GearItem; score: number };
  const cands: Cand[] = [{ score: abilityDamage({ kind: 'none' }, dmgLevel, levelCap, damageBonus) }];
  const capFor = (w: GearItem) => (style === 'ranged' ? rangedCap(w, ammoItems) : { cap: undefined as number | undefined, ammo: undefined as GearItem | undefined });
  for (const w of weapons) {
    const { cap, ammo } = capFor(w);
    const effCap = style === 'ranged' ? (cap ?? Infinity) : levelCap;
    if (w.hand === 'two-hand') {
      const setup = weaponSetupOf(w);
      cands.push({ main: w, cap, ammo, score: abilityDamage(setup, dmgLevel, effCap, damageBonus) + (w.accTier ?? w.tier) / 1000 });
    } else if (w.hand === 'main-hand') {
      // Off-hands that share the main-hand's ammo requirement (or none).
      const compatibleOffs = offs.filter((o) => style !== 'ranged' || o.ammo === w.ammo);
      const off = highestTier(compatibleOffs);
      const setup = weaponSetupOf(w, off);
      cands.push({ main: w, off, cap, ammo, score: abilityDamage(setup, dmgLevel, effCap, damageBonus) + (w.accTier ?? w.tier) / 1000 });
    }
  }
  const best = cands.sort((a, b) => b.score - a.score)[0];

  slots.Weapon = best.main;
  slots.Shield = best.off;
  if (!best.off && best.main?.hand !== 'two-hand' && style === 'melee') {
    // One-handed with no off-hand weapon: wear the best defensive shield.
    slots.Shield = allowedItems('Shield', tierOf('Shield'), items).filter((i) => !i.hand).sort(byStrength)[0];
  }
  slots.Ammo = style === 'ranged' ? best.ammo : undefined;

  return {
    style,
    slots,
    weapon: weaponSetupOf(best.main, best.off),
    capTier: style === 'ranged' ? best.cap : undefined,
    damageBonus,
    weaponTier: best.main?.tier ?? 0,
  };
};

// ── Boss planning ────────────────────────────────────────────────────────────

export type Readiness = 'ready' | 'stretch' | 'undergeared' | 'blocked' | 'skilling';

export interface StylePlan { style: CombatStyle; loadout: Loadout; result: DpsResult }

export interface BossPlan {
  boss: Rs3Boss;
  best?: StylePlan;
  /** Every style, fastest first. */
  styles: StylePlan[];
  killsPerHour: number;
  readiness: Readiness;
  /** Weapon tier minus the boss's recommended tier (best style). */
  gearDelta: number;
  /** Style level minus the boss's recommended level (best style). */
  levelDelta: number;
  missingSkills: { skill: string; need: number; have: number }[];
  missingQuests: string[];
}

export interface PlanInput {
  equipment: Record<string, number>;
  levels: Record<string, number>;
  quests: string[];
  rotationId: string;
  potionId: string;
  /** Restrict to one style (undefined = all four). */
  style?: CombatStyle;
}

/** Amortised between-kill time (looting, banking, instance setup), seconds. */
export const KILL_OVERHEAD_S = 20;

export const runStyle = (boss: Rs3Boss, style: CombatStyle, input: PlanInput): StylePlan => {
  const loadout = bestLoadout(input.equipment, style, input.levels);
  const sk = STYLE_SKILLS[style];
  const result = computeDps({
    style,
    levels: { accuracy: input.levels[sk.accuracy] || 1, damage: input.levels[sk.damage] || 1 },
    weapon: loadout.weapon,
    damageBonus: loadout.damageBonus,
    capTier: loadout.capTier,
    rotationId: input.rotationId,
    potionId: input.potionId,
    target: { affinity: boss.affinity[style], defence: boss.defence, armour: boss.armour, lp: boss.lp },
  });
  return { style, loadout, result };
};

export const planBoss = (boss: Rs3Boss, req: ActivityReq | undefined, input: PlanInput): BossPlan => {
  const missingSkills = Object.entries(req?.skills ?? {})
    .map(([skill, need]) => ({ skill, need, have: input.levels[skill] || (skill === 'Constitution' ? 10 : 1) }))
    .filter((g) => g.have < g.need);
  const missingQuests = (req?.quests ?? []).filter((q) => !input.quests.includes(q));
  const blocked = missingSkills.length > 0 || missingQuests.length > 0;

  if (boss.skilling) {
    return {
      boss, styles: [], killsPerHour: 0, readiness: blocked ? 'blocked' : 'skilling',
      gearDelta: 0, levelDelta: 0, missingSkills, missingQuests,
    };
  }

  const styles = (input.style ? [input.style] : COMBAT_STYLES)
    .map((s) => runStyle(boss, s, input))
    .sort((a, b) => {
      // Within 1% of each other counts as a tie → prefer the boss's recommended style.
      const ta = a.result.ttk, tb = b.result.ttk;
      const tie = isFinite(ta) && isFinite(tb) ? Math.abs(ta - tb) <= 0.01 * Math.min(ta, tb) : ta === tb;
      if (!tie) return ta - tb;
      return Number(b.style === boss.recStyle) - Number(a.style === boss.recStyle) || b.result.dps - a.result.dps;
    });
  const best = styles[0];
  const ttk = best?.result.ttk ?? Infinity;
  const killsPerHour = isFinite(ttk) && ttk > 0 ? Math.floor(3600 / (ttk + KILL_OVERHEAD_S)) : 0;

  const gearDelta = (best?.loadout.weaponTier ?? 0) - boss.recTier;
  const lvl = best ? input.levels[STYLE_SKILLS[best.style].damage] || 1 : 1;
  const levelDelta = lvl - boss.recLevel;

  let readiness: Readiness;
  if (blocked) readiness = 'blocked';
  else if (!isFinite(ttk)) readiness = 'undergeared';
  else if (gearDelta >= 0 && levelDelta >= 0) readiness = 'ready';
  else if (gearDelta >= -10 && levelDelta >= -10) readiness = 'stretch';
  else readiness = 'undergeared';

  return { boss, best, styles, killsPerHour, readiness, gearDelta, levelDelta, missingSkills, missingQuests };
};

/** Boosted level helper re-exported for the UI. */
export { boostedLevel };
