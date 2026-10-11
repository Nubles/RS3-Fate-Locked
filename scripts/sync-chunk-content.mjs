#!/usr/bin/env node
/**
 * sync-chunk-content.mjs — regenerate public/chunk-content.json from RuneScape 3
 * cache data.
 *
 * Source: the RuneScape Wiki maps project's RS3 cache dumps by mejrs
 *   https://github.com/mejrs/data_rs3  (served from raw.githubusercontent.com)
 *     npc_name_collection.json        name → [npc ids]
 *     npcids/npcid=<id>.json          every spawn of that npc (x, y, p + config)
 *     object_name_collection.json     name → [location (object) ids]
 *     location_configs/<id>.json      object config (name, actions)
 *     locations/<id>.json             every placement (map square i,j + local x,y)
 * plus the RuneScape Wiki "Shortcuts" list (Agility levels) re-expressed below.
 *
 * Output keeps the compact shape ChunkContentService decodes, keyed by map
 * square id (cx * 256 + cy, cx = x >> 6, cy = y >> 6 — our map's chunk grid):
 *   m  monsters  [name, spawnCount, slayerLevel?]   (NPCs with Attack + combat > 0)
 *   p  NPCs      names                              (non-combat, incl. fishing spots, wisps)
 *   o  objects   [name, count]                      (gathering nodes, stations, transport)
 *   s  shops     shop names                         (NPCs with a Trade option)
 * Planes are merged into their map square. Old-style dungeons that sit 6400
 * tiles north of the surface (map squares y 136..169) are folded onto the
 * surface square above them, like the world map does; other instanced areas
 * (The Arc, Zanaris, the Abyss, …) keep their own square.
 *
 * Fetch strategy (targeted, cached): every id of every name the app cares
 * about (Resource Engine sources, bosses, skilling/shop/transport NPCs and
 * objects), plus the first three ids of every other NPC name — when one of them is
 * a monster with spawns, the rest of that name's ids are fetched too. Responses are
 * cached on disk (--cache <dir>, default $TMPDIR/rs3-chunk-content-cache) so a
 * re-run is offline.
 *
 * Usage:  node scripts/sync-chunk-content.mjs [--cache dir] [--concurrency 32]
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public', 'chunk-content.json');
const DATA = 'https://raw.githubusercontent.com/mejrs/data_rs3/refs/heads/master';
const arg = (flag, dflt) => { const i = process.argv.indexOf(flag); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const CACHE = resolve(arg('--cache', join(tmpdir(), 'rs3-chunk-content-cache')));
const CONCURRENCY = +arg('--concurrency', 32);
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

// ── Repo data (names the app references) ───────────────────────────────────
async function loadRepoNames() {
  const r = await build({
    stdin: {
      contents: `export { RESOURCE_MAP } from './data/resourceData'; export { BOSSES_LIST, REGION_GROUPS, MISTHALIN_AREAS } from './data/items';`,
      resolveDir: ROOT, loader: 'ts',
    },
    bundle: true, format: 'esm', write: false, platform: 'node', logLevel: 'error',
  });
  const m = await import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
  const names = new Set();
  const slayer = new Map();
  for (const sources of Object.values(m.RESOURCE_MAP)) {
    for (const s of sources) {
      if (!['DROP', 'PICKPOCKET', 'SHOP', 'MERCHANT', 'QUEST', 'SKILL'].includes(s.type)) continue;
      names.add(s.name.toLowerCase());
      if (s.type === 'DROP' && s.skills?.Slayer) slayer.set(s.name.toLowerCase(), s.skills.Slayer);
    }
  }
  for (const b of m.BOSSES_LIST) names.add(String(b).toLowerCase());
  const continentOf = (place) => (m.MISTHALIN_AREAS.includes(place) ? 'Misthalin'
    : Object.keys(m.REGION_GROUPS).find(k => m.REGION_GROUPS[k].includes(place)) ?? null);
  return { names, slayer, continentOf };
}

// ── Coordinates ─────────────────────────────────────────────────────────────
/** Map square → our chunk: fold old-style dungeons (squares y 136..169) onto the surface. */
const chunkOf = (sx, sy) => [sx, sy >= 136 && sy < 170 ? sy - 100 : sy];
const idOf = (cx, cy) => String(cx * 256 + cy);

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

