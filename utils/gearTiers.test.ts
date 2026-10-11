import { describe, it, expect } from 'vitest';
import { EQUIPMENT_TIER_MAX } from '../constants';
import {
  powerScore, assignTiersForSlot, canonicalTierFromName,
  itemStyle, buildTierAnchors, anchoredTier,
} from './gearTiers';
import { ZERO_BONUSES, GearBonuses } from './gearStats';

const b = (over: Partial<GearBonuses>): GearBonuses => ({ ...ZERO_BONUSES, ...over });

describe('gear tiers', () => {
  it('powerScore is zero for no bonuses and rises with offence', () => {
    expect(powerScore(ZERO_BONUSES)).toBe(0);
    expect(powerScore(b({ slash: 80 }))).toBeGreaterThan(powerScore(b({ slash: 10 })));
    expect(powerScore(b({ slash: 80, meleeStr: 80 }))).toBeGreaterThan(powerScore(b({ slash: 80 })));
  });

  it('counts defence (weighted) and prayer', () => {
    expect(powerScore(b({ defStab: 100 }))).toBeGreaterThan(0);
    expect(powerScore(b({ prayer: 10 }))).toBeGreaterThan(0);
  });

  it('buckets a large slot across the full tier range, monotonically', () => {
    const items = Array.from({ length: 90 }, (_, i) => ({ id: i, score: i }));
    const tiers = assignTiersForSlot(items);
    const values = [...tiers.values()];
    expect(Math.min(...values)).toBe(1);
    expect(Math.max(...values)).toBe(EQUIPMENT_TIER_MAX);
    // Stronger item never lands below a weaker one.
    for (let i = 1; i < items.length; i++) {
      expect(tiers.get(items[i].id)!).toBeGreaterThanOrEqual(tiers.get(items[i - 1].id)!);
    }
  });

  it('canonical tiers match the RS3 Codex material table', () => {
    expect(canonicalTierFromName('Bronze med helm')).toBe(1);
    expect(canonicalTierFromName('Iron platebody')).toBe(1);
    expect(canonicalTierFromName('Steel scimitar')).toBe(2);
    expect(canonicalTierFromName('Mithril chainbody')).toBe(2);
    expect(canonicalTierFromName('Adamant kiteshield')).toBe(3);
    expect(canonicalTierFromName('Rune full helm')).toBe(3);
    expect(canonicalTierFromName('Rune platebody')).toBe(3);
    expect(canonicalTierFromName('Dragon scimitar')).toBe(4);
    expect(canonicalTierFromName('Orikalkum platebody')).toBe(4);
    expect(canonicalTierFromName('Necronium platebody')).toBe(5);
    expect(canonicalTierFromName("Ahrim's robe top")).toBe(5);
    expect(canonicalTierFromName('Bandos chestplate')).toBe(5);
    expect(canonicalTierFromName('Bane platebody')).toBe(6);
    expect(canonicalTierFromName('Torva platebody')).toBe(6);
    expect(canonicalTierFromName('Elder rune platebody')).toBe(6);
    expect(canonicalTierFromName('Tetsu body')).toBe(7);
    expect(canonicalTierFromName('Malevolent cuirass')).toBe(8);
    expect(canonicalTierFromName('Elder rune platebody + 5')).toBe(8);
    expect(canonicalTierFromName('Noxious scythe')).toBe(8);
    expect(canonicalTierFromName('Elite tectonic robe top')).toBe(9);
    expect(canonicalTierFromName('Trimmed masterwork platebody')).toBe(9);
    expect(canonicalTierFromName('Zaros godsword')).toBe(9);
    expect(canonicalTierFromName('Fractured Staff of Armadyl')).toBe(9);
  });

  it('resolves ambiguous material words by specificity', () => {
    expect(canonicalTierFromName("Black dragonhide body")).toBe(4); // not Black metal (T2)
    expect(canonicalTierFromName('Black platebody')).toBe(2);
    expect(canonicalTierFromName("Green d'hide chaps")).toBe(3);
    expect(canonicalTierFromName('Royal dragonhide body')).toBe(4);
    expect(canonicalTierFromName('Elite tectonic mask')).toBe(9); // not plain Tectonic (T8)
    expect(canonicalTierFromName('Refined anima core helm of Zamorak')).toBe(7); // not Anima core (T6)
    expect(canonicalTierFromName('Magic shieldbow')).toBe(3);
  });

  it('pins iconic non-material items to sensible tiers', () => {
    expect(canonicalTierFromName('Abyssal whip')).toBe(5);
    expect(canonicalTierFromName('Dragon defender')).toBe(4); // beats generic "Dragon"
    expect(canonicalTierFromName('Chaotic rapier')).toBe(6);
    expect(canonicalTierFromName('Fire cape')).toBe(5);
    expect(canonicalTierFromName('TokHaar-Kal-Ket')).toBe(8);
    expect(canonicalTierFromName('Igneous Kal-Mej')).toBe(9);
    expect(canonicalTierFromName('Amulet of glory')).toBe(3);
  });

  it('tiers god-themed clue cosmetics by their base material, not the god', () => {
    expect(canonicalTierFromName('Armadyl rune full helm')).toBe(3);
    expect(canonicalTierFromName('Guthix adamant kiteshield')).toBe(3);
    expect(canonicalTierFromName("Armadyl d'hide body")).toBe(3);
    // ...but the real God Wars armour (no material word) is still T5.
    expect(canonicalTierFromName('Bandos chestplate')).toBe(5);
    expect(canonicalTierFromName('Armadyl helmet')).toBe(5);
    expect(canonicalTierFromName('Armadyl godsword')).toBe(5);
  });

  it('returns null only for genuinely unclassifiable items', () => {
    expect(canonicalTierFromName('Cabbage')).toBeNull();
    expect(canonicalTierFromName('Spinning plate')).toBeNull();
  });

  it('detects an item\'s combat style', () => {
    expect(itemStyle(b({ slash: 80, meleeStr: 80 }))).toBe('melee');
    expect(itemStyle(b({ ranged: 60, rangedStr: 30 }))).toBe('ranged');
    expect(itemStyle(b({ magic: 30, magicStr: 15 }))).toBe('magic');
    expect(itemStyle(b({ defStab: 100 }))).toBe('armour');
  });

  it('anchored fallback places unknown gear against the canonical ladder, per style', () => {
    // Canonical melee anchors: a weak T2 and a strong T8.
    const known = [
      { tier: 2, bonuses: b({ slash: 20, meleeStr: 20 }) },
      { tier: 8, bonuses: b({ slash: 120, meleeStr: 120 }) },
    ];
    const anchors = buildTierAnchors(known);
    // A whip-like melee item (strong) lands at/above the strong anchor.
    expect(anchoredTier(b({ slash: 110, meleeStr: 100 }), anchors)).toBeGreaterThanOrEqual(7);
    // A weak melee item lands at the low anchor.
    expect(anchoredTier(b({ slash: 25, meleeStr: 15 }), anchors)).toBeLessThanOrEqual(3);
    // Stronger never tiers below weaker.
    expect(anchoredTier(b({ slash: 120, meleeStr: 120 }), anchors))
      .toBeGreaterThanOrEqual(anchoredTier(b({ slash: 40, meleeStr: 40 }), anchors));
  });

  it('handles empty and tiny slots without crashing', () => {
    expect(assignTiersForSlot([]).size).toBe(0);
    const tiny = assignTiersForSlot([{ id: 1, score: 5 }, { id: 2, score: 50 }]);
    expect(tiny.get(1)).toBe(1);
    expect(tiny.get(2)!).toBeGreaterThanOrEqual(1);
    expect(tiny.get(2)!).toBeLessThanOrEqual(EQUIPMENT_TIER_MAX);
  });
});
