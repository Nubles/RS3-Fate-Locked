import { TableType } from '../types';

export interface ContentRequirement {
  id: string;
  category: TableType;
  regions: string[];
  skills: Record<string, number>;
  quests?: string[];     // Specific quest prerequisites — must match QUEST_DATA entries.
  diaries?: string[];    // Specific Achievement Diary tier IDs — must match DIARY_DATA entries.
  description?: string;
  items?: string[];      // Optional specific item requirements
}

type GoalOpts = Partial<Pick<ContentRequirement, 'quests' | 'diaries' | 'description' | 'items'>>;

/** Compact constructor: the record key doubles as the goal id. */
const goal = (
  id: string,
  category: TableType,
  regions: string[],
  skills: Record<string, number>,
  opts: GoalOpts = {},
): [string, ContentRequirement] => [id, { id, category, regions, skills, ...opts }];

/**
 * STRATEGY_DATABASE — the RS3 strategic goals a player can pin in the Goal
 * Tracker / Strategy Guide. Each goal lists the hard gates to reach it:
 * regions (continents, sub-areas or Misthalin areas from data/items), skill
 * levels (SKILLS_LIST names, capped at 99 to match the unlock tiers), RS3
 * quests (official titles = QUEST_DATA ids) and RS3 Achievement Diary tiers
 * (DIARY_DATA ids, e.g. 'Ardougne Elite').
 *
 * Requirements are the hard gates from the RuneScape Wiki; where a goal's real
 * gate is "any one of" several skills, or a level above 99, the description
 * says so rather than inventing a single number.
 */