/** NPC names that are worth every id (beyond the Resource Engine's sources). */
const NPC_KEEP = new RegExp([
  '^fishing spot$', '^banker$', 'banker$', '^shopkeeper', '^shop (assistant|keeper)', 'general store',
  '^(pale|flickering|bright|glowing|sparkling|gleaming|vibrant|lustrous|elder|brilliant|radiant|luminous|incandescent) wisp$',
  '^(turael|spria|jacquelyn|vannaka|the raptor|mazchna|achtryn|chaeldar|sumona|duradel|lapalok|kuradal|morvran|laniakea|mandrith)$',
  'kebbit$', 'salamander$', 'chinchompa$', 'skillchompa$', 'impling$', 'larupia$', 'graahk$', 'kyatt$', '^pawya$', '^grenwall$', 'tortle$', 'jadinko$',
  '^(crimson swift|golden warbler|copper longtail|cerulean twitch|tropical wagtail|ruby harvest|sapphire glacialis|snowy knight|black warlock)$',
  '^(man|woman|farmer|master farmer|guard|knight of ardougne|paladin|hero|watchman|gnome|rogue|cave goblin|menaphite thug|desert bandit|bandit|h\\.a\\.m\\. member)$',
  ' worker$', '^gnome pilot$', 'captain', '^charter', 'sailor', '^tanner$', '^sawmill operator$', 'gem trader', '^ellis$',
].join('|'), 'i');

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
 * LODESTONES below instead.
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
 * RS3 lodestones (Lodestone Network) by the tile they stand on. Their placed
 * objects are varbit parents the dumps can't name, so their positions are
 * listed here at map-square precision.
 */
const LODESTONES = {
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
 * shortcuts) → level + the place(s) on our map they sit in. Located by place
 * name (chunkForPlace) because the obstacle objects have generic names.
 */
const SHORTCUTS = [
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
].map(([level, what, where, chunks]) => ({ name: `${what} (${where})`, skill: 'Agility', level, objects: [], chunks }));

// ── Build ───────────────────────────────────────────────────────────────────
const newRec = () => ({ monsters: new Map(), npcs: new Set(), objects: new Map(), shops: new Set() });

