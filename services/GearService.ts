/**
 * RS3 equipment catalogue for the Equipment Lab (Gear / DPS) and the Boss Kill
 * Planner. Backed entirely by the curated, bundled dataset in data/rs3Gear.ts
 * (RuneScape Wiki–sourced), so it works offline and loads no external data.
 * The OSRS fork fetched the weirdgloop OSRS dps-calc equipment.json here; that
 * is gone — nothing in this service touches OSRS data.
 *
 * The async `init()` / `ready` / `error` surface is kept so callers written
 * for a lazily-loaded dataset keep working unchanged.
 */

import { GearItem } from '../utils/gearStats';
import { ALL_GEAR } from '../utils/bossPlanner';

class GearService {
  private byIdMap = new Map<number, GearItem>();
  private bySlotMap = new Map<string, GearItem[]>();

  public ready = true;
  public error: string | null = null;

  constructor() {
    for (const it of ALL_GEAR) {
      this.byIdMap.set(it.id, it);
      if (!this.bySlotMap.has(it.slot)) this.bySlotMap.set(it.slot, []);
      this.bySlotMap.get(it.slot)!.push(it);
    }
    // Strongest first, then alphabetical — a sensible default picker order.
    for (const [, list] of this.bySlotMap) {
      list.sort((a, b) => b.fateTier - a.fateTier || b.tier - a.tier || a.name.localeCompare(b.name));
    }
  }

  /** Kept for API compatibility: the dataset is bundled, so this resolves immediately. */
  async init(): Promise<void> {
    return;
  }

  all(): GearItem[] {
    return ALL_GEAR;
  }
  bySlot(slot: string): GearItem[] {
    return this.bySlotMap.get(slot) ?? [];
  }
  byId(id: number | undefined): GearItem | undefined {
    return id == null ? undefined : this.byIdMap.get(id);
  }
  /** Fate equipment tier needed for an item (1..9). */
  tierOf(id: number): number {
    return this.byIdMap.get(id)?.fateTier ?? 1;
  }
}

export const gearService = new GearService();
