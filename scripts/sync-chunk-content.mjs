#!/usr/bin/env node
/**
 * sync-chunk-content.mjs — regenerate public/chunk-content.json from RuneScape 3
 * cache data.
 *
 * Source: the RuneScape Wiki maps project's RS3 cache dumps by mejrs
 *   https://github.com/mejrs/data_rs3  (served from raw.githubusercontent.com)
 *     npc_name_collection.json        name → [npc ids]
 *     npc_morph_collection.json       morph child → parent ids (varbit NPCs' spawns)
 *     npcids/npcid=<id>.json          every spawn of that npc (x, y, p + config)
 *     object_name_collection.json     name → [location (object) ids]
 *     object_morph_collection.json    morph child → parent ids (patches, Elder trees)
 *     location_configs/<id>.json      object config (name, actions)
 *     locations/<id>.json             every placement (map square i,j + local x,y)
 *     map_labels.json + map_label_locations.json   world-map text labels → chunk names
 *     clue_locations.json             clue scroll steps (tier + tile)
 *     transport_data.json             origin → destination links (transport graph)
 *     teleport_data.json              "Lodestone Teleport" destinations
 * plus the RuneScape Wiki "Shortcuts" list (Agility levels) re-expressed below,
 * and — when present — the wiki tables in scripts/rs3-wiki/ (written by other
 * tools; never edited here): slayer-masters.json, drops.json, quests.json,
 * shops.json. Missing ones are skipped, so re-run this after they change.
 *
 * Output keeps the compact shape ChunkContentService decodes, keyed by map
 * square id (cx * 256 + cy, cx = x >> 6, cy = y >> 6 — our map's chunk grid):
 *   n  name      world-map label in the chunk, else the nearest within its radius
 *   m  monsters  [name, spawnCount, slayerLevel?]   (NPCs with Attack + combat > 0)
 *   p  NPCs      names                              (non-combat, incl. fishing spots, wisps)
 *   o  objects   [name, count]                      (gathering nodes, stations, transport, pinned shortcuts)
 *   s  shops     shop names                         (NPCs with a Trade option / wiki shops)
 *   q  quests    {quest: 'first' | 'step'}          (wiki quests.json)
 *   c  clues     {tier: step count}
 * plus doc-level connect (undirected transport graph with named connector
 * nodes), overlays.Clues, shortcuts, banks, tags, slayerMasters, drops, shopItems.
 * Planes are merged into their map square. Old-style dungeons that sit 6400
 * tiles north of the surface (map squares y 136..169) are folded onto the
 * surface square above them, like the world map does; other instanced areas
 * (The Arc, Zanaris, the Abyss, …) keep their own square.
 *
 * Fetch strategy (cached): every NPC id of every name plus every morph parent
 * (ids without spawns 404 once — ~26k requests on a cold cache), and every
 * object id of the names in OBJECTS / the shortcut table. Responses are cached
 * on disk (--cache <dir>, default $TMPDIR/rs3-chunk-content-cache) so a re-run
 * is offline. --wiki <dir> reads the wiki tables from elsewhere; --out <file>
 * writes somewhere other than public/chunk-content.json.
 *
 * Usage:  node scripts/sync-chunk-content.mjs [--cache dir] [--concurrency 32] [--wiki dir] [--out file]
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = 'https://raw.githubusercontent.com/mejrs/data_rs3/refs/heads/master';
const arg = (flag, dflt) => { const i = process.argv.indexOf(flag); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const CACHE = resolve(arg('--cache', join(tmpdir(), 'rs3-chunk-content-cache')));
const CONCURRENCY = +arg('--concurrency', 32);
const OUT = resolve(arg('--out', resolve(ROOT, 'public', 'chunk-content.json')));
mkdirSync(CACHE, { recursive: true });

// ── Cached fetching ─────────────────────────────────────────────────────────
const cacheFile = (path) => join(CACHE, path.replace(/[\/=]/g, '_'));
async function getJson(path) {
  const file = cacheFile(path);
  if (existsSync(file)) { const t = readFileSync(file, 'utf8'); return t === '404' ? null : JSON.parse(t); }
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(`${DATA}/${path}`, { headers: { 'User-Agent': 'fate-locked rs3 chunk content sync' } });
      if (res.status === 404) { writeFileSync(file, '404'); return null; }
      if (res.ok) { const t = await res.text(); writeFileSync(file, t); return JSON.parse(t); }
      console.warn(`  ${path}: HTTP ${res.status} (attempt ${attempt})`);
    } catch (err) {
      console.warn(`  ${path}: ${err.message} (attempt ${attempt})`);
    }
    await new Promise(r => setTimeout(r, 1000 * attempt));
  }
  throw new Error(`could not download ${path}`);
}
async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0, done = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
      if (++done % 1000 === 0) console.log(`    ${done}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return out;
}

// ── Repo data (names / places the app references) ─────────────────────────
async function loadRepo() {
  const r = await build({
    stdin: {
      contents: `export { RESOURCE_MAP } from './data/resourceData';
export { BOSSES_LIST, REGION_GROUPS, MISTHALIN_AREAS } from './data/items';
export { REGION_CHUNKS } from './data/regionChunks';
export { SUB_AREA_CHUNKS } from './data/subAreaChunks';
export { RS3_BOSSES } from './data/rs3Bosses';
export { QUEST_DATA } from './data/questData';`,
      resolveDir: ROOT, loader: 'ts',
    },
    bundle: true, format: 'esm', write: false, platform: 'node', logLevel: 'error',
  });
  const m = await import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
  const slayer = new Map();
  for (const sources of Object.values(m.RESOURCE_MAP)) {
    for (const s of sources) if (s.type === 'DROP' && s.skills?.Slayer) slayer.set(s.name.toLowerCase(), s.skills.Slayer);
  }
  const bosses = new Set();
  for (const b of m.BOSSES_LIST) bosses.add(String(b).toLowerCase());
  for (const b of m.RS3_BOSSES) { bosses.add(b.name.toLowerCase()); if (b.npc) bosses.add(b.npc.toLowerCase()); }
  const continentOf = (place) => (m.MISTHALIN_AREAS.includes(place) ? 'Misthalin'
    : Object.keys(m.REGION_GROUPS).find(k => m.REGION_GROUPS[k].includes(place)) ?? null);
  return {
    slayer, bosses, continentOf,
    regionChunks: m.REGION_CHUNKS, subAreaChunks: m.SUB_AREA_CHUNKS,
    questNames: new Set(Object.keys(m.QUEST_DATA)),
  };
}

// ── Coordinates ─────────────────────────────────────────────────────────────
/** Surface islands that sit inside the dungeon band (drawn as map insets, see
 *  utils/mapCoords.ts MAP_INSETS) and must not be folded: Ashdale. */
const SURFACE_IN_DUNGEON_BAND = [[37, 40, 140, 143]];
const isSurfaceIsland = (sx, sy) => SURFACE_IN_DUNGEON_BAND.some(([x0, x1, y0, y1]) => sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1);
/** Map square → our chunk: fold old-style dungeons (squares y 136..169) onto the surface. */
const chunkOf = (sx, sy) => [sx, sy >= 136 && sy < 170 && !isSurfaceIsland(sx, sy) ? sy - 100 : sy];
/** Tile y → the folded (surface) y the map draws it at (x lets surface islands opt out). */
const foldY = (y, x) => (y >= 136 * 64 && y < 170 * 64 && !(x !== undefined && isSurfaceIsland(x >> 6, y >> 6)) ? y - 6400 : y);
/** Is this tile inside an old-style dungeon (folded onto the surface)? */
const isUnder = (y, x) => y >= 136 * 64 && y < 170 * 64 && !(x !== undefined && isSurfaceIsland(x >> 6, y >> 6));
/** Tile → our chunk id. */
const idOf = (cx, cy) => String(cx * 256 + cy);
const tileId = (x, y) => { const [cx, cy] = chunkOf(x >> 6, y >> 6); return idOf(cx, cy); };
const idXY = (id) => [Math.floor(+id / 256), +id % 256];

