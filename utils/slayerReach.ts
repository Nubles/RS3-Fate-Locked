/**
 * Slayer task reachability.
 *
 * Given each Slayer master's assignable-monster table (ChunkContentService
 * slayerMasters — merged into the dataset from the RuneScape Wiki's Slayer
 * master pages when scripts/rs3-wiki/slayer-masters.json exists; the panel
 * hides itself whenever the table is empty) and
 * your current state, work out which tasks you could actually be assigned
 * and complete: Slayer level, quest unlocks, combat level (RS3 formula, so a
 * master's combat floor — Vannaka 30, Mazchna 50, Chaeldar 75, Sumona 90,
 * Duradel 100, Kuradal 110, Morvran/Laniakea/Mandrith 120 — compares like for
 * like), and whether the monster lives in a chunk you've unlocked.
 */

import { DropSource, UnlockState } from '../types';
import { SlayerMasters } from '../services/ChunkContentService';

/** An RS3 Slayer master and the gates for being assigned tasks by them. */
export interface Rs3SlayerMaster {
  name: string;
  /** Masters that share this master's assignments (successors / alternates). */
  aliases: string[];
  location: string;
  /** Minimum combat level to be assigned a task (RS3 formula). */
  combat: number;
  /** Minimum Slayer level. */
  slayer: number;
  /** Quests that must be complete to reach / use the master. */
  quests: string[];
  /** The Farm Keys roll this master feeds. */
  source: DropSource;
  /** RuneScape Wiki chathead image filename. */
  image: string;
}

/**
 * RS3 Slayer masters, in order of their requirements (RuneScape Wiki,
 * "Slayer master"). Matches the SLAYER_* members of DropSource.
 */
export const RS3_SLAYER_MASTERS: Rs3SlayerMaster[] = [
  { name: 'Turael', aliases: ['Spria'], location: 'Burthorpe', combat: 0, slayer: 0, quests: [], source: DropSource.SLAYER_BEGINNER, image: 'Turael_chathead.png' },
  { name: 'Jacquelyn', aliases: [], location: 'Lumbridge', combat: 0, slayer: 0, quests: [], source: DropSource.SLAYER_BEGINNER, image: 'Jacquelyn_chathead.png' },
  { name: 'Vannaka', aliases: [], location: 'Edgeville', combat: 30, slayer: 0, quests: [], source: DropSource.SLAYER_VANNAKA, image: 'Vannaka_chathead.png' },
  { name: 'The Raptor', aliases: [], location: 'Fort Forinthry', combat: 35, slayer: 0, quests: ['Unwelcome Guests'], source: DropSource.SLAYER_RAPTOR, image: 'The_Raptor_chathead.png' },
  { name: 'Mazchna', aliases: ['Achtryn'], location: 'Canifis', combat: 50, slayer: 0, quests: [], source: DropSource.SLAYER_MAZCHNA, image: 'Mazchna_chathead.png' },
  { name: 'Chaeldar', aliases: [], location: 'Zanaris', combat: 75, slayer: 0, quests: ['Lost City'], source: DropSource.SLAYER_CHAELDAR, image: 'Chaeldar_chathead.png' },
  { name: 'Sumona', aliases: [], location: 'Pollnivneach', combat: 90, slayer: 35, quests: ['Smoking Kills'], source: DropSource.SLAYER_SUMONA, image: 'Sumona_chathead.png' },
  { name: 'Duradel', aliases: ['Lapalok'], location: 'Shilo Village', combat: 100, slayer: 50, quests: ['Shilo Village'], source: DropSource.SLAYER_DURADEL, image: 'Duradel_chathead.png' },
  { name: 'Kuradal', aliases: [], location: 'Ancient Cavern', combat: 110, slayer: 75, quests: [], source: DropSource.SLAYER_KURADAL, image: 'Kuradal_chathead.png' },
  { name: 'Morvran', aliases: [], location: 'Prifddinas', combat: 120, slayer: 85, quests: ["Plague's End"], source: DropSource.SLAYER_MORVRAN, image: 'Morvran_chathead.png' },
  { name: 'Laniakea', aliases: [], location: 'Anachronia', combat: 120, slayer: 90, quests: [], source: DropSource.SLAYER_LANIAKEA, image: 'Laniakea_chathead.png' },
  { name: 'Mandrith', aliases: [], location: 'Wilderness', combat: 120, slayer: 95, quests: [], source: DropSource.SLAYER_MANDRITH, image: 'Mandrith_chathead.png' },
  // Reaper assignments: 45 Slayer + combat 50 (Death's office, via Draynor).
  { name: 'Death', aliases: ['Reaper'], location: "Death's Office", combat: 50, slayer: 45, quests: [], source: DropSource.SLAYER_BOSS, image: 'Death_chathead.png' },
];

/** The RS3 master a table's master name refers to (null = not an RS3 master). */
export const rs3MasterFor = (name: string): Rs3SlayerMaster | null => {
  const n = name.trim().toLowerCase();
  return RS3_SLAYER_MASTERS.find(m =>
    m.name.toLowerCase() === n || m.aliases.some(a => a.toLowerCase() === n)) ?? null;
};

