// Region each Activities & Utility item is located in / requires access to.
//
// Informational only — surfaced as a "📍 Region" tag on activity cards so a
// player can see, at a glance, which region an activity lives in. Items not
// listed here (ubiquitous farming patch types, item-based transports that work
// from anywhere) intentionally have no tag.
//
// Regions use the RS3 continent names from REGION_GROUPS (plus 'Misthalin',
// the free starter kingdom). Multi-region content is assigned its primary
// access point, using the continent its sub-area sits under in REGION_GROUPS
// (e.g. the City of Um is filed under Morytania, the Heart of Gielinor under
// the Wilderness, the Lost Grove under Tirannwn). Content inside the
// Elder God Wars Dungeon / Senntisten (beneath the Digsite) is Misthalin.
// Locations verified against the RuneScape Wiki.

export const ACTIVITY_REGIONS: Record<string, string> = {
  // ---- Bosses: elite dungeons & raids ---------------------------------------
  'Temple of Aminishi': 'The Arc',                // Aminishi, the Arc
  'Dragonkin Laboratory': 'Wilderness',           // Deep Wilderness castle ruins
  'The Shadow Reef': 'Daemonheim',                // eastern shore of Daemonheim
  'Zamorakian Undercity': 'Misthalin',            // Elder God Wars Dungeon
  'Liberation of Mazcab': 'Islands & Others',     // Mazcab raids

  // ---- Bosses: high-level ---------------------------------------------------
  'Vorago': 'Asgarnia',                           // Borehole, north of Falador
  'Telos': 'Wilderness',                          // Heart of Gielinor
  'Solak': 'Tirannwn',                            // The Lost Grove
  'Araxxor': 'Morytania',                         // Araxyte Hive
  'Nex: Angel of Death': 'Fremennik',             // Ancient Prison, God Wars Dungeon
  'Raksha': 'Anachronia',                         // Orthen Oubliette
  'Arch-Glacor': 'Misthalin',                     // Glacor Front, Senntisten
  'Kerapac': 'Misthalin',                         // Nodon Front, Elder God Wars Dungeon
  'Zamorak, Lord of Chaos': 'Misthalin',          // Zamorakian Undercity
  'TzKal-Zuk': 'Misthalin',                       // TzekHaar Front, Elder God Wars Dungeon
  'Rasial': 'Morytania',                          // Rasial's Citadel above the City of Um
  'Sanctum of Rebirth': 'Morytania',              // Underworld, entered from the City of Um
  'Barrows: Rise of the Six': 'Morytania',
  'Kalphite King': 'Kharidian Desert',            // Exiled Kalphite Hive
  'Amascut, the Devourer': 'Kharidian Desert',    // Golden Palace, Menaphos
  'The Magister': 'Kharidian Desert',             // Sophanem Slayer Dungeon

  // ---- Bosses: God Wars Dungeons -------------------------------------------
  'Nex': 'Fremennik',
  'General Graardor': 'Fremennik',
  'Commander Zilyana': 'Fremennik',
  "Kree'arra": 'Fremennik',
  "K'ril Tsutsaroth": 'Fremennik',
  'Helwyr': 'Wilderness',                         // Heart of Gielinor
  'Twin Furies': 'Wilderness',
  'Gregorovic': 'Wilderness',
  'Vindicta & Gorvek': 'Wilderness',

  // ---- Bosses: mid-level ----------------------------------------------------
  'Corporeal Beast': 'Wilderness',
  'Queen Black Dragon': 'Asgarnia',               // Grotworm Lair, near Port Sarim
  'Legiones': 'Kandarin',                         // Monastery of Ascension, Feldip Hills
  'Har-Aken': 'Karamja',                          // Fight Kiln, TzHaar City
  'Dagannoth Kings': 'Fremennik',                 // Waterbirth Island
  'Kalphite Queen': 'Kharidian Desert',
  'Exiled Kalphite Queen': 'Kharidian Desert',
  'Black Stone Dragon': 'Wilderness',             // inside the Dragonkin Laboratory
  'Hermod': 'Morytania',                          // Rasial's Citadel, City of Um
  'Zemouregal & Vorkath': 'Misthalin',            // Fort Forinthry
  'Rex Matriarchs': 'Anachronia',
  'Flesh-hatcher Mhekarnahz': 'Wilderness',      // Ocularis, entrance west of Daemonheim
  'Ivar, King of Bones': 'Havenhythe',
  'Silverquill, the Dreadhog': 'Havenhythe',

  // ---- Bosses: entry / skilling ---------------------------------------------
  'Giant Mole': 'Asgarnia',                       // under Falador Park
  'King Black Dragon': 'Wilderness',
  'Chaos Elemental': 'Wilderness',
  'Barrows Brothers': 'Morytania',
  'Bork': 'Wilderness',                           // Chaos Tunnels
  'TzHaar Fight Cave': 'Karamja',
  'Skeletal Horror': 'Misthalin',                 // Silvarea
  'Croesus': 'Misthalin',                         // Croesus Front, Senntisten
  'Gate of Elidinis': 'Morytania',                // Underworld, atop the Sanctum of Rebirth

  // ---- Minigames: Distractions & Diversions ---------------------------------
  // Roaming D&Ds (stars, evil trees, penguins, sinkholes…) are tagged with the
  // kingdom where their hub/reward NPC sits.
  'Shooting Stars': 'Misthalin',
  'Evil Tree': 'Misthalin',
  'Penguin Hide and Seek': 'Kandarin',            // points redeemed at Ardougne Zoo
  'Guthixian Caches': 'Misthalin',
  'Wilderness Warbands': 'Wilderness',
  'Goebie Supply Run': 'Islands & Others',        // Mazcab
  'Big Chinchompa': 'Kandarin',
  'Phoenix Lair': 'Kandarin',
  'Rush of Blood': 'Tirannwn',                    // Morvran's dungeon, Prifddinas
  'Sinkholes': 'Daemonheim',
  'Herby Werby': 'Anachronia',
  'Fish Flingers': 'Islands & Others',            // Isla Anglerine
  'Wilderness Flash Events': 'Wilderness',

  // ---- Minigames: combat ----------------------------------------------------
  'Barbarian Assault': 'Kandarin',
  'Castle Wars': 'Kandarin',
  'Clan Wars': 'Asgarnia',                        // Clan Camp
  'Soul Wars': 'Misthalin',                       // portal in Edgeville
  'Stealing Creation': 'Asgarnia',                // Gamers' Grotto, north of Falador
  'Fist of Guthix': 'Asgarnia',                   // Gamers' Grotto
  'Pest Control': 'Asgarnia',                     // Void Knights' Outpost
  'Heist': 'Asgarnia',                            // north-west of Falador
  'Shattered Worlds': 'Asgarnia',                 // Void Knights' Outpost
  'Dominion Tower': 'Kharidian Desert',           // west of Uzer
  'TzHaar Fight Pit': 'Karamja',
  'Duel Arena': 'Kharidian Desert',
  'Troll Invasion': 'Asgarnia',                   // Burthorpe
  "Champion's Challenge": 'Misthalin',            // Champions' Guild basement

  // ---- Minigames: skilling --------------------------------------------------
  'Great Orb Project': 'Misthalin',               // Wizards' Tower
  'Trouble Brewing': 'Morytania',                 // Mos Le'Harmless
  'Temple Trekking': 'Morytania',
  'Fishing Trawler': 'Kandarin',                  // Port Khazard
  'Gnome Restaurant': 'Kandarin',
  'Mage Training Arena': 'Kharidian Desert',
  'Pyramid Plunder': 'Kharidian Desert',          // Sophanem
  "Sorceress's Garden": 'Kharidian Desert',       // Al Kharid
  'Blast Furnace': 'Fremennik',                   // Keldagrim
  "Artisans' Workshop": 'Asgarnia',
  'Livid Farm': 'Fremennik',                      // Lunar Isle
  'Tears of Guthix': 'Misthalin',                 // Lumbridge Swamp caves
  'Brimhaven Agility Arena': 'Karamja',
  "Shades of Mort'ton": 'Morytania',
  'Tai Bwo Wannai Cleanup': 'Karamja',
  "Warriors' Guild": 'Asgarnia',
  'Burthorpe Games Room': 'Asgarnia',
  'Rat Pits': 'Misthalin',                        // Varrock sewers
  'Runespan': 'Misthalin',                        // Wizards' Tower
  'Impetuous Impulses': 'Islands & Others',       // Puro-Puro
  'Player-Owned Ports': 'Asgarnia',               // Port Sarim
  'Deep Sea Fishing': 'Kandarin',                 // via Goomah in the Fishing Guild
  'Ranch Out of Time': 'Anachronia',
  'Big Game Hunter': 'Anachronia',
  'Flash Powder Factory': 'Asgarnia',             // Rogues' Den, Taverley
  'Conquest': 'Asgarnia',                         // Void Knights' Outpost

  // ---- Guilds ---------------------------------------------------------------
  "Champions' Guild": 'Misthalin',
  "Cooks' Guild": 'Misthalin',
  'Crafting Guild': 'Asgarnia',
  'Mining Guild': 'Asgarnia',
  'Fishing Guild': 'Kandarin',
  "Heroes' Guild": 'Asgarnia',
  "Legends' Guild": 'Kandarin',
  'Ranging Guild': 'Kandarin',
  // Warriors' Guild — tagged above (it is both a guild and a minigame).
  "Wizards' Guild": 'Kandarin',                   // Yanille
  'Invention Guild': 'Asgarnia',                  // north-east of Falador
  'Archaeology Guild': 'Misthalin',               // Digsite
  "Servants' Guild": 'Kandarin',                  // Ardougne
  "Thieves' Guild": 'Misthalin',                  // Lumbridge
  'Max Guild': 'Tirannwn',                        // Prifddinas

  // ---- Mobility (networks/items tied to one place) --------------------------
  'Spirit Trees': 'Kandarin',
  'Gnome Gliders': 'Kandarin',
  'Canoes': 'Misthalin',
  'Balloon Transport': 'Asgarnia',
  'Mine Carts': 'Fremennik',                      // Keldagrim
  'Wilderness Obelisks': 'Wilderness',
  'Abyss Teleport': 'Wilderness',                 // Mage of Zamorak
  'Ring of Kinship': 'Daemonheim',
  'Ectophial': 'Morytania',
  'Crystal Teleport Seed': 'Tirannwn',
  'Grand Seed Pod': 'Kandarin',
  'Enchanted Lyre': 'Fremennik',
  'Digsite Pendant': 'Misthalin',
  'Eagle Transport': 'Kandarin',
  "Drakan's Medallion": 'Morytania',
  "Pharaoh's Sceptre": 'Kharidian Desert',
  'Magic Carpets': 'Kharidian Desert',
  'Camulet': 'Kharidian Desert',
  'Archaeology Journal': 'Misthalin',             // Archaeology Guild
  'Wicked Hood': 'Misthalin',                     // Wizards' Tower
  'Max Guild Portals': 'Tirannwn',
  'Menaphos Boats': 'Kharidian Desert',

  // ---- Farming patches (only region-specific patch types) -------------------
  'Cactus': 'Kharidian Desert',
  'Mushroom': 'Morytania',                        // Canifis
  'Calquat': 'Karamja',                           // Tai Bwo Wannai
  'Belladonna': 'Misthalin',                      // Draynor Manor
  'Jade Vine': 'Karamja',
  'Evil Turnip': 'Misthalin',                     // Draynor Manor
  'Vine': 'Kandarin',
  'Player-Owned Farm': 'Kandarin',                // Manor Farm, north of Ardougne
  'Dinosaur Farm': 'Anachronia',
};

export const getActivityRegion = (item: string): string | undefined =>
  ACTIVITY_REGIONS[item];
