import { describe, it, expect } from 'vitest';
import { slayerReachability, combatLevel, SlayerStatus, RS3_SLAYER_MASTERS, rs3MasterFor } from './slayerReach';
import { SlayerMasters } from '../services/ChunkContentService';
import { UnlockState } from '../types';

const base = (over: Partial<UnlockState> = {}): UnlockState => ({
  equipment: {}, skills: {}, levels: {}, regions: [], mobility: [], arcana: [],
  housing: [], merchants: [], minigames: [], bosses: [], storage: [], guilds: [],
  farming: [], slayerUnlocks: [], quests: [], diaries: [], cas: [],
  completedTasks: [], collectionLog: {},
  ...over,
});

const MASTERS: SlayerMasters = {
  Turael: {
    Crawling: { weight: 8, slayer: 5 },                         // low slayer
    Banshees: { weight: 8, slayer: 15, req: ['Priest in Peril Complete the quest'] },
    Bigfella: { weight: 5, combat: 80 },                         // combat gate
  },
};

// A locate fn that knows where two monsters live and their unlock state.
const locate = (name: string) => {
  if (name === 'Crawling') return { cx: 1, cy: 1, unlocked: true };
  if (name === 'Banshees') return { cx: 2, cy: 2, unlocked: false };
  if (name === 'Bigfella') return { cx: 3, cy: 3, unlocked: true };
  return null;
};

const statusOf = (r: ReturnType<typeof slayerReachability>, m: string): SlayerStatus =>
  r.masters[0].rows.find(x => x.monster === m)!.status;

describe('slayerReachability', () => {
  it('combat level uses the RS3 formula (max 138)', () => {
    // Fresh account: floor((1.3×2 + 1 + 10) / 4) = 3
    expect(combatLevel({ Attack: 1, Strength: 1, Defence: 1, Constitution: 10 })).toBe(3);
    // Maxed combat (incl. Summoning): floor((1.3×198 + 99 + 99 + 49 + 49) / 4) = 138
    const maxed = { Attack: 99, Strength: 99, Defence: 99, Constitution: 99, Prayer: 99, Ranged: 99, Magic: 99, Necromancy: 99, Summoning: 99 };
    expect(combatLevel(maxed)).toBe(138);
    // No Summoning: floor((257.4 + 99 + 99 + 49 + 0) / 4) = 126
    expect(combatLevel({ ...maxed, Summoning: 1 })).toBe(126);
    // Pure Necromancy counts as 2 × Necro on the offence side
    expect(combatLevel({ Necromancy: 99, Constitution: 10 })).toBe(Math.floor((1.3 * 198 + 1 + 10) / 4));
  });

  it('gates on Slayer skill being unlocked at all', () => {
    const r = slayerReachability(MASTERS, base({ levels: { Slayer: 50 } }), locate);
    // Slayer skill tier 0 → everything slayer-locked
    expect(statusOf(r, 'Crawling')).toBe('slayer-locked');
  });

  it('classifies each task by its binding requirement', () => {
    const u = base({ skills: { Slayer: 5 }, levels: { Slayer: 20, Attack: 40, Strength: 40, Defence: 40, Constitution: 40 } });
    const r = slayerReachability(MASTERS, u, locate);
    expect(statusOf(r, 'Crawling')).toBe('ready');         // slayer 5 met, unlocked chunk
    expect(statusOf(r, 'Banshees')).toBe('quest-locked');  // needs Priest in Peril
    expect(statusOf(r, 'Bigfella')).toBe('combat-locked'); // combat < 80
  });

  it('an unlocked quest clears the quest gate but area lock remains', () => {
    const u = base({ skills: { Slayer: 5 }, levels: { Slayer: 20 }, quests: ['Priest in Peril'] });
    const r = slayerReachability(MASTERS, u, locate);
    expect(statusOf(r, 'Banshees')).toBe('area-locked');   // chunk not unlocked
  });

  it('skips OSRS-only masters and applies the RS3 master gates', () => {
    const masters: SlayerMasters = {
      Konar: { Crawling: { weight: 1 } },          // OSRS-only → dropped
      Sumona: { Crawling: { weight: 1 } },         // combat 90, Slayer 35, Smoking Kills
    };
    const u = base({ skills: { Slayer: 5 }, levels: { Slayer: 40, Attack: 99, Strength: 99, Defence: 99, Constitution: 99 } });
    const r = slayerReachability(masters, u, locate);
    expect(r.masters.map(m => m.master)).toEqual(['Sumona']);
    expect(r.masters[0].rows[0].status).toBe('quest-locked'); // Smoking Kills missing
    const done = slayerReachability(masters, { ...u, quests: ['Smoking Kills'] }, locate);
    expect(done.masters[0].rows[0].status).toBe('ready');
    expect(RS3_SLAYER_MASTERS.every(m => rs3MasterFor(m.name) === m)).toBe(true);
  });

  it('reports ready counts per master', () => {
    const u = base({ skills: { Slayer: 5 }, levels: { Slayer: 99, Attack: 99, Strength: 99, Defence: 99, Constitution: 99 }, quests: ['Priest in Peril'] });
    const r = slayerReachability(MASTERS, u, locate);
    // Crawling + Bigfella ready (unlocked chunks); Banshees area-locked
    expect(r.masters[0].ready).toBe(2);
  });
});
