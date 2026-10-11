// RS3 content tables for Fate Locked. Every unlockable entry lives in one of
// these lists; data/*.consistency tests pin the other data files to them.

// RuneScape 3's 29 skills, in the in-game skills-interface order.
export const SKILLS_LIST = [
  'Attack', 'Constitution', 'Mining',
  'Strength', 'Agility', 'Smithing',
  'Defence', 'Herblore', 'Fishing',
  'Ranged', 'Thieving', 'Cooking',
  'Prayer', 'Crafting', 'Firemaking',
  'Magic', 'Fletching', 'Woodcutting',
  'Runecrafting', 'Slayer', 'Farming',
  'Construction', 'Hunter', 'Summoning',
  'Dungeoneering', 'Divination', 'Invention',
  'Archaeology', 'Necromancy'
];

// RS3 worn-equipment slots (the Ammo slot is "Ammo/Quiver"; Pocket holds
// scrimshaws, grimoires and Necromancy tomes; Aura is the Loyalty aura slot).
export const EQUIPMENT_SLOTS = [
  'Head', 'Cape', 'Neck', 'Ammo', 'Weapon', 'Body', 'Shield', 'Legs', 'Gloves', 'Boots', 'Ring', 'Pocket', 'Aura'
];

export const MOBILITY_LIST = [
  'Lodestone Network', 'Fairy Rings', 'Spirit Trees', 'Gnome Gliders', 'Charter Ships',
  'Abyss Teleport', 'Jewellery Teleports', 'Canoes', 'Balloon Transport', 'Mine Carts',
  'Wilderness Obelisks', 'Grouping Teleports', 'Ring of Kinship', 'Ring of Slaying',
  'Ectophial', 'Crystal Teleport Seed', 'Grand Seed Pod', 'Ring of Fortune',
  'Enchanted Lyre', 'Digsite Pendant', 'Games Necklace', 'Ring of Duelling',
  'Combat Bracelet', 'Skills Necklace', 'Amulet of Glory', 'Eagle Transport',
  'Drakan\'s Medallion', 'Pharaoh\'s Sceptre', 'Magic Carpets', 'Camulet',
  'Archaeology Journal', 'Wicked Hood', 'Sixth-Age Circuit', 'Achievement Teleports',
  'Max Guild Portals', 'Menaphos Boats'
];

export const ARCANA_LIST = [
  'Ancient Magicks', 'Lunar Spellbook', 'Ancient Curses', 'Piety', 'Rigour', 'Augury',
  'Chivalry', 'Praesul Codex', 'Bones to Peaches', 'Dwarf Multicannon', 'God Spells',
  'Greater Ability Codices', 'Archaeology Relics', 'Invention Perks', 'Necromancy Rituals',
  'Necromancy Incantations'
];

export const POH_LIST = [
  'Costume Room', 'Chapel Altar', 'Portal Chamber', 'Lectern', 'Workshop Tools', 'Kitchen',
  'Menagerie', 'Mounted Amulet of Glory', 'Combat Room', 'Superior Garden Fairy Ring',
  'Superior Garden Spirit Tree', 'Occult Altar', 'Armour Case', 'Magic Wardrobe', 'Cape Rack',
  'Treasure Chest (Clues)', 'Toy Box', 'Armour Repair Stand', 'Telescope', 'Dungeon', 'Aquarium',
  'Servant\'s Bedroom', 'Servant\'s Moneybag', 'Dining Table', 'Boss Lair', 'Throne Room',
  'Oubliette', 'Quest Hall', 'Skill Hall', 'Games Room', 'Pet House', 'Clockmaker\'s Bench'
];

