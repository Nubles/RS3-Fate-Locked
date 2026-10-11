import { describe, it, expect } from 'vitest';
import { summariseQuestPlaces, refineQuestRegion, chunkQuestName, rs3QuestName } from './questLocations';
import { QUEST_DATA } from '../data/questData';
import type { EntityLocation } from '../services/ChunkContentService';
import { UnlockState } from '../types';

const unlocksWith = (regions: string[] = []): UnlockState =>
  ({ regions } as unknown as UnlockState);

// 46,52 = Falador (Asgarnia, gated); 50,50 = Lumbridge (Misthalin, always free).
const FALADOR: EntityLocation = { cx: 46, cy: 52, role: 'step' };
const FALADOR_START: EntityLocation = { cx: 46, cy: 52, role: 'first' };
const LUMBRIDGE: EntityLocation = { cx: 50, cy: 50, role: 'first' };

describe('summariseQuestPlaces', () => {
  it('reports no data for an empty location list', () => {
    const info = summariseQuestPlaces([], unlocksWith([]));
    expect(info.hasData).toBe(false);
    expect(info.allUnlocked).toBe(false);
  });

  it('tags each place with its real (sub-area) unlock state', () => {
    const info = summariseQuestPlaces([LUMBRIDGE, FALADOR], unlocksWith([]));
    expect(info.hasData).toBe(true);
    const fal = info.places.find(p => p.label.includes('Falador'))!;
    const lum = info.places.find(p => p.label.includes('Lumbridge'))!;
    expect(lum.unlocked).toBe(true);   // Misthalin free
    expect(fal.unlocked).toBe(false);  // Falador not unlocked
    expect(info.allUnlocked).toBe(false);
    expect(info.lockedPlaces).toHaveLength(1);
  });

  it('allUnlocked flips once the gated sub-area is unlocked', () => {
    const info = summariseQuestPlaces([LUMBRIDGE, FALADOR], unlocksWith(['Falador']));
    expect(info.allUnlocked).toBe(true);
    expect(info.lockedPlaces).toHaveLength(0);
  });

  it('dedupes by place and promotes a start over a passing step', () => {
    const info = summariseQuestPlaces([FALADOR, FALADOR_START], unlocksWith(['Falador']));
    expect(info.places).toHaveLength(1);
    expect(info.places[0].role).toBe('first');
    expect(info.startPlaces).toHaveLength(1);
  });

  it('orders start places first, then locked before unlocked', () => {
    const info = summariseQuestPlaces([LUMBRIDGE, FALADOR], unlocksWith([]));
    // Lumbridge is the start → leads; Falador (locked step) follows.
    expect(info.places[0].label).toContain('Lumbridge');
  });
});

describe('refineQuestRegion', () => {
  const locked = summariseQuestPlaces([LUMBRIDGE, FALADOR], unlocksWith([]));
  const reachable = summariseQuestPlaces([LUMBRIDGE, FALADOR], unlocksWith(['Falador']));

  it('passes through when the authored region is already met', () => {
    expect(refineQuestRegion(true, locked)).toEqual({ met: true, via: 'authored' });
  });

  it('loosens to met when every chunk is in an unlocked sub-area', () => {
    expect(refineQuestRegion(false, reachable)).toEqual({ met: true, via: 'chunks' });
  });

  it('stays locked when a needed place is still locked', () => {
    expect(refineQuestRegion(false, locked)).toEqual({ met: false, via: 'locked' });
  });

  it('stays locked when there is no chunk evidence', () => {
    const none = summariseQuestPlaces([], unlocksWith([]));
    expect(refineQuestRegion(false, none)).toEqual({ met: false, via: 'locked' });
  });
});

describe('chunkQuestName (RS3 title → OSRS-derived chunk dataset title)', () => {
  it('passes shared titles through unchanged', () => {
    expect(chunkQuestName('Cook\'s Assistant')).toBe('Cook\'s Assistant');
  });
  it('maps renamed quests to the dataset title', () => {
    expect(chunkQuestName('Dragon Slayer')).toBe('Dragon Slayer I');
    expect(chunkQuestName('A Fairy Tale I - Growing Pains')).toBe('Fairytale I - Growing Pains');
  });
  it('folds every Recipe for Disaster subquest onto the parent entry', () => {
    expect(chunkQuestName('Recipe for Disaster: Freeing Pirate Pete')).toBe('Recipe for Disaster');
  });
  it('refuses chunk data for a same-titled but different OSRS quest', () => {
    expect(chunkQuestName('Sins of the Father')).toBeNull();
  });
  it('reverse-maps dataset titles back to RS3', () => {
    expect(rs3QuestName('Desert Treasure I')).toBe('Desert Treasure');
    expect(rs3QuestName('Waterfall Quest')).toBe('Waterfall Quest');
  });
  it('every aliased RS3 title is a real quest', () => {
    for (const rs3 of ['Dragon Slayer', 'Desert Treasure', 'Monkey Madness', 'Rat Catchers', 'Bar Crawl', 'Sins of the Father']) {
      expect(QUEST_DATA[rs3], rs3).toBeDefined();
    }
  });
});