// ── RS3 facts ───────────────────────────────────────────────────────────────
/** RS3 Slayer level to damage/be assigned (runescape.wiki "Slayer"). */
const SLAYER_LEVELS = {
  'crawling hand': 5, 'cave bug': 7, 'cave crawler': 10, 'banshee': 15, 'mighty banshee': 15, 'cave slime': 17,
  'rockslug': 20, 'desert lizard': 22, 'cockatrice': 25, 'pyrefiend': 30, 'mogre': 32, 'harpie bug swarm': 33,
  'wall beast': 35, 'killerwatt': 37, 'molanisk': 39, 'basilisk': 40, 'terror dog': 40, 'fever spider': 42,
  'infernal mage': 45, 'brine rat': 47, 'bloodveld': 50, 'mutated bloodveld': 50, 'jelly': 52, 'turoth': 55,
  'mutated zygomite': 57, 'cave horror': 58, 'aberrant spectre': 60, 'spiritual ranger': 63, 'dust devil': 65,
  'spiritual warrior': 68, 'kurask': 70, 'skeletal wyvern': 72, 'jungle strykewyrm': 73, 'gargoyle': 75,
  'desert strykewyrm': 77, 'aquanite': 78, 'nechryael': 80, 'mutated jadinko baby': 80, 'spiritual mage': 83,
  'abyssal demon': 85, 'mutated jadinko guard': 86, 'dark beast': 90, 'mutated jadinko male': 91,
  'ice strykewyrm': 93, 'ganodermic flyer': 95, 'ganodermic beast': 95, 'grotworm': 1,
};

/**
 * Well-known RS3 shop owners → shop name (runescape.wiki). Generic shopkeepers
 * run general stores; any other trader is listed under its own name.
 */
const SHOP_NAMES = {
  'Aubury': "Aubury's Rune Shop", 'Bob': "Bob's Brilliant Axes", 'Lowe': "Lowe's Archery Emporium",
  'Horvik': "Horvik's Armour Shop", 'Zaff': "Zaff's Superior Staves", 'Thessalia': "Thessalia's Fine Clothes",
  'Gerrant': "Gerrant's Fishy Business", 'Wydin': "Wydin's Food Store", 'Betty': "Betty's Magic Emporium",
  'Brian': "Brian's Battleaxe Bazaar", 'Wayne': "Wayne's Chains", 'Peksa': "Peksa's Helmet Shop",
  'Cassie': "Cassie's Shield Shop", 'Flynn': "Flynn's Mace Market", 'Herquin': "Herquin's Gems",
  'Gaius': "Gaius' Two-Handed Shop", 'Zeke': "Zeke's Superior Scimitars", 'Louie Legs': "Louie's Armoured Legs Bazaar",
  'Ranael': "Ranael's Super Skirt Store", 'Dommik': "Dommik's Crafting Store", 'Harry': "Harry's Fishing Shop",
  'Hickton': "Hickton's Archery Emporium", 'Rommik': "Rommik's Crafty Supplies", 'Grum': "Grum's Gold Exchange",
  'Jiminua': "Jiminua's Jungle Store", 'Obli': "Obli's General Store", 'Fernahei': "Fernahei's Fishing Hut",
  'Davon': "Davon's Amulet Store", 'Zambo': 'Karamja Wines, Spirits, and Beers', 'Valaine': "Valaine's Shop of Champions",
  'Scavvo': "Scavvo's Rune Store", 'Baraek': "Baraek's Fur Stall", 'Gem merchant': 'Gem Stall',
  'Gem trader': 'Gem Trader', 'Ali Morrisane': "Ali's Discount Wares", 'Dodgy Mike': 'Dodgy Mike\'s Second-hand Clothing',
  'Pikkupstix': "Pikkupstix's Summoning Supplies", 'Rasolo': "Rasolo's Rune & Archery Shop", 'Tutab': "Tutab's Magical Market",
  'Fat Tony': "Fat Tony's Pizza", 'Jatix': "Jatix's Herblore Shop", 'Frenita': "Frenita's Cookery Shop",
  'Candle maker': "Candle Maker's Shop", 'Arhein': "Arhein's Store", 'Hura': "Hura's Crossbow Shop",
  'Nurmof': "Nurmof's Pickaxe Shop", 'Drogo dwarf': "Drogo's Mining Emporium", 'Tea seller': 'Tea Stall',
  'Silk merchant': 'Silk Stall', 'Spice seller': 'Spice Stall', 'Fur trader': 'Fur Trader', 'Silver merchant': 'Silver Stall',
  'Baker': 'Bakery Stall', 'Karim': "Karim's Kebab Shop", 'Ranging Guild Doorman': 'Ranging Guild',
  'Aemad': "Aemad's Adventuring Supplies", 'Kortan': "Kortan's Adventuring Supplies", 'Alice': "Alice's Farming Shop",
  'Sarah': "Sarah's Farming Shop", 'Vanessa': "Vanessa's Farming Shop", 'Richard': "Richard's Farming Shop",
  'Sigmund the Merchant': 'Sigmund the Merchant', 'Jukat': "Jukat's Sword Shop", 'Ellis': 'Tannery',
  'Sawmill operator': 'Sawmill', 'Bartender': 'Bar', 'Barmaid': 'Bar', 'Barman': 'Bar',
  'Martin Thwait': "Martin Thwait's Lost and Found", 'Diango': "Diango's Toy Store", 'Ore seller': 'Ore Seller',
};
const SLAYER_MASTER = /^(turael|spria|jacquelyn|vannaka|the raptor|mazchna|achtryn|chaeldar|sumona|duradel|lapalok|kuradal|morvran|laniakea|mandrith)$/i;
const shopNameFor = (npc) => {
  if (/[<>]/.test(npc)) return null; // colour-tagged placeholder names
  if (SHOP_NAMES[npc]) return SHOP_NAMES[npc];
  if (SLAYER_MASTER.test(npc)) return `Slayer Equipment (${npc})`;
  if (/^(shopkeeper|shop keeper|shop assistant|general store merchant)/i.test(npc)) return 'General Store';
  if (/banker/i.test(npc)) return null;
  return `${npc} (shop)`;
};

/**
 * Objects worth placing: exact names (case-insensitive) → canonical display
 * name. Placements count only when the object has an option at all, and
 * gathering nodes need their skilling option (filters out decorative copies). Value: [display, requiredActionRegex | null].
 *
 * Not recoverable from these dumps: objects placed as varbit-driven parents
 * whose named children carry no placements of their own — notably Elder
 * trees, lodestones and most farming patches. Lodestones are added from
 * teleport_data.json (named via LODESTONE_NAMES below) instead.
 */
