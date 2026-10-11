// Regenerates data/caTasks.ts from the RuneScape Wiki's Combat Mastery tier
// pages (https://runescape.wiki/w/Combat_Mastery_-_Easy … _-_Grandmaster).
// Unlike bosses/quests (which need app-specific curation — models, economy,
// prereqs), a combat achievement is *fully* defined by the wiki: boss, official
// name, requirement text and tier. So this is a true sync, not just a detector.
//
// RS3 achievements have no numeric task id, so IDs are `ca_<slug of the
// achievement name>` (with `_<boss slug>` appended on the rare name collision).
// That keeps re-runs idempotent and preserves player progress
// (unlocks.completedTasks) as long as the wiki doesn't rename an achievement.
//
// Run:  npm run ca:sync   (also part of `npm run content:sync`)
import { readFileSync, writeFileSync } from 'node:fs';

const API = 'https://runescape.wiki/api.php';
const UA = { 'Api-User-Agent': 'FateLockedRS3/1.0 (CA sync)' };
const TIERS = ['Easy', 'Medium', 'Hard', 'Elite', 'Master', 'Grandmaster'];
const OUT = new URL('../data/caTasks.ts', import.meta.url);
const ITEMS = new URL('../data/items.ts', import.meta.url);

// Wiki boss/sub-boss names → data/items.ts BOSSES_LIST entries. Anything not
// listed here (and not already a BOSSES_LIST name) is written through as-is.
const BOSS_ALIASES = {
  'Araxxi': 'Araxxor', 'Araxxor and Araxxi': 'Araxxor',
  'TzTok-Jad': 'TzHaar Fight Cave',
  'Giant Mole (HM)': 'Giant Mole',
  'Avaryss and Nymora': 'Twin Furies', 'Avaryss': 'Twin Furies', 'Nymora': 'Twin Furies',
  'Ascension Legiones': 'Legiones',
  'Pthentraken': 'Rex Matriarchs', 'Osseous': 'Rex Matriarchs', 'Rathis': 'Rex Matriarchs', 'Orikalka': 'Rex Matriarchs',
  'Crassian Leviathan': 'The Shadow Reef', 'Taraket': 'The Shadow Reef', 'Taraket the Necromancer': 'The Shadow Reef',
  'Ambassador': 'The Shadow Reef', 'The Ambassador': 'The Shadow Reef',
  'Seiryu': 'Temple of Aminishi', 'Seiryu the Azure Serpent': 'Temple of Aminishi',
  'Masuta': 'Temple of Aminishi', 'Masuta the Ascended': 'Temple of Aminishi', 'Sanctum Guardian': 'Temple of Aminishi',
  'Astellarn': 'Dragonkin Laboratory', 'Verak Lith': 'Dragonkin Laboratory',
  'Vermyx': 'Sanctum of Rebirth', 'Vermyx, Brood Mother': 'Sanctum of Rebirth',
  'Kezalam': 'Sanctum of Rebirth', 'Kezalam, the Wanderer': 'Sanctum of Rebirth',
  'Nakatra': 'Sanctum of Rebirth', 'Nakatra, Devourer Eternal': 'Sanctum of Rebirth',
  'Yakamaru': 'Liberation of Mazcab', 'Beastmaster Durzag': 'Liberation of Mazcab',
  'Nex, Angel of Death': 'Nex: Angel of Death',
  'Zamorak': 'Zamorak, Lord of Chaos',
  'Amascut': 'Amascut, the Devourer',
  'Magister': 'The Magister',
  'Kerapac, the bound': 'Kerapac', 'Rasial, the First Necromancer': 'Rasial',
  'Raksha, the Shadow Colossus': 'Raksha', 'Solak, Guardian of the Grove': 'Solak',
  'Telos, the Warden': 'Telos', 'Hermod, the Spirit of War': 'Hermod',
};

const decode = (s) => s
  .replace(/<sup[\s\S]*?<\/sup>/g, '')      // drop citation superscripts
  .replace(/<[^>]+>/g, '')                   // strip tags
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
  .replace(/\[\d+\]/g, '')                   // footnote markers
  .replace(/\s+/g, ' ').trim();

