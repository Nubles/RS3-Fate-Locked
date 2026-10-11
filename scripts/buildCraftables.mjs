// One-off authoring tool: pulls Smithing / Crafting / Magic-enchant recipes
// from the RuneScape Wiki (RS3, runescape.wiki) `recipe` bucket and
//   1. reports curated RESOURCE_MAP recipes whose level or inputs disagree
//      with the wiki (the catalogue is hand-curated from generator helpers in
//      data/resourceData.ts, so drift is fixed there, by hand), and
//   2. writes paste-ready `section(...)` blocks for in-scope wiki items the
//      catalogue doesn't have yet to scripts/_craftables.generated.txt.
// It never edits data files. Not shipped or imported at runtime.
//
// Run:  node scripts/buildCraftables.mjs        (needs network + npx tsx)
//
// Assumes the RS3 wiki exposes the same `recipe` bucket shape as the Weird
// Gloop wikis (`production_json`, `uses_skill`); the script throws on any
// non-bucket response rather than writing partial output.
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const API = 'https://runescape.wiki/api.php';

const fetchRecipes = (skill) => {
  const query = `bucket('recipe').select('production_json').where('uses_skill','${skill}').limit(5000).run()`;
  const url = `${API}?action=bucket&format=json&query=${encodeURIComponent(query)}`;
  const body = execFileSync('curl', ['-s', '-A', UA, url], { encoding: 'utf8', maxBuffer: 5e7 });
  const json = JSON.parse(body);
  if (!json.bucket) throw new Error(`No bucket for ${skill}: ${body.slice(0, 200)}`);
  return json.bucket.map((r) => JSON.parse(r.production_json));
};

// Current catalogue (curated + generated families), read through tsx so the
// helper-built sections are included.
const loadCatalogue = () => JSON.parse(execFileSync('npx', ['tsx', '-e',
  "import('./data/resourceData.ts').then(m => process.stdout.write(JSON.stringify(m.RESOURCE_MAP)))"],
  { encoding: 'utf8', maxBuffer: 1e8, cwd: new URL('..', import.meta.url) }));

// --- name normalisation -----------------------------------------------------
const CONNECTORS = new Set(['of', 'the', 'a', 'an', 'and', 'to', 'on', 'from']);
const toAppCase = (raw) => raw.trim().split(' ').map((word, i) => {
  const lower = word.toLowerCase();
  if (i > 0 && CONNECTORS.has(lower)) return lower;
  return word.charAt(0).toUpperCase() + word.slice(1);
}).join(' ');

// Wiki names that differ from the app's keys (Title Case of the wiki name is
// otherwise the key). Square shields are "sq shield" in-game and on the wiki.
const ALIAS = {
  'Bronze Square Shield': 'Bronze Sq Shield', 'Iron Square Shield': 'Iron Sq Shield',
  'Steel Square Shield': 'Steel Sq Shield', 'Mithril Square Shield': 'Mithril Sq Shield',
  'Adamant Square Shield': 'Adamant Sq Shield', 'Rune Square Shield': 'Rune Sq Shield',
};
const appName = (raw) => { const c = toAppCase(raw); return ALIAS[c] || c; };

// --- scope ------------------------------------------------------------------
// Smithing: the six standard metals and the four elite metals (Orikalkum →
// Elder rune), base items only (no "+1".."+5" upgrades, no off-hands, no
// ore boxes / mattocks / Invention-only parts), smithed purely from bars.
const METAL = /^(Bronze|Iron|Steel|Mithril|Adamant|Rune|Orikalkum|Necronium|Bane|Elder rune)\b/i;
const BAR = /^(Bronze|Iron|Steel|Mithril|Adamant|Rune|Orikalkum|Necronium|Bane|Elder rune) bar$/i;
const wantSmithing = (out, materials) =>
  METAL.test(out) && !/\+\s*\d|off hand|off-hand|ore box|mattock|\(m\)|burial|spikes/i.test(out)
  && materials.length > 0 && materials.every((m) => BAR.test(m.name) || /^hammer$/i.test(m.name));