const OBJECTS = {};
const obj = (names, display, action = null) => { for (const n of names) OBJECTS[n.toLowerCase()] = [display ?? n, action]; };
const CHOP = /^(chop|cut)/i, MINE = /^mine/i, STEAL = /^steal/i;
// Woodcutting (RS3 tree names)
obj(['Tree', 'tree'], 'Tree', CHOP);
obj(['Dead tree'], 'Dead tree', CHOP);
obj(['Evergreen'], 'Evergreen tree', CHOP);
obj(['Jungle Tree'], 'Jungle tree', CHOP);
obj(['Achey tree', 'Achey Tree'], 'Achey tree', CHOP);
obj(['Oak', 'Oak tree', 'Oak Tree'], 'Oak tree', CHOP);
obj(['Willow', 'Willow tree', 'Willow Tree'], 'Willow tree', CHOP);
obj(['Teak'], 'Teak tree', CHOP);
obj(['Maple tree', 'Maple Tree'], 'Maple tree', CHOP);
obj(['Hollow tree'], 'Hollow tree', CHOP);
obj(['Acadia tree'], 'Acadia tree', CHOP);
obj(['Arctic Pine'], 'Arctic pine', CHOP);
obj(['Eucalyptus tree'], 'Eucalyptus tree', CHOP);
obj(['Mahogany'], 'Mahogany tree', CHOP);
obj(['Yew', 'Yew tree'], 'Yew tree', CHOP);
obj(['Ivy'], 'Ivy', CHOP);
obj(['Blisterwood Tree'], 'Blisterwood tree', CHOP);
obj(['Magic tree', 'Magic Tree'], 'Magic tree', CHOP);
obj(['Elder tree'], 'Elder tree', CHOP);
obj(['Crystal tree'], 'Crystal tree', CHOP);
obj(['Eternal magic tree'], 'Eternal magic tree', CHOP);
obj(['Golden Bamboo'], 'Golden bamboo', CHOP);
obj(['Bamboo'], 'Bamboo', CHOP);
// Mining (RS3 post-2018 rocks)
for (const ore of ['Copper', 'Tin', 'Clay', 'Iron', 'Coal', 'Silver', 'Mithril', 'Adamantite', 'Luminite', 'Gold',
  'Runite', 'Orichalcite', 'Drakolith', 'Necrite', 'Phasmatite', 'Banite', 'Light animica', 'Dark animica',
  'Granite', 'Sandstone', 'Limestone', 'Blurite', 'Soft clay', 'Gem', 'Common gem', 'Uncommon gem', 'Precious gem',
  'Prifddinas gem', 'Platinum', 'Havensilver']) {
  obj([`${ore} rock`, `${ore} rocks`], `${ore} rock`, MINE);
}
obj(['Seren stone', 'Seren Stone'], 'Seren stone', MINE);
obj(['Corrupted Seren Stone'], 'Corrupted Seren stone', MINE);
// Runecrafting
for (const r of ['Air', 'Mind', 'Water', 'Earth', 'Fire', 'Body', 'Cosmic', 'Chaos', 'Astral', 'Nature', 'Law', 'Death', 'Blood', 'Soul', 'Time']) {
  obj([`${r} altar`], `${r} altar`);
  obj([`${r} ruins`], `${r} ruins`);
}
obj(['Runecrafting altar'], 'Runecrafting altar');
obj(['Mysterious ruins'], 'Mysterious ruins');
// Thieving stalls
for (const s of ["Baker's stall", 'Bakery stall', 'Silk stall', 'Fur stall', 'Silver stall', 'Spice stall', 'Gem stall',
  'Seed stall', 'Fish stall', 'Tea stall', 'Crafting stall', 'Food stall', 'General stall', 'Magic stall', 'Scimitar stall',
  'Veg stall', 'Wine stall', 'Crossbow stall']) obj([s], s.charAt(0) + s.slice(1).toLowerCase(), STEAL);
// Stations
obj(['Anvil'], 'Anvil');
obj(['Furnace', 'Lava Furnace'], 'Furnace');
obj(['Range', 'Cooking range'], 'Cooking range');
obj(['Spinning wheel'], 'Spinning wheel');
obj(['Loom'], 'Loom');
obj(["Potter's wheel", "Potter's Wheel", 'Pottery wheel'], "Potter's wheel");
obj(['Pottery oven', 'Pottery Oven'], 'Pottery oven');
obj(['Sawmill'], 'Sawmill');
obj(['Altar'], 'Altar', /^pray/i);
obj(['Chaos altar'], 'Chaos altar (Prayer)', /^pray/i);
obj(['Altar of Guthix'], 'Altar of Guthix');
obj(['Bank booth', 'Bank Booth'], 'Bank booth', /^bank$/i);
obj(['Bank chest'], 'Bank chest', /^(use|bank)/i);
obj(['Bank deposit box', 'Deposit box', 'Deposit Box'], 'Bank deposit box');
// Farming patches
for (const p of ['Herb patch', 'Flower patch', 'Flower Patch', 'Allotment', 'Hops Patch', 'Bush Patch', 'Tree patch',
  'Fruit tree patch', 'Fruit Tree Patch', 'Cactus patch', 'Mushroom patch', 'Calquat patch', 'Spirit Tree Patch',
  'Elder tree patch', 'Crystal tree patch', 'Bloodwood tree patch', 'Belladonna patch', 'Jade vine patch']) {
  obj([p], p.charAt(0) + p.slice(1).toLowerCase());
}
// Transport
obj(['Spirit tree', 'Spirit Tree'], 'Spirit tree');
obj(['Fairy ring'], 'Fairy ring');
obj(['Canoe station', 'Canoe Station'], 'Canoe station');
obj(['Obelisk'], 'Obelisk');
obj(['Fort Forinthry lodestone'], 'Fort Forinthry lodestone');
obj(['Obelisk of Air'], 'Obelisk of Air'); obj(['Obelisk of Water'], 'Obelisk of Water');
obj(['Obelisk of Earth'], 'Obelisk of Earth'); obj(['Obelisk of Fire'], 'Obelisk of Fire');

/**
 * RS3 lodestone NAMES by approximate tile. The exact positions come from the
 * cache's teleport_data.json "Lodestone Teleport" rows (which carry no names):
 * each row takes the name of the nearest entry here. Entries no row matches
 * (City of Um — not in that dump) are placed at the tile listed here.
 */
const LODESTONE_NAMES = {
  'Lumbridge': [3233, 3221], 'Varrock': [3214, 3376], 'Edgeville': [3067, 3505], 'Falador': [2967, 3403],
  'Port Sarim': [3011, 3215], 'Draynor Village': [3105, 3298], 'Al Kharid': [3297, 3184], 'Burthorpe': [2899, 3544],
  'Taverley': [2878, 3442], 'Catherby': [2811, 3449], "Seers' Village": [2689, 3482], 'Ardougne': [2634, 3348],
  'Yanille': [2529, 3094], "Eagles' Peak": [2366, 3479], 'Tirannwn': [2254, 3149], "Oo'glog": [2532, 2871],
  'Karamja': [2761, 3147], 'Canifis': [3517, 3515], 'Fremennik Province': [2712, 3677], 'Lunar Isle': [2085, 3914],
  'Bandit Camp': [3214, 2954], 'Wilderness Crater': [3143, 3635], 'Ashdale': [2474, 2708], 'Prifddinas': [2208, 3360],
  'Menaphos': [3216, 2716], 'Anachronia': [5431, 2338], 'City of Um': [1084, 1768],
};

/**
 * RS3 Agility shortcuts (runescape.wiki "Shortcuts", list of current
 * shortcuts) → level + the place(s) on our map they sit in. Each row is pinned
 * to a cache "Agility shortcuts" transport link near those places (preferring
 * one with a matching obstacle object next to it); a pinned shortcut gets a
 * chunk object named after it ("Crumbling wall (Falador)") on both ends.
 * Unpinned rows fall back to the place names (chunkForPlace).
 */
