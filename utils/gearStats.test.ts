import { describe, it, expect } from 'vitest';
import { armourValue, lpBonus, armourDamageBonus, weaponDamage, toGearItem, sumStats, styleDamageBonus, ZERO_STATS } from './gearStats';
import { RS3_GEAR } from '../data/rs3Gear';

const item = (name: string) => {
  const d = RS3_GEAR.find((i) => i.name === name);
  if (!d) throw new Error(`missing ${name}`);
  return toGearItem(d);
};

// Wiki reference values (runescape.wiki, 2026-10).
describe('RS3 gear stats', () => {
  it('tank armour: Rune platebody 195.5 armour / 750 LP, Rune full helm 170 / 500', () => {
    expect(armourValue('Body', 50, 'tank')).toBe(195.5);
    expect(lpBonus('Body', 50, 'tank')).toBe(750);
    expect(armourValue('Head', 50, 'tank')).toBe(170);
    expect(lpBonus('Head', 50, 'tank')).toBe(500);
    expect(armourValue('Shield', 50, 'tank')).toBe(170); // Rune kiteshield
    expect(armourValue('Body', 83, 'tank')).toBeCloseTo(477, 0); // Tetsu body
  });

  it('power armour: Malevolent cuirass 500.9 / 33.7, helm 435.6 / 22.5, greaves 479.1 / 28.1', () => {
    const c = item('Malevolent cuirass').stats;
    expect(Math.abs(c.armour - 500.9)).toBeLessThanOrEqual(0.11);
    expect(c.damageBonus).toBe(33.7);
    expect(c.lp).toBe(0);
    const h = item('Malevolent helm').stats;
    const g = item('Malevolent greaves').stats;
    expect(Math.abs(h.armour - 435.6)).toBeLessThanOrEqual(0.11);
    expect(h.damageBonus).toBe(22.5);
    expect(Math.abs(g.armour - 479.1)).toBeLessThanOrEqual(0.11);
    expect(g.damageBonus).toBe(28.1);
  });

  it('Torva: body 389.6 / 30.0 / 1125 LP, gloves 84.7 / 12.5 / 375 LP', () => {
    expect(item('Torva platebody').stats).toMatchObject({ armour: 389.6, damageBonus: 30, lp: 1125 });
    expect(item('Torva gloves').stats).toMatchObject({ armour: 84.7, damageBonus: 12.5, lp: 375 });
    expect(armourDamageBonus('Body', 92, 'power')).toBe(34.5); // Trimmed masterwork / Elite sirenic
    expect(armourDamageBonus('Body', 92, 'tank')).toBe(0);
  });

  it('weapon damage + accuracy: Omni guard T95 912 / 2765, Zaros godsword T92 1324.8 / 2577', () => {
    expect(item('Omni guard').stats).toMatchObject({ weaponDamage: 912, accuracy: 2765 });
    expect(item('Zaros godsword').stats).toMatchObject({ weaponDamage: 1324.8, accuracy: 2577 });
    expect(item('Death guard (tier 80)').stats).toMatchObject({ weaponDamage: 768, accuracy: 1924 });
    expect(weaponDamage(90, 'off-hand')).toBe(432);
    // Split accuracy tier (wiki: Blade of Nymora dmg T80 / acc T90)
    expect(item('Blade of Nymora').stats).toMatchObject({ weaponDamage: 768, accuracy: 2458 });
  });

  it('sums stats and only counts damage bonus for the matching style', () => {
    const set = [item('Malevolent cuirass'), item('Sirenic hauberk')];
    expect(sumStats([])).toEqual(ZERO_STATS);
    expect(styleDamageBonus(set, 'melee')).toBe(33.7);
    expect(styleDamageBonus(set, 'ranged')).toBe(33.7);
    expect(styleDamageBonus(set, 'magic')).toBe(0);
    expect(Math.abs(sumStats(set).armour - 1001.8)).toBeLessThanOrEqual(0.3);
  });

  it('numeric ids are stable and unique', () => {
    const ids = RS3_GEAR.map((d) => toGearItem(d).id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(item('Rune platebody').id).toBe(item('Rune platebody').id);
    expect(item('Rune platebody').id).toBeGreaterThan(100_000_000);
  });
});
