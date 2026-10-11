import { describe, it, expect } from 'vitest';
import { EQUIPMENT_TIER_MAX } from '../constants';
import { canonicalTierFromName, fateTierForRs3Tier, maxRs3TierForFate, RS3_TIER_CAP } from './gearTiers';
import { ALL_GEAR } from './bossPlanner';

describe('gear tiers', () => {
  it('maps RS3 item tiers onto the Codex Fate ladder', () => {
    expect(fateTierForRs3Tier(1)).toBe(1);
    expect(fateTierForRs3Tier(10)).toBe(1);
    expect(fateTierForRs3Tier(20)).toBe(2);
    expect(fateTierForRs3Tier(50)).toBe(3);
    expect(fateTierForRs3Tier(60)).toBe(4);
    expect(fateTierForRs3Tier(70)).toBe(5);
    expect(fateTierForRs3Tier(75)).toBe(5);
    expect(fateTierForRs3Tier(80)).toBe(6);
    expect(fateTierForRs3Tier(85)).toBe(7);
    expect(fateTierForRs3Tier(87)).toBe(7);
    expect(fateTierForRs3Tier(90)).toBe(8);
    expect(fateTierForRs3Tier(92)).toBe(9);
    expect(fateTierForRs3Tier(95)).toBe(9);
    expect(RS3_TIER_CAP.length).toBe(EQUIPMENT_TIER_MAX + 1);
  });

  it('maxRs3TierForFate is the inverse cap and is monotonic', () => {
    expect(maxRs3TierForFate(0)).toBe(0);
    for (let f = 1; f <= EQUIPMENT_TIER_MAX; f++) {
      expect(maxRs3TierForFate(f)).toBeGreaterThan(maxRs3TierForFate(f - 1));
      expect(fateTierForRs3Tier(maxRs3TierForFate(f))).toBe(f);
    }
  });

  it('dataset items agree with the Codex name ladder (where the name is classifiable)', () => {
    for (const it of ALL_GEAR) {
      if (it.style === 'all' || it.style === 'necromancy') continue;
      const byName = canonicalTierFromName(it.name);
      if (byName == null) continue;
      expect(Math.abs(byName - it.fateTier), it.name).toBeLessThanOrEqual(1);
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
});
