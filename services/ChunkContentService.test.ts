import { describe, it, expect } from 'vitest';
import { aggregateContent, ChunkContent } from './ChunkContentService';

const empty = (over: Partial<ChunkContent> = {}): ChunkContent => ({
  monsters: [], npcs: [], objects: [], shops: [],
  quests: {}, diaries: {}, clues: {}, spawns: [],
  ...over,
});

describe('aggregateContent', () => {
  it('sums monster counts and keeps the lowest slayer requirement', () => {
    const a = empty({ monsters: [{ name: 'Cave bug', count: 3, slayer: 7 }] });
    const b = empty({ monsters: [{ name: 'Cave bug', count: 2, slayer: null }, { name: 'Goblin', count: 5, slayer: null }] });
    const agg = aggregateContent([a, b]);
    expect(agg.monsters).toEqual([
      { name: 'Cave bug', count: 5, slayer: 7 },
      { name: 'Goblin', count: 5, slayer: null },
    ]);
  });

  it('quest "first" wins over "step" regardless of order', () => {
    const a = empty({ quests: { 'Cook\'s Assistant': 'step' } });
    const b = empty({ quests: { 'Cook\'s Assistant': 'first' } });
    expect(aggregateContent([a, b]).quests['Cook\'s Assistant']).toBe('first');
    expect(aggregateContent([b, a]).quests['Cook\'s Assistant']).toBe('first');
  });

  it('dedupes npcs/shops/spawns and sums objects + clues', () => {
    const a = empty({
      npcs: ['Hans'], shops: ['General Store'], spawns: ['Logs'],
      objects: [['Yew tree', 2]], clues: { easy: 3 },
    });
    const b = empty({
      npcs: ['Hans', 'Bob'], shops: ['General Store'], spawns: ['Logs'],
      objects: [['Yew tree', 1], ['Bank booth', 2]], clues: { easy: 1, hard: 2 },
    });
    const agg = aggregateContent([a, b]);
    expect(agg.npcs).toEqual(['Bob', 'Hans']);
    expect(agg.shops).toEqual(['General Store']);
    expect(agg.spawns).toEqual(['Logs']);
    expect(agg.objects).toEqual([['Yew tree', 3], ['Bank booth', 2]]);
    expect(agg.clues).toEqual({ easy: 4, hard: 2 });
  });

  it('concatenates diary refs for the same area', () => {
    const a = empty({ diaries: { Varrock: 'EA1' } });
    const b = empty({ diaries: { Varrock: 'MD3', Lumbridge: 'HD4' } });
    expect(aggregateContent([a, b]).diaries).toEqual({ Varrock: 'EA1, MD3', Lumbridge: 'HD4' });
  });

  it('handles the empty case', () => {
    const agg = aggregateContent([]);
    expect(agg.monsters).toEqual([]);
    expect(agg.quests).toEqual({});
  });
});

// The shipped dataset (scripts/sync-chunk-content.mjs). Guards the shape the
// map and panels rely on, not exact counts.
import chunkDoc from '../public/chunk-content.json';

describe('public/chunk-content.json', () => {
  const doc = chunkDoc as unknown as {
    version: number;
    chunks: Record<string, { n?: string; c?: Record<string, number> }>;
    connect: Record<string, string[]>;
    overlays: Record<string, { x: number; y: number; cx: number; cy: number; t?: string }[]>;
  };

  it('is the v10 dataset with chunk names (Lumbridge square named)', () => {
    expect(doc.version).toBe(10);
    expect(doc.chunks[String(50 * 256 + 50)]?.n).toBe('Lumbridge');
  });

  it('connect is undirected and has named network nodes', () => {
    for (const [a, list] of Object.entries(doc.connect)) {
      for (const b of list) expect(doc.connect[b], `${a} → ${b}`).toContain(a);
    }
    expect(doc.connect['Fairy ring network']?.length).toBeGreaterThan(20);
    expect(doc.connect['Lodestone network']?.length).toBeGreaterThan(20);
  });

  it('clue overlay points carry a known tier and sit in their chunk', () => {
    const pts = doc.overlays.Clues ?? [];
    expect(pts.length).toBeGreaterThan(500);
    for (const p of pts) {
      expect(['Easy', 'Medium', 'Hard', 'Elite', 'Master']).toContain(p.t);
      expect(p.x >> 6).toBe(p.cx);
      expect(p.y >> 6).toBe(p.cy);
    }
  });
});
