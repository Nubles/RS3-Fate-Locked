// Re-syncs data/collectionLogData.ts to the live RuneScape 3 Wiki collection
// logs so the in-app log stays a mirror of the game's. RS3 has no
// machine-readable collection-log module (OSRS's Module:Collection_log is
// WikiSync-fed and OSRS-only), so the source of truth is the rendered RS3 log
// pages, fetched via the API's action=parse:
//   Boss collection log           -> Bosses tab   (one section per log entry)
//   Slayer collection log         -> Slayer tab   (one section per region)
//   Treasure Trail collection log -> Clues tab    (one section per clue tier)
// Each section heading is a log entry; the first article link of each table
// row is a tracked item. The Minigames and Other tabs are app-curated (RS3 has
// no minigame log) and are left untouched.
//
// Run on demand:   npm run clog:sync
//
// What it does (and deliberately does NOT do):
//   • Aligns each existing page's item names to the wiki's names and APPENDS any
//     newly-tracked items — PRESERVING existing synthetic IDs, so player
//     progress (keyed by id) survives a re-sync.
//   • Never renumbers, never deletes. App items with no wiki match are kept and
//     reported (so a wiki rename can't silently drop a slot).
//   • If the wiki adds a brand-new PAGE, it can't know which tab it belongs to,
//     so it just reports it for a human to place (then re-run). After placing an
//     empty page `'X': { name: 'X', items: [] }`, a re-run fills its items.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'data/collectionLogData.ts';
const API = 'https://runescape.wiki/api.php';
const UA = { 'Api-User-Agent': 'FateLockedRS3/1.0 (collection-log sync)' };
const SOURCES = ['Boss collection log', 'Slayer collection log', 'Treasure Trail collection log'];

// Page-title differences between the app and the wiki (app title -> wiki
// section). Used only for MATCHING; the app keeps its own display titles.
const PAGE_MATCH = {
  'Shared Treasure Trail Rewards': 'General clue rewards',
  'Easy Treasure Trails': 'Easy clue rewards',
  'Medium Treasure Trails': 'Medium clue rewards',
  'Hard Treasure Trails': 'Hard clue rewards',
  'Elite Treasure Trails': 'Elite clue rewards',
  'Master Treasure Trails': 'Master clue rewards',
};

// Section headings on the log pages that are not log entries.
const NON_LOG_SECTIONS = new Set([
  'contents', 'tracked drops', 'rewards', 'achievements', 'disassembly', 'update history',
  'trivia', 'references', 'gallery', 'see also', 'book info', 'combat stats', 'changes',
  'navigation menu',
]);

const decode = s => s
  .replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;|&#160;/g, ' ');

// Same parser as services/CollectionLogSyncService.ts parseLogPageHtml (kept in
// sync by hand; scripts/ is plain JS and can't import the TS module).
function parseLogPageHtml(html) {
  const out = {};
  const parts = html.split(/<h[23]\b[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].search(/<\/h[23]>/i);
    if (end < 0) continue;
    const raw = parts[i].slice(0, end);
    const headline = raw.match(/class="mw-headline"[^>]*>([\s\S]*?)<\/span>/i);
    const heading = decode((headline ? headline[1] : raw.replace(/<span[^>]*mw-editsection[\s\S]*$/i, ''))
      .replace(/<[^>]+>/g, '')).trim();
    if (!heading || NON_LOG_SECTIONS.has(heading.toLowerCase())) continue;
    const items = [];
    for (const row of parts[i].slice(end).split(/<tr\b/i).slice(1)) {
      const re = /<a\b[^>]*href="\/w\/([^"#?]+)[^"]*"[^>]*title="([^"]+)"/gi;
      let m;
      while ((m = re.exec(row)) !== null) {
        const title = decode(m[2]);
        if (/^(File|Category|Template|Special|Help|RuneScape|Module|User|Update):/i.test(title)) continue;
        if (!items.includes(title)) items.push(title);
        break;
      }
    }
    if (items.length) out[heading] = items;
  }
  return out;
}

const norm = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const baseNorm = s => s.toLowerCase().replace(/\s*\([^)]*\)\s*/g, ' ').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const unesc = s => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

async function wikiHtml(title) {
  const u = `${API}?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json`;
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error(`wiki ${title}: HTTP ${r.status}`);
  const d = await r.json();
  return d.parse.text['*'];
}

