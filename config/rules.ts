
import { DropSource } from '../types';

export const EQUIPMENT_TIER_MAX = 9;

export const DROP_RATES: Record<string, number> = {
  [DropSource.QUEST_NOVICE]: 25,
  [DropSource.QUEST_INTERMEDIATE]: 50,
  [DropSource.QUEST_EXPERIENCED]: 75,
  [DropSource.QUEST_MASTER]: 95,
  [DropSource.QUEST_GRANDMASTER]: 100,
  
  // RS3 balance: the sink is ~888 keys (29 skills x 10 tiers, 13 gear slots x 9
  // tiers, 164 areas, 53 bosses, 53 minigames, ...). One-time earn at these
  // rates is ~1,070 (286 quests ~175, 619 diary tasks ~284, ~590 Combat Mastery
  // tasks ~178, 1,167 collection-log slots ~140, level-ups ~287), i.e. ~1.2x the
  // sink, so keys stay scarce and Slayer, clues and bossing stay the flexible
  // top-up income. See config/economy.ts.
  [DropSource.CA_EASY]: 8,
  [DropSource.CA_MEDIUM]: 15,
  [DropSource.CA_HARD]: 25,
  [DropSource.CA_ELITE]: 30,
  [DropSource.CA_MASTER]: 40,
  [DropSource.CA_GRANDMASTER]: 55,

  [DropSource.COLLECTION_LOG]: 12, // RS3's log is ~1,170 slots vs OSRS's ~1,900, so each slot pays more

  [DropSource.DIARY_EASY]: 20,
  [DropSource.DIARY_MEDIUM]: 40,
  [DropSource.DIARY_HARD]: 65,
  [DropSource.DIARY_ELITE]: 85,
  
  // RS3 Slayer masters — rate climbs with the master's combat/Slayer gate.
  [DropSource.SLAYER_BEGINNER]: 5,
  [DropSource.SLAYER_VANNAKA]: 10,
  [DropSource.SLAYER_RAPTOR]: 15,
  [DropSource.SLAYER_MAZCHNA]: 15,
  [DropSource.SLAYER_CHAELDAR]: 25,
  [DropSource.SLAYER_SUMONA]: 30,
  [DropSource.SLAYER_DURADEL]: 40,
  [DropSource.SLAYER_KURADAL]: 50,
  [DropSource.SLAYER_MORVRAN]: 60,
  [DropSource.SLAYER_LANIAKEA]: 65,
  [DropSource.SLAYER_MANDRITH]: 70,
  [DropSource.SLAYER_BOSS]: 80,

  [DropSource.CLUE_EASY]: 10,
  [DropSource.CLUE_MEDIUM]: 20,
  [DropSource.CLUE_HARD]: 35,
  [DropSource.CLUE_ELITE]: 55,
  [DropSource.CLUE_MASTER]: 75,

  // Repeatable endgame faucets — keep unlocked bosses/raids/activities/pets
  // earning keys long after the one-time sources (quests/diaries/CAs) dry up.
  [DropSource.BOSS_LOW]: 15,
  [DropSource.BOSS_MID]: 30,
  [DropSource.BOSS_HIGH]: 50,
  [DropSource.RAID]: 65,
  [DropSource.ACTIVITY_MINIGAME]: 10,
  [DropSource.PET]: 100,

  [DropSource.CUSTOM]: 50,
};
