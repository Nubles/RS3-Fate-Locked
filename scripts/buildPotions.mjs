// One-off authoring tool: pulls Herblore recipes from the RuneScape Wiki
// (RS3, runescape.wiki) `recipe` bucket and
//   1. reports curated potions in RESOURCE_MAP whose Herblore level or
//      ingredients disagree with the wiki, and
//   2. writes paste-ready entries for standard potions the catalogue doesn't
//      have yet to scripts/_potions.generated.txt (for the 'Potions' section).
// It never edits data files. Not shipped or imported at runtime.
//
// Run:  node scripts/buildPotions.mjs        (needs network + npx tsx)
//
// Assumes the RS3 wiki exposes the same `recipe` bucket shape as the Weird
// Gloop wikis (`production_json`, `uses_skill`); throws otherwise.
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

const loadCatalogue = () => JSON.parse(execFileSync('npx', ['tsx', '-e',
  "import('./data/resourceData.ts').then(m => process.stdout.write(JSON.stringify(m.RESOURCE_MAP)))"],
  { encoding: 'utf8', maxBuffer: 1e8, cwd: new URL('..', import.meta.url) }));

// --- name helpers -----------------------------------------------------------
const CONNECTORS = new Set(['of', 'the', 'a', 'an', 'and', 'to', 'on', 'from']);
const toAppCase = (raw) => raw.trim().split(' ').map((w, i) => {
  const lower = w.toLowerCase();
  if (i > 0 && CONNECTORS.has(lower)) return lower;
  return w.charAt(0).toUpperCase() + w.slice(1);
}).join(' ');

const isUnf = (name) => /\(unf\)|\(unfinished\)/i.test(name);
const stripDose = (name) => name.replace(/\s*\(\s*\d\s*\)\s*$/i, '').trim();

// RS3 wiki names → app keys. Dose-stripped potion names are otherwise used
// as-is in Title Case ("Super attack (3)" → "Super Attack").
const ALIAS = {
  'Prayer': 'Prayer Potion', 'Attack': 'Attack Potion', 'Strength': 'Strength Potion',
  'Defence': 'Defence Potion', 'Ranging': 'Ranging Potion', 'Necromancy': 'Necromancy Potion',
  'Restore': 'Restore Potion', 'Energy': 'Energy Potion', 'Agility': 'Agility Potion',
  'Combat': 'Combat Potion', 'Fishing': 'Fishing Potion', 'Hunter': 'Hunter Potion',
  'Super Ranging': 'Super Ranging Potion', 'Super Magic': 'Super Magic Potion',
  'Antipoison+': 'Antipoison+', 'Super Antipoison': 'Superantipoison',
};
const norm = (n) => { const c = toAppCase(stripDose(n)); return ALIAS[c] || c; };

// Out of scope: juju / perfect juju (Herblore Habitat), combination
// "mix" potions (Barbarian Training), flasks / salves / bombs, and the
// Herblore Habitat god potions — they need extra unlock modelling.
const OUT_OF_SCOPE = /juju|\bmix\b|flask|salve|bomb|blessing|gift|favour|aggroverload|holy |searing/i;

const recipes = fetchRecipes('Herblore');

// unfinished-potion recipes: "X potion (unf)" -> [herb, vial]
const unfMap = {};
for (const r of recipes) {
  const out = r.output?.name;
  if (out && isUnf(out)) unfMap[out] = (r.materials || []).map((m) => ({ name: m.name, qty: Number(m.quantity) || 1 }));
}

const catalogue = loadCatalogue();
const report = [];
const fresh = new Map();

for (const r of recipes) {
  const out = r.output?.name;
  if (!out || isUnf(out) || !/\(\s*\d\s*\)\s*$/.test(out)) continue; // potions are dosed
  if (OUT_OF_SCOPE.test(out)) continue;
  const skill = r.skills?.find((s) => s.name === 'Herblore');
  if (!skill) continue;
  const key = norm(out);

  // Inputs, expanding any unfinished potion into herb + vial of water.
  const inputs = {};
  let isDecant = false;
  for (const m of r.materials || []) {
    const parts = isUnf(m.name) ? (unfMap[m.name] || []) : [{ name: m.name, qty: Number(m.quantity) || 1 }];
    for (const p of parts) {
      const k = norm(p.name);
      if (k === key) isDecant = true;
      inputs[k] = (inputs[k] || 0) + p.qty;
    }
  }
  if (isDecant || !Object.keys(inputs).length) continue;
  const level = Number(skill.level) || 1;

  const existing = catalogue[key];
  if (existing) {
    const recipe = existing.find((s) => s.inputs && s.skills?.Herblore !== undefined);
    if (recipe && recipe.skills.Herblore !== level) {
      report.push(`${key}: Herblore ${recipe.skills.Herblore} (app) vs ${level} (wiki)`);
    }
    continue;
  }
  // Keep the lowest-quantity row when the wiki lists one recipe per dose.
  const sum = Object.values(inputs).reduce((a, b) => a + b, 0);
  const cur = fresh.get(key);
  if (!cur || sum < cur.sum) fresh.set(key, { level, inputs, sum });
}

const esc = (s) => s.replace(/'/g, "\\'");
let ts = "// Paste into the 'Potions' section of data/resourceData.ts after review.\n";
for (const key of [...fresh.keys()].sort()) {
  const { level, inputs } = fresh.get(key);
  ts += `  '${esc(key)}': [{ type: 'SKILL', name: 'Herblore', regions: ANY, skills: { 'Herblore': ${level} }, ` +
    `inputs: { ${Object.entries(inputs).map(([k, v]) => `'${esc(k)}': ${v}`).join(', ')} } }],\n`;
}
writeFileSync(new URL('./_potions.generated.txt', import.meta.url), ts);

console.log(`${fresh.size} wiki potions not yet in RESOURCE_MAP → scripts/_potions.generated.txt`);
console.log(`${report.length} Herblore level mismatches in curated potions:`);
for (const line of report) console.log(`  ${line}`);