export type SlayerStatus =
  | 'ready'         // assignable and reachable right now
  | 'slayer-locked' // Slayer skill/level too low
  | 'quest-locked'  // a quest unlock is missing
  | 'combat-locked' // combat level below the master's assignment floor
  | 'area-locked'   // requirements met, but no unlocked chunk has it
  | 'no-location';  // not found in the chunk dataset

export interface SlayerTaskRow {
  monster: string;
  slayer?: number;
  combat?: number;
  req?: string[];
  weight: number;
  status: SlayerStatus;
  loc: { cx: number; cy: number; unlocked: boolean } | null;
}

export interface SlayerMasterReach {
  master: string;
  rows: SlayerTaskRow[];
  ready: number;
  total: number;
}

export interface SlayerReach {
  combatLevel: number;
  slayerLevel: number;
  slayerUnlocked: boolean;
  masters: SlayerMasterReach[];
}

/** Resolve a task name to a representative chunk (best-effort, may be null). */
export type LocateFn = (taskName: string) => { cx: number; cy: number; unlocked: boolean } | null;

/**
 * RuneScape 3 combat level (max 138) from the tracked skill levels:
 *   floor((1.3 × max(Att + Str, 2 × Mag, 2 × Rng, 2 × Necro)
 *          + Def + Const + floor(Pray / 2) + floor(Summ / 2)) / 4)
 * Constitution defaults to 10 for a fresh account.
 */
export const combatLevel = (levels: Record<string, number>): number => {
  const L = (k: string, d = 1) => Math.max(levels[k] ?? d, d);
  const offence = Math.max(
    L('Attack') + L('Strength'),
    2 * L('Magic'),
    2 * L('Ranged'),
    2 * L('Necromancy'),
  );
  const lvl = Math.floor(
    (1.3 * offence + L('Defence') + L('Constitution', 10)
      + Math.floor(L('Prayer') / 2) + Math.floor(L('Summoning') / 2)) / 4,
  );
  return Math.min(138, lvl);
};

/**
 * Candidate monster names for a task name, most literal first: "Wolves" →
 * Wolves, Wolf, Wolfe, Wolve; "Cave bugs" → Cave bugs, Cave bug; "Jellies" → Jelly.
 */
export const taskNameForms = (task: string): string[] => {
  const t = task.trim();
  const out = [t];
  if (/ies$/i.test(t)) out.push(t.slice(0, -3) + 'y');
  if (/ves$/i.test(t)) out.push(t.slice(0, -3) + 'f', t.slice(0, -3) + 'fe');
  if (/men$/i.test(t)) out.push(t.slice(0, -3) + 'man');
  if (/es$/i.test(t)) out.push(t.slice(0, -2));
  if (/s$/i.test(t)) out.push(t.slice(0, -1));
  return [...new Set(out)];
};

/** A req string like "Priest in Peril Complete the quest" → quest name. */
const questFromReq = (req: string): string | null => {
  const m = req.match(/^(.*?) Complete the quest$/);
  return m ? m[1].trim() : null;
};

export function slayerReachability(masters: SlayerMasters, unlocks: UnlockState, locate: LocateFn): SlayerReach {
  const slayerLevel = unlocks.levels?.['Slayer'] ?? 1;
  const slayerUnlocked = (unlocks.skills?.['Slayer'] ?? 0) > 0;
  const combat = combatLevel(unlocks.levels ?? {});
  const questSet = new Set(unlocks.quests ?? []);

  const reqMet = (req?: string[]): boolean => {
    if (!req || req.length === 0) return true;
    return req.every(r => {
      const q = questFromReq(r);
      // Non-quest requirements (rare) aren't gated — treat as met.
      return q == null || questSet.has(q);
    });
  };

  const out: SlayerMasterReach[] = [];
  for (const [master, tasks] of Object.entries(masters)) {
    // Only RS3 masters are listed; any other name in the table is skipped.
    const rs3 = rs3MasterFor(master);
    if (!rs3) continue;
    const masterQuestsMet = rs3.quests.every(q => questSet.has(q));
    const rows: SlayerTaskRow[] = [];
    for (const [monster, info] of Object.entries(tasks)) {
      const loc = locate(monster);
      const slayerReq = Math.max(info.slayer ?? 0, rs3.slayer) || undefined;
      const combatReq = Math.max(info.combat ?? 0, rs3.combat) || undefined;
      let status: SlayerStatus;
      if (!slayerUnlocked || (slayerReq != null && slayerLevel < slayerReq)) status = 'slayer-locked';
      else if (!masterQuestsMet || !reqMet(info.req)) status = 'quest-locked';
      else if (combatReq != null && combat < combatReq) status = 'combat-locked';
      else if (!loc) status = 'no-location';
      else if (!loc.unlocked) status = 'area-locked';
      else status = 'ready';

      rows.push({ monster, slayer: slayerReq, combat: combatReq, req: info.req, weight: info.weight, status, loc });
    }
    rows.sort((a, b) =>
      Number(b.status === 'ready') - Number(a.status === 'ready') ||
      (a.slayer ?? 0) - (b.slayer ?? 0) ||
      a.monster.localeCompare(b.monster));
    out.push({ master, rows, ready: rows.filter(r => r.status === 'ready').length, total: rows.length });
  }

  return { combatLevel: combat, slayerLevel, slayerUnlocked, masters: out };
}