async function main() {
  console.log(`cache: ${CACHE}`);
  const { names: repoNames, slayer: repoSlayer, continentOf } = await loadRepoNames();
  // Each shortcut also falls back to its continent when the sub-area isn't painted.
  const shortcuts = SHORTCUTS.map(sc => {
    const cont = continentOf(sc.chunks[0]);
    return cont && !sc.chunks.includes(cont) ? { ...sc, chunks: [...sc.chunks, cont] } : sc;
  });
  const npcNames = await getJson('npc_name_collection.json');
  const objNames = await getJson('object_name_collection.json');

  // --- NPCs ---
  const wanted = (name) => repoNames.has(name.toLowerCase()) || NPC_KEEP.test(name);
  const full = new Set(), probe = new Map(); // id sets
  for (const [name, ids] of Object.entries(npcNames)) {
    if (!name || name === 'null' || name.startsWith('"')) continue;
    if (wanted(name)) ids.forEach(id => full.add(id));
    else probe.set(name, ids);
  }
  console.log(`npcs: ${full.size} targeted ids; probing ${probe.size} other names`);
  const spawnsById = new Map();
  const fetchNpc = async (id) => { const d = await getJson(`npcids/npcid=${id}.json`); if (d) spawnsById.set(id, d); };
  await pool([...full], fetchNpc);
  const PROBE = 3; // first few ids of every other name: later ids are mostly variants
  const firstIds = [...probe.values()].flatMap(ids => ids.slice(0, PROBE));
  await pool(firstIds, fetchNpc);
  const isMonsterSpawn = (s) => (s.combat ?? 0) > 0 && (s.actions ?? []).includes('Attack');
  const followUp = [];
  for (const ids of probe.values()) {
    if (ids.slice(0, PROBE).some(id => spawnsById.get(id)?.some(isMonsterSpawn))) followUp.push(...ids.slice(PROBE));
  }
  console.log(`  follow-up ids for probed monsters: ${followUp.length}`);
  await pool(followUp, fetchNpc);

  const chunks = new Map();
  const rec = (cx, cy) => { const k = idOf(cx, cy); let r = chunks.get(k); if (!r) chunks.set(k, r = newRec()); return r; };
  const banks = new Set();
  let npcSpawns = 0;
  for (const spawns of spawnsById.values()) {
    for (const s of spawns) {
      const name = String(s.name ?? '').trim();
      if (!name || name === 'null' || /[<>]/.test(name)) continue;
      const [cx, cy] = chunkOf(s.x >> 6, s.y >> 6);
      const r = rec(cx, cy);
      const actions = (s.actions ?? []).filter(Boolean);
      npcSpawns++;
      if (isMonsterSpawn(s)) {
        const lvl = SLAYER_LEVELS[name.toLowerCase()] ?? repoSlayer.get(name.toLowerCase()) ?? null;
        const cur = r.monsters.get(name);
        if (cur) cur.count++; else r.monsters.set(name, { count: 1, slayer: lvl });
        continue;
      }
      if (name === 'Fishing spot') {
        r.npcs.add(actions.length ? `Fishing spot (${actions.map(a => a.toLowerCase()).join(', ')})` : 'Fishing spot');
        continue;
      }
      r.npcs.add(name);
      if (actions.includes('Bank')) banks.add(idOf(cx, cy));
      if (actions.includes('Trade')) { const shop = shopNameFor(name); if (shop) r.shops.add(shop); }
    }
  }

  // --- Objects ---
  const objIds = [];
  for (const [name, ids] of Object.entries(objNames)) if (OBJECTS[name.toLowerCase()]) objIds.push(...ids);
  console.log(`objects: ${objIds.length} ids`);
  let objSpawns = 0;
  await pool(objIds, async (id) => {
    const locs = await getJson(`locations/${id}.json`);
    if (!locs || !locs.length) return;
    const cfg = await getJson(`location_configs/${id}.json`);
    if (!cfg?.name) return;
    const [display, action] = OBJECTS[cfg.name.toLowerCase()] ?? [];
    if (!display) return;
    // Every kept object must be interactive (decorative/instanced template
    // copies have no options); gathering nodes need their skilling option.
    // Members-only options live in member_actions.
    const need = action ?? /\S/;
    if (![...(cfg.actions ?? []), ...(cfg.member_actions ?? [])].some(a => a && need.test(a))) return;
    for (const l of locs) {
      const [cx, cy] = chunkOf(l.i, l.j);
      const r = rec(cx, cy);
      r.objects.set(display, (r.objects.get(display) ?? 0) + 1);
      if (display === 'Bank booth' || display === 'Bank chest') banks.add(idOf(cx, cy));
      objSpawns++;
    }
  });

  for (const [place, [x, y]] of Object.entries(LODESTONES)) {
    const r = rec(x >> 6, y >> 6);
    r.objects.set(`${place} lodestone`, 1);
  }

  // --- Serialise chunks ---
  const out = {};
  for (const [id, r] of [...chunks.entries()].sort((a, b) => +a[0] - +b[0])) {
    const e = {};
    if (r.monsters.size) e.m = [...r.monsters.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([n, v]) => (v.slayer != null ? [n, v.count, v.slayer] : [n, v.count]));
    if (r.npcs.size) e.p = [...r.npcs].sort();
    if (r.objects.size) e.o = [...r.objects.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (r.shops.size) e.s = [...r.shops].sort();
    if (Object.keys(e).length) out[id] = e;
  }

  // --- Transport graph: each network's nodes linked through one hub (the
  //     links carry no unlock requirement, as before — reachability errs
  //     toward "reachable"). ---
  const adj = new Map();
  const link = (a, b) => { if (a === b) return; for (const [x, y] of [[a, b], [b, a]]) { if (!adj.has(x)) adj.set(x, new Set()); adj.get(x).add(y); } };
  const networks = { lodestone: /lodestone$/, 'fairy ring': /^Fairy ring$/, 'spirit tree': /^Spirit tree$/, canoe: /^Canoe station$/, obelisk: /^Obelisk$/ };
  for (const re of Object.values(networks)) {
    const ids = Object.entries(out).filter(([, e]) => (e.o ?? []).some(([n]) => re.test(n))).map(([id]) => id);
    for (const id of ids.slice(1)) link(ids[0], id);
  }
  const connect = {};
  for (const [id, set] of [...adj.entries()].sort((a, b) => +a[0] - +b[0])) connect[id] = [...set].sort();

  // --- Tags (faceted categories → chunks) ---
  const tagRules = {
    furnace: /^Furnace$/, anvil: /^Anvil$/, range: /^Cooking range$/, altar: /^Altar$|\(Prayer\)|^Altar of Guthix$/,
    lodestone: /lodestone$/, 'fairy ring': /^Fairy ring$/, 'farming patch': /patch$|^Allotment$/, 'deposit box': /^Bank deposit box$/,
  };
  const tags = {};
  for (const [tag, re] of Object.entries(tagRules)) {
    const ids = Object.entries(out).filter(([, e]) => (e.o ?? []).some(([n]) => re.test(n))).map(([id]) => id);
    if (ids.length) tags[tag] = ids;
  }
  const fishing = Object.entries(out).filter(([, e]) => (e.p ?? []).some(n => n.startsWith('Fishing spot'))).map(([id]) => id);
  if (fishing.length) tags['fishing spot'] = fishing;
  const shopsTag = Object.entries(out).filter(([, e]) => e.s?.length).map(([id]) => id);
  if (shopsTag.length) tags.shop = shopsTag;

  const doc = {
    version: 9,
    game: 'rs3',
    source: 'RuneScape 3 cache data by mejrs / RuneScape Wiki maps project (github.com/mejrs/data_rs3: npcids, locations, location_configs); Agility shortcuts from runescape.wiki/w/Shortcuts',
    generated: new Date().toISOString().slice(0, 10),
    notes: 'Map squares (cx*256+cy). Old-style dungeons (squares y 136-169) folded onto the surface square above. No RS3 data source for quest steps, diaries, clue steps, item spawns, shop stock, drop tables, slayer master tables or quest-gated chunks: those fields are empty.',
    chunks: out,
    connect,
    slayerMasters: {},
    shortcuts,
    shopItems: {},
    drops: {},
    overlays: {},
    skillItems: {},
    taskUnlocks: {},
    questSections: {},
    banks: [...banks].sort((a, b) => +a - +b),
    tags,
  };
  const json = JSON.stringify(doc);
  writeFileSync(OUT, json);
  const monsterNames = new Set(Object.values(out).flatMap(e => (e.m ?? []).map(m => m[0])));
  console.log(`  npc spawns: ${npcSpawns} (${spawnsById.size} ids) | object placements: ${objSpawns}`);
  console.log(`  monsters: ${monsterNames.size} names | banks: ${doc.banks.length} | connect nodes: ${Object.keys(connect).length} | tags: ${Object.keys(tags).join(', ')}`);
  console.log(`wrote public/chunk-content.json — ${Object.keys(out).length} chunks with content, ~${Math.round(json.length / 1024)} KB`);
}

await main();