const SHORTCUT_ROWS = [
  [5, 'Crumbling wall', 'Falador', ['Falador']],
  [10, 'Ropeswing', 'Moss Giant Island', ['Brimhaven']],
  [12, 'Stepping stone', 'Brimhaven Dungeon', ['Brimhaven']],
  [13, 'Fence jump', 'South Varrock', ['Varrock']],
  [14, 'Log balance', 'Wendlewick river', ['Wendlewick']],
  [15, 'Stepping stone', 'Edgeville Dungeon', ['Edgeville']],
  [16, 'Underwall tunnel', 'Yanille', ['Yanille']],
  [19, 'Rock scramble', 'Grand Tree', ['Tree Gnome Stronghold']],
  [20, 'Log balance', 'Coal truck mine', ["Seers' Village"]],
  [21, 'Underwall tunnel', 'Grand Exchange', ['Varrock', 'Edgeville']],
  [22, 'Pipe', 'Brimhaven Dungeon entrance', ['Brimhaven']],
  [25, 'Rocks', "Eagles' Peak", ["Eagles' Peak"]],
  [26, 'Underwall tunnel', 'Falador south wall', ['Falador']],
  [27, 'Stepping stones', 'South Wendlewick', ['Wendlewick']],
  [28, 'Broken railing', 'Draynor Manor', ['Draynor Village']],
  [29, 'Rock passage', "Oo'glog", ["Oo'glog"]],
  [30, 'Stepping stones', 'South-east Karamja', ['Tai Bwo Wannai', 'Shilo Village']],
  [32, 'Stepping stone', 'Shilo Village', ['Shilo Village']],
  [32, 'Planks', 'Highweald Forest', ['Highweald Forest']],
  [33, 'Log balance', 'East Ardougne', ['East Ardougne']],
  [34, 'Pipe', 'Brimhaven Dungeon', ['Brimhaven']],
  [35, 'Log balance', 'Upper Highweald Forest waterfall', ['Highweald Forest']],
  [37, 'Tree', 'Tree Gnome Stronghold', ['Tree Gnome Stronghold']],
  [38, 'Cliffside scramble', 'Al Kharid mine', ['Al Kharid']],
  [40, 'Rope', 'Agility Pyramid', ['Agility Pyramid']],
  [41, 'Cliffside (easy)', 'Trollheim', ['Trollheim']],
  [42, 'Crevice', 'Dwarven Mines', ['Dwarven Mine']],
  [43, 'Crevice', 'Fremennik Slayer Dungeon', ['Rellekka']],
  [43, 'Cliffside (medium)', 'Trollheim', ['Trollheim']],
  [44, 'Cliffside (advanced)', 'Trollheim', ['Trollheim']],
  [45, 'Log balance', 'Tirannwn', ['Isafdar', 'Arandar']],
  [46, 'Jutting wall', 'Zanaris, cosmic altar', ['Zanaris']],
  [47, 'Cliffside (hard)', 'Trollheim', ['Trollheim']],
  [48, 'Log balance', 'North of Camelot', ['Camelot']],
  [49, 'Obstacle pipe', 'Yanille Agility Dungeon', ['Yanille']],
  [51, 'Pipe', 'Edgeville Dungeon / Varrock Sewers', ['Edgeville', 'Varrock']],
  [52, 'Stepping stone', 'Taverley Dungeon', ['Taverley']],
  [54, 'Lava moat', 'Red Dragon Isle', ['Lava Dragon Isle']],
  [55, 'Tunnel', 'Kalphite Hive entrance', ['Kalphite Lair']],
  [58, 'Weathered wall', 'Port Phasmatys to Ectofuntus', ['Port Phasmatys']],
  [60, 'Boulder', 'God Wars Dungeon surface', ['God Wars Dungeon', 'Trollheim']],
  [60, 'Rocky handholds', 'God Wars Dungeon / Wilderness', ['God Wars Dungeon']],
  [61, 'Stile', 'Tree Gnome Stronghold', ['Tree Gnome Stronghold']],
  [61, 'Chasm jump', 'Fremennik Slayer Dungeon', ['Rellekka']],
  [63, 'Crumbling wall', 'The Islands That Once Were Turtles', ['Islands That Once Were Turtles']],
  [64, 'Cliffside', 'Trollheim, Wilderness route', ['Trollheim']],
  [64, 'Plant', 'Observatory', ['Observatory']],
  [65, 'Broken Saradomin statue', 'Paterdomus, River Salve', ['Paterdomus']],
  [66, 'Jutting wall (advanced)', 'Zanaris, cosmic altar', ['Zanaris']],
  [67, 'Pile of rubble', 'Yanille Agility Dungeon', ['Yanille']],
  [70, 'Rocky wall', 'God Wars Dungeon, Saradomin encampment', ['God Wars Dungeon']],
  [70, 'Obstacle pipe', 'Taverley Dungeon', ['Taverley']],
  [71, 'Plank', 'Slayer Tower', ['Slayer Tower']],
  [72, 'Crumbling wall', 'Asgarnian Ice Dungeon', ['Asgarnian Ice Dungeon']],
  [72, 'Stepping stones', 'Berylbrook', ['Berylbrook']],
  [74, 'Tunnel', 'Shilo Village northern wall', ['Shilo Village']],
  [75, 'Rock', 'Poison Waste island', ['Poison Waste']],
  [79, 'Tunnel', 'Kalphite Hive, to Guardians and Queen', ['Kalphite Lair']],
  [79, 'Rotten log', 'Fenmoor fairy ring', ['Fenmoor']],
  [80, 'Pylon', 'Dorgesh-Kaan Agility Course', ['Dorgesh-Kaan']],
  [80, 'Strange floor', 'Taverley Dungeon', ['Taverley']],
  [81, 'Stepping stones', 'Fenmoor', ['Fenmoor']],
  [83, 'Rotten log', 'South Fenmoor', ['Fenmoor']],
  [86, 'Low wall', "Kuradal's Dungeon", ['Ancient Cavern']],
  [90, 'Gap', "Kuradal's Dungeon", ['Ancient Cavern']],
  [92, 'Low wall', 'Port Phasmatys', ['Port Phasmatys']],
];