const JEWELLERY = /(ring|necklace|amulet|bracelet)\b/i;
const wantCrafting = (out) => {
  const n = out.toLowerCase();
  if (/\(\d\)|\(i\)|\(e\)|\(or\)/.test(n)) return false; // charged / imbued / ornament variants
  if (/\bd'hide\b/.test(n)) return true;
  if (/^(leather|hardleather|hard leather|studded|coif)/.test(n)) return true;
  if (/^(uncut )?(opal|jade|red topaz|sapphire|emerald|ruby|diamond|dragonstone|onyx)$/.test(n)) return true;
  return JEWELLERY.test(n) && /^(gold|sapphire|emerald|ruby|diamond|dragonstone|onyx)/.test(n);
};
const wantMagic = (out, materials) => !/\(\d\)/.test(out) && materials.some((m) => JEWELLERY.test(m.name));

const categoryOf = (key) => {
  if (/\bd'hide\b/i.test(key)) return "D'hide Armour";
  if (/^(Leather|Hardleather|Hard Leather|Studded|Coif)/i.test(key)) return 'Leather Armour';
  if (JEWELLERY.test(key)) return 'Jewellery';
  if (/^(Orikalkum|Necronium|Bane|Elder Rune)\b/.test(key)) return 'Elite Smithing';
  const m = key.match(/^(Bronze|Iron|Steel|Mithril|Adamant|Rune)\b/);
  if (m) return `${m[1]} Smithing`;
  return 'Gems';
};

// --- compare / collect ------------------------------------------------------
const catalogue = loadCatalogue();
const report = [];
const fresh = new Map(); // key -> source

const visit = (rec, accept) => {
  const out = rec.output?.name;
  if (!out || !accept(out, rec.materials || [])) return;
  const skill = rec.skills?.[0];
  if (!skill) return;
  const key = appName(out);
  const inputs = Object.fromEntries((rec.materials || [])
    .filter((m) => !/^hammer$/i.test(m.name))
    .map((m) => [appName(m.name), Number(m.quantity) || 1]));
  const level = Number(skill.level) || 1;
  const outputYield = Number(rec.output.quantity) || 1;

  const existing = catalogue[key];
  if (existing) {
    const recipe = existing.find((s) => s.inputs && s.skills?.[skill.name] !== undefined);
    if (!recipe) return;
    if (recipe.skills[skill.name] !== level) report.push(`${key}: ${skill.name} ${recipe.skills[skill.name]} (app) vs ${level} (wiki)`);
    for (const [k, v] of Object.entries(inputs)) {
      if (recipe.inputs[k] !== v) report.push(`${key}: input ${k} ×${recipe.inputs[k] ?? 0} (app) vs ×${v} (wiki)`);
    }
    return;
  }
  if (!fresh.has(key)) {
    fresh.set(key, {
      type: 'SKILL', name: rec.facilities || skill.name, regions: ['Any'],
      skills: { [skill.name]: level }, inputs, ...(outputYield > 1 ? { outputYield } : {}),
    });
  }
};

for (const rec of fetchRecipes('Smithing')) visit(rec, wantSmithing);
for (const rec of fetchRecipes('Crafting')) visit(rec, wantCrafting);
for (const rec of fetchRecipes('Magic')) visit(rec, wantMagic);

// --- emit -------------------------------------------------------------------
const esc = (s) => s.replace(/'/g, "\\'");
const fmt = (s) => {
  const parts = [`type: '${s.type}'`, `name: '${esc(s.name)}'`, `regions: ['Any']`,
    `skills: { ${Object.entries(s.skills).map(([k, v]) => `'${k}': ${v}`).join(', ')} }`];
  if (Object.keys(s.inputs).length) parts.push(`inputs: { ${Object.entries(s.inputs).map(([k, v]) => `'${esc(k)}': ${v}`).join(', ')} }`);
  if (s.outputYield) parts.push(`outputYield: ${s.outputYield}`);
  return `{ ${parts.join(', ')} }`;
};
const byCat = {};
for (const key of [...fresh.keys()].sort()) (byCat[categoryOf(key)] ??= []).push(key);
let ts = '// Paste into data/resourceData.ts after review (check inputs resolve).\n';
for (const [cat, keys] of Object.entries(byCat)) {
  ts += `section('${esc(cat)}', {\n`;
  for (const key of keys) ts += `  '${esc(key)}': [${fmt(fresh.get(key))}],\n`;
  ts += '});\n\n';
}
writeFileSync(new URL('./_craftables.generated.txt', import.meta.url), ts);

console.log(`${fresh.size} in-scope wiki items not yet in RESOURCE_MAP → scripts/_craftables.generated.txt`);
console.log(`${report.length} level/input mismatches in curated recipes:`);
for (const line of report) console.log(`  ${line}`);
