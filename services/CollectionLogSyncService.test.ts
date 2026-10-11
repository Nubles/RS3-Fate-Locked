import { describe, it, expect } from 'vitest';
import { computeSync, parseLogPageHtml } from './CollectionLogSyncService';
import type { CollectionLogTab } from '../data/collectionLogData';

// Minimal app dataset standing in for COLLECTION_LOG_DATA.
const appData: Record<string, CollectionLogTab> = {
  Bosses: {
    name: 'Bosses',
    pages: {
      'Test Boss': { name: 'Test Boss', items: [
        { id: 101001, name: 'Existing item' },
        { id: 101002, name: "Araxxi's fang" },
      ] },
    },
  },
  Clues: {
    name: 'Clues',
    pages: {
      // App calls it "Easy Treasure Trails"; the wiki log section is "Easy clue rewards".
      'Easy Treasure Trails': { name: 'Easy Treasure Trails', items: [
        { id: 302001, name: 'Highwayman mask' },
      ] },
    },
  },
};

const wiki = [
  { id: 1, name: 'Existing item', tabs: ['Test Boss'] },
  { id: 2, name: "Araxxi's fang", tabs: ['Test Boss'] },    // present (apostrophe) — must not re-add
  { id: 3, name: 'Brand New Drop', tabs: ['Test Boss'] },    // NEW item on existing page
  { id: 4, name: 'Blue beret', tabs: ['Easy clue rewards'] }, // NEW via page alias
  { id: 5, name: 'Some Pet', tabs: ['Totally New Boss'] },   // brand-new page
  { id: 6, name: 'Some Drop', tabs: ['Totally New Boss'] },
];

describe('collection log runtime sync diff', () => {
  const { additions, newSources } = computeSync(wiki, appData);

  it('appends only genuinely-new items to existing pages', () => {
    const names = additions.map(a => a.name).sort();
    expect(names).toEqual(['Blue beret', 'Brand New Drop']);
  });

  it('mints a collision-free id continuing the page scheme', () => {
    const drop = additions.find(a => a.name === 'Brand New Drop')!;
    expect(drop.tab).toBe('Bosses');
    expect(drop.page).toBe('Test Boss');
    expect(drop.id).toBe(101003); // next free after 101001/101002
  });

  it('matches pages through the alias map', () => {
    const beret = additions.find(a => a.name === 'Blue beret')!;
    expect(beret.page).toBe('Easy Treasure Trails');
    expect(beret.id).toBe(302002);
  });

  it('does not re-add items already present (incl. apostrophes)', () => {
    expect(additions.some(a => a.name === "Araxxi's fang")).toBe(false);
    expect(additions.some(a => a.name === 'Existing item')).toBe(false);
  });

  it('surfaces brand-new pages as newSources instead of adding them blindly', () => {
    expect(newSources).toEqual([{ name: 'Totally New Boss', itemCount: 2 }]);
  });

  it('is idempotent: re-running against the post-merge data yields nothing', () => {
    const merged: Record<string, CollectionLogTab> = JSON.parse(JSON.stringify(appData));
    for (const a of additions) {
      const page = Object.values(merged[a.tab].pages).find(p => p.name === a.page)!;
      page.items.push({ id: a.id, name: a.name });
    }
    // Only consider the pages that still exist (ignore the brand-new page).
    const again = computeSync(wiki.filter(w => w.tabs[0] !== 'Totally New Boss'), merged);
    expect(again.additions).toEqual([]);
  });
});

// The display-override hook: when the app stores a different display name than
// the scraped one, overrides prevent a spurious duplicate append.
describe('collection log sync applies display overrides', () => {
  const app: Record<string, CollectionLogTab> = {
    Slayer: { name: 'Slayer', pages: {
      'Morytania': { name: 'Morytania', items: [
        { id: 211001, name: 'Crawling hand (item)' },
      ] },
    } },
  };
  const wiki = [{ id: 7, name: 'Crawling hand', tabs: ['Morytania'] }];
  const overrides = { 7: 'Crawling hand (item)' };

  it('adds a duplicate WITHOUT overrides (demonstrates the hazard)', () => {
    expect(computeSync(wiki, app).additions).toHaveLength(1);
  });

  it('adds nothing WITH overrides applied', () => {
    expect(computeSync(wiki, app, overrides).additions).toEqual([]);
  });
});

describe('RS3 log page HTML parser', () => {
  const html = `
    <div class="mw-heading mw-heading2"><h2 id="Contents">Contents</h2></div>
    <div class="mw-heading mw-heading3"><h3 id="Araxxi">Araxxi</h3><span class="mw-editsection">[edit | edit source]</span></div>
    <table><tr><th>Item</th></tr>
      <tr><td><a href="/w/File:Araxxi%27s_fang.png" title="File:Araxxi&#39;s fang.png"><img/></a></td><td><a href="/w/Araxxi%27s_fang" title="Araxxi&#39;s fang">Araxxi's fang</a></td><td><a href="/w/Araxxor" title="Araxxor">Araxxor</a></td></tr>
      <tr><td><a href="/w/Spider_leg_top" title="Spider leg top">Spider leg top</a></td></tr>
    </table>
    <h3><span class="mw-headline" id="Barrows">Barrows</span><span class="mw-editsection">[edit | edit source]</span></h3>
    <table><tr><td><a href="/w/Ahrim%27s_hood" title="Ahrim&#39;s hood">Ahrim's hood</a></td></tr></table>
    <h2 id="Update_history">Update history</h2>
    <table><tr><td><a href="/w/Update:Foo" title="Update:Foo">Foo</a></td><td><a href="/w/Some_page" title="Some page">x</a></td></tr></table>`;

  it('maps each heading to the first article link of each table row', () => {
    expect(parseLogPageHtml(html)).toEqual({
      'Araxxi': ["Araxxi's fang", 'Spider leg top'],
      'Barrows': ["Ahrim's hood"],
    });
  });
});