export const MERCHANTS_LIST = [
  'General Stores', 'Magic Shops', 'Archery Shops', 'Sword Shops', 'Food Shops',
  'Fishing Shops', 'Clothes Shops', 'Farming Shops', 'Crafting Shops', 'Mining Shops',
  'Gem Shops', 'Herblore Shops', 'Dye Shops', 'Axe Shops', 'Platebody Shops',
  'Bars & Inns', 'Cooking Shops', 'Shield Shops', 'Scimitar Shops', 'Helmet Shops',
  'Platelegs Shops', 'Plateskirt Shops', 'Chainbody Shops', 'Mace Shops',
  'Staff Shops', 'Crossbow Shops', 'Hunter Shops', 'Candle Shops', 'Fur Traders',
  'Jewellery Shops', 'Kebab Sellers', 'Silk Shops', 'Silver Shops', 'Spice Shops',
  'Vegetable Shops', 'Wine Traders', 'Amulet Shops',
  'Slayer Equipment', 'Stonemasons', 'Sawmill Operators', 'Ore Merchants',
  'Estate Agents', 'Tanners', 'Taxidermists', 'Decanters', 'Lost Property',
  'Warhammer Shops', 'Claw Shops', 'Halberd Shops', 'Pet Shops',
  'Weapon Shops', 'Reward Shops', 'Invention Supplies', 'Archaeology Supplies',
  'Necromancy Supplies', 'Summoning Shops', 'Dungeoneering Rewards', 'Divination Supplies'
];

export const STORAGE_LIST = [
  'Ore Box', 'Material Storage', 'Money Pouch', 'Rune Pouch', 'Tool Belt', 'Gem Bag', 'Coal Bag',
  'Wood Box', 'Soil Box', 'Essence Pouches', 'Bonecrusher', 'Herbicide', 'Charming Imp',
  'Seedicide', 'Gold Accumulator', 'Beast of Burden', 'Hidey-Holes', 'Tool Leprechauns',
  'Bank Presets', 'Sign of the Porter', 'Familiar Pack Yak', 'Bank Boosters'
];

export const GUILDS_LIST = [
  'Champions\' Guild', 'Cooks\' Guild', 'Crafting Guild', 'Mining Guild', 'Fishing Guild',
  'Heroes\' Guild', 'Legends\' Guild', 'Ranging Guild', 'Warriors\' Guild', 'Wizards\' Guild',
  'Invention Guild', 'Archaeology Guild', 'Servants\' Guild', 'Thieves\' Guild', 'Max Guild'
];

export const SLAYER_UNLOCKS_LIST = [
  'Slayer Helmet', 'Broader Fletching', 'Ring Bling', 'Gargoyle Smasher', 'Slug Salter',
  'Reptile Freezer', 'Shroom Sprayer', 'Aquanites', 'Ice Strykewyrms', 'Mithril Dragons',
  'Task Preferences', 'Social Slayer', 'Reaper Tasks', 'Corrupted Creatures'
];

export const FARMING_PATCH_LIST = [
  'Allotment', 'Herb', 'Flower', 'Hops', 'Bush', 'Tree', 'Fruit Tree', 'Cactus',
  'Mushroom', 'Spirit Tree', 'Calquat', 'Belladonna', 'Jade Vine', 'Evil Turnip',
  'Elder Tree', 'Vine', 'Player-Owned Farm', 'Dinosaur Farm'
];

export const FARMING_UNLOCK_DETAILS: Record<string, string> = {
  'Allotment': 'Potatoes, Cabbages, Watermelons, Snapdragon-tier crops',
  'Herb': 'Guam, Ranarr, Torstol, Fellstalk, Bloodweed',
  'Flower': 'Marigold, Nasturtium, Woad, White lily',
  'Hops': 'Barley, Krandorian, Wildblood',
  'Bush': 'Redberry, Poison Ivy, Whiteberry',
  'Tree': 'Oak, Willow, Maple, Yew, Magic',
  'Fruit Tree': 'Apple, Banana, Orange, Papaya, Palm, Dragonfruit',
  'Cactus': 'Cactus spine, Potato cactus',
  'Mushroom': 'Bittercap, Morchella',
  'Spirit Tree': 'Teleport network node',
  'Calquat': 'Calquat fruit (Tai Bwo Wannai)',
  'Belladonna': 'Deadly nightshade (Draynor Manor)',
  'Jade Vine': 'Jade vine (Karamja, Back to my Roots)',
  'Evil Turnip': 'Evil turnips (Draynor Manor)',
  'Elder Tree': 'Elder logs (Farming 90)',
  'Vine': 'Grapes (Kandarin vinery)',
  'Player-Owned Farm': 'Manor Farm animal husbandry',
  'Dinosaur Farm': 'Anachronia Ranch Out of Time'
};

