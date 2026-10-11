import { describe, it, expect } from 'vitest';
import {
  BOSSES_LIST, MINIGAMES_LIST, GUILDS_LIST, MOBILITY_LIST, ARCANA_LIST,
  POH_LIST, MERCHANTS_LIST, STORAGE_LIST, FARMING_PATCH_LIST, SKILLS_LIST,
  EQUIPMENT_SLOTS, REGION_GROUPS, MISTHALIN_AREAS,
  SLAYER_UNLOCKS_LIST,
} from './items';
import { COLLECTION_LOG_DATA, BOSS_PAGE_ALIASES, COLLOG_ONLY_BOSS_PAGES } from './collectionLogData';
import { ACTIVITY_REGIONS } from './activityRegions';

/**
 * Data-consistency tests.
 *
 * These guard against the recurring drift where one data file is updated but
 * another isn't — e.g. a boss gets a Collection Log page but is never added to
 * the unlock table. When that happens, one of these tests fails in CI with a
 * message naming the offending entry.
 */

// Some RS3 Collection Log boss pages use a different display name than the
// unlock table, or cover several bosses at once (BOSS_PAGE_ALIASES), and a few
// real log pages are for bosses not yet in BOSSES_LIST (COLLOG_ONLY_BOSS_PAGES).
// Both live next to the data. A *new* boss page that isn't in BOSSES_LIST and
// isn't covered by either will (correctly) fail the test.

const NAMED_LISTS: Record<string, string[]> = {
  BOSSES_LIST, MINIGAMES_LIST, GUILDS_LIST, MOBILITY_LIST, ARCANA_LIST,
  POH_LIST, MERCHANTS_LIST, STORAGE_LIST, FARMING_PATCH_LIST, SKILLS_LIST,
  EQUIPMENT_SLOTS, SLAYER_UNLOCKS_LIST,
};

// --- no duplicates ----------------------------------------------------------

describe('content lists have no duplicate entries', () => {
  for (const [name, list] of Object.entries(NAMED_LISTS)) {
    it(name, () => {
      const seen = new Set<string>();
      const dupes = list.filter(x => (seen.has(x) ? true : (seen.add(x), false)));
      expect(dupes, `duplicates in ${name}`).toEqual([]);
    });
  }
});

// --- region definitions -----------------------------------------------------

describe('region definitions', () => {
  it('every sub-region name is globally unique across all continents', () => {
    const all = [...Object.values(REGION_GROUPS).flat(), ...MISTHALIN_AREAS];
    const seen = new Set<string>();
    const dupes = all.filter(r => (seen.has(r) ? true : (seen.add(r), false)));
    expect(dupes, 'a region name appears under two continents').toEqual([]);
  });
});

// --- activity region tags ---------------------------------------------------

describe('activityRegions', () => {
  const activityItems = new Set([
    ...BOSSES_LIST, ...MINIGAMES_LIST, ...GUILDS_LIST,
    ...MOBILITY_LIST, ...FARMING_PATCH_LIST,
  ]);
  const validRegions = new Set([...Object.keys(REGION_GROUPS), 'Misthalin']);

  it('every tagged item exists in an activity list', () => {
    const orphans = Object.keys(ACTIVITY_REGIONS).filter(k => !activityItems.has(k));
    expect(orphans, 'region-tagged items not found in any activity list').toEqual([]);
  });

  it('every region value is a real continent', () => {
    const bad = Object.entries(ACTIVITY_REGIONS)
      .filter(([, region]) => !validRegions.has(region))
      .map(([item, region]) => `${item} → ${region}`);
    expect(bad, 'invalid region values').toEqual([]);
  });
});

// --- collection log internal integrity --------------------------------------

describe('collection log', () => {
  it('every item ID is globally unique', () => {
    const seen = new Set<number>();
    const dupes: number[] = [];
    for (const tab of Object.values(COLLECTION_LOG_DATA)) {
      for (const page of Object.values(tab.pages)) {
        for (const item of page.items) {
          if (seen.has(item.id)) dupes.push(item.id);
          else seen.add(item.id);
        }
      }
    }
    expect(dupes, 'duplicate collection-log item IDs').toEqual([]);
  });

  it('page names are unique within each tab', () => {
    for (const [tabName, tab] of Object.entries(COLLECTION_LOG_DATA)) {
      const names = Object.values(tab.pages).map(p => p.name);
      expect(new Set(names).size, `duplicate page names in tab "${tabName}"`).toBe(names.length);
    }
  });
});

// --- collection log <-> unlock list drift -----------------------------------

describe('collection log pages map to unlock tables', () => {
  it('alias targets are real BOSSES_LIST entries', () => {
    const bossSet = new Set(BOSSES_LIST);
    const badAliases = Object.entries(BOSS_PAGE_ALIASES)
      .flatMap(([, targets]) => targets)
      .filter(t => !bossSet.has(t));
    expect(badAliases, 'BOSS_PAGE_ALIASES point at non-existent bosses').toEqual([]);
  });

  it('alias keys and collog-only pages are real Bosses-tab pages', () => {
    const pages = new Set(Object.keys(COLLECTION_LOG_DATA['Bosses']?.pages ?? {}));
    const stale = [...Object.keys(BOSS_PAGE_ALIASES), ...COLLOG_ONLY_BOSS_PAGES].filter(p => !pages.has(p));
    expect(stale, 'alias/collog-only entries with no matching Bosses page').toEqual([]);
  });

  it('every Bosses-tab page is unlockable in BOSSES_LIST', () => {
    const bossSet = new Set(BOSSES_LIST);
    const unmapped = Object.keys(COLLECTION_LOG_DATA['Bosses']?.pages ?? {})
      .filter(page => !bossSet.has(page) && !(page in BOSS_PAGE_ALIASES) && !COLLOG_ONLY_BOSS_PAGES.has(page));
    expect(
      unmapped,
      'collection-log boss pages with no BOSSES_LIST entry — add them to BOSSES_LIST or BOSS_PAGE_ALIASES',
    ).toEqual([]);
  });

  it('every Minigames-tab page is unlockable in MINIGAMES_LIST', () => {
    const miniSet = new Set(MINIGAMES_LIST);
    const unmapped = Object.keys(COLLECTION_LOG_DATA['Minigames']?.pages ?? {})
      .filter(page => !miniSet.has(page));
    expect(
      unmapped,
      'collection-log minigame pages with no MINIGAMES_LIST entry — add them to MINIGAMES_LIST',
    ).toEqual([]);
  });
});
