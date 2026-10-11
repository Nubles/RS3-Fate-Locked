import { DropSource } from '../types';

/**
 * RuneScape 3 quest list.
 *
 * Source: https://runescape.wiki/w/List_of_quests (+ each quest's own wiki page
 * for start location, requirements and quest points).
 *
 *  • `regions`  — the continent(s) the quest starts in / is gated by, using the
 *                 continent keys of REGION_GROUPS plus 'Misthalin' (the free
 *                 starter continent; MISTHALIN_AREAS incl. Fort Forinthry).
 *                 The City of Um (Necromancy) sits in Morytania; Havenhythe
 *                 (2026, east of Morytania) is tagged 'Islands & Others' until
 *                 the backbone grows a dedicated region.
 *  • `skills`   — skill levels needed to START/COMPLETE the quest (RS3 skill
 *                 names, e.g. Constitution, Necromancy, Archaeology). The meta
 *                 key 'Quest Points' is a QP requirement.
 *  • `prereqs`  — DIRECT quest prerequisites only (the chain below them is
 *                 implied); every entry is a key of QUEST_DATA.
 *  • `difficulty` — RS3 official difficulty. RS3 "Special" quests (Recipe for
 *                 Disaster, Dimension of Disaster, Once Upon a Time in Gielinor,
 *                 That Old Black Magic) are mapped to the closest tier and
 *                 flagged `special: true`.
 *  • `miniquest` — RS3 miniquests (and quests that award 0 QP are NOT
 *                 miniquests — e.g. Aftermath, Eye of Het I — they keep
 *                 `points: 0` but no flag).
 *
 * Seasonal event quests (Christmas Village, Blooming Burrow, Harvest Hollow)
 * are only available during their events and are intentionally omitted.
 *
 * Recipe for Disaster is modelled as its nine RS3 subquests (each 1 QP, titled
 * as on the wiki: "Recipe for Disaster: …") plus the parent quest
 * "Recipe for Disaster", which represents the final subquest
 * (Defeating the Culinaromancer) and its 1 QP.
 */
export interface QuestData {
  id: string;
  name: string;
  regions: string[];
  skills: Record<string, number>;
  prereqs: string[];
  points: number;
  series?: string;
  difficulty: DropSource;
  /** Members-only quest (RS3). Omitted/false = free-to-play. */
  members?: boolean;
  /** RS3 miniquest (not in the quest list, awards no QP). */
  miniquest?: boolean;
  /** RS3 "Special" difficulty — mapped to the nearest tier in `difficulty`. */
  special?: boolean;
}

const N = DropSource.QUEST_NOVICE;
const I = DropSource.QUEST_INTERMEDIATE;
const E = DropSource.QUEST_EXPERIENCED;
const M = DropSource.QUEST_MASTER;
const G = DropSource.QUEST_GRANDMASTER;

interface Opts {
  series?: string;
  /** Free-to-play quest (default: members). */
  f2p?: boolean;
  miniquest?: boolean;
  special?: boolean;
}

type Def = [
  name: string,
  difficulty: DropSource,
  points: number,
  regions: string[],
  skills: Record<string, number>,
  prereqs: string[],
  opts?: Opts,
];

// Common region shorthands
const MIS = ['Misthalin'];
const ASG = ['Asgarnia'];
const KAN = ['Kandarin'];
const KAR = ['Karamja'];
const DES = ['Kharidian Desert'];
const MOR = ['Morytania'];
const FRE = ['Fremennik'];
const TIR = ['Tirannwn'];
const WIL = ['Wilderness'];
const DAE = ['Daemonheim'];
const ANA = ['Anachronia'];
const ISL = ['Islands & Others'];
/** City of Um — the Necromancy hub, in Morytania. */
const UM = MOR;
/** Havenhythe (2026 continent east of Morytania) — see header note. */
const HAV = ['Havenhythe'];

