import { describe, it, expect } from 'vitest';
import { COLLECTION_LOG_DATA } from './collectionLogData';

// TAB IDs: Bosses=1, Slayer=2, Clues=3, Minigames=4, Other=5
const TAB_ID: Record<string, number> = { Bosses: 1, Slayer: 2, Clues: 3, Minigames: 4, Other: 5 };

describe('collection log data integrity', () => {
  // RS3 has Boss, Slayer and Treasure Trail logs; Minigames/Other are app tabs.
  it('has exactly the five expected tabs', () => {
    expect(Object.keys(COLLECTION_LOG_DATA).sort()).toEqual(['Bosses', 'Clues', 'Minigames', 'Other', 'Slayer']);
  });

  it('every item id is globally unique', () => {
    const seen = new Map<number, string>();
    const dups: string[] = [];
    for (const tab of Object.values(COLLECTION_LOG_DATA))
      for (const page of Object.values(tab.pages))
        for (const item of page.items) {
          if (seen.has(item.id)) dups.push(`${item.id} (${seen.get(item.id)} & ${item.name})`);
          else seen.set(item.id, item.name);
        }
    expect(dups, 'duplicate item ids').toEqual([]);
  });

  // Some log pages could legitimately have several slots sharing one display
  // name (none do in the current RS3 data). Everywhere else, a repeated name
  // means a real bug (distinct items mislabelled the same).
  const SAME_NAME_OK = new Set<string>([]);
  it('no page lists the same item name twice (outside known multi-slot pages)', () => {
    const dups: string[] = [];
    for (const tab of Object.values(COLLECTION_LOG_DATA))
      for (const page of Object.values(tab.pages)) {
        if (SAME_NAME_OK.has(page.name)) continue;
        const seen = new Set<string>();
        for (const item of page.items) {
          if (seen.has(item.name)) dups.push(`${page.name} -> "${item.name}"`);
          seen.add(item.name);
        }
      }
    expect(dups, 'pages with duplicate item names').toEqual([]);
  });

  it('no page is empty', () => {
    const empty: string[] = [];
    for (const tab of Object.values(COLLECTION_LOG_DATA))
      for (const page of Object.values(tab.pages))
        if (page.items.length === 0) empty.push(page.name);
    expect(empty, 'empty pages').toEqual([]);
  });

  it('every item id encodes its tab (id / 100000 === tab id)', () => {
    const bad: string[] = [];
    for (const [tabName, tab] of Object.entries(COLLECTION_LOG_DATA)) {
      const tabId = TAB_ID[tabName];
      for (const page of Object.values(tab.pages))
        for (const item of page.items)
          if (Math.floor(item.id / 100000) !== tabId) bad.push(`${item.id} "${item.name}" (in ${tabName})`);
    }
    expect(bad.slice(0, 30), 'items whose id tab-prefix is wrong').toEqual([]);
  });

  // Coverage regression floor. RS3 data: Bosses 433, Slayer 168, Clues 325,
  // Minigames 156, Other 85 = 1,167 slots (the old OSRS log had 1,905). This
  // floor catches accidental bulk item/page deletion; a wiki re-sync
  // (`npm run clog:sync`) that adds items only raises the number.
  it('retains full collection-log coverage (>= 1167 slots)', () => {
    let slots = 0;
    for (const tab of Object.values(COLLECTION_LOG_DATA))
      for (const page of Object.values(tab.pages)) slots += page.items.length;
    expect(slots).toBeGreaterThanOrEqual(1167);
  });

  // Page structure: Bosses 48 = every entry of the RS3 Boss collection log;
  // Slayer 11 = the RS3 Slayer collection log's regional sections captured so
  // far; Clues 6 = shared rewards + the five RS3 clue tiers (Easy..Master, RS3
  // has no Beginner); Minigames 18 and Other 5 are app-curated RS3 pages.
  it('has the audited page count in each tab', () => {
    const counts = Object.fromEntries(
      Object.entries(COLLECTION_LOG_DATA).map(([k, t]) => [k, Object.keys(t.pages).length])
    );
    expect(counts).toEqual({ Bosses: 48, Slayer: 11, Clues: 6, Minigames: 18, Other: 5 });
  });
});
