import { describe, it, expect } from 'vitest';
import { resourceReqFor, resourceUsable } from './chunkResources';
import type { UnlockState } from '../types';

const u = (skills: Record<string, number>, levels: Record<string, number>): UnlockState =>
  ({ skills, levels } as unknown as UnlockState);

describe('resourceReqFor', () => {
  it('maps RS3 chunk-object names to the right skill + level', () => {
    // Names as they appear in the RS3 cache dataset; RS3 requirements
    // (post-2018 Mining rework; runescape.wiki).
    const cases: [string, string | null, number][] = [
      ['Tree', 'Woodcutting', 1],
      ['Oak tree', 'Woodcutting', 10],
      ['Willow tree', 'Woodcutting', 20],
      ['Teak tree', 'Woodcutting', 30],
      ['Maple tree', 'Woodcutting', 40],
      ['Acadia tree', 'Woodcutting', 50],
      ['Ivy', 'Woodcutting', 68],
      ['Yew tree', 'Woodcutting', 70],
      ['Magic tree', 'Woodcutting', 80],
      ['Elder tree', 'Woodcutting', 90],
      ['Dead tree', 'Woodcutting', 1],
      ['Copper rock', 'Mining', 1],
      ['Iron rock', 'Mining', 10],
      ['Coal rock', 'Mining', 20],
      ['Mithril rock', 'Mining', 30],
      ['Luminite rock', 'Mining', 40],
      ['Runite rock', 'Mining', 50],
      ['Drakolith rock', 'Mining', 60],
      ['Necrite rock', 'Mining', 70],
      ['Phasmatite rock', 'Mining', 70],
      ['Banite rock', 'Mining', 80],
      ['Seren stone', 'Mining', 89],
      ['Light animica rock', 'Mining', 90],
      ['Dark animica rock', 'Mining', 90],
      ['Fishing spot (net, bait)', 'Fishing', 1],
      ['Fishing spot (lure, bait)', 'Fishing', 20],
      ['Fishing spot (net, harpoon)', 'Fishing', 16],
      ['Fishing spot (cage, harpoon)', 'Fishing', 35],
      ['Fishing spot (cage)', 'Fishing', 40],
      ['Silk stall', 'Thieving', 20],
      ['Gem stall', 'Thieving', 75],
      ['Air altar', 'Runecrafting', 1],
      ['Nature altar', 'Runecrafting', 44],
      ['Soul altar', 'Runecrafting', 90],
      ['Astral altar', 'Runecrafting', 40],
      ['Nature ruins', 'Runecrafting', 1],
    ];
    for (const [name, skill, level] of cases) {
      const req = resourceReqFor(name);
      expect(req?.skill ?? null, name).toBe(skill);
      if (skill) expect(req!.level, name).toBe(level);
    }
  });

  it('excludes Prayer altars and travel portals from Runecrafting', () => {
    for (const name of ['Chaos altar (Prayer)', 'Altar of Guthix', 'Altar of Zamorak', 'Saradomin Portal', 'Portal of Cadarn']) {
      expect(resourceReqFor(name), name).toBeNull();
    }
  });

  it('leaves inert scenery, stations and transport nodes ungated', () => {
    for (const name of ['Bank booth', 'Anvil', 'Furnace', 'Cooking range', 'Altar',
      'Rocks', 'Rock', 'Loose rocks', 'Rocky handholds', 'Spirit tree', 'Lumbridge lodestone', 'Runecrafting altar']) {
      expect(resourceReqFor(name), name).toBeNull();
    }
  });

  it('most-specific rule wins (ore before bare rock, magic before tree)', () => {
    expect(resourceReqFor('Coal rock')!.level).toBe(20);
    expect(resourceReqFor('Magic tree')!.level).toBe(80);
  });
});

describe('resourceUsable', () => {
  const yew = resourceReqFor('Yew tree')!; // level 70 → needs tier 7 (cap model)

  it('locks a node when the TIER does not reach the level, even at 99', () => {
    // The headline case: 99 Woodcutting but only tier 3 unlocked → no yews.
    expect(resourceUsable(yew, u({ Woodcutting: 3 }, { Woodcutting: 99 }))).toBe(false);
  });

  it('unlocks once the tier reaches the level (tier 7 for a 70 node)', () => {
    expect(resourceUsable(yew, u({ Woodcutting: 6 }, { Woodcutting: 99 }))).toBe(false); // tier 6 caps at 60
    expect(resourceUsable(yew, u({ Woodcutting: 7 }, { Woodcutting: 70 }))).toBe(true);
  });

  it('still requires the current level, not just the tier', () => {
    expect(resourceUsable(yew, u({ Woodcutting: 10 }, { Woodcutting: 65 }))).toBe(false); // tier ok, level too low
  });

  it('defaults a missing level to 1', () => {
    const tree = resourceReqFor('Tree')!; // level 1 → tier 1
    expect(resourceUsable(tree, u({ Woodcutting: 1 }, {}))).toBe(true);
  });
});