const DEFS: Def[] = [
  // ───────────────────────────── Free-to-play ─────────────────────────────
  ['A Shadow over Ashdale', N, 1, ISL, {}, [], { f2p: true }],
  ['A Soul\'s Bane', N, 1, MIS, {}, [], { f2p: true }],
  ['Beneath Cursed Tides', I, 1, MIS, { Attack: 30, Cooking: 30, Firemaking: 30, Magic: 30, Mining: 30, Smithing: 30, Strength: 30, Woodcutting: 30 }, [], { f2p: true }],
  ['Broken Home', N, 1, MIS, {}, [], { f2p: true }],
  ['Chef\'s Assistant', N, 1, MIS, { Cooking: 32 }, ['Cook\'s Assistant'], { f2p: true }],
  ['Cook\'s Assistant', N, 1, MIS, {}, [], { f2p: true, series: 'Recipe for Disaster' }],
  ['Death Plateau', N, 1, ASG, {}, [], { f2p: true, series: 'Troll' }],
  ['Demon Slayer', N, 3, MIS, {}, [], { f2p: true, series: 'Delrith' }],
  ['Dragon Slayer', E, 2, MIS, { 'Quest Points': 33 }, [], { f2p: true }],
  ['Druidic Ritual', N, 4, ASG, {}, [], { f2p: true }],
  ['Duck Quest', N, 1, MIS, {}, [], { f2p: true }],
  ['Ernest the Chicken', N, 4, MIS, {}, [], { f2p: true }],
  ['Gertrude\'s Cat', N, 1, MIS, {}, [], { f2p: true }],
  ['Goblin Diplomacy', N, 5, ASG, {}, [], { f2p: true, series: 'Cave Goblin' }],
  ['Gower Quest', E, 1, MIS, { 'Quest Points': 34 }, [], { f2p: true }],
  ['Gunnar\'s Ground', N, 5, MIS, { Crafting: 5 }, [], { f2p: true }],
  ['Hearts of Sanguine', N, 1, HAV, {}, ['Visions of Havenhythe'], { f2p: true, series: 'Sanguine' }],
  ['Heartstealer', N, 1, MIS, {}, [], { f2p: true }],
  ['Imp Catcher', N, 1, MIS, {}, [], { f2p: true }],
  ['Let Them Eat Pie', N, 1, MIS, {}, [], { f2p: true }],
  ['Missing, Presumed Death', N, 2, MIS, {}, [], { f2p: true, series: 'Sliske\'s Game' }],
  ['Myths of the White Lands', N, 2, MIS, {}, [], { f2p: true }],
  ['Necromancy!', N, 1, MIS, {}, [], { f2p: true, series: 'The First Necromancer' }],
  ['Once Upon a Slime', N, 1, ASG, {}, [], { f2p: true }],
  ['One Piercing Note', N, 2, ASG, {}, [], { f2p: true }],
  ['Perils of Ice Mountain', N, 1, ASG, { Farming: 5, Hunter: 5, Thieving: 5 }, [], { f2p: true }],
  ['Pirate\'s Treasure', N, 2, ASG, {}, [], { f2p: true, series: 'Pirate' }],
  ['Rune Memories', N, 1, MIS, {}, ['Rune Mysteries'], { f2p: true, series: 'Ariane' }],
  ['Rune Mysteries', N, 1, MIS, {}, [], { f2p: true, series: 'Ariane' }],
  ['Shield of Arrav', N, 1, MIS, {}, [], { f2p: true }],
  ['Song from the Depths', N, 1, ASG, {}, [], { f2p: true }],
  ['Stolen Hearts', N, 1, MIS, {}, [], { f2p: true, series: 'Ozan' }],
  ['Swept Away', N, 2, MIS, {}, [], { f2p: true }],
  ['The Blood Pact', N, 1, MIS, {}, [], { f2p: true }],
  ['The Death of Chivalry', N, 1, ASG, {}, [], { f2p: true }],
  ['The Knight\'s Sword', I, 1, ASG, { Mining: 10 }, [], { f2p: true }],
  ['The Restless Ghost', N, 1, MIS, {}, [], { f2p: true }],
  ['There\'s No Place Like Home...', N, 1, ASG, {}, [], { f2p: true }],
  ['Vampyre Slayer', N, 3, MIS, {}, [], { f2p: true }],
  ['Violet is Blue', N, 1, ASG, {}, [], { f2p: true }],
  ['Violet is Blue Too', N, 1, ASG, {}, ['Violet is Blue'], { f2p: true }],
  ['Visions of Havenhythe', N, 1, [...ASG, ...HAV], {}, [], { f2p: true, series: 'Sanguine' }],
  ['What\'s Mine is Yours', N, 1, ASG, { Smithing: 5 }, [], { f2p: true }],
  ['Witch\'s House', I, 4, ASG, {}, [], { f2p: true }],
  ['Wolf Whistle', N, 1, ASG, {}, [], { f2p: true }],

  // ─────────────────────────────── Novice ────────────────────────────────
  ['Biohazard', N, 3, KAN, {}, ['Plague City'], { series: 'Elf (Prifddinas)' }],
  ['Bringing Home the Bacon', N, 1, ASG, { Construction: 14, Farming: 14, Summoning: 14 }, []],
  ['Buyers and Cellars', N, 1, MIS, { Thieving: 5 }, [], { series: 'Thieves\' Guild' }],
  ['Call of the Ancestors', N, 1, DES, {}, []],
  ['Clock Tower', N, 1, KAN, {}, []],
  ['Diamond in the Rough', N, 1, MIS, {}, ['Stolen Hearts'], { series: 'Ozan' }],
  ['Dwarf Cannon', N, 1, KAN, {}, []],
  ['Eagles\' Peak', N, 2, KAN, { Hunter: 27 }, []],
  ['Elemental Workshop I', N, 1, KAN, { Crafting: 20, Mining: 20, Smithing: 20 }, [], { series: 'Elemental Workshop' }],
  ['Eye of Het I', N, 0, DES, { Agility: 65 }, ['City of Senntisten'], { series: 'The Elder God Wars' }],
  ['Eye of Het II', N, 0, DES, {}, ['Eye of Het I'], { series: 'The Elder God Wars' }],
  ['Fishing Contest', N, 1, KAN, { Fishing: 10 }, []],
  ['Fur \'n Seek', N, 2, MIS, {}, ['Rag and Bone Man'], { series: 'Odd Old Man' }],
  ['Hazeel Cult', N, 1, KAN, {}, [], { series: 'Mahjarrat Mysteries' }],
  ['Hermit Permits', N, 1, HAV, { Construction: 5, Crafting: 15 }, ['Visions of Havenhythe']],
  ['Impressing the Locals', N, 1, [...ASG, 'The Arc'], {}, [], { series: 'Tales of the Arc' }],
  ['Jungle Potion', N, 1, KAR, { Herblore: 3 }, ['Druidic Ritual']],
  ['Monk\'s Friend', N, 1, KAN, {}, []],
  ['Murder Mystery', N, 3, KAN, {}, []],
  ['Murder on the Border', N, 1, MIS, { Woodcutting: 20 }, ['New Foundations'], { series: 'Fort Forinthry' }],
  ['Nature Spirit', N, 2, MOR, {}, ['Priest in Peril', 'The Restless Ghost'], { series: 'Myreque' }],
  ['New Foundations', N, 1, MIS, {}, [], { series: 'Fort Forinthry' }],
  ['Observatory Quest', N, 2, KAN, {}, []],
  ['Plague City', N, 1, KAN, {}, [], { series: 'Elf (Prifddinas)' }],
  ['Priest in Peril', N, 1, MIS, {}, [], { series: 'Myreque' }],
  ['Princess and the Pauper', N, 1, MIS, { Construction: 25, Cooking: 25 }, ['Gertrude\'s Cat', 'Murder on the Border'], { series: 'Fort Forinthry' }],
  ['Rag and Bone Man', N, 1, MIS, {}, [], { series: 'Odd Old Man' }],
  ['Raksha, the Shadow Colossus', N, 0, ANA, {}, [], { series: 'The Elder God Wars' }],
  ['Recruitment Drive', N, 1, ASG, { Herblore: 3 }, [], { series: 'Temple Knight' }],
  ['Rune Mechanics', N, 1, DES, { Construction: 25, Magic: 27, Runecrafting: 20 }, []],
  ['Rune Mythos', N, 1, UM, { Necromancy: 24 }, ['Necromancy!'], { series: 'The First Necromancer' }],
  ['Sheep Herder', N, 4, KAN, {}, []],
  ['The Jack of Spades', N, 1, DES, {}, ['Diamond in the Rough'], { series: 'Ozan' }],
  ['The Needle Skips', N, 1, KAN, {}, [], { series: 'The Elder God Wars' }],
  ['The Tale of the Muspah', N, 1, FRE, { Firemaking: 10, Magic: 8, Mining: 10, Woodcutting: 6 }, []],
  ['Tower of Life', N, 2, KAN, { Construction: 10 }, []],
  ['Wiz Kid', N, 1, HAV, { Magic: 33 }, ['Visions of Havenhythe']],

  // ───────────────────────────── Intermediate ────────────────────────────
  ['A Tail of Two Cats', I, 2, ASG, {}, ['Icthlarin\'s Little Helper']],
  ['All Fired Up', I, 1, MIS, { Firemaking: 43 }, ['Priest in Peril']],
  ['Animal Magnetism', I, 1, MIS, { Crafting: 19, Ranged: 30, Slayer: 18, Woodcutting: 35 }, ['The Restless Ghost', 'Ernest the Chicken', 'Priest in Peril']],
  ['Another Slice of H.A.M.', I, 1, MIS, { Attack: 15, Prayer: 25 }, ['Death to the Dorgeshuun', 'The Giant Dwarf', 'The Dig Site'], { series: 'Cave Goblin' }],
  ['Battle of the Monolith', I, 0, MIS, {}, ['Azzanadra\'s Quest'], { series: 'The Elder God Wars' }],
  ['Big Chompy Bird Hunting', I, 2, KAN, { Cooking: 30, Fletching: 5, Ranged: 30 }, [], { series: 'Ogre' }],
  ['Carnillean Rising', I, 1, KAN, { Construction: 31, Thieving: 33, 'Quest Points': 50 }, ['The Blood Pact', 'Hazeel Cult']],
  ['Cold War', I, 1, KAN, { Agility: 30, Construction: 34, Crafting: 30, Hunter: 10, Thieving: 15 }, [], { series: 'Penguin' }],
  ['Creature of Fenkenstrain', I, 2, MOR, { Crafting: 20, Thieving: 25 }, ['Priest in Peril', 'The Restless Ghost']],
  ['Daughter of Chaos', I, 1, ASG, { Archaeology: 40, Divination: 40 }, [], { series: 'Legacy of Zamorak' }],
  ['Death to the Dorgeshuun', I, 1, MIS, { Agility: 23, Thieving: 23 }, ['The Lost Tribe'], { series: 'Cave Goblin' }],
  ['Desperate Creatures', I, 0, ASG, {}, ['Desperate Measures'], { series: 'The Elder God Wars' }],
  ['Desperate Measures', I, 3, ASG, { Agility: 50, Archaeology: 50 }, ['Desperate Times'], { series: 'The Elder God Wars' }],
  ['Desperate Times', I, 3, ASG, { Divination: 50, Mining: 50, Smithing: 50 }, ['The Needle Skips', 'You Are It', 'There\'s No Place Like Home...'], { series: 'The Elder God Wars' }],
  ['Dishonour among Thieves', I, 2, MIS, { Agility: 30, Thieving: 30 }, ['Hazeel Cult', 'Missing, Presumed Death'], { series: 'Sliske\'s Game' }],
  ['Elemental Workshop II', I, 1, KAN, { Magic: 20, Smithing: 30 }, ['Elemental Workshop I'], { series: 'Elemental Workshop' }],
  ['Elemental Workshop III', I, 1, KAN, { Mining: 20, Smithing: 33 }, ['Elemental Workshop II'], { series: 'Elemental Workshop' }],
  ['Elemental Workshop IV', I, 2, KAN, { Crafting: 41, Defence: 40, Runecrafting: 39, Smithing: 42, Thieving: 39 }, ['Elemental Workshop III'], { series: 'Elemental Workshop' }],
  ['Enlightened Journey', I, 1, ASG, { Crafting: 36, Farming: 30, Firemaking: 20, 'Quest Points': 20 }, []],
  ['Evil Dave\'s Big Day Out', I, 2, MIS, { Cooking: 30 }, ['Recipe for Disaster: Freeing Evil Dave']],
  ['Forgettable Tale of a Drunken Dwarf', I, 2, FRE, { Cooking: 22, Farming: 17 }, ['The Giant Dwarf', 'Fishing Contest'], { series: 'Dwarf (Red Axe)' }],
  ['Garden of Tranquillity', I, 2, MIS, { Farming: 25 }, ['Creature of Fenkenstrain']],
  ['Ghosts Ahoy', I, 2, MOR, { Agility: 25, Cooking: 20 }, ['Priest in Peril', 'The Restless Ghost']],
  ['Heart of Stone', I, 1, MIS, { Magic: 35, Runecrafting: 25 }, ['Carnillean Rising', 'Rune Memories'], { series: 'Sliske\'s Game' }],
  ['Holy Grail', I, 2, KAN, { Attack: 20 }, ['Merlin\'s Crystal'], { series: 'Camelot' }],
  ['Hunt for Red Raktuber', I, 1, KAN, { Construction: 45, Hunter: 45, Thieving: 38 }, ['Cold War', 'Sea Slug'], { series: 'Penguin' }],
  ['Icthlarin\'s Little Helper', I, 2, DES, {}, ['Gertrude\'s Cat', 'Diamond in the Rough'], { series: 'Desert' }],
  ['In Aid of the Myreque', I, 2, MOR, { Agility: 25, Crafting: 25, Magic: 7, Mining: 15 }, ['In Search of the Myreque'], { series: 'Myreque' }],
  ['In Search of the Myreque', I, 2, MOR, { Agility: 25 }, ['Nature Spirit'], { series: 'Myreque' }],
  ['Kennith\'s Concerns', I, 1, KAN, { Mining: 46 }, ['The Slug Menace'], { series: 'Temple Knight' }],
  ['Kili Row', I, 1, UM, { Necromancy: 20 }, ['Necromancy!'], { series: 'City of Um' }],
  ['Making History', I, 3, KAN, {}, ['Priest in Peril', 'The Restless Ghost'], { series: 'Enchanted Key' }],
  ['Meeting History', I, 1, KAN, { Herblore: 3 }, ['Making History'], { series: 'Enchanted Key' }],
  ['Merlin\'s Crystal', I, 6, KAN, {}, [], { series: 'Camelot' }],
  ['Missing My Mummy', I, 1, MIS, { Construction: 35, Cooking: 35, Crafting: 35, Magic: 35, Prayer: 35 }, ['Icthlarin\'s Little Helper', 'The Golem'], { series: 'Desert' }],
  ['Mountain Daughter', I, 2, FRE, { Agility: 20 }, [], { series: 'Fremennik' }],
  ['My Arm\'s Big Adventure', I, 1, FRE, { Farming: 29, Woodcutting: 10 }, ['Eadgar\'s Ruse', 'The Feud', 'Jungle Potion'], { series: 'Troll' }],
  ['Olaf\'s Quest', I, 1, FRE, { Firemaking: 40, Woodcutting: 50 }, ['The Fremennik Trials']],
  ['Quiet Before the Swarm', I, 1, ASG, { Attack: 35, Strength: 42 }, ['Imp Catcher', 'Wanted!'], { series: 'Void Knight' }],
  ['Rat Catchers', I, 2, MIS, {}, ['Icthlarin\'s Little Helper']],
  ['Salt in the Wound', I, 2, DAE, { Constitution: 50, Defence: 60, Dungeoneering: 35, Herblore: 47, Summoning: 45 }, ['Kennith\'s Concerns'], { series: 'Temple Knight' }],
  ['Scorpion Catcher', I, 1, ASG, { Prayer: 31 }, []],
  ['Sea Slug', I, 1, KAN, { Firemaking: 30 }, [], { series: 'Temple Knight' }],
  ['Secrets of Amberfell', I, 3, HAV, { Construction: 30, Herblore: 35, Hunter: 32, Slayer: 28 }, ['Hearts of Sanguine'], { series: 'Sanguine' }],
  ['Shades of Mort\'ton', I, 3, MOR, { Crafting: 20, Firemaking: 5, Herblore: 15 }, ['Priest in Peril']],
  ['Shadow of the Storm', I, 1, DES, { Crafting: 30 }, ['Demon Slayer', 'The Golem'], { series: 'Delrith' }],
  ['Smoking Kills', I, 1, DES, { Crafting: 25, Slayer: 35 }, ['Icthlarin\'s Little Helper', 'The Restless Ghost'], { series: 'Desert' }],
  ['Spirit of Summer', I, 1, WIL, { Construction: 40, Farming: 26, Prayer: 35, Summoning: 19 }, ['The Restless Ghost'], { series: 'Summer' }],
  ['Spirits of the Elid', I, 2, DES, { Magic: 33, Mining: 37, Ranged: 37, Thieving: 37 }, [], { series: 'Desert' }],
  ['Tai Bwo Wannai Trio', I, 2, KAR, { Agility: 15, Cooking: 30, Fishing: 5 }, ['Jungle Potion']],
  ['Tears of Guthix', I, 1, MIS, { Crafting: 20, Firemaking: 49, Mining: 20, 'Quest Points': 44 }, []],
  ['The Darkness of Hallowvale', I, 2, MOR, { Agility: 26, Construction: 5, Crafting: 32, Magic: 33, Mining: 20, Strength: 40, Thieving: 22 }, ['In Aid of the Myreque'], { series: 'Myreque' }],
  ['The Dig Site', I, 2, MIS, { Agility: 10, Herblore: 10, Thieving: 25 }, []],
  ['The Eyes of Glouphrie', I, 2, KAN, { Construction: 5, Magic: 46 }, ['The Grand Tree'], { series: 'Gnome' }],
  ['The Feud', I, 1, DES, { Thieving: 30 }, []],
  ['The Fremennik Trials', I, 3, FRE, { Crafting: 40, Fletching: 25, Woodcutting: 40 }, [], { series: 'Fremennik' }],
  ['The Giant Dwarf', I, 2, FRE, { Crafting: 12, Firemaking: 16, Magic: 33, Thieving: 14 }, [], { series: 'Dwarf (Red Axe)' }],
  ['The Golem', I, 1, DES, { Crafting: 20, Thieving: 25 }, []],
  ['The Hand in the Sand', I, 1, KAN, { Crafting: 49, Thieving: 17 }, []],
  ['The Lost Tribe', I, 1, MIS, { Agility: 13, Mining: 17, Thieving: 13 }, ['Goblin Diplomacy', 'Rune Mysteries'], { series: 'Cave Goblin' }],
  ['The Slug Menace', I, 1, KAN, { Crafting: 30, Runecrafting: 30, Slayer: 30, Thieving: 30 }, ['Wanted!', 'Sea Slug'], { series: 'Temple Knight' }],
  ['The Tourist Trap', I, 2, DES, { Fletching: 10, Smithing: 20 }, []],
  ['Tree Gnome Village', I, 2, KAN, {}, [], { series: 'Gnome' }],
  ['Tribal Totem', I, 1, KAN, { Thieving: 21 }, []],
  ['Unwelcome Guests', I, 1, MIS, { Construction: 50, Slayer: 10 }, ['Murder on the Border'], { series: 'Fort Forinthry' }],
  ['Vessel of the Harbinger', I, 1, UM, { Necromancy: 46, Prayer: 40 }, ['Rune Mythos', 'Ghosts Ahoy'], { series: 'The First Necromancer' }],
  ['Wanted!', I, 1, ASG, {}, ['Recruitment Drive', 'Enter the Abyss'], { series: 'Temple Knight' }],
  ['Watchtower', I, 4, KAN, { Agility: 25, Herblore: 14, Magic: 14, Mining: 40, Thieving: 15 }, []],
  ['Waterfall Quest', I, 1, KAN, {}, []],
  ['What Lies Below', I, 1, MIS, { Runecrafting: 35 }, ['Rune Mysteries']],
  ['You Are It', I, 1, KAN, {}, ['There\'s No Place Like Home...'], { series: 'The Elder God Wars' }],
  ['Zogre Flesh Eaters', I, 1, KAN, { Herblore: 8, Ranged: 30, Smithing: 4 }, ['Big Chompy Bird Hunting', 'Jungle Potion'], { series: 'Ogre' }],
  // "Special" in RS3 — a short fairy-tale anthology with no requirements.
  ['Once Upon a Time in Gielinor', I, 4, MIS, {}, [], { special: true }],

  // ───────────────────────────── Experienced ─────────────────────────────
  ['A Fairy Tale I - Growing Pains', E, 2, MIS, {}, ['Lost City', 'Nature Spirit'], { series: 'Fairy' }],
  ['A Fairy Tale II - Cure a Queen', E, 2, MIS, { Farming: 49, Herblore: 57, Thieving: 40 }, ['A Fairy Tale I - Growing Pains'], { series: 'Fairy' }],
  ['A Fairy Tale III - Battle at Ork\'s Rift', E, 2, ISL, { Farming: 54, Magic: 59 }, ['A Fairy Tale II - Cure a Queen'], { series: 'Fairy' }],
  ['A Void Dance', E, 1, ASG, { Construction: 47, Herblore: 49, Hunter: 46, Mining: 47, Summoning: 48, Thieving: 54, Woodcutting: 52 }, ['Quiet Before the Swarm'], { series: 'Void Knight' }],
  ['Aftermath', E, 0, ASG, {}, ['Twilight of the Gods'], { series: 'The Elder God Wars' }],
  ['Ancient Awakening', E, 1, MIS, { Necromancy: 50 }, ['Dead and Buried'], { series: 'Fort Forinthry' }],
  ['As a First Resort', E, 1, KAN, { Firemaking: 51, Hunter: 48, Woodcutting: 58 }, ['Zogre Flesh Eaters'], { series: 'Ogre' }],
  ['Azzanadra\'s Quest', E, 3, ASG, { Agility: 58, Archaeology: 70 }, ['The Vault of Shadows', 'Raksha, the Shadow Colossus', 'Desperate Creatures'], { series: 'The Elder God Wars' }],
  ['Battle of Forinthry', E, 1, MIS, { Necromancy: 60 }, ['Ancient Awakening'], { series: 'Fort Forinthry' }],
  ['Beneath Scabaras\' Sands', E, 2, DES, { Slayer: 87 }, ['\'Phite Club', 'Ode of the Devourer', 'Soul Searching'], { series: 'Desert' }],
  ['Between a Rock...', E, 2, FRE, { Defence: 30, Mining: 40, Smithing: 50 }, ['Dwarf Cannon', 'Fishing Contest']],
  ['Cabin Fever', E, 2, MOR, { Agility: 42, Crafting: 45, Ranged: 40, Smithing: 50 }, ['Pirate\'s Treasure', 'Rum Deal'], { series: 'Pirate' }],
  ['Dead and Buried', E, 1, MIS, {}, ['Unwelcome Guests'], { series: 'Fort Forinthry' }],
  ['Defender of Varrock', E, 2, MIS, { Agility: 51, Hunter: 59, Mining: 54, Smithing: 54 }, ['Shield of Arrav', 'The Knight\'s Sword', 'Family Crest', 'What Lies Below'], { series: 'Mahjarrat Mysteries' }],
  ['Devious Minds', E, 1, MIS, { Fletching: 50, Runecrafting: 50, Smithing: 65 }, ['Recruitment Drive', 'What\'s Mine is Yours'], { series: 'Mahjarrat Mysteries' }],
  ['Eadgar\'s Ruse', E, 1, ASG, { Herblore: 31 }, ['Druidic Ritual', 'Troll Stronghold'], { series: 'Troll' }],
  ['Eclipse of the Heart', E, 3, DES, { Agility: 65, Necromancy: 90 }, ['Pharaoh\'s Folly'], { series: 'Desert' }],
  ['Enakhra\'s Lament', E, 2, DES, { Crafting: 50, Firemaking: 45, Magic: 13, Mining: 45, Prayer: 43 }, [], { series: 'Mahjarrat Mysteries' }],
  ['Family Crest', E, 1, MIS, { Crafting: 40, Magic: 59, Mining: 40, Smithing: 40 }, []],
  ['Fight Arena', E, 2, KAN, {}, [], { series: 'Mahjarrat Mysteries' }],
  ['Haunted Mine', E, 2, MOR, { Agility: 15, Crafting: 35 }, ['Priest in Peril']],
  ['Heralds of Crimson', E, 3, HAV, { Crafting: 51, Herblore: 55, Mining: 65, Smithing: 60 }, ['Secrets of Amberfell'], { series: 'Sanguine' }],
  ['Hero\'s Welcome', E, 2, FRE, { Divination: 60, Mining: 67, Slayer: 62, Smithing: 67 }, ['Lunar Diplomacy'], { series: 'Sliske\'s Game' }],
  ['Heroes\' Quest', E, 1, ASG, { 'Quest Points': 55, Cooking: 53, Fishing: 53, Herblore: 25, Mining: 50 }, ['Shield of Arrav', 'Lost City', 'Merlin\'s Crystal', 'Dragon Slayer', 'Druidic Ritual']],
  ['Horror from the Deep', E, 2, FRE, { Agility: 35 }, ['Bar Crawl'], { series: 'Fremennik' }],
  ['Housing of Parliament', E, 1, UM, { Necromancy: 54 }, ['Necromancy!'], { series: 'City of Um' }],
  ['In Pyre Need', E, 1, KAN, { Crafting: 52, Firemaking: 55, Fletching: 53 }, []],
  ['Kindred Spirits', E, 1, ASG, { Agility: 60, Crafting: 60, Herblore: 60, Smithing: 60 }, ['Missing, Presumed Death'], { series: 'Sliske\'s Game' }],
  ['King\'s Ransom', E, 1, KAN, { Defence: 65, Magic: 45 }, ['Holy Grail', 'Murder Mystery', 'One Small Favour'], { series: 'Camelot' }],
  ['Land of the Goblins', E, 1, ISL, { Agility: 36, Fishing: 36, Herblore: 37, Thieving: 36 }, ['Another Slice of H.A.M.', 'Fishing Contest'], { series: 'Cave Goblin' }],
  ['Legacy of Seergaze', E, 2, MOR, { Agility: 29, Construction: 20, Crafting: 47, Firemaking: 40, Magic: 49, Mining: 35, Slayer: 31 }, ['The Darkness of Hallowvale'], { series: 'Myreque' }],
  ['Lost City', E, 3, MIS, { Crafting: 31, Woodcutting: 36 }, [], { series: 'Fairy' }],
  ['Lunar Diplomacy', E, 2, FRE, { Crafting: 61, Defence: 40, Firemaking: 49, Herblore: 5, Magic: 65, Mining: 60, Woodcutting: 55 }, ['The Fremennik Trials', 'Lost City', 'Rune Mysteries', 'Shilo Village'], { series: 'Fremennik' }],
  ['One Small Favour', E, 2, KAR, { Agility: 36, Crafting: 25, Herblore: 18, Smithing: 30 }, ['Rune Mysteries', 'Shilo Village']],
  ['Osseous Rex', E, 1, ANA, { Archaeology: 30, Necromancy: 70 }, []],
  ['Pharaoh\'s Folly', E, 2, DES, {}, ['Beneath Scabaras\' Sands'], { series: 'Desert' }],
  ['Royal Trouble', E, 1, FRE, { Agility: 40, Slayer: 40 }, ['Throne of Miscellania'], { series: 'Fremennik' }],
  ['Rum Deal', E, 2, MOR, { Crafting: 42, Farming: 40, Fishing: 50, Prayer: 47, Slayer: 42 }, ['Zogre Flesh Eaters', 'Priest in Peril'], { series: 'Pirate' }],
  ['Shilo Village', E, 2, KAR, { Agility: 32, Crafting: 20 }, ['Jungle Potion']],
  ['Some Like It Cold', E, 1, KAN, { Construction: 50, Crafting: 56, Fishing: 65, Thieving: 50 }, ['Hunt for Red Raktuber'], { series: 'Penguin' }],
  ['Soul Searching', E, 1, UM, {}, ['Necromancy!'], { series: 'City of Um' }],
  ['Stellar Born', E, 2, KAN, { Divination: 70, Mining: 70 }, ['Observatory Quest']],
  ['Succession', E, 1, ASG, { Mining: 60, Smithing: 60 }, ['Daughter of Chaos', 'Civil War III'], { series: 'Legacy of Zamorak' }],
  ['Summer\'s End', E, 1, WIL, { Firemaking: 47, Hunter: 35, Mining: 45, Prayer: 55, Summoning: 23, Woodcutting: 37 }, ['Spirit of Summer'], { series: 'Summer' }],
  ['Temple of Ikov', E, 1, KAN, { Ranged: 40, Thieving: 42 }, [], { series: 'Mahjarrat Mysteries' }],
  ['The Chosen Commander', E, 3, ISL, { Agility: 46, Strength: 46, Thieving: 46 }, ['Land of the Goblins'], { series: 'Cave Goblin' }],
  ['The Fremennik Isles', E, 1, FRE, { Agility: 40, Construction: 20, Crafting: 46, Woodcutting: 56 }, ['The Fremennik Trials'], { series: 'Fremennik' }],
  ['The Grand Tree', E, 5, KAN, { Agility: 25 }, [], { series: 'Gnome' }],
  ['The Great Brain Robbery', E, 2, MOR, { Construction: 30, Crafting: 16, Prayer: 50 }, ['Creature of Fenkenstrain', 'Cabin Fever', 'Recipe for Disaster: Freeing Pirate Pete'], { series: 'Pirate' }],
  ['The Path of Glouphrie', E, 2, KAN, { Agility: 45, Ranged: 47, Slayer: 56, Strength: 60, Thieving: 56 }, ['The Eyes of Glouphrie', 'Waterfall Quest', 'Tree Gnome Village'], { series: 'Gnome' }],
  ['The Spirit of War', E, 1, UM, { Necromancy: 65 }, ['Vessel of the Harbinger'], { series: 'The First Necromancer' }],
  ['The Vault of Shadows', E, 0, DES, { Archaeology: 58, Divination: 60 }, [], { series: 'The Elder God Wars' }],
  ['Throne of Miscellania', E, 1, FRE, {}, ['The Fremennik Trials', 'Heroes\' Quest'], { series: 'Fremennik' }],
  ['TokTz-Ket-Dill', E, 1, KAR, { Construction: 50, Crafting: 43, Mining: 45, Strength: 40 }, [], { series: 'TzHaar' }],
  ['Troll Romance', E, 2, FRE, { Agility: 28 }, ['Troll Stronghold'], { series: 'Troll' }],
  ['Troll Stronghold', E, 1, ASG, { Agility: 15 }, ['Death Plateau'], { series: 'Troll' }],
  ['Underground Pass', E, 2, KAN, { Ranged: 25 }, ['Biohazard'], { series: 'Elf (Prifddinas)' }],
  // "Special" in RS3 (four Necromancy sub-stories, 32–65 Necromancy).
  ['That Old Black Magic', E, 1, UM, { Necromancy: 32 }, ['Necromancy!'], { special: true }],

  // ─────────────────────────────── Master ────────────────────────────────
  ['\'Phite Club', M, 1, DES, {}, ['Our Man in the North'], { series: 'Desert' }],
  ['A Clockwork Syringe', M, 1, ASG, { Construction: 62, Defence: 76, Dungeoneering: 50, Slayer: 61, Smithing: 74, Summoning: 65, Thieving: 74 }, ['Rocking Out', 'There\'s No Place Like Home...'], { series: 'Pirate' }],
  ['Back to my Roots', M, 1, KAN, { Agility: 55, Farming: 53, Slayer: 59, Woodcutting: 72 }, ['The Hand in the Sand', 'Tribal Totem']],
  ['Back to the Freezer', M, 1, KAN, { Divination: 50, Runecrafting: 45, Slayer: 37 }, ['Some Like It Cold', 'Ernest the Chicken'], { series: 'Penguin' }],
  ['Blood Runs Deep', M, 2, FRE, { Attack: 75, Slayer: 65, Strength: 75 }, ['Glorious Memories', 'Dream Mentor', 'Horror from the Deep'], { series: 'Fremennik' }],
  ['Catapult Construction', M, 2, TIR, { Construction: 44, Fletching: 42 }, ['Regicide']],
  ['City of Senntisten', M, 3, DES, { Archaeology: 74, Magic: 74, Slayer: 75 }, ['Battle of the Monolith'], { series: 'The Elder God Wars' }],
  ['Contact!', M, 1, DES, {}, ['Icthlarin\'s Little Helper'], { series: 'Desert' }],
  ['Crocodile Tears', M, 1, DES, { Agility: 30, Fishing: 72, Hunter: 73, Woodcutting: 47 }, ['Missing My Mummy', 'Dealing with Scabaras', 'Spirits of the Elid', 'The Jack of Spades'], { series: 'Desert' }],
  ['Curse of the Black Stone', M, 4, DAE, { Agility: 12, Woodcutting: 34 }, ['Impressing the Locals']],
  ['Deadliest Catch', M, 1, KAN, { Fishing: 70, Herblore: 3, Hunter: 67, Thieving: 70 }, ['Tower of Life']],
  ['Dealing with Scabaras', M, 1, DES, { Agility: 50, Firemaking: 21, Strength: 60, Thieving: 60 }, ['Contact!'], { series: 'Desert' }],
  ['Desert Treasure', M, 3, DES, { Firemaking: 50, Magic: 50, Slayer: 10, Thieving: 53 }, ['The Dig Site', 'Troll Stronghold'], { series: 'Mahjarrat Mysteries' }],
  ['Do No Evil', M, 1, DES, { Construction: 64, Crafting: 68, Magic: 70, Ranged: 50, Thieving: 70 }, ['Animal Magnetism', 'Desert Treasure', 'Smoking Kills', 'Missing My Mummy', 'Dealing with Scabaras', 'Recipe for Disaster: Freeing King Awowogei'], { series: 'Desert' }],
  ['Dream Mentor', M, 2, FRE, {}, ['Lunar Diplomacy'], { series: 'Fremennik' }],
  ['Forgiveness of a Chaos Dwarf', M, 2, FRE, { Firemaking: 61, Hunter: 61, Strength: 69 }, ['Forgettable Tale of a Drunken Dwarf', 'Between a Rock...'], { series: 'Dwarf (Red Axe)' }],
  ['Glorious Memories', M, 1, FRE, { Agility: 50, Herblore: 43, Hunter: 41, Magic: 57 }, ['Mountain Daughter', 'The Fremennik Isles', 'Royal Trouble'], { series: 'Fremennik' }],
  ['Grim Tales', M, 1, ASG, { Agility: 59, Farming: 45, Herblore: 52, Thieving: 58, Woodcutting: 71 }, ['Witch\'s House']],
  ['King of the Dwarves', M, 2, FRE, { Mining: 68, Smithing: 70, Strength: 77 }, ['Forgiveness of a Chaos Dwarf', 'My Arm\'s Big Adventure'], { series: 'Dwarf (Red Axe)' }],
  ['Legends\' Quest', M, 4, KAN, { 'Quest Points': 107, Agility: 50, Crafting: 45, Herblore: 56, Magic: 52, Mining: 42, Prayer: 50, Smithing: 50, Strength: 50, Thieving: 50, Woodcutting: 10 }, ['Heroes\' Quest', 'Jungle Potion']],
  ['Love Story', M, 2, MIS, { Construction: 68, Crafting: 67, Magic: 77, Smithing: 68 }, ['Swan Song'], { series: 'Wise Old Man' }],
  ['Monkey Madness', M, 3, KAN, {}, ['The Grand Tree', 'Tree Gnome Village'], { series: 'Gnome' }],
  ['Mourning\'s End Part I', M, 2, TIR, { Ranged: 60, Thieving: 50 }, ['Roving Elves', 'Big Chompy Bird Hunting', 'Sheep Herder'], { series: 'Elf (Prifddinas)' }],
  ['Mourning\'s End Part II', M, 2, TIR, {}, ['Mourning\'s End Part I'], { series: 'Elf (Prifddinas)' }],
  ['Nomad\'s Elegy', M, 1, MIS, { Construction: 75, Mining: 75, Woodcutting: 75 }, ['Nomad\'s Requiem', 'Dishonour among Thieves', 'Heart of Stone', 'The Mighty Fall', 'Throne of Miscellania', 'The Void Stares Back'], { series: 'Sliske\'s Game' }],
  ['Ode of the Devourer', M, 1, MIS, {}, ['Requiem for a Dragon'], { series: 'Fort Forinthry' }],
  ['Our Man in the North', M, 1, DES, {}, ['Do No Evil', 'Crocodile Tears', 'The Feud', 'Spirits of the Elid'], { series: 'Desert' }],
  ['Regicide', M, 3, KAN, { Agility: 56 }, ['Underground Pass'], { series: 'Elf (Prifddinas)' }],
  ['Remains of the Necrolord', M, 1, UM, { Dungeoneering: 77, Necromancy: 85 }, ['Tomes of the Warlock'], { series: 'The First Necromancer' }],
  ['Requiem for a Dragon', M, 1, MIS, {}, ['Battle of Forinthry', 'Tomes of the Warlock', 'Kili Row'], { series: 'Fort Forinthry' }],
  ['Rocking Out', M, 2, MOR, { Agility: 60, Crafting: 66, Smithing: 69, Thieving: 63 }, ['The Great Brain Robbery'], { series: 'Pirate' }],
  ['Roving Elves', M, 1, TIR, {}, ['Regicide', 'Waterfall Quest'], { series: 'Elf (Prifddinas)' }],
  ['Swan Song', M, 2, KAN, { 'Quest Points': 100, Cooking: 62, Crafting: 40, Firemaking: 42, Fishing: 62, Magic: 66, Smithing: 45 }, ['One Small Favour', 'Garden of Tranquillity'], { series: 'Wise Old Man' }],
  ['The Branches of Darkmeyer', M, 2, MOR, { Agility: 63, Crafting: 64, Farming: 63, Fletching: 70, Magic: 70, Slayer: 67, Woodcutting: 76 }, ['Legacy of Seergaze'], { series: 'Myreque' }],
  ['The Curse of Arrav', M, 1, DES, { Agility: 61, Mining: 64, Ranged: 64, Slayer: 37, Strength: 64, Summoning: 41, Thieving: 66 }, ['Defender of Varrock', 'Missing My Mummy', 'The Tale of the Muspah', 'Troll Stronghold', 'Garden of Tranquillity'], { series: 'Mahjarrat Mysteries' }],
  ['The Elder Kiln', M, 2, KAR, { Agility: 60, Magic: 75, Mining: 40 }, [], { series: 'TzHaar' }],
  ['The Firemaker\'s Curse', M, 2, KAN, { Agility: 64, Constitution: 76, Firemaking: 74 }, []],
  ['The Lord of Vampyrium', M, 2, MOR, { Attack: 75, Constitution: 79, Construction: 75, Defence: 76, Hunter: 78, Slayer: 75, Strength: 75 }, ['The Branches of Darkmeyer'], { series: 'Myreque' }],
  ['The Mighty Fall', M, 2, ISL, { Attack: 79, Constitution: 78, Defence: 72, Slayer: 69, Strength: 79 }, ['The Chosen Commander', 'Missing, Presumed Death'], { series: 'Cave Goblin' }],
  ['The Prisoner of Glouphrie', M, 1, KAN, { Agility: 64, Construction: 62, Runecrafting: 61, Thieving: 64 }, ['The Path of Glouphrie', 'Roving Elves'], { series: 'Gnome' }],
  ['The Temple at Senntisten', M, 2, DES, { Prayer: 50 }, ['Devious Minds', 'Desert Treasure', 'The Curse of Arrav'], { series: 'Mahjarrat Mysteries' }],
  ['Tomes of the Warlock', M, 1, UM, { Archaeology: 86, Magic: 66, Necromancy: 75 }, ['The Spirit of War', 'The Jack of Spades'], { series: 'The First Necromancer' }],
  ['Twilight of the Gods', M, 3, MIS, { Divination: 80, Thieving: 60 }, ['Extinction'], { series: 'The Elder God Wars' }],
  ['Within the Light', M, 2, TIR, { Agility: 69, Fletching: 70, Ranged: 75, Woodcutting: 75 }, ['Mourning\'s End Part II'], { series: 'Elf (Prifddinas)' }],
  // "Special" in RS3 — five subquests (Coin of the Realm + four replays).
  ['Dimension of Disaster', M, 10, MIS, {}, ['Shield of Arrav', 'Shadow of the Storm', 'Defender of Varrock', 'The Curse of Arrav'], { special: true }],

  // ───────────────────────────── Grandmaster ─────────────────────────────
  ['Alpha vs Omega', G, 1, UM, { Necromancy: 95 }, ['Remains of the Necrolord'], { series: 'The First Necromancer' }],
  ['Birthright of the Dwarves', G, 2, FRE, { Mining: 80, Smithing: 82, Strength: 85 }, ['King of the Dwarves'], { series: 'Dwarf (Red Axe)' }],
  ['Children of Mah', G, 2, FRE, {}, ['The Light Within', 'Dishonour among Thieves'], { series: 'Sliske\'s Game' }],
  ['Extinction', G, 4, MIS, {}, ['Sins of the Father', 'Eye of Het II'], { series: 'The Elder God Wars' }],
  ['Fate of the Gods', G, 2, TIR, { Agility: 73, Divination: 75, Magic: 79, Slayer: 76, Summoning: 67 }, ['Missing, Presumed Death'], { series: 'Sliske\'s Game' }],
  ['Nomad\'s Requiem', G, 3, MIS, { Construction: 60, Hunter: 65, Magic: 75, Mining: 66, Prayer: 70 }, ['King\'s Ransom', 'One Small Favour']],
  ['One of a Kind', G, 1, MIS, { Divination: 40, Dungeoneering: 67, Magic: 81, Summoning: 74 }, ['A Tail of Two Cats', 'Holy Grail', 'The World Wakes', 'Missing, Presumed Death'], { series: 'Sliske\'s Game' }],
  ['Pieces of Hate', G, 2, ASG, { Agility: 83, Construction: 81, Firemaking: 82, Thieving: 85 }, ['A Clockwork Syringe'], { series: 'Pirate' }],
  ['Plague\'s End', G, 2, TIR, { Agility: 75, Construction: 75, Crafting: 75, Dungeoneering: 75, Herblore: 75, Mining: 75, Prayer: 75, Ranged: 75, Summoning: 75, Woodcutting: 75 }, ['Within the Light', 'Catapult Construction', 'Making History'], { series: 'Elf (Prifddinas)' }],
  ['Ritual of the Mahjarrat', G, 5, ASG, { Agility: 77, Crafting: 76, Mining: 76 }, ['The Temple at Senntisten', 'While Guthix Sleeps', 'Enakhra\'s Lament', 'The Slug Menace', 'A Fairy Tale II - Cure a Queen', 'Cabin Fever', 'A Tail of Two Cats', 'Fight Arena', 'Hazeel Cult'], { series: 'Mahjarrat Mysteries' }],
  ['River of Blood', G, 3, MIS, { Attack: 78, Constitution: 80, Firemaking: 76, Fletching: 75, Herblore: 80, Magic: 78, Mining: 72, Ranged: 78 }, ['The Lord of Vampyrium', 'Defender of Varrock', 'All Fired Up'], { series: 'Myreque' }],
  // Sins of the Father also needs 85 in ONE of Crafting/Runecrafting/Smithing/
  // Invention — an either/or the skills map can't express, so it's left out.
  ['Sins of the Father', G, 0, ANA, {}, ['Desperate Creatures'], { series: 'The Elder God Wars' }],
  ['Sliske\'s Endgame', G, 3, MIS, {}, ['Children of Mah', 'Nomad\'s Elegy', 'Kindred Spirits', 'Hero\'s Welcome', 'One of a Kind', 'The Death of Chivalry'], { series: 'Sliske\'s Game' }],
  ['The Brink of Extinction', G, 3, KAR, { Mining: 72, Smithing: 80 }, ['The Elder Kiln'], { series: 'TzHaar' }],
  ['The Light Within', G, 2, TIR, { Agility: 80, Crafting: 80, Divination: 80, Herblore: 80, Prayer: 80, Slayer: 80, Woodcutting: 80 }, ['Plague\'s End', 'The World Wakes', 'Fate of the Gods', 'The Temple at Senntisten', 'Meeting History'], { series: 'Elf (Prifddinas)' }],
  ['The Void Stares Back', G, 1, ASG, { Attack: 78, Construction: 70, Crafting: 25, Defence: 71, Firemaking: 80, Magic: 70, Smithing: 78, Strength: 55, Summoning: 80 }, ['A Void Dance'], { series: 'Void Knight' }],
  ['The World Wakes', G, 3, KAN, {}, []],
  ['While Guthix Sleeps', G, 5, KAN, { Agility: 25, Defence: 40, Farming: 65, Herblore: 65, Hunter: 55, Magic: 75, Summoning: 23, Thieving: 60 }, ['Defender of Varrock', 'Dream Mentor', 'Legends\' Quest', 'The Path of Glouphrie', 'Tears of Guthix', 'Wanted!', 'Temple of Ikov', 'The Hunt for Surok'], { series: 'Mahjarrat Mysteries' }],

  // ───────────────────────── Recipe for Disaster ─────────────────────────
  // Nine 1-QP subquests + the final "Defeating the Culinaromancer" (the parent
  // quest entry). The parent is RS3 "Special"; mapped to Grandmaster.
  ['Recipe for Disaster: Another Cook\'s Quest', N, 1, MIS, { Cooking: 10 }, ['Cook\'s Assistant'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing the Goblin Generals', N, 1, [...MIS, ...ASG], {}, ['Recipe for Disaster: Another Cook\'s Quest', 'Goblin Diplomacy'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing the Mountain Dwarf', N, 1, [...MIS, ...ASG], {}, ['Recipe for Disaster: Another Cook\'s Quest', 'Fishing Contest'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing Evil Dave', I, 1, MIS, { Cooking: 25 }, ['Recipe for Disaster: Another Cook\'s Quest', 'Gertrude\'s Cat', 'Shadow of the Storm'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing the Lumbridge Sage', I, 1, MIS, { Cooking: 40 }, ['Recipe for Disaster: Another Cook\'s Quest'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing Pirate Pete', I, 1, [...MIS, ...ASG], { Cooking: 31 }, ['Recipe for Disaster: Another Cook\'s Quest'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing Skrach Uglogwee', I, 1, [...MIS, ...KAN], { Cooking: 41, Firemaking: 20 }, ['Recipe for Disaster: Another Cook\'s Quest', 'Big Chompy Bird Hunting'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing Sir Amik Varze', E, 1, [...MIS, ...ASG, ...KAR], {}, ['Recipe for Disaster: Another Cook\'s Quest', 'Lost City', 'Legends\' Quest'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster: Freeing King Awowogei', M, 1, [...MIS, ...ISL], { Agility: 48, Cooking: 70 }, ['Recipe for Disaster: Another Cook\'s Quest', 'Monkey Madness'], { series: 'Recipe for Disaster' }],
  ['Recipe for Disaster', G, 1, MIS, { 'Quest Points': 176 }, [
    'Recipe for Disaster: Freeing the Goblin Generals', 'Recipe for Disaster: Freeing the Mountain Dwarf',
    'Recipe for Disaster: Freeing Evil Dave', 'Recipe for Disaster: Freeing the Lumbridge Sage',
    'Recipe for Disaster: Freeing Pirate Pete', 'Recipe for Disaster: Freeing Skrach Uglogwee',
    'Recipe for Disaster: Freeing Sir Amik Varze', 'Recipe for Disaster: Freeing King Awowogei',
    'Desert Treasure', 'Horror from the Deep',
  ], { series: 'Recipe for Disaster', special: true }],

  // ────────────────────────────── Miniquests ─────────────────────────────
  // RS3 miniquests that gate quests above, plus a few notable ones.
  ['Bar Crawl', N, 0, KAN, {}, [], { miniquest: true }],
  ['Civil War I', I, 0, ASG, {}, ['Daughter of Chaos'], { miniquest: true, series: 'Legacy of Zamorak' }],
  ['Civil War II', I, 0, ASG, {}, ['Civil War I'], { miniquest: true, series: 'Legacy of Zamorak' }],
  ['Civil War III', I, 0, ASG, {}, ['Civil War II'], { miniquest: true, series: 'Legacy of Zamorak' }],
  ['Curse of the Empty Lord', E, 0, WIL, {}, ['Desert Treasure', 'The Restless Ghost'], { miniquest: true, series: 'Mahjarrat Mysteries' }],
  ['Enter the Abyss', N, 0, [...MIS, ...WIL], {}, ['Rune Mysteries'], { miniquest: true }],
  ['Koschei\'s Troubles', M, 0, FRE, {}, ['Children of Mah'], { miniquest: true }],
  ['Lair of Tarn Razorlor', E, 0, MOR, { Slayer: 40 }, ['Haunted Mine'], { miniquest: true }],
  ['Purple Cat', N, 0, MIS, {}, [], { miniquest: true }],
  ['Sheep Shearer', N, 0, MIS, {}, [], { miniquest: true, f2p: true }],
  ['Tales of the God Wars', I, 0, FRE, {}, ['Troll Stronghold'], { miniquest: true }],
  ['The General\'s Shadow', I, 0, KAN, {}, ['Curse of the Empty Lord', 'Fight Arena'], { miniquest: true }],
  ['The Hunt for Surok', E, 0, MIS, {}, ['What Lies Below'], { miniquest: true, series: 'Mahjarrat Mysteries' }],
  ['Witch\'s Potion', N, 0, ASG, {}, [], { miniquest: true, f2p: true }],
];