// The starter kingdom — free in every mode except the Lumbridge-only start.
export const MISTHALIN_AREAS = [
  'Varrock', 'Lumbridge', 'Draynor Village', 'Wizards\' Tower', 'Edgeville',
  'Barbarian Village', 'Digsite', 'Silvarea', 'Paterdomus', 'Fort Forinthry'
];

export const REGION_GROUPS: Record<string, string[]> = {
  'Asgarnia': [
    'Falador', 'Port Sarim', 'Rimmington', 'Taverley', 'Burthorpe', 'Warriors\' Guild',
    'Heroes\' Guild', 'Crafting Guild', 'Dwarven Mine', 'Ice Mountain', 'Asgarnian Ice Dungeon',
    'Artisans\' Workshop', 'Goblin Village', 'Mudskipper Point', 'Void Knights\' Outpost', 'Entrana',
    'Clan Camp'
  ],
  'Kandarin': [
    'East Ardougne', 'West Ardougne', 'Catherby', 'Seers\' Village', 'Camelot', 'Yanille',
    'Port Khazard', 'Hemenster', 'Fishing Guild', 'Ranging Guild', 'Legends\' Guild',
    'Tree Gnome Stronghold', 'Gnome Village', 'Witchaven', 'Piscatoris Fishing Colony',
    'Feldip Hills', 'Baxtorian Falls', 'Otto\'s Grotto', 'Barbarian Outpost', 'Fight Arena',
    'Castle Wars', 'Eagles\' Peak', 'Observatory', 'Ourania Altar', 'Oo\'glog', 'Ancient Cavern'
  ],
  'Karamja': [
    'Musa Point', 'Brimhaven', 'Tai Bwo Wannai', 'Shilo Village', 'Kharazi Jungle',
    'TzHaar City', 'Crandor', 'Ship Yard'
  ],
  'Kharidian Desert': [
    'Al Kharid', 'Duel Arena', 'Shantay Pass', 'Pollnivneach', 'Nardah',
    'Sophanem', 'Menaphos', 'Bandit Camp', 'Bedabin Camp', 'Ruins of Uzer',
    'Mage Training Arena', 'Agility Pyramid', 'Kalphite Lair', 'Ruins of Unkah',
    'Citharede Abbey', 'Jaldraocht Pyramid', 'Kharid-et'
  ],
  'Morytania': [
    'Canifis', 'Port Phasmatys', 'Mort\'ton', 'Barrows', 'Burgh de Rott', 'Meiyerditch',
    'Darkmeyer', 'Fenkenstrain\'s Castle', 'Slayer Tower', 'Mort Myre Swamp', 'Haunted Mine',
    'Haunted Woods', 'Harmony Island', 'Mos Le\'Harmless', 'Braindeath Island',
    'Dragontooth Island', 'City of Um', 'Castle Drakan'
  ],
  'Fremennik': [
    'Rellekka', 'Neitiznot', 'Jatizso', 'Miscellania & Etceteria', 'Waterbirth Island',
    'Lunar Isle', 'Mountain Camp', 'Lighthouse', 'Keldagrim', 'Pirates\' Cove', 'Trollheim',
    'God Wars Dungeon'
  ],
  'Tirannwn': [
    'Prifddinas', 'Lletya', 'Tyras Camp', 'Elf Camp', 'Isafdar',
    'Arandar', 'Gwenith', 'Iorwerth Camp', 'Poison Waste', 'Port Tyras',
    'Max Guild', 'Lost Grove'
  ],
  'Wilderness': [
    'Chaos Temple', 'Rogues\' Castle', 'Lava Maze', 'Wilderness Bandit Camp',
    'Dark Warriors\' Fortress', 'Graveyard of Shadows', 'Forgotten Cemetery', 'Mage Arena',
    'Fountain of Rune', 'Demonic Ruins', 'Wilderness Agility Course', 'Pirates\' Hideout',
    'Lava Dragon Isle', 'Forinthry Dungeon', 'Frozen Waste Plateau', 'Heart of Gielinor'
  ],
  'Daemonheim': [
    'Daemonheim Peninsula', 'Frozen Floors', 'Abandoned Floors', 'Furnished Floors',
    'Occult Floors', 'Warped Floors'
  ],
  'Anachronia': [
    'Anachronia Base Camp', 'Orthen Dig Site', 'Anachronia Agility Course',
    'Anachronia Slayer Dungeon', 'Ranch Out of Time', 'Big Game Hunter'
  ],
  'The Arc': [
    'Waiko', 'Tuai Leit', 'Aminishi', 'Cyclosis', 'Goshima', 'Whale\'s Maw',
    'Islands That Once Were Turtles'
  ],
  'Havenhythe': [
    'Wendlewick', 'Amberfell', 'Highweald Forest', 'Moonrise Dig Site', 'Berylbrook',
    'Fenmoor', 'Linbog Village', 'Moonsylvar Wood'
  ],
  'Islands & Others': [
    'Ape Atoll', 'Zanaris', 'Puro-Puro', 'The Abyss', 'Dorgesh-Kaan', 'Mazcab',
    'Everlight', 'Stormguard Citadel', 'Infernal Source', 'Warforge', 'Ashdale'
  ]
};

