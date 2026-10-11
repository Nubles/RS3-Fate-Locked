
import { DropSource } from '../types';
import { ALL_CA_TASKS } from './caTasks';

export interface CATier {
  id: string; // e.g. "Easy"
  pointsRequired: number; // Cumulative CombatScore needed to finish this tier (and every tier below it)
  recommendedStats: string;
  keyUnlocks: string[]; // Bosses (BOSSES_LIST names) whose achievements make up most of the tier
  difficulty: DropSource;
}

/**
 * RuneScape 3 Combat Achievements (2023): six "Combat Mastery" tiers on the
 * RuneScape Wiki — Easy, Medium, Hard, Elite, Master, Grandmaster. Every
 * achievement in a tier is worth that tier's CombatScore (Easy 1 … Grandmaster 6)
 * and each Combat Mastery tier also requires the tier below it, so
 * `pointsRequired` is the running CombatScore total through that tier.
 * Completing a tier unlocks the matching War's medallion override.
 */
export const CA_TIER_SCORE: Record<string, number> = {
  Easy: 1, Medium: 2, Hard: 3, Elite: 4, Master: 5, Grandmaster: 6,
};

const TIER_ORDER = ['Easy', 'Medium', 'Hard', 'Elite', 'Master', 'Grandmaster'] as const;

const cumulativePoints = (tier: string): number => {
  let total = 0;
  for (const t of TIER_ORDER) {
    total += ALL_CA_TASKS.filter((task) => task.tierId === t).length * CA_TIER_SCORE[t];
    if (t === tier) break;
  }
  return total;
};

export const CA_DATA: Record<string, CATier> = {
  'Easy': {
    id: 'Easy',
    pointsRequired: cumulativePoints('Easy'),
    recommendedStats: 'Base 70 combat, T60-70 gear',
    keyUnlocks: ['Giant Mole', 'King Black Dragon', 'Kalphite Queen', 'Barrows Brothers', 'Chaos Elemental', 'Dagannoth Kings'],
    difficulty: DropSource.CA_EASY
  },
  'Medium': {
    id: 'Medium',
    pointsRequired: cumulativePoints('Medium'),
    recommendedStats: 'Base 80 combat, T70-80 gear',
    keyUnlocks: ['General Graardor', 'Kree\'arra', 'Corporeal Beast', 'Queen Black Dragon', 'Rex Matriarchs', 'TzHaar Fight Cave'],
    difficulty: DropSource.CA_MEDIUM
  },
  'Hard': {
    id: 'Hard',
    pointsRequired: cumulativePoints('Hard'),
    recommendedStats: 'Base 90 combat, T80-90 gear, Curses',
    keyUnlocks: ['Nex', 'Kalphite King', 'Araxxor', 'Helwyr', 'Twin Furies', 'Barrows: Rise of the Six', 'Temple of Aminishi'],
    difficulty: DropSource.CA_HARD
  },
  'Elite': {
    id: 'Elite',
    pointsRequired: cumulativePoints('Elite'),
    recommendedStats: '99 combat stats, T90+ gear, overloads',
    keyUnlocks: ['Vorago', 'Telos', 'Solak', 'Raksha', 'Nex: Angel of Death', 'The Shadow Reef', 'Sanctum of Rebirth'],
    difficulty: DropSource.CA_ELITE
  },
  'Master': {
    id: 'Master',
    pointsRequired: cumulativePoints('Master'),
    recommendedStats: 'Maxed combat, T92+ gear, full invention perks',
    keyUnlocks: ['Zamorak, Lord of Chaos', 'Amascut, the Devourer', 'TzKal-Zuk', 'Kerapac', 'Liberation of Mazcab'],
    difficulty: DropSource.CA_MASTER
  },
  'Grandmaster': {
    id: 'Grandmaster',
    pointsRequired: cumulativePoints('Grandmaster'),
    recommendedStats: 'Maxed, best-in-slot gear',
    keyUnlocks: ['Telos', 'Vorago', 'Zamorak, Lord of Chaos', 'Amascut, the Devourer', 'Arch-Glacor'],
    difficulty: DropSource.CA_GRANDMASTER
  }
};