export const STRATEGY_DATABASE: Record<string, ContentRequirement> = Object.fromEntries([
  // ============================================================================
  // KEY QUESTS & QUEST-LOCKED REGIONS
  // ============================================================================
  goal('Recipe for Disaster', TableType.QUESTS, ['Misthalin', 'Kandarin', 'Karamja', 'Islands & Others'], {
    'Cooking': 70, 'Agility': 48, 'Mining': 50, 'Fishing': 53, 'Thieving': 53, 'Herblore': 25,
    'Magic': 59, 'Smithing': 40, 'Firemaking': 50, 'Ranged': 40, 'Crafting': 40, 'Fletching': 10,
    'Slayer': 10, 'Woodcutting': 36,
  }, {
    quests: ['Desert Treasure', 'Horror from the Deep', 'Monkey Madness', "Legends' Quest", 'Big Chompy Bird Hunting', 'Nature Spirit'],
    description: "Culinaromancer's gloves 10 — the best early-game gloves — and the Culinaromancer's chest.",
  }),
  goal('Dragon Slayer', TableType.QUESTS, ['Misthalin', 'Asgarnia', 'Karamja'], {}, {
    description: "33 Quest Points. Lets you wear rune platebodies and green dragonhide bodies; Elvarg's head.",
  }),
  goal('Desert Treasure', TableType.QUESTS, ['Kharidian Desert', 'Asgarnia', 'Kandarin', 'Misthalin', 'Wilderness'], {
    'Thieving': 53, 'Firemaking': 50, 'Magic': 50, 'Slayer': 10,
  }, {
    quests: ['The Dig Site', 'Temple of Ikov', 'The Tourist Trap', 'Troll Stronghold', 'Priest in Peril', 'Waterfall Quest'],
    description: 'Unlocks the Ancient Magicks spellbook (Ice Barrage, Blood Barrage).',
  }),
  goal('Lunar Diplomacy', TableType.QUESTS, ['Fremennik'], {
    'Crafting': 61, 'Defence': 40, 'Firemaking': 49, 'Herblore': 5, 'Magic': 65, 'Mining': 60, 'Woodcutting': 55,
  }, {
    quests: ['The Fremennik Trials', 'Lost City', 'Rune Mysteries', 'Shilo Village'],
    description: 'Unlocks the Lunar spellbook and Lunar Isle.',
  }),
  goal("King's Ransom", TableType.QUESTS, ['Kandarin', 'Asgarnia'], { 'Magic': 45, 'Defence': 65 }, {
    quests: ['Holy Grail', 'Murder Mystery', 'One Small Favour'],
    description: 'Opens the Knight Waves training ground — Chivalry, Piety, Rigour and Augury.',
  }),
  goal('Prifddinas', TableType.REGIONS, ['Tirannwn', 'Prifddinas'], {
    'Agility': 75, 'Construction': 75, 'Dungeoneering': 75, 'Herblore': 75, 'Mining': 75,
    'Ranged': 75, 'Summoning': 75, 'Woodcutting': 75,
  }, {
    quests: ["Plague's End"],
    description: "The Elven city: Max Guild, Hefin course, crystal trees, Seren stones, Morvran and the Prifddinas lodestone.",
  }),
  goal('Menaphos', TableType.REGIONS, ['Kharidian Desert', 'Menaphos'], {}, {
    description: 'Start The Jack of Spades to open the city of Menaphos, its lodestone and reputation districts.',
  }),
  goal('Anachronia', TableType.REGIONS, ['Anachronia'], {}, {
    description: 'Base camp, Laniakea (Slayer), Rex Matriarchs, Raksha, the Anachronia Agility Course and dinosaur farming.',
  }),
  goal('Lunar Isle', TableType.REGIONS, ['Lunar Isle'], {}, {
    quests: ['Lunar Diplomacy'],
    description: 'Lunar spellbook altar, Livid Farm and the Lunar Isle lodestone.',
  }),
  goal('Ape Atoll', TableType.REGIONS, ['Ape Atoll'], {}, {
    quests: ['Monkey Madness'],
    description: 'Dragon scimitar, the Ape Atoll Agility Course and greegree transformations.',
  }),
  goal('Zanaris', TableType.REGIONS, ['Zanaris'], { 'Woodcutting': 36, 'Crafting': 31 }, {
    quests: ['Lost City'],
    description: 'Fairy city: Chaeldar, the cosmic altar, Puro-Puro and dragon dagger/longsword shops.',
  }),
  goal('Keldagrim', TableType.REGIONS, ['Keldagrim'], {}, {
    quests: ['The Giant Dwarf'],
    description: 'Dwarven capital: Blast Furnace, mine carts and the Grand Exchange of dwarves.',
  }),
  goal("Mos Le'Harmless", TableType.REGIONS, ["Mos Le'Harmless"], {}, {
    quests: ['Cabin Fever'],
    description: 'Trouble Brewing and the Cave Horrors (Black mask).',
  }),
  goal('Dorgesh-Kaan', TableType.REGIONS, ['Dorgesh-Kaan'], {}, {
    quests: ['Death to the Dorgeshuun'],
    description: 'Cave goblin city: Dorgesh-Kaan Agility Course and thieving.',
  }),
  goal('Tirannwn', TableType.REGIONS, ['Tirannwn'], {}, {
    quests: ['Regicide'],
    description: 'The Tirannwn lodestone opens when you start Regicide; Lletya and Isafdar beyond.',
  }),

  // ============================================================================
  // PRAYERS, CURSES & SPELLBOOKS
  // ============================================================================
  goal('Ancient Curses', TableType.ARCANA, ['Digsite', 'Kharidian Desert'], { 'Prayer': 50 }, {
    quests: ['The Temple at Senntisten'],
    description: 'Unlocks the Ancient Curses prayer book (Sap/Leech curses, Soul Split, Turmoil).',
  }),
  goal('Soul Split', TableType.ARCANA, ['Digsite'], { 'Prayer': 92 }, {
    quests: ['The Temple at Senntisten'],
    description: 'Heal from the damage you deal — the core sustain curse.',
  }),
  goal('Turmoil', TableType.ARCANA, ['Digsite'], { 'Prayer': 95 }, {
    quests: ['The Temple at Senntisten'],
    description: 'Best Ancient Curse for melee until the Praesul codex curses.',
  }),
  goal('Praesul Codex', TableType.ARCANA, ['God Wars Dungeon'], { 'Prayer': 99 }, {
    quests: ['The Temple at Senntisten'],
    description: 'Malevolence, Desolation and Affliction curses — dropped by Nex: Angel of Death.',
  }),
  goal('Ruination', TableType.ARCANA, ['City of Um'], { 'Necromancy': 95 }, {
    quests: ['Necromancy!'],
    description: 'Necromancy damage curse, learned from Selene in the City of Um.',
  }),
  goal('Piety', TableType.ARCANA, ['Camelot'], { 'Prayer': 70, 'Defence': 70 }, {
    quests: ["King's Ransom"],
    description: 'Best standard melee prayer — Knight Waves training ground.',
  }),
  goal('Rigour', TableType.ARCANA, ['Camelot'], { 'Prayer': 70, 'Defence': 70 }, {
    quests: ["King's Ransom"],
    description: 'Ranged counterpart of Piety — Knight Waves training ground.',
  }),
  goal('Augury', TableType.ARCANA, ['Camelot'], { 'Prayer': 70, 'Defence': 70 }, {
    quests: ["King's Ransom"],
    description: 'Magic counterpart of Piety — Knight Waves training ground.',
  }),
  goal('Ancient Magicks', TableType.ARCANA, ['Kharidian Desert'], { 'Magic': 50 }, {
    quests: ['Desert Treasure'],
    description: 'Ice Barrage and Blood Barrage — AoE combat and bonus-XP Slayer staples.',
  }),
  goal('Lunar Spellbook', TableType.ARCANA, ['Lunar Isle'], { 'Magic': 65 }, {
    quests: ['Lunar Diplomacy'],
    description: 'Vengeance, Disruption Shield, Superglass Make, Plank Make and Spellbook Swap.',
  }),
  goal('Disruption Shield', TableType.ARCANA, ['Lunar Isle'], { 'Magic': 90 }, {
    quests: ['Lunar Diplomacy'],
    description: 'Absorbs the next hit — key PvM defensive spell.',
  }),
  goal('Superglass Make', TableType.ARCANA, ['Lunar Isle'], { 'Magic': 77 }, {
    quests: ['Lunar Diplomacy'],
    description: 'Fast molten glass for Crafting.',
  }),
  goal('Plank Make', TableType.ARCANA, ['Lunar Isle'], { 'Magic': 86 }, {
    quests: ['Lunar Diplomacy'],
    description: 'Turn logs into planks anywhere (Magic + Construction).',
  }),
  goal('Bones to Peaches', TableType.ARCANA, ['Mage Training Arena'], { 'Magic': 60 }, {
    description: 'Bought from the Mage Training Arena reward shop.',
  }),
  goal('Dwarf Multicannon', TableType.ARCANA, ['Kandarin'], {}, {
    quests: ['Dwarf Cannon'],
    description: 'AoE damage turret for Slayer tasks.',
  }),
  goal('Necromancy Rituals', TableType.ARCANA, ['City of Um'], {}, {
    quests: ['Necromancy!'],
    description: 'Ritual sites in the City of Um — inks, ensouled bars and Necromancy XP.',
  }),
  goal('Invention Perks', TableType.ARCANA, ['Asgarnia'], { 'Smithing': 80, 'Crafting': 80, 'Divination': 80, 'Invention': 1 }, {
    description: 'Invention unlocks at the Invention Guild; gizmo perks (Precise, Biting, Aftershock…) scale with Invention level.',
  }),
  goal('Archaeology Relics', TableType.ARCANA, ['Digsite'], { 'Archaeology': 1 }, {
    description: 'Relic powers from restored mysteries — e.g. Fury of the Small and Persistent Rage.',
  }),

  // ============================================================================
  // HERBLORE MILESTONES
  // ============================================================================
  goal('Extreme Potions', TableType.SKILLS, [], { 'Herblore': 88 }, {
    description: 'Extreme attack (88) through extreme necromancy — bought ingredients and super potions.',
  }),
  goal('Overloads', TableType.SKILLS, [], { 'Herblore': 96 }, {
    description: 'Boosts every combat skill — the core PvM potion.',
  }),
  goal('Supreme Overloads', TableType.SKILLS, [], { 'Herblore': 98 }, {
    description: 'Higher overload boost; combine with prayer renewals for supreme overload salves.',
  }),
  goal('Prayer Renewals', TableType.SKILLS, [], { 'Herblore': 94 }, {
    description: 'Restores Prayer over time — staple boss supply.',
  }),
  goal('Super Antifire', TableType.SKILLS, [], { 'Herblore': 85 }, {
    description: 'Full dragonfire immunity — needed for the Queen Black Dragon and dragons.',
  }),

  // ============================================================================
  // GEAR & WEAPONS (tiered RS3 progression)
  // ============================================================================
  goal('Barrows Equipment', TableType.BOSSES, ['Barrows'], { 'Defence': 70 }, {
    quests: ['Priest in Peril'],
    description: 'Tier 70 degradable armour sets from the Barrows Brothers.',
  }),
  goal('Dragon Defender', TableType.GUILDS, ["Warriors' Guild"], { 'Attack': 60, 'Defence': 60 }, {
    description: "Cyclopes in the Warriors' Guild — 99 Attack/Strength or 130 combined to enter.",
  }),
  goal('Chaotic Weapons', TableType.MERCHANTS, ['Daemonheim'], { 'Dungeoneering': 80, 'Attack': 80 }, {
    description: 'Chaotic rapier/longsword/maul, crossbow and staff from the Dungeoneering reward shop (80 Dungeoneering).',
  }),
  goal('Ring of Vigour', TableType.MERCHANTS, ['Daemonheim'], { 'Dungeoneering': 62 }, {
    description: 'Saves adrenaline on ultimates — Dungeoneering reward shop.',
  }),
  goal('Bonecrusher', TableType.STORAGE, ['Daemonheim'], { 'Dungeoneering': 21 }, {
    description: 'Auto-buries bones for Prayer XP — Dungeoneering reward shop.',
  }),
  goal('Abyssal Whip', TableType.BOSSES, ['Slayer Tower'], { 'Slayer': 85, 'Attack': 70 }, {
    description: 'Dropped by abyssal demons (85 Slayer).',
  }),
  goal('Dark Bow', TableType.BOSSES, ['Tirannwn'], { 'Slayer': 90, 'Ranged': 70 }, {
    quests: ["Mourning's End Part II"],
    description: "Dropped by dark beasts in Mourning's End Part II's Temple of Light.",
  }),
  goal('Ascension Crossbows', TableType.BOSSES, ['Feldip Hills'], { 'Slayer': 95, 'Ranged': 90 }, {
    description: 'Tier 90 crossbows from the Legiones (Monastery of Ascension).',
  }),
  goal('Drygore Weapons', TableType.BOSSES, ['Kalphite Lair'], { 'Attack': 90 }, {
    description: 'Tier 90 melee weapons from the Kalphite King.',
  }),
  goal('Noxious Weapons', TableType.BOSSES, ['Morytania'], { 'Attack': 90, 'Ranged': 90, 'Magic': 90 }, {
    description: 'Tier 90 noxious scythe, longbow and staff from Araxxor.',
  }),
  goal('Seren Godbow', TableType.BOSSES, ['Lost Grove'], { 'Ranged': 92 }, {
    description: 'Tier 92 two-handed bow from Solak.',
  }),
  goal('Zaryte Bow', TableType.BOSSES, ['God Wars Dungeon'], { 'Ranged': 90 }, {
    description: 'Tier 90 bow from Nex.',
  }),
  goal('Eldritch Crossbow', TableType.BOSSES, ['Wilderness'], { 'Ranged': 92 }, {
    description: 'Tier 92 crossbow assembled from Dragonkin Laboratory components.',
  }),
  goal('Tectonic Armour', TableType.BOSSES, ['Asgarnia'], { 'Defence': 90, 'Magic': 90 }, {
    description: 'Tier 90 power armour for Magic from Vorago’s tectonic energy.',
  }),
  goal("Erethdor's Grimoire", TableType.BOSSES, ['Heart of Gielinor'], {}, {
    description: 'Pocket-slot critical-strike boost — dropped by Telos.',
  }),
  goal('Elder Rune Armour', TableType.SKILLS, ["Artisans' Workshop"], { 'Smithing': 90 }, {
    description: 'Smith elder rune armour (+1 to +5) — tier 80-90 melee armour.',
  }),
  goal('Masterwork Armour', TableType.SKILLS, ["Artisans' Workshop"], { 'Smithing': 99, 'Defence': 90 }, {
    description: 'Tier 92 melee armour, smithed at the Artisans\' Workshop; trimmed with elite-dungeon components.',
  }),
  goal('Deathwarden Robes', TableType.SKILLS, ['City of Um'], { 'Necromancy': 90 }, {
    quests: ['Necromancy!'],
    description: 'Tier 90 Necromancy armour, crafted from ghostly ink and spirit materials.',
  }),
  goal("First Necromancer's Equipment", TableType.BOSSES, ['City of Um'], { 'Necromancy': 95 }, {
    quests: ['Alpha vs Omega'],
    description: "Tier 95 Necromancy robes, Omni guard and Soulbound lantern from Rasial.",
  }),
  goal('Fire Cape', TableType.BOSSES, ['TzHaar City'], {}, {
    description: 'Complete the TzHaar Fight Cave (TzTok-Jad).',
  }),
  goal('TokHaar-Kal Cape', TableType.BOSSES, ['TzHaar City'], {}, {
    quests: ['The Elder Kiln'],
    description: 'Complete the Fight Kiln (Har-Aken) — needs a fire cape to enter.',
  }),
  goal('Igneous Kal-Zuk Cape', TableType.BOSSES, ['Misthalin'], {}, {
    description: 'Defeat TzKal-Zuk at the TzekHaar Front — best-in-slot cape.',
  }),
  goal("Culinaromancer's Gloves 10", TableType.MERCHANTS, ['Lumbridge'], { 'Cooking': 70 }, {
    quests: ['Recipe for Disaster'],
    description: "Best early gloves — Culinaromancer's chest in Lumbridge Castle basement.",
  }),
  goal('Slayer Helmet', TableType.SLAYER_UNLOCKS, ['Kharidian Desert'], { 'Crafting': 55 }, {
    quests: ['Smoking Kills'],
    description: 'Learn to craft it with Slayer points (Sumona, Pollnivneach).',
  }),
  goal('Max Cape', TableType.GUILDS, ['Prifddinas'], {
    'Attack': 99, 'Constitution': 99, 'Mining': 99, 'Strength': 99, 'Agility': 99, 'Smithing': 99,
    'Defence': 99, 'Herblore': 99, 'Fishing': 99, 'Ranged': 99, 'Thieving': 99, 'Cooking': 99,
    'Prayer': 99, 'Crafting': 99, 'Firemaking': 99, 'Magic': 99, 'Fletching': 99, 'Woodcutting': 99,
    'Runecrafting': 99, 'Slayer': 99, 'Farming': 99, 'Construction': 99, 'Hunter': 99, 'Summoning': 99,
    'Dungeoneering': 99, 'Divination': 99, 'Invention': 99, 'Archaeology': 99, 'Necromancy': 99,
  }, {
    quests: ["Plague's End"],
    description: 'Level 99 in all 29 skills — bought from Max in the Max Guild.',
  }),

  // ============================================================================
  // ACHIEVEMENT DIARY REWARDS
  // ============================================================================
  goal('Ardougne Cloak 4', TableType.MOBILITY, ['Kandarin'], {}, {
    diaries: ['Ardougne Elite'],
    description: 'Unlimited Ardougne Monastery / farm teleports and better pickpocketing.',
  }),
  goal("Explorer's Ring 4", TableType.MOBILITY, ['Lumbridge'], {}, {
    diaries: ['Lumbridge Hard'],
    description: 'Unlimited cabbage-patch teleports, run-energy restores and High Alchemy casts.',
  }),
  goal('Falador Shield 4', TableType.MOBILITY, ['Asgarnia'], {}, {
    diaries: ['Falador Elite'],
    description: 'Prayer restores and an extra reward from the Giant Mole.',
  }),
  goal('Karamja Gloves 4', TableType.MOBILITY, ['Karamja'], {}, {
    diaries: ['Karamja Elite'],
    description: 'Gem mine and Duradel teleports; cheaper Brimhaven Dungeon.',
  }),
  goal('Desert Amulet 4', TableType.MOBILITY, ['Kharidian Desert'], {}, {
    diaries: ['Desert Elite'],
    description: 'Nardah and Kalphite Cave teleports; desert heat immunity.',
  }),
  goal('Fremennik Sea Boots 4', TableType.MOBILITY, ['Fremennik'], {}, {
    diaries: ['Fremennik Elite'],
    description: 'Unlimited Rellekka teleports and Dagannoth Kings bonuses.',
  }),
  goal('Morytania Legs 4', TableType.MOBILITY, ['Morytania'], {}, {
    diaries: ['Morytania Elite'],
    description: 'Unlimited Slime pit / Burgh de Rott teleports and extra Barrows loot.',
  }),
  goal('Tirannwn Quiver 4', TableType.MOBILITY, ['Tirannwn'], {}, {
    diaries: ['Tirannwn Elite'],
    description: 'Infinite ammo slot quiver with Prifddinas teleports.',
  }),
  goal('Varrock Armour 4', TableType.MOBILITY, ['Varrock'], {}, {
    diaries: ['Varrock Elite'],
    description: 'Chance of extra bars/ores while smithing and mining.',
  }),
  goal('Wilderness Sword 4', TableType.MOBILITY, ['Wilderness'], {}, {
    diaries: ['Wilderness Elite'],
    description: 'Wilderness teleports and noted dragon bones from wilderness dragons.',
  }),

  // ============================================================================
  // TRANSPORT NETWORKS & TELEPORTS
  // ============================================================================
  goal('Fairy Rings', TableType.MOBILITY, ['Zanaris'], {}, {
    quests: ['Lost City'],
    description: 'Partway through A Fairy Tale II - Cure a Queen; carry a dramen or lunar staff until Fairy Tale III.',
  }),
  goal('Spirit Trees', TableType.MOBILITY, ['Tree Gnome Stronghold'], {}, {
    quests: ['Tree Gnome Village'],
    description: 'Teleport between spirit trees across Gielinor.',
  }),
  goal('Gnome Gliders', TableType.MOBILITY, ['Tree Gnome Stronghold'], {}, {
    quests: ['The Grand Tree'],
    description: 'Glider network from the Grand Tree.',
  }),
  goal('Balloon Transport', TableType.MOBILITY, ['Entrana'], { 'Firemaking': 20, 'Farming': 30, 'Crafting': 36 }, {
    quests: ['Enlightened Journey'],
    description: 'Hot-air balloon routes (Taverley, Crafting Guild, Castle Wars, Grand Tree, Varrock).',
  }),
  goal('Mine Carts', TableType.MOBILITY, ['Keldagrim'], {}, {
    quests: ['The Giant Dwarf'],
    description: 'Dwarven mine-cart network out of Keldagrim.',
  }),
  goal('Eagle Transport', TableType.MOBILITY, ["Eagles' Peak"], { 'Hunter': 27 }, {
    quests: ["Eagles' Peak"],
    description: "Eagle routes from Eagles' Peak.",
  }),
  goal('Ectophial', TableType.MOBILITY, ['Port Phasmatys'], {}, {
    quests: ['Ghosts Ahoy'],
    description: 'Unlimited teleport to the Ectofuntus.',
  }),
  goal('Enchanted Lyre', TableType.MOBILITY, ['Rellekka'], {}, {
    quests: ['The Fremennik Trials'],
    description: 'Teleport to Rellekka.',
  }),
  goal('Crystal Teleport Seed', TableType.MOBILITY, ['Lletya'], {}, {
    quests: ["Mourning's End Part I"],
    description: "Lletya teleports; Prifddinas destination after Plague's End.",
  }),
  goal('Camulet', TableType.MOBILITY, ['Kharidian Desert'], {}, {
    quests: ["Enakhra's Lament"],
    description: "Teleport to Enakhra's Temple.",
  }),
  goal("Drakan's Medallion", TableType.MOBILITY, ['Darkmeyer'], {}, {
    quests: ['The Branches of Darkmeyer'],
    description: 'Teleports around Morytania (Burgh de Rott, Darkmeyer).',
  }),
  goal('Sixth-Age Circuit', TableType.MOBILITY, ['Misthalin'], {}, {
    quests: ['The World Wakes'],
    description: "Guthix's Cave and Guthixian teleports.",
  }),
  goal('Ring of Fortune', TableType.MOBILITY, [], { 'Crafting': 72, 'Magic': 87 }, {
    description: 'Grand Exchange teleport (Miscellania after Throne of Miscellania).',
  }),
  goal('Archaeology Journal', TableType.MOBILITY, ['Digsite'], { 'Archaeology': 1 }, {
    description: 'Unlimited teleport to the Archaeology Guild.',
  }),
  goal('Prifddinas Lodestone', TableType.MOBILITY, ['Prifddinas'], {}, {
    quests: ["Plague's End"],
    description: 'Lodestone into the heart of Prifddinas.',
  }),
  goal('Max Guild Portals', TableType.MOBILITY, ['Prifddinas'], {}, {
    quests: ["Plague's End"],
    description: 'Attunable boss and skilling portals in the Max Guild (99 in any skill to enter).',
  }),

  // ============================================================================
  // GUILDS
  // ============================================================================
  goal('Invention Guild', TableType.GUILDS, ['Asgarnia'], { 'Smithing': 80, 'Crafting': 80, 'Divination': 80 }, {
    description: 'Unlocks Invention (north-east of Falador).',
  }),
  goal('Archaeology Guild', TableType.GUILDS, ['Digsite'], { 'Archaeology': 1 }, {
    description: 'Archaeology hub at the Digsite.',
  }),
  goal('Fishing Guild', TableType.GUILDS, ['Fishing Guild'], { 'Fishing': 68 }, {
    description: 'Sharks, swordfish and access to the Deep Sea Fishing hub.',
  }),
  goal('Mining Guild', TableType.GUILDS, ['Dwarven Mine'], { 'Mining': 60 }, {
    description: 'Coal, mithril and adamantite close to a bank.',
  }),
  goal('Crafting Guild', TableType.GUILDS, ['Crafting Guild'], { 'Crafting': 40 }, {
    description: 'Gold/gem rocks, bank and pottery.',
  }),
  goal('Ranging Guild', TableType.GUILDS, ['Ranging Guild'], { 'Ranged': 40 }, {
    description: 'Archery competition and ranged supply shops.',
  }),
  goal("Wizards' Guild", TableType.GUILDS, ['Yanille'], { 'Magic': 66 }, {
    description: 'Magic shops and mystic robes.',
  }),
  goal("Heroes' Guild", TableType.GUILDS, ["Heroes' Guild"], {}, {
    quests: ["Heroes' Quest"],
    description: 'Amulet of glory fountain and the Heroes\' Guild facilities.',
  }),
  goal("Legends' Guild", TableType.GUILDS, ["Legends' Guild"], {}, {
    quests: ["Legends' Quest"],
    description: 'Legends cape and the totem.',
  }),
  goal("Champions' Guild", TableType.GUILDS, ['Varrock'], {}, {
    description: "33 Quest Points — Champion's Challenge.",
  }),
  goal("Thieves' Guild", TableType.GUILDS, ['Lumbridge'], { 'Thieving': 5 }, {
    quests: ['Buyers and Cellars'],
    description: 'Thieving training and the heist quest line.',
  }),
  goal('Max Guild', TableType.GUILDS, ['Prifddinas'], {}, {
    quests: ["Plague's End"],
    description: 'Garden: 99 in any skill. Tower: 99 in every skill.',
  }),

  // ============================================================================
  // MINIGAMES & ACTIVITIES
  // ============================================================================
  goal('Livid Farm', TableType.MINIGAMES, ['Lunar Isle'], { 'Magic': 70, 'Agility': 60, 'Crafting': 60, 'Farming': 60, 'Construction': 50 }, {
    quests: ['Lunar Diplomacy'],
    description: 'Unlocks the extra Lunar spells (Cure Plant, Fertile Soil, Disruption Shield, Vengeance Group…).',
  }),
  goal('Flash Powder Factory', TableType.MINIGAMES, ['Taverley'], { 'Thieving': 75, 'Agility': 75, 'Herblore': 50 }, {
    description: 'Rogues\' Den team minigame — Rogue armour and flash powder rewards.',
  }),
  goal('Rush of Blood', TableType.MINIGAMES, ['Prifddinas'], { 'Slayer': 85 }, {
    quests: ["Plague's End"],
    description: "Morvran's boss-rush Slayer Distraction & Diversion.",
  }),
  goal('Player-Owned Ports', TableType.MINIGAMES, ['Port Sarim'], {}, {
    description: 'Send voyages to the Eastern Lands — needs 90 in at least one port skill.',
  }),
  goal('Deep Sea Fishing', TableType.MINIGAMES, ['Fishing Guild'], { 'Fishing': 68 }, {
    description: 'Fishing hub (Goomah, Fishing Guild): swarms, sailfish and minnows.',
  }),
  goal('Pest Control', TableType.MINIGAMES, ['Void Knights\' Outpost'], {}, {
    description: 'Void Knight equipment — combat level 40+.',
  }),
  goal('Fight Kiln', TableType.MINIGAMES, ['TzHaar City'], {}, {
    quests: ['The Elder Kiln'],
    description: 'TokHaar-Kal cape and the Har-Aken fight.',
  }),
  goal('Shooting Stars (Size 10)', TableType.MINIGAMES, [], { 'Mining': 90 }, {
    description: 'Mine the largest crashed stars for stardust.',
  }),

  // ============================================================================
  // SKILLING NODES
  // ============================================================================
  goal('Seren Stones', TableType.SKILLS, ['Prifddinas'], { 'Mining': 89 }, {
    quests: ["Plague's End"],
    description: 'AFK Mining XP in the Trahaearn district.',
  }),
  goal('Crystal Trees', TableType.SKILLS, ['Prifddinas'], { 'Woodcutting': 94 }, {
    quests: ["Plague's End"],
    description: 'Crystal tree blossoms and fast Woodcutting XP.',
  }),
  goal('Elder Trees', TableType.SKILLS, [], { 'Woodcutting': 90 }, {
    description: 'Elder logs — high-value logs and Firemaking.',
  }),
  goal('Rocktails', TableType.SKILLS, ['Dwarven Mine'], { 'Fishing': 90 }, {
    description: 'Living Rock Caverns, beneath Falador — best healing fish before sailfish.',
  }),
  goal('Grenwalls', TableType.SKILLS, ['Isafdar'], { 'Hunter': 77 }, {
    quests: ['Regicide'],
    description: 'Grenwall spikes and fast Hunter XP in Isafdar.',
  }),
  goal('Frost Dragons', TableType.SKILLS, ['Asgarnian Ice Dungeon'], { 'Dungeoneering': 85 }, {
    description: 'Frost dragon bones — top Prayer XP from combat.',
  }),
  goal('Elder Tree Patches', TableType.FARMING_LAYERS, [], { 'Farming': 90 }, {
    description: 'Grow elder trees in the dedicated patches.',
  }),
  goal('Jade Vine', TableType.FARMING_LAYERS, ['Karamja'], { 'Farming': 78 }, {
    quests: ['Back to my Roots'],
    description: 'Jade vine patch in Karamja.',
  }),
  goal('Pack Yak', TableType.SKILLS, [], { 'Summoning': 96 }, {
    description: '30-slot beast of burden that can bank items.',
  }),
  goal('Steel Titan', TableType.SKILLS, [], { 'Summoning': 99 }, {
    description: 'Top combat familiar for most styles.',
  }),

  // ============================================================================
  // AGILITY COURSES
  // ============================================================================
  goal('Agility Pyramid', TableType.AGILITY_COURSES, ['Agility Pyramid'], { 'Agility': 30 }, {
    description: 'Desert course with a gold-pyramid reward.',
  }),
  goal('Barbarian Outpost Course', TableType.AGILITY_COURSES, ['Barbarian Outpost'], { 'Agility': 35 }, {
    description: 'Barbarian Outpost course (advanced laps at 90).',
  }),
  goal('Wilderness Agility Course', TableType.AGILITY_COURSES, ['Wilderness Agility Course'], { 'Agility': 52 }, {
    description: 'Deep Wilderness course.',
  }),
  goal('Werewolf Agility Course', TableType.AGILITY_COURSES, ['Canifis'], { 'Agility': 60 }, {
    description: 'Underground course beneath Canifis.',
  }),
  goal('Anachronia Agility Course', TableType.AGILITY_COURSES, ['Anachronia Agility Course'], { 'Agility': 30 }, {
    description: 'Laps around Anachronia; later sections need 50 / 70 / 85 Agility.',
  }),
  goal('Advanced Gnome Course', TableType.AGILITY_COURSES, ['Tree Gnome Stronghold'], { 'Agility': 85 }, {
    description: 'Gnome Stronghold advanced course.',
  }),
  goal('Hefin Agility Course', TableType.AGILITY_COURSES, ['Prifddinas'], { 'Agility': 77 }, {
    quests: ["Plague's End"],
    description: 'Prifddinas course — light creatures and crystal motherlode shards.',
  }),
]);