// ── Map labels → place names ────────────────────────────────────────────────
/** Map labels that annotate rather than name a place. */
const JUNK_LABELS = new Set([
  'exit', 'entrance', 'boot', 'bank', 'bank vault', 'altar', 'portal', 'rocks', 'ruins', 'cave', 'mine', 'market',
  'kitchen', 'kitchens', 'library', 'chapel', 'jail', 'barracks', 'castle', 'palace', 'temple', 'shrine', 'station',
  'vault', 'pillars', 'roots', 'flax', 'mill', 'kiln', 'bag of supplies', 'box of health', 'your camp', 'park',
  'recreation', 'swamp', 'trawler', 'nursery', 'minecarts', 'throne room', 'courthouse', 'council chamber', 'outpost',
  'pyramid', 'graveyard', 'quarry', 'fear', 'anger', 'confusion', 'hopelessness', 'dead people', 'dogs', 'guardians',
  'prison block', 'observation outpost', 'damaged wall', 'wire machine', 'agility course', 'agility course spikes',
  'obstacle course', 'agility training area', 'oikoi (households)', 'the heart', 'beehives', 'distillery',
  'distilleries', 'goutweed store', 'underground pig pen', 'sleeping dragon', 'swarm', 'crucible', 'the hollows',
]);
const JUNK_LABEL_RE = /^(here be|beware|nothing interesting|start of|access to)\b|^\(/i;
const singulars = (w) => {
  const out = new Set([w]);
  if (w.endsWith('ies')) out.add(w.slice(0, -3) + 'y');
  if (w.endsWith('ves')) { out.add(w.slice(0, -3) + 'f'); out.add(w.slice(0, -3) + 'fe'); }
  if (w.endsWith('es')) out.add(w.slice(0, -2));
  if (w.endsWith('s')) out.add(w.slice(0, -1));
  if (w.endsWith('men')) out.add(w.slice(0, -3) + 'man');
  return [...out];
};
const cleanLabel = (t) => t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function buildLabels(mapLabels, labelLocs, npcNameSet) {
  const byId = new Map(mapLabels.map(l => [l.id, l]));
  // "Black demons", "Ice warriors & giants", "Dagannoth" — monster callouts.
  const isMonsterLabel = (text) => text.toLowerCase().split(/\s*(?:&|,|\band\b)\s*/).filter(Boolean)
    .some(part => singulars(part).some(f => npcNameSet.has(f)));
  const out = [];
  for (const { location: { x, y, plane }, labelId } of labelLocs) {
    const lab = byId.get(labelId);
    if (!lab?.text) continue;
    const text = cleanLabel(lab.text);
    if (!text) continue;
    const place = !JUNK_LABELS.has(text.toLowerCase()) && !JUNK_LABEL_RE.test(text) && !isMonsterLabel(text);
    out.push({ text, font: lab.fontSize ?? 0, x, y, fy: foldY(y, x), p: plane, under: isUnder(y, x), id: tileId(x, y), place });
  }
  return out;
}

// ── Transport networks ──────────────────────────────────────────────────────
/**
 * transport_data.json group → how it enters the chunk graph. `hub` = every
 * endpoint joins one named network node (ChunkActivityPanel / chunkMobility
 * classify the node name into its MOBILITY_LIST network); `route` = each
 * origin↔destination pair gets its own named node; `named` = links go through
 * a node named after the nearest map label of the far (underground) end, else
 * a direct chunk↔chunk link; `direct` = plain chunk↔chunk link. Groups not
 * listed (doors, gates, agility-course obstacles, Runespan, …) only move you
 * within an area and are left out.
 */
const TRANSPORT_GROUPS = [
  [/^Fairy ring network$|^One way fairy rings$/, 'hub', 'Fairy ring network'],
  [/^Spirit tree re-rooter$/, 'hub', 'Spirit tree network'],
  [/^Gnome gliders$/, 'hub', 'Gnome glider network'],
  [/^Balloons$/, 'hub', 'Balloon network'],
  [/^Magic carpet network$/, 'hub', 'Magic carpet network'],
  [/^Wilderness obelisks$/, 'hub', 'Wilderness obelisk network'],
  [/^Charter ship - /, 'hub', 'Charter ship network'],
  [/^Portmaster Kags$/, 'hub', 'Portmaster Kags (Menaphos boats)'],
  [/^Max Guild Boss portal$|^Max guild skilling portals$/, 'hub', 'Max Guild portals'],
  [/^War's Retreat Boss portal$/, 'hub', "War's Retreat boss portals"],
  [/^Jennica's ring$/, 'hub', "Jennica's ring"],
  [/^Portal \(Chaos tunnels\)$/, 'hub', 'Chaos Tunnels'],
  [/^Abyss\s*$/, 'hub', 'Abyss'],
  [/^Underground Pass$/, 'hub', 'Underground Pass'],
  [/^Poison Waste Islands$/, 'hub', 'Poison Waste islands'],
  [/^Boats$/, 'route', 'Boat'],
  [/^Dungeon entrances$|^Resource Dungeons$|^Ladder|^Stairs|^Ladders$|^Gully$/, 'named', null],
  [/^Interactive scenery$|^NPCs$|^Misc items|^Prifddinas and Max Guild interactive scenery$|^Temple of Light and Prifddinas Undercity/, 'direct', null],
  [/^Agility shortcuts$/, 'direct', null],
];
const transportRule = (group) => TRANSPORT_GROUPS.find(([re]) => re.test(group)) ?? null;

// ── Wiki data written by other tools (optional) ─────────────────────────────
const WIKI_DIR = resolve(arg('--wiki', resolve(ROOT, 'scripts', 'rs3-wiki')));
function loadWiki(file) {
  const f = join(WIKI_DIR, file);
  if (!existsSync(f)) { console.log(`  wiki: ${file} not present — skipped`); return null; }
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch (err) { console.warn(`  wiki: ${file} unreadable (${err.message}) — skipped`); return null; }
}
/** Array, or {key: {...}} / {key: [...]} object → array of records with `name`. */
const asRecords = (d, listKey = 'items') => {
  if (!d) return [];
  if (Array.isArray(d)) return d.filter(x => x && typeof x === 'object');
  if (typeof d !== 'object') return [];
  for (const k of ['quests', 'shops', 'entries', 'data']) if (Array.isArray(d[k])) return d[k];
  return Object.entries(d).map(([name, v]) => (Array.isArray(v) ? { name, [listKey]: v }
    : v && typeof v === 'object' ? { name, ...v } : { name }));
};
const itemName = (it) => (typeof it === 'string' ? it : it && typeof it === 'object' ? (it.name ?? it.item ?? null) : null);
const xyOf = (c) => {
  if (!c) return null;
  if (Array.isArray(c) && c.length >= 2 && Number.isFinite(+c[0]) && Number.isFinite(+c[1])) return [+c[0], +c[1]];
  if (typeof c === 'object' && Number.isFinite(+c.x) && Number.isFinite(+c.y)) return [+c.x, +c.y];
  return null;
};

// ── Build ───────────────────────────────────────────────────────────────────
const newRec = () => ({ monsters: new Map(), npcs: new Set(), objects: new Map(), shops: new Set(), shopNpc: new Map(), quests: {}, clues: {} });
const CLUE_TIERS = ['easy', 'medium', 'hard', 'elite', 'master'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

async function main() {
  console.log(`cache: ${CACHE}`);
  const repo = await loadRepo();
  const { slayer: repoSlayer, continentOf, bosses } = repo;
  const npcNames = await getJson('npc_name_collection.json');
  const objNames = await getJson('object_name_collection.json');
  const [mapLabels, labelLocs, teleports, transports, clueLocs] = await Promise.all([
    getJson('map_labels.json'), getJson('map_label_locations.json'), getJson('teleport_data.json'),
    getJson('transport_data.json'), getJson('clue_locations.json'),
  ]);

  // --- NPCs: every id of every name (ids without spawns 404 once, then cached) ---
  const allIds = new Set();
  for (const [name, ids] of Object.entries(npcNames)) {
    if (!name || name === 'null' || name.startsWith('"')) continue;
    ids.forEach(id => allIds.add(id));
  }
  // Morph parents (varbit-driven NPCs) hold the spawns of many named NPCs.
  for (const parents of Object.values(await getJson('npc_morph_collection.json') ?? {})) {
    for (const id of parents) if (Number.isInteger(id) && id >= 0) allIds.add(id);
  }
  console.log(`npcs: ${allIds.size} ids`);
  const spawnsById = new Map();
  await pool([...allIds], async (id) => { const d = await getJson(`npcids/npcid=${id}.json`); if (d) spawnsById.set(id, d); });
  const isMonsterSpawn = (s) => (s.combat ?? 0) > 0 && (s.actions ?? []).includes('Attack');

  const chunks = new Map();
  const rec = (id) => { let r = chunks.get(id); if (!r) chunks.set(id, r = newRec()); return r; };
  const banks = new Set();
  const npcChunks = new Map(); // npc name (lower) → Map(chunk id → spawns)
  const npcNameSet = new Set();
  const tagSets = new Map(); // tag → Set(chunk id)
  const tag = (t, id) => { if (!tagSets.has(t)) tagSets.set(t, new Set()); tagSets.get(t).add(id); };
  let npcSpawns = 0;
  for (const spawns of spawnsById.values()) {
    for (const s of spawns) {
      const name = String(s.name ?? '').trim();
      if (!name || name === 'null' || /[<>]/.test(name)) continue;
      const id = tileId(s.x, s.y);
      const r = rec(id);
      const lower = name.toLowerCase();
      npcNameSet.add(lower);
      if (!npcChunks.has(lower)) npcChunks.set(lower, new Map());
      npcChunks.get(lower).set(id, (npcChunks.get(lower).get(id) ?? 0) + 1);
      const actions = (s.actions ?? []).filter(Boolean);
      npcSpawns++;
      if (actions.includes('Pickpocket') || actions.includes('Pickpocket from')) tag('thieving', id);
      if (isMonsterSpawn(s)) {
        const lvl = SLAYER_LEVELS[lower] ?? repoSlayer.get(lower) ?? null;
        const cur = r.monsters.get(name);
        if (cur) cur.count++; else r.monsters.set(name, { count: 1, slayer: lvl });
        if (bosses.has(lower)) tag('boss', id);
        continue;
      }
      if (name === 'Fishing spot') {
        r.npcs.add(actions.length ? `Fishing spot (${actions.map(a => a.toLowerCase()).join(', ')})` : 'Fishing spot');
        tag('fishing', id);
        continue;
      }
      r.npcs.add(name);
      if (actions.includes('Bank')) banks.add(id);
      if (actions.includes('Trade')) { const shop = shopNameFor(name); if (shop) { r.shops.add(shop); r.shopNpc.set(name, shop); } }
      if (SLAYER_MASTER.test(name)) { tag('slayer master', id); tag('slayer', id); }
      if (/ wisp$|^wisp$/i.test(name)) tag('divination', id);
      if (/kebbit$|salamander$|chinchompa$|skillchompa$|larupia$|graahk$|kyatt$|^pawya$|^grenwall$|tortle$|jadinko$|^(crimson swift|golden warbler|copper longtail|cerulean twitch|tropical wagtail|ruby harvest|sapphire glacialis|snowy knight|black warlock)$/i.test(name)) tag('hunter', id);
      if (/^tanner$|^ellis$/i.test(name)) tag('tanner', id);
    }
  }
  console.log(`  ${spawnsById.size} ids with spawns, ${npcSpawns} spawns`);

  // --- Objects ---
  const objIds = [];
  for (const [name, ids] of Object.entries(objNames)) if (OBJECTS[name.toLowerCase()]) objIds.push(...ids);
  // Agility-shortcut obstacle names (exact, any case) — only used to pin shortcuts.
  const scForms = new Map(); // lower form → true
  for (const [, what] of SHORTCUT_ROWS) {
    const base = what.replace(/\s*\(.*\)$/, '').toLowerCase();
    for (const f of [base, base + 's', base.replace(/s$/, '')]) scForms.set(f, true);
  }
  const scIds = [];
  for (const [name, ids] of Object.entries(objNames)) if (scForms.has(name.toLowerCase()) && !OBJECTS[name.toLowerCase()]) scIds.push(...ids);
  console.log(`objects: ${objIds.length} ids (+${scIds.length} shortcut obstacle ids)`);
  let objSpawns = 0;
  const scPlacements = []; // { name, x, y } (folded)
  // Varbit-driven objects (farming patches, Elder trees, …) are placed as a
  // morph parent; object_morph_collection maps child id → parent ids.
  const objMorphs = await getJson('object_morph_collection.json') ?? {};
  const objNameOf = new Map();
  for (const [name, ids] of Object.entries(objNames)) for (const id of ids) objNameOf.set(id, name.toLowerCase());
  const displayOf = (lower) => OBJECTS[lower]?.[0] ?? null;
  const morphParents = new Map(); // parent id → child cfg (the named object)
  const placedParents = new Set();
  await pool([...objIds, ...scIds], async (id) => {
    let locs = await getJson(`locations/${id}.json`);
    const cfg = await getJson(`location_configs/${id}.json`);
    if (!cfg?.name) return;
    if ((!locs || !locs.length) && OBJECTS[cfg.name.toLowerCase()]) {
      for (const pid of new Set(objMorphs[String(id)] ?? [])) {
        // Keep the lowest-id child per parent so the result is order-independent.
        const cur = morphParents.get(pid);
        if (!cur || id < cur.id) morphParents.set(pid, { ...cfg, id });
      }
      return;
    }
    if (!locs || !locs.length) return;
    placeObject(cfg, locs);
  });
  // A parent is that object only when it IS one: a patch parent must morph into
  // the patch; any other parent must morph only into the same display object
  // (so a tree patch growing a Magic tree isn't counted as a Magic tree).
  await pool([...morphParents.keys()], async (pid) => {
    const cfg = morphParents.get(pid);
    const display = displayOf(cfg.name.toLowerCase());
    const pcfg = await getJson(`location_configs/${pid}.json`);
    const kids = [...new Set((pcfg?.morphs_1?.ids ?? pcfg?.morphs_2?.ids ?? []).filter(k => k >= 0))];
    if (!kids.length) return;
    const kidDisplays = kids.map(k => displayOf(objNameOf.get(k) ?? ''));
    const isPatch = /patch$|^Allotment$/i.test(display);
    const ok = isPatch ? kidDisplays.includes(display) : kidDisplays.every(d => d === display);
    if (!ok) return;
    const key = `${display}|${pid}`;
    if (placedParents.has(key)) return;
    placedParents.add(key);
    const locs = await getJson(`locations/${pid}.json`);
    if (locs?.length) placeObject(cfg, locs);
  });
  function placeObject(cfg, locs) {
    const acts = [...(cfg.actions ?? []), ...(cfg.member_actions ?? [])].filter(Boolean);
    const lower = cfg.name.toLowerCase();
    if (scForms.has(lower) && acts.length) {
      for (const l of locs) scPlacements.push({ name: lower, x: l.i * 64 + l.x, y: foldY(l.j * 64 + l.y, l.i * 64 + l.x) });
    }
    let [display, action] = OBJECTS[lower] ?? [];
    if (!display) return;
    // Every kept object must be interactive (decorative/instanced template
    // copies have no options); gathering nodes need their skilling option.
    // Members-only options live in member_actions.
    const need = action ?? /\S/;
    if (!acts.some(a => need.test(a))) return;
    if (display === 'Obelisk' && acts.some(a => /infuse|renew/i.test(a))) display = 'Summoning obelisk';
    for (const l of locs) {
      const [cx, cy] = chunkOf(l.i, l.j);
      const id = idOf(cx, cy);
      const r = rec(id);
      r.objects.set(display, (r.objects.get(display) ?? 0) + 1);
      if (display === 'Bank booth' || display === 'Bank chest') banks.add(id);
      objSpawns++;
    }
  }
  console.log(`  morph parents: ${morphParents.size} candidates, ${placedParents.size} placed`);

  // --- Lodestones: exact teleport destinations, named from LODESTONE_NAMES ---
  const lodeRows = teleports.filter(t => t.groupName === 'Lodestone Teleport' && t.destination);
  const unmatched = new Set(Object.keys(LODESTONE_NAMES));
  const lodestones = [];
  for (const { destination: { x, y } } of lodeRows) {
    let best = null, bd = Infinity;
    for (const [n, [hx, hy]] of Object.entries(LODESTONE_NAMES)) { const d = Math.hypot(hx - x, hy - y); if (d < bd) { bd = d; best = n; } }
    if (best && bd < 64) { unmatched.delete(best); lodestones.push([best, x, y]); }
    else console.warn(`  lodestone at ${x},${y} has no name within 64 tiles — skipped`);
  }
  for (const n of unmatched) { const [x, y] = LODESTONE_NAMES[n]; lodestones.push([n, x, y]); }
  for (const [n, x, y] of lodestones) rec(tileId(x, y)).objects.set(`${n} lodestone`, 1);
  console.log(`  lodestones: ${lodeRows.length} from teleport_data, ${unmatched.size} from the name table (${[...unmatched].join(', ')})`);

  // --- Clue steps ---
  const cluePoints = [];
  const clueSeen = new Set();
  for (const c of clueLocs) {
    const m = String(c.name ?? '').match(/\((easy|medium|hard|elite|master)\)\s*$/i);
    if (!m || !Number.isFinite(c.x) || !Number.isFinite(c.y)) continue;
    const tier = m[1].toLowerCase();
    const key = `${tier}|${c.x}|${c.y}`;
    if (clueSeen.has(key)) continue;
    clueSeen.add(key);
    const id = tileId(c.x, c.y);
    const r = rec(id);
    r.clues[tier] = (r.clues[tier] ?? 0) + 1;
    const [cx, cy] = idXY(id);
    cluePoints.push({ x: c.x, y: foldY(c.y, c.x), cx, cy, t: cap(tier) });
    tag('clue', id);
  }

  // --- Map labels → chunk names ---
  const labels = buildLabels(mapLabels, labelLocs, npcNameSet);
  const places = labels.filter(l => l.place);
  // Name priority: a town/landmark label in the chunk → the nearest one within
  // its radius → a dungeon label folded onto the chunk → a kingdom/continent
  // label in or near the chunk.
  const names = new Map();
  const center = (id) => { const [cx, cy] = idXY(id); return [cx * 64 + 32, cy * 64 + 32]; };
  const ownBest = new Map();
  for (const l of places) {
    if (l.under || l.font === 2) continue;
    const [mx, my] = center(l.id);
    const prio = l.font === 1 ? 2 : 1;
    const d = Math.hypot(l.x - mx, l.fy - my);
    const cur = ownBest.get(l.id);
    if (!cur || prio > cur.prio || (prio === cur.prio && d < cur.d)) ownBest.set(l.id, { prio, d, text: l.text });
  }
  for (const [id, v] of ownBest) names.set(id, v.text);
  const RADIUS = { 0: 80, 1: 170, 2: 320 };
  const surface = places.filter(l => !l.under);
  const underOwn = new Map();
  for (const l of places) if (l.under && !underOwn.has(l.id)) underOwn.set(l.id, l.text);
  const universe = new Set([...chunks.keys(), ...underOwn.keys()]);
  for (const list of [...Object.values(repo.regionChunks), ...Object.values(repo.subAreaChunks)]) for (const c of list) universe.add(idOf(c.cx, c.cy));
  for (const id of universe) {
    if (names.has(id)) continue;
    const [mx, my] = center(id);
    let best = null, bs = 1, wide = null, ws = 1;
    for (const l of surface) {
      const s = Math.hypot(l.x - mx, l.fy - my) / (RADIUS[l.font] ?? 80);
      if (l.font === 2) { if (s <= ws) { ws = s; wide = l; } } else if (s <= bs) { bs = s; best = l; }
    }
    const n = best?.text ?? underOwn.get(id) ?? wide?.text;
    if (n) names.set(id, n);
  }
  console.log(`  names: ${ownBest.size} chunks from their own label, ${names.size - ownBest.size} from a nearby label`);

  // --- Wiki: shops (stock + shop names on the owner's chunks) ---
  const shopItems = {};
  let wikiShopPlaced = 0;
  const chunkMatchesPlace = (id, text) => {
    if (!text) return false;
    const t = text.toLowerCase();
    const n = names.get(id);
    if (n && t.includes(n.toLowerCase())) return true;
    const [cx, cy] = idXY(id);
    for (const [sub, list] of Object.entries(repo.subAreaChunks)) {
      if (t.includes(sub.toLowerCase()) && list.some(c => c.cx === cx && c.cy === cy)) return true;
    }
    return false;
  };
  /** Chunks an NPC (by name) spawns in, narrowed by a place text when it's in several. */
  const npcPlace = (npc, placeText) => {
    const m = npc ? npcChunks.get(String(npc).toLowerCase()) : null;
    if (!m || !m.size) return [];
    const ids = [...m.keys()];
    if (ids.length === 1) return ids;
    const hit = ids.filter(id => chunkMatchesPlace(id, placeText));
    if (hit.length && hit.length <= 3) return hit;
    return ids.length <= 3 && !placeText ? ids : [];
  };
  for (const s of asRecords(loadWiki('shops.json'))) {
    const name = s.name ?? s.shop;
    if (!name) continue;
    const items = (s.items ?? s.stock ?? []).map(itemName).filter(Boolean);
    if (items.length) shopItems[name] = [...new Set(items)];
    const npc = s.npc ?? s.owner ?? s.keeper;
    const ids = Array.isArray(npc) ? npc.flatMap(n => npcPlace(n, s.location)) : npcPlace(npc, s.location);
    const xy = xyOf(s.coords ?? s.coordinates);
    if (xy) ids.push(tileId(xy[0], xy[1]));
    for (const id of new Set(ids)) {
      const r = rec(id);
      for (const n of (Array.isArray(npc) ? npc : [npc])) {
        const auto = r.shopNpc.get(n);
        if (auto && auto !== name && !Object.values(SHOP_NAMES).includes(auto)) r.shops.delete(auto);
      }
      r.shops.add(name);
      wikiShopPlaced++;
    }
  }

  // --- Wiki: quests ('first' where it starts, 'step' at named places) ---
  let questFirst = 0, questStep = 0, questSkipped = 0;
  const labelByText = new Map();
  for (const l of places) { const k = l.text.toLowerCase(); if (!labelByText.has(k) || (!l.under && labelByText.get(k).under)) labelByText.set(k, l); }
  for (const q of asRecords(loadWiki('quests.json'))) {
    const name = q.name ?? q.quest;
    if (!name) continue;
    let ids = [];
    const xy = xyOf(q.coords ?? q.coordinates ?? q.startCoords);
    if (xy) ids = [tileId(xy[0], xy[1])];
    else if (q.startNpc) ids = npcPlace(q.startNpc, q.start);
    if (!ids.length && q.start) { const l = labelByText.get(String(q.start).toLowerCase()); if (l) ids = [l.id]; }
    if (ids.length) { for (const id of ids) rec(id).quests[name] = 'first'; questFirst++; } else questSkipped++;
    for (const p of (Array.isArray(q.places) ? q.places : [])) {
      const l = labelByText.get(String(p).toLowerCase());
      let id = l?.id;
      if (!id) { const sub = repo.subAreaChunks[p]; if (sub?.length) id = idOf(sub[0].cx, sub[0].cy); }
      if (id) { const r = rec(id); if (r.quests[name] !== 'first') { r.quests[name] = 'step'; questStep++; } }
    }
  }

  // --- Wiki: Slayer masters + drops ---
  const wikiMasters = loadWiki('slayer-masters.json');
  const slayerMasters = wikiMasters && typeof wikiMasters === 'object' && !Array.isArray(wikiMasters) ? (wikiMasters.masters ?? wikiMasters) : {};
  const taskSlayer = new Map();
  for (const tasks of Object.values(slayerMasters)) {
    for (const [task, info] of Object.entries(tasks ?? {})) {
      if (!(info?.slayer > 1)) continue;
      for (const f of singulars(task.toLowerCase())) taskSlayer.set(f, Math.min(taskSlayer.get(f) ?? 999, info.slayer));
    }
  }
  const wikiDrops = loadWiki('drops.json');
  const drops = {};
  for (const r of asRecords(wikiDrops?.drops ?? wikiDrops)) {
    const items = (r.items ?? r.drops ?? []).map(itemName).filter(Boolean);
    if (r.name && items.length) drops[r.name] = [...new Set(items)];
  }

  // --- Agility shortcuts: pin each listed shortcut to its cache transport link ---
  const scInstances = [];
  for (const t of transports) {
    if (t.groupName !== 'Agility shortcuts' || !t.origin || !t.destination) continue;
    const a = { x: t.origin.x, y: foldY(t.origin.y, t.origin.x) }, b = { x: t.destination.x, y: foldY(t.destination.y, t.destination.x) };
    const near = (p, q) => Math.abs(p.x - q.x) <= 4 && Math.abs(p.y - q.y) <= 4;
    if (scInstances.some(i => (near(i.a, a) && near(i.b, b)) || (near(i.a, b) && near(i.b, a)))) continue;
    scInstances.push({ a, b, used: false });
  }
  const placeIds = (place, where) => {
    const out = [];
    for (const c of repo.subAreaChunks[place] ?? []) out.push([c.cx, c.cy]);
    for (const k of [place, where]) { const l = labelByText.get(k.toLowerCase()); if (l) out.push(idXY(l.id)); }
    return out;
  };
  const shortcuts = [];
  let scPinned = 0;
  for (const [level, what, where, places] of SHORTCUT_ROWS) {
    const name = `${what} (${where})`;
    const sc = { name, skill: 'Agility', level, objects: [], chunks: [...places] };
    const cont = continentOf(places[0]);
    if (cont && !sc.chunks.includes(cont)) sc.chunks.push(cont);
    const area = places.flatMap(p => placeIds(p, where));
    if (area.length) {
      const nearArea = (p) => area.some(([cx, cy]) => Math.max(Math.abs((p.x >> 6) - cx), Math.abs((p.y >> 6) - cy)) <= 1);
      const cands = scInstances.filter(i => !i.used && (nearArea(i.a) || nearArea(i.b)));
      const base = what.replace(/\s*\(.*\)$/, '').toLowerCase();
      const forms = new Set([base, base + 's', base.replace(/s$/, '')]);
      const hasObj = (i) => scPlacements.some(o => forms.has(o.name) && [i.a, i.b].some(p => Math.abs(o.x - p.x) <= 5 && Math.abs(o.y - p.y) <= 5));
      const matched = cands.filter(hasObj);
      const pick = matched[0] ?? (cands.length === 1 ? cands[0] : null);
      if (pick) {
        pick.used = true;
        for (const p of [pick.a, pick.b]) rec(tileId(p.x, p.y)).objects.set(name, 1);
        sc.objects = [name];
        scPinned++;
      }
    }
    shortcuts.push(sc);
  }
  for (const i of scInstances) { tag('agility', tileId(i.a.x, i.a.y)); tag('agility', tileId(i.b.x, i.b.y)); }
  console.log(`  shortcuts: ${scPinned}/${SHORTCUT_ROWS.length} pinned to a cache link (${scInstances.length} cache shortcut links)`);

  // --- Serialise chunks ---
  const out = {};
  for (const [id, r] of [...chunks.entries()].sort((a, b) => +a[0] - +b[0])) {
    const e = {};
    if (names.has(id)) e.n = names.get(id);
    if (r.monsters.size) e.m = [...r.monsters.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([n, v]) => {
        let lvl = v.slayer;
        if (lvl == null) for (const f of singulars(n.toLowerCase())) if (taskSlayer.has(f)) { lvl = taskSlayer.get(f); break; }
        return lvl != null ? [n, v.count, lvl] : [n, v.count];
      });
    if (r.npcs.size) e.p = [...r.npcs].sort();
    if (r.objects.size) e.o = [...r.objects.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (r.shops.size) e.s = [...r.shops].sort();
    if (Object.keys(r.quests).length) e.q = Object.fromEntries(Object.entries(r.quests).sort((a, b) => a[0].localeCompare(b[0])));
    if (Object.keys(r.clues).length) e.c = Object.fromEntries(CLUE_TIERS.filter(t => r.clues[t]).map(t => [t, r.clues[t]]));
    if (Object.keys(e).length > (e.n ? 1 : 0)) out[id] = e;
  }
  // Named chunks without content still carry their name.
  for (const [id, n] of names) if (!out[id]) out[id] = { n };

  // --- Transport graph (undirected; named connector nodes) ---
  const adj = new Map();
  const link = (a, b) => { if (a === b) return; for (const [x, y] of [[a, b], [b, a]]) { if (!adj.has(x)) adj.set(x, new Set()); adj.get(x).add(y); } };
  const hubs = new Map(); // hub name → Set(chunk ids)
  const hubAdd = (hub, id) => { if (!hubs.has(hub)) hubs.set(hub, new Set()); hubs.get(hub).add(id); };
  for (const [n, x, y] of lodestones) hubAdd('Lodestone network', tileId(x, y));
  const objectHubs = { 'Fairy ring network': /^Fairy ring$/, 'Spirit tree network': /^Spirit tree$/, 'Canoe network': /^Canoe station$/, 'Lodestone network': /lodestone$/ };
  for (const [hub, re] of Object.entries(objectHubs)) {
    for (const [id, e] of Object.entries(out)) if ((e.o ?? []).some(([n]) => re.test(n))) hubAdd(hub, id);
  }
  /** Nearest place label to a tile (raw coords, same space), within `max` tiles. */
  const nearestLabel = (x, y, max) => {
    let best = null, bd = max;
    for (const l of places) { const d = Math.hypot(l.x - x, l.y - y); if (d <= bd) { bd = d; best = l; } }
    return best;
  };
  const counts = { hub: 0, route: 0, named: 0, direct: 0 };
  for (const t of transports) {
    if (!t.origin || !t.destination) continue;
    const rule = transportRule(t.groupName ?? '');
    if (!rule) continue;
    const [, kind, label] = rule;
    const a = tileId(t.origin.x, t.origin.y), b = tileId(t.destination.x, t.destination.y);
    if (kind === 'hub') { hubAdd(label, a); hubAdd(label, b); counts.hub++; continue; }
    if (a === b) continue; // same chunk once dungeons are folded
    if (kind === 'route') {
      const an = names.get(a) ?? a, bn = names.get(b) ?? b;
      const node = `Boat (${[an, bn].sort().join(' – ')})`;
      link(a, node); link(node, b); counts.route++;
      continue;
    }
    if (kind === 'named') {
      // Name the link after the far end's area: the underground / instanced end.
      const ends = [t.origin, t.destination].sort((p, q) => (q.y >= 4160 ? 1 : 0) - (p.y >= 4160 ? 1 : 0));
      const far = ends[0];
      const l = far.y >= 4160 ? nearestLabel(far.x, far.y, 96) : null;
      if (l) { link(a, l.text); link(l.text, b); counts.named++; continue; }
    }
    link(a, b); counts.direct++;
  }
  for (const [hub, ids] of hubs) for (const id of ids) link(hub, id);
  const connect = {};
  for (const [id, set] of [...adj.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'en', { numeric: true }))) {
    connect[id] = [...set].sort();
  }
  console.log(`  transport rows: ${JSON.stringify(counts)} | hubs: ${[...hubs.keys()].join(', ')}`);

  // --- Tags (faceted categories → chunks) ---
  const objTagRules = {
    furnace: /^Furnace$/, anvil: /^Anvil$/, range: /^Cooking range$/, altar: /^Altar$|\(Prayer\)|^Altar of Guthix$/,
    lodestone: /lodestone$/, 'fairy ring': /^Fairy ring$/, 'spirit tree': /^Spirit tree$/, 'farming patch': /patch$|^Allotment$/,
    'deposit box': /^Bank deposit box$/, 'spinning wheel': /^Spinning wheel$/, loom: /^Loom$/, pottery: /^Potter's wheel$|^Pottery oven$/,
    sawmill: /^Sawmill$/, 'summoning obelisk': /^Summoning obelisk$/, 'canoe station': /^Canoe station$/,
    // skills
    woodcutting: / tree$|^Ivy$|bamboo$|^Arctic pine$/i, mining: / rock$|^Seren stone$|Seren stone$/, runecrafting: /^(Air|Mind|Water|Earth|Fire|Body|Cosmic|Chaos|Astral|Nature|Law|Death|Blood|Soul|Time) (altar|ruins)$|^Runecrafting altar$|^Mysterious ruins$/,
    smithing: /^Anvil$|^Furnace$/, cooking: /^Cooking range$/, crafting: /^Spinning wheel$|^Loom$|^Potter's wheel$|^Pottery oven$|^Furnace$/,
    prayer: /^Altar$|\(Prayer\)|^Altar of Guthix$/, farming: /patch$|^Allotment$/, thieving: / stall$/i, summoning: /^Summoning obelisk$/,
  };
  for (const [id, e] of Object.entries(out)) {
    for (const [t, re] of Object.entries(objTagRules)) if ((e.o ?? []).some(([n]) => re.test(n))) tag(t, id);
    if (e.s?.length) tag('shop', id);
    if ((e.m ?? []).some(m => m[2] != null)) tag('slayer', id);
    if (Object.values(e.q ?? {}).includes('first')) tag('quest start', id);
  }
  for (const id of tagSets.get('tanner') ?? []) tag('crafting', id);
  tagSets.delete('tanner');
  const tags = {};
  for (const t of [...tagSets.keys()].sort()) tags[t] = [...tagSets.get(t)].sort((a, b) => +a - +b);

  const overlays = {};
  if (cluePoints.length) overlays.Clues = cluePoints;

  const doc = {
    version: 10,
    game: 'rs3',
    source: 'RuneScape 3 cache data by mejrs / RuneScape Wiki maps project (github.com/mejrs/data_rs3: npcids, locations, location_configs, map_labels, map_label_locations, transport_data, teleport_data, clue_locations); Agility shortcut levels from runescape.wiki/w/Shortcuts; optional wiki tables from scripts/rs3-wiki/ (slayer masters, drops, quests, shops)',
    generated: new Date().toISOString().slice(0, 10),
    notes: 'Map squares (cx*256+cy). Old-style dungeons (squares y 136-169) folded onto the surface square above. '
      + 'n = in-game world-map label in (or near) the chunk; m/p/o/s = NPC/object spawns; c = clue scroll step locations per tier (also overlays.Clues); '
      + 'connect = cache transport links (fairy rings, spirit trees, gliders, balloons, carpets, charters, obelisks, lodestones, canoes, boats, dungeon entrances, cross-chunk stairs/ladders, agility shortcuts) with named network/dungeon nodes. '
      + `Wiki tables merged when present: slayerMasters ${Object.keys(slayerMasters).length ? 'yes' : 'no'}, drops ${Object.keys(drops).length ? 'yes' : 'no'}, quests ${questFirst ? 'yes' : 'no'}, shop stock ${Object.keys(shopItems).length ? 'yes' : 'no'}. `
      + 'Not covered (no RS3 source): achievement diaries (d), ground item spawns (i), skillItems, taskUnlocks, questSections, impling/crime/star overlays (implings only spawn in Puro-Puro in the cache).',
    chunks: out,
    connect,
    slayerMasters,
    shortcuts,
    shopItems,
    drops,
    overlays,
    skillItems: {},
    taskUnlocks: {},
    questSections: {},
    banks: [...banks].sort((a, b) => +a - +b),
    tags,
  };
  const json = JSON.stringify(doc);
  writeFileSync(OUT, json);
  const monsterNames = new Set(Object.values(out).flatMap(e => (e.m ?? []).map(m => m[0])));
  console.log(`  npc spawns: ${npcSpawns} | object placements: ${objSpawns} | clue steps: ${cluePoints.length}`);
  console.log(`  quests: ${questFirst} placed (${questSkipped} unplaced), ${questStep} steps | wiki shop placements: ${wikiShopPlaced} | shop stock: ${Object.keys(shopItems).length} | drops: ${Object.keys(drops).length} | slayer masters: ${Object.keys(slayerMasters).length}`);
  console.log(`  monsters: ${monsterNames.size} names | banks: ${doc.banks.length} | connect nodes: ${Object.keys(connect).length} | tags: ${Object.keys(tags).join(', ')}`);
  console.log(`wrote ${OUT} — ${Object.keys(out).length} chunks, ~${Math.round(json.length / 1024)} KB`);
}

await main();