async function loadWiki() {
  const pages = {};
  for (const title of SOURCES) {
    const sections = parseLogPageHtml(await wikiHtml(title));
    if (!Object.keys(sections).length) throw new Error(`no log sections parsed from "${title}" — page layout changed?`);
    Object.assign(pages, sections);
  }
  return pages;
}

function alignItems(appItems, wikiItems, log, page) {
  const P = Math.floor(appItems[0].id / 1000) * 1000;
  const used = new Set(appItems.map(i => i.id - P));
  let next = Math.max(...appItems.map(i => i.id - P)) + 1;
  const mint = () => { while (used.has(next)) next++; used.add(next); return P + next; };
  const pool = wikiItems.map(n => ({ n, used: false }));
  const out = [];
  for (const ai of appItems) {
    let hit = pool.find(w => !w.used && norm(w.n) === norm(ai.name)) ||
              pool.find(w => !w.used && baseNorm(w.n) === baseNorm(ai.name));
    if (hit) { hit.used = true; if (hit.n !== ai.name) log.renames.push(`[${page}] ${ai.name} -> ${hit.n}`); out.push({ id: ai.id, name: hit.n }); }
    else { log.kept.push(`[${page}] ${ai.name} (#${ai.id})`); out.push(ai); }
  }
  for (const w of pool) if (!w.used) { const id = mint(); out.push({ id, name: w.n }); log.adds.push(`[${page}] ${w.n} (#${id})`); }
  return out;
}

const run = async () => {
  const wikiPages = await loadWiki();
  const wikiByNorm = {}; for (const p of Object.keys(wikiPages)) wikiByNorm[norm(p)] = p;
  const lines = readFileSync(FILE, 'utf8').split(/\r?\n/);
  const tabRe = /^  '([^']+)': \{$/;
  const pageRe = /^(      ')((?:[^'\\]|\\.)*)('?: \{ name: ')((?:[^'\\]|\\.)*)(', items: \[)(.*)(\] \},?\s*)$/;
  const itemRe = /\{id: (\d+), name: '((?:[^'\\]|\\.)*)'\}/g;
  const log = { renames: [], adds: [], kept: [] };
  const matchedWiki = new Set();

  for (let i = 0; i < lines.length; i++) {
    const pm = lines[i].match(pageRe);
    if (!pm) continue;
    const pageName = unesc(pm[4]);
    const appItems = [];
    let m; itemRe.lastIndex = 0;
    while ((m = itemRe.exec(pm[6])) !== null) appItems.push({ id: parseInt(m[1]), name: unesc(m[2]) });
    const target = PAGE_MATCH[pageName] || wikiByNorm[norm(pageName)];
    if (!target || !wikiPages[target]) { log.kept.push(`[page ${pageName}] no wiki match — left as-is`); continue; }
    matchedWiki.add(target);
    const aligned = appItems.length ? alignItems(appItems, wikiPages[target], log, pageName)
      : wikiPages[target].map((n, k) => ({ id: Math.floor(appItems[0]?.id / 1000) * 1000 + k + 1, name: n }));
    const items = aligned.map(it => `{id: ${it.id}, name: '${esc(it.name)}'}`).join(', ');
    lines[i] = `${pm[1]}${esc(unesc(pm[2]))}${pm[3]}${esc(pageName)}${pm[5]}${items}${pm[7]}`;
  }

  const newPages = Object.keys(wikiPages).filter(p => !matchedWiki.has(p));
  writeFileSync(FILE, lines.join('\n'));

  console.log(`[clog:sync] renames ${log.renames.length}, items added ${log.adds.length}, kept-without-wiki-match ${log.kept.length}`);
  for (const r of log.renames) console.log('  RENAME ' + r);
  for (const a of log.adds) console.log('  ADD    ' + a);
  for (const k of log.kept) console.log('  KEEP   ' + k);
  if (newPages.length) {
    console.log(`\n[clog:sync] ${newPages.length} NEW wiki page(s) need a tab + empty stub, then re-run:`);
    for (const p of newPages) console.log(`  + "${p}" (${wikiPages[p].length} items)`);
  }
  console.log(`\n[clog:sync] done. Review the diff, run \`npm test\`, and commit.`);
};

run().catch(e => { console.error('[clog:sync] failed:', e.message); process.exit(1); });
