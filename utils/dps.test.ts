import { describe, it, expect } from 'vitest';
import {
  damageLevelFn, abilityDamage2h, abilityDamageMain, abilityDamageOff, abilityDamage,
  playerAccuracy, armourRating, hitChance, computeDps, boostedLevel, DpsInput, ROTATIONS, GCD_SECONDS,
  formatDuration,
} from './dps';
import { accuracyFn, weaponAccuracy } from './gearStats';

// Reference values from the RuneScape Wiki (Ability damage, Hit chance), 2026-10.
describe('RS3 ability damage (wiki formula)', () => {
  it('level scaling g(L) matches the old 2.5·L curve at 145', () => {
    expect(damageLevelFn(145)).toBeCloseTo(145, 6);
    expect(damageLevelFn(99)).toBeCloseTo(105.92, 2);
    expect(damageLevelFn(0)).toBe(0);
  });

  it('two-hand: ⌊2.5g⌋ + ⌊1.25g⌋ + ⌊14.4·min(t,cap) + 1.5b⌋', () => {
    // 99, T90, b=100 → 264 + 132 + ⌊1296 + 150⌋ = 1842
    expect(abilityDamage2h(99, 90, Infinity, 100)).toBe(1842);
  });

  it('dual wield = main-hand + half main-hand and equals the 2h at the same tier', () => {
    expect(abilityDamageMain(99, 90, Infinity, 100)).toBe(1228); // 264 + ⌊864 + 100⌋
    expect(abilityDamageOff(99, 90, Infinity, 100)).toBe(614);
    expect(abilityDamage({ kind: 'dual', mainTier: 90, offTier: 90 }, 99, Infinity, 100)).toBe(1842);
  });

  it('weapon tier is capped (melee by Strength, ranged by ammo tier)', () => {
    expect(abilityDamage2h(70, 90, 70, 0)).toBe(abilityDamage2h(70, 70, Infinity, 0));
    expect(abilityDamage2h(99, 95, 60, 0)).toBeLessThan(abilityDamage2h(99, 95, 95, 0));
  });

  it('unarmed only gets the level term', () => {
    expect(abilityDamage({ kind: 'none' }, 99, Infinity, 0)).toBe(264);
  });
});

describe('RS3 hit chance (wiki formula)', () => {
  it('f(x) and weapon accuracy reproduce wiki values', () => {
    expect(Math.floor(accuracyFn(99))).toBe(1212);
    expect(Math.round(accuracyFn(80))).toBe(770);
    expect(weaponAccuracy(80)).toBe(1924);
    expect(weaponAccuracy(90)).toBe(2458);
    expect(weaponAccuracy(92)).toBe(2577);
    expect(weaponAccuracy(95)).toBe(2765);
  });

  it('accuracy and armour rating', () => {
    expect(playerAccuracy(99, 90)).toBe(3670);
    expect(armourRating(80, 1924)).toBe(2693);
  });

  it('H = affinity × a / d, capped at 100%', () => {
    expect(hitChance(50, 4068, 2843)).toBeCloseTo(0.7154, 3); // wiki QBD example
    expect(hitChance(90, 2905, 2202)).toBe(1); // wiki abyssal demon example (118.7% → capped)
    expect(hitChance(0, 3000, 2000)).toBe(0);
  });
});

describe('DPS model', () => {
  const base = (): DpsInput => ({
    style: 'necromancy',
    levels: { accuracy: 99, damage: 99 },
    weapon: { kind: 'dual', mainTier: 90, offTier: 90 },
    damageBonus: 100,
    rotationId: 'revolution',
    potionId: 'none',
    target: { affinity: 55, defence: 80, armour: 1924, lp: 200_000 },
  });

  it('ties AD × hit chance × rotation / GCD together', () => {
    const r = computeDps(base());
    expect(r.abilityDamage).toBe(1842);
    expect(r.hitChance).toBeCloseTo(0.55 * 3670 / 2693, 6);
    expect(r.dps).toBeCloseTo((1842 * r.hitChance * 1.5) / GCD_SECONDS, 6);
    expect(r.ttk).toBeCloseTo(200_000 / r.dps, 6);
  });

  it('rotation presets scale DPS in order', () => {
    const d = ROTATIONS.map((rot) => computeDps({ ...base(), rotationId: rot.id }).dps);
    expect(d[0]).toBeLessThan(d[1]);
    expect(d[1]).toBeLessThan(d[2]);
  });

  it('overloads boost levels (3 + 15%, elder 5 + 17%) and DPS', () => {
    expect(boostedLevel(99, 'overload')).toBe(116);
    expect(boostedLevel(99, 'elder')).toBe(120);
    expect(computeDps({ ...base(), potionId: 'elder' }).dps).toBeGreaterThan(computeDps(base()).dps);
  });

  it('melee caps the weapon tier at Strength level', () => {
    const low = computeDps({ ...base(), style: 'melee', levels: { accuracy: 99, damage: 60 }, weapon: { kind: 'two-hand', tier: 90 } });
    expect(low.cap).toBe(60);
  });

  it('a skilling/zero-LP target never yields a finite TTK', () => {
    expect(computeDps({ ...base(), target: { ...base().target, lp: 0 } }).ttk).toBe(Infinity);
  });

  it('formats durations', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(Infinity)).toBe('—');
  });
});