const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’.!?,()]/g, '')
  .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function loadBosses() {
  const src = readFileSync(ITEMS, 'utf8');
  const m = src.match(/export const BOSSES_LIST = (\[[\s\S]*?\]);/);
  return new Set(m ? [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'")) : []);
}

function normaliseBoss(raw, bosses) {
  const name = raw
    .replace(/^(Raid|Boss Dungeon|Elite Dungeon):\s*/i, '')   // "Elite Dungeon: Shadow Reef (Ambassador)"
    .replace(/\s*\(([^)]*)\)\s*$/, (_, inner) => (BOSS_ALIASES[inner] || bosses.has(inner) ? `|${inner}` : ''))
    .trim();
  const [group, sub] = name.split('|');
  for (const cand of [sub, group]) {
    if (!cand) continue;
    if (bosses.has(cand)) return cand;
    if (BOSS_ALIASES[cand]) return BOSS_ALIASES[cand];
    if (bosses.has('The ' + cand)) return 'The ' + cand;
  }
  return group;
}

async function fetchTier(tier, bosses) {
  const page = `Combat Mastery - ${tier}`;
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&origin=*`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  let json;
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: UA });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = await res.json();
  } finally { clearTimeout(timer); }
  const html = json.parse.text['*'];
  const out = [];
  for (const table of html.matchAll(/<table[^>]*wikitable[\s\S]*?<\/table>/g)) {
    const rows = [...table[0].matchAll(/<tr[\s\S]*?<\/tr>/g)].map(r => r[0]);
    if (!rows.length) continue;
    // Locate the columns from the header row so a column re-order on the wiki
    // doesn't silently scramble the output.
    const head = [...rows[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(c => decode(c[1]).toLowerCase());
    const col = (re) => head.findIndex(h => re.test(h));
    const iName = col(/^(name|achievement)/);
    const iDesc = col(/description/);
    const iBoss = col(/boss|monster|subcategory|category/);
    if (iName < 0 || iDesc < 0) continue;
    for (const row of rows.slice(1)) {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => decode(c[1]));
      if (cells.length <= Math.max(iName, iDesc)) continue;
      const name = cells[iName];
      if (!name || /^Combat Mastery - /i.test(name)) continue;   // the previous-tier prerequisite
      out.push({
        tierId: tier,
        monster: iBoss >= 0 ? normaliseBoss(cells[iBoss], bosses) : 'General',
        name,
        description: cells[iDesc],
      });
    }
  }
  return out;
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function render(tasks) {
  const lines = [];
  lines.push('');
  lines.push('export interface CATask {');
  lines.push('  id: string;');
  lines.push('  tierId: string;');
  lines.push('  monster: string;');
  lines.push('  /** Official in-game achievement name (e.g. "Feeling Flameproof"). */');
  lines.push('  name?: string;');
  lines.push('  description: string;');
  lines.push('}');
  lines.push('');
  lines.push('// RuneScape 3 Combat Achievements — the achievements required by each');
  lines.push('// "Combat Mastery - <Tier>" achievement on the RuneScape Wiki, generated by');
  lines.push('// `npm run ca:sync` (scripts/sync-combat-achievements.mjs). Each');
  lines.push('// achievement\'s CombatScore equals its tier (Easy 1 … Grandmaster 6).');
  lines.push('// `monster` uses the data/items.ts BOSSES_LIST name where the fight is a');
  lines.push('// listed boss. IDs are `ca_<slug of the achievement name>`.');
  lines.push('export const ALL_CA_TASKS: CATask[] = [');
  for (const tier of TIERS) {
    const group = tasks.filter(t => t.tierId === tier);
    if (!group.length) continue;
    lines.push(`  // ${tier.toUpperCase()} TIER (${group.length})`);
    for (const t of group) {
      lines.push(`  { id: '${t.id}', tierId: '${tier}', monster: '${esc(t.monster)}', name: '${esc(t.name)}', description: '${esc(t.description)}' },`);
    }
  }
  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const bosses = loadBosses();
  const all = [];
  for (const tier of TIERS) {
    const rows = await fetchTier(tier, bosses);
    if (!rows.length) throw new Error(`no tasks parsed for ${tier} — aborting to avoid wiping data`);
    all.push(...rows);
    console.log(`[ca:sync] ${tier}: ${rows.length}`);
  }
  // Assign stable ids; an achievement belongs to exactly one tier, so de-dupe by name.
  const seen = new Set();
  const tasks = [];
  for (const t of all) {
    let id = `ca_${slug(t.name)}`;
    if (tasks.some(x => x.name === t.name)) continue;
    if (seen.has(id)) id += `_${slug(t.monster)}`;
    seen.add(id);
    tasks.push({ ...t, id });
  }
  if (tasks.length < 400) throw new Error(`only ${tasks.length} CA tasks parsed — refusing to write (expected ~590)`);

  const prev = (() => { try { return readFileSync(OUT, 'utf8'); } catch { return ''; } })();
  const prevCount = (prev.match(/\bid: 'ca_/g) || []).length;
  writeFileSync(OUT, render(tasks));
  const unmapped = [...new Set(tasks.map(t => t.monster).filter(m => !bosses.has(m)))];
  if (unmapped.length) console.log(`[ca:sync] monsters not in BOSSES_LIST: ${unmapped.join(', ')}`);
  console.log(`[ca:sync] wrote data/caTasks.ts: ${tasks.length} tasks (was ${prevCount}).`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-combat-achievements.mjs')) {
  main().catch(e => { console.error('[ca:sync] failed:', e.message); process.exit(1); });
}