export const REGIONS_LIST = Object.values(REGION_GROUPS).flat();

export const BOSSES_LIST = [
  // Elite dungeons & raids
  'Temple of Aminishi', 'Dragonkin Laboratory', 'The Shadow Reef', 'Zamorakian Undercity',
  'Liberation of Mazcab',
  // High-level
  'Vorago', 'Telos', 'Solak', 'Araxxor', 'Nex: Angel of Death', 'Raksha', 'Arch-Glacor',
  'Kerapac', 'Zamorak, Lord of Chaos', 'TzKal-Zuk', 'Rasial', 'Sanctum of Rebirth',
  'Barrows: Rise of the Six', 'Kalphite King', 'Amascut, the Devourer', 'The Magister',
  // God Wars Dungeons
  'Nex', 'General Graardor', 'Commander Zilyana', 'Kree\'arra', 'K\'ril Tsutsaroth',
  'Helwyr', 'Twin Furies', 'Gregorovic', 'Vindicta & Gorvek',
  // Mid-level
  'Corporeal Beast', 'Queen Black Dragon', 'Legiones', 'Har-Aken', 'Dagannoth Kings',
  'Kalphite Queen', 'Exiled Kalphite Queen', 'Black Stone Dragon', 'Hermod',
  'Zemouregal & Vorkath', 'Rex Matriarchs', 'Flesh-hatcher Mhekarnahz',
  // Entry / skilling
  'Giant Mole', 'King Black Dragon', 'Chaos Elemental', 'Barrows Brothers', 'Bork',
  'TzHaar Fight Cave', 'Skeletal Horror', 'Croesus', 'Gate of Elidinis',
  'Ivar, King of Bones', 'Silverquill, the Dreadhog'
];

export const MINIGAMES_LIST = [
  // Distractions & Diversions
  'Shooting Stars', 'Evil Tree', 'Penguin Hide and Seek', 'Guthixian Caches',
  'Wilderness Warbands', 'Goebie Supply Run', 'Big Chinchompa', 'Phoenix Lair',
  'Rush of Blood', 'Sinkholes', 'Herby Werby', 'Fish Flingers', 'Wilderness Flash Events',
  // Combat minigames
  'Barbarian Assault', 'Castle Wars', 'Clan Wars', 'Soul Wars', 'Stealing Creation',
  'Fist of Guthix', 'Pest Control', 'Heist', 'Shattered Worlds', 'Dominion Tower',
  'TzHaar Fight Pit', 'Duel Arena', 'Troll Invasion', 'Champion\'s Challenge',
  // Skilling minigames
  'Great Orb Project', 'Trouble Brewing', 'Temple Trekking', 'Fishing Trawler',
  'Gnome Restaurant', 'Mage Training Arena', 'Pyramid Plunder', 'Sorceress\'s Garden',
  'Blast Furnace', 'Artisans\' Workshop', 'Livid Farm', 'Tears of Guthix',
  'Brimhaven Agility Arena', 'Shades of Mort\'ton', 'Tai Bwo Wannai Cleanup',
  'Warriors\' Guild', 'Burthorpe Games Room', 'Rat Pits', 'Runespan', 'Impetuous Impulses',
  'Player-Owned Ports', 'Deep Sea Fishing', 'Ranch Out of Time', 'Big Game Hunter',
  'Flash Powder Factory', 'Conquest'
];