function build(defs: Def[]): Record<string, QuestData> {
  const out: Record<string, QuestData> = {};
  for (const [name, difficulty, points, regions, skills, prereqs, opts = {}] of defs) {
    const q: QuestData = {
      id: name, name, regions: [...new Set(regions)], skills, prereqs, points, difficulty,
      members: !opts.f2p,
    };
    if (opts.series) q.series = opts.series;
    if (opts.miniquest) q.miniquest = true;
    if (opts.special) q.special = true;
    out[name] = q;
  }
  return out;
}

export const QUEST_DATA: Record<string, QuestData> = build(DEFS);

/** Is this entry an RS3 miniquest (as opposed to a full quest)? */
export const isMiniquest = (q: Pick<QuestData, 'miniquest'>): boolean => !!q.miniquest;

/**
 * RS3 wiki page titles that differ from the quest's display name.
 * Miniquest pages carry a " (miniquest)" suffix on the RS3 wiki.
 */
const QUEST_WIKI_TITLES: Record<string, string> = {
  'Raksha, the Shadow Colossus': 'Raksha, the Shadow Colossus (quest)',
};

/** RuneScape Wiki URL for a quest or miniquest by name. */
export const questWikiUrl = (name: string): string => {
  const q = QUEST_DATA[name];
  const title = QUEST_WIKI_TITLES[name] ?? (q?.miniquest ? `${name} (miniquest)` : name);
  return `https://runescape.wiki/w/${encodeURIComponent(title.replace(/ /g, '_'))}`;
};
