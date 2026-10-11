/**
 * RS3 boss stat blocks for the DPS calculator and Boss Kill Planner, backed by
 * the bundled RuneScape Wiki–sourced dataset in data/rs3Bosses.ts (one record
 * per BOSSES_LIST entry). Offline; loads no external data. (The OSRS fork
 * fetched the weirdgloop OSRS dps-calc monsters.json here — removed.)
 */

import { RS3_BOSSES, Rs3Boss } from '../data/rs3Bosses';

export type MonsterStats = Rs3Boss;

class MonsterService {
  private byNameMap = new Map<string, Rs3Boss>(RS3_BOSSES.map((b) => [b.name.toLowerCase(), b]));

  public ready = true;
  public error: string | null = null;

  /** Kept for API compatibility: the dataset is bundled, so this resolves immediately. */
  async init(): Promise<void> {
    return;
  }

  all(): Rs3Boss[] {
    return RS3_BOSSES;
  }

  /** Name search (boss or its stat-block NPC), ranked: prefix matches first, then substring. */
  search(q: string, limit = 60): Rs3Boss[] {
    const query = q.trim().toLowerCase();
    if (!query) return RS3_BOSSES.slice(0, limit);
    const starts: Rs3Boss[] = [];
    const contains: Rs3Boss[] = [];
    for (const b of RS3_BOSSES) {
      const names = [b.name, b.npc ?? ''].map((n) => n.toLowerCase());
      if (names.some((n) => n.startsWith(query))) starts.push(b);
      else if (names.some((n) => n.includes(query))) contains.push(b);
    }
    return [...starts, ...contains].slice(0, limit);
  }

  /** Exact (case-insensitive) BOSSES_LIST name lookup. */
  byName(name: string): Rs3Boss | undefined {
    return this.byNameMap.get(name.trim().toLowerCase());
  }
}

export const monsterService = new MonsterService();
