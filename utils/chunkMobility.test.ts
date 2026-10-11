import { describe, it, expect } from 'vitest';
import { mobilityFor } from './chunkMobility';
import { MOBILITY_LIST } from '../constants';

describe('mobilityFor', () => {
  it('maps RS3 chunk transport objects to a MOBILITY_LIST network', () => {
    const cases: [string, string][] = [
      ['Varrock lodestone', 'Lodestone Network'],
      ['Canoe station', 'Canoes'],
      ['Spirit tree', 'Spirit Trees'],
      ['Fairy ring', 'Fairy Rings'],
      ['Crashed glider', 'Gnome Gliders'],
      ['Canoe Station', 'Canoes'],
      ['Balloon toad pile', 'Balloon Transport'],
      ['Lodestone', 'Lodestone Network'],
      ['Charter ship', 'Charter Ships'],
      ['Carpet hotspot', 'Magic Carpets'],
      ['Obelisk', 'Wilderness Obelisks'],
      ['Mine cart', 'Mine Carts'],
    ];
    for (const [name, network] of cases) {
      expect(mobilityFor(name), name).toBe(network);
    }
  });

  it('only ever returns networks the Mobility table actually has', () => {
    const valid = new Set(MOBILITY_LIST);
    for (const name of ['Spirit tree', 'Fairy ring', 'Canoe Station', 'Obelisk', 'Lodestone', 'Magic Mushtree', 'Quetzal']) {
      const got = mobilityFor(name);
      if (got) expect(valid.has(got), `${name} -> ${got}`).toBe(true);
    }
  });

  it('ignores cart-shaped scenery that is not the mine-cart network', () => {
    for (const name of ['Broken cart', 'Corpse cart', 'Travel cart', 'Coal Truck', 'Broken cart wheel']) {
      expect(mobilityFor(name), name).toBeNull();
    }
  });

  it('does not treat elemental orb-charging obelisks as transport', () => {
    for (const name of ['Obelisk of Water', 'Obelisk of Air', 'Obelisk of Earth', 'Obelisk of Fire']) {
      expect(mobilityFor(name), name).toBeNull();
    }
  });

  it('does not invent networks for non-RS3 transport (mushtrees, quetzals)', () => {
    expect(mobilityFor('Magic Mushtree')).toBeNull();
    expect(mobilityFor('Quetzal')).toBeNull();
  });

  it('returns null for plainly inert objects', () => {
    for (const name of ['Bank booth', 'Anvil', 'Oak tree', 'Iron rocks']) {
      expect(mobilityFor(name), name).toBeNull();
    }
  });
});
