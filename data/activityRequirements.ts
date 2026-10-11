// Access requirements (skill levels + quests) for Activities & Utility content.
//
// Surfaced on activity cards next to the region tag so a player can see, at a
// glance, what gates an activity: the quest(s) and skill level(s) actually
// required to access/fight it in RuneScape 3. Recommended (not required) levels
// are NOT listed here — only hard gates. Bosses, guilds, minigames and
// transports were checked against the RuneScape Wiki.
//
// `note` carries gates that aren't a plain skill/quest (Quest Points, kill
// count, keys, item unlocks, virtual levels above 99, etc.). Skill gates stay
// within 1-99 because the unlock tiers cap at 99; the few RS3 gates above 99
// (e.g. 115 Slayer for the Magister) live in `note`.

export interface ActivityReq {
  /** Hard skill-level gates, e.g. { Slayer: 95 }. */
  skills?: Record<string, number>;
  /** Required quests (official RS3 titles = QUEST_DATA ids). */
  quests?: string[];
  /** Any gate that isn't a skill/quest. */
  note?: string;
}

export const ACTIVITY_REQUIREMENTS: Record<string, ActivityReq> = {
  // ===== Bosses: elite dungeons & raids ======================================
  'Dragonkin Laboratory': { note: 'Elite dungeon — 1-5 players (story mode solo).' },
  'The Shadow Reef': { note: 'Elite dungeon — 1-5 players, entered from the east shore of Daemonheim.' },
  'Temple of Aminishi': { note: 'Elite dungeon — needs access to the Arc (Aminishi).' },
  'Zamorakian Undercity': { note: 'Elite dungeon — Zamorak is fought at the end of a full clear.' },
  'Liberation of Mazcab': { note: 'Raid — Beastmaster Durzag & Yakamaru; 10-player teams via the Grouping System.' },

  // ===== Bosses: high-level ===================================================
  'Vorago': { note: 'Speak to Vorago in the Borehole once to become eligible.' },
  'Telos': { note: 'Ancient sigil — assembled from components dropped by all four Heart of Gielinor generals.' },
  'Raksha': { quests: ['Raksha, the Shadow Colossus'], note: 'Anachronia; speak to Laniakea after the quest.' },
  'Rasial': { quests: ['Alpha vs Omega'], note: 'The Necromancy quest line effectively needs 95 Necromancy.' },
  'Sanctum of Rebirth': { quests: ['Soul Searching'] },
  'Amascut, the Devourer': { quests: ['Eclipse of the Heart'] },
  'The Magister': { note: '115 Slayer and a Key to the Crossing (Sophanem Slayer Dungeon).' },
  'Nex: Angel of Death': { note: 'Ancient Prison access (God Wars Dungeon); no kill count needed.' },
  'TzKal-Zuk': { note: 'Fight through 17 waves of the TzekHaar Front first.' },
  'Barrows: Rise of the Six': { note: 'Group boss (2-5 players) in the Barrows crypts.' },

  // ===== Bosses: God Wars Dungeons ============================================
  'Nex': { quests: ['Troll Stronghold'], note: 'Ancient Prison: 40 Zaros kill count plus a frozen key from all four encampments (60 Strength OR 60 Agility for the boulder).' },
  'General Graardor': { skills: { Strength: 70 }, quests: ['Troll Stronghold'], note: '40 Bandos kill count.' },
  'Commander Zilyana': { skills: { Agility: 70 }, quests: ['Troll Stronghold'], note: '40 Saradomin kill count.' },
  "Kree'arra": { skills: { Ranged: 70 }, quests: ['Troll Stronghold'], note: '40 Armadyl kill count.' },
  "K'ril Tsutsaroth": { skills: { Constitution: 70 }, quests: ['Troll Stronghold'], note: '40 Zamorak kill count.' },
  'Helwyr': { skills: { Magic: 80 }, note: 'Heart of Gielinor — 40 Seren kill count.' },
  'Twin Furies': { skills: { Ranged: 80 }, note: 'Heart of Gielinor — 40 Zamorak kill count.' },
  'Gregorovic': { skills: { Prayer: 80 }, note: 'Heart of Gielinor — 40 Sliske kill count.' },
  'Vindicta & Gorvek': { skills: { Attack: 80 }, note: 'Heart of Gielinor — 40 Zaros kill count.' },

  // ===== Bosses: mid-level =====================================================
  'Queen Black Dragon': { skills: { Summoning: 60 } },
  'Legiones': { skills: { Slayer: 95 }, note: 'Ascension Keystones; 81 Slayer to enter the Monastery of Ascension.' },
  'Har-Aken': { quests: ['The Elder Kiln'], note: 'Final wave of the Fight Kiln — needs a fire cape.' },
  'Hermod': { quests: ['The Spirit of War'] },
  'Zemouregal & Vorkath': { quests: ['Battle of Forinthry'] },
  'Rex Matriarchs': { note: 'Anachronia access; Osseous needs the quest Osseous Rex.' },
  'Black Stone Dragon': { note: 'Final boss of the Dragonkin Laboratory elite dungeon.' },

  // ===== Bosses: entry / skilling ==============================================
  'Bork': { quests: ['What Lies Below'], note: 'Once per day, Chaos Tunnels.' },
  'Skeletal Horror': { skills: { Slayer: 72, Prayer: 30 }, note: "Rag and Bone Man + Fur 'n Seek wish lists completed." },
  'Gate of Elidinis': { quests: ['Ode of the Devourer'] },
  'Barrows Brothers': { quests: ['Priest in Peril'], note: 'Morytania access through Paterdomus.' },

  // ===== Guilds ===============================================================
  "Champions' Guild": { note: '33 Quest Points.' },
  "Cooks' Guild": { skills: { Cooking: 32 }, note: "Wear a chef's hat (or Cooking cape / Varrock hard achievements)." },
  'Crafting Guild': { skills: { Crafting: 40 } },
  'Mining Guild': { skills: { Mining: 60 } },
  'Fishing Guild': { skills: { Fishing: 68 } },
  "Heroes' Guild": { quests: ["Heroes' Quest"] },
  "Legends' Guild": { quests: ["Legends' Quest"] },
  'Ranging Guild': { skills: { Ranged: 40 } },
  "Warriors' Guild": { note: '99 Attack or 99 Strength, or 130 combined Attack + Strength.' },
  "Wizards' Guild": { skills: { Magic: 66 } },
  'Invention Guild': { skills: { Smithing: 80, Crafting: 80, Divination: 80 } },
  'Archaeology Guild': { skills: { Archaeology: 1 }, note: 'Complete the Archaeology tutorial at the Digsite.' },
  "Thieves' Guild": { skills: { Thieving: 5 }, quests: ['Buyers and Cellars'] },
  "Servants' Guild": { note: 'Hire servants for your player-owned house (Construction).' },
  'Max Guild': { quests: ["Plague's End"], note: 'Garden: 99 in any skill or a quest cape. Tower: 99 in every skill.' },

  // ===== Arcana (spellbooks, prayers & unlocks) ===============================
  'Ancient Magicks': { skills: { Magic: 50 }, quests: ['Desert Treasure'] },
  'Lunar Spellbook': { skills: { Magic: 65 }, quests: ['Lunar Diplomacy'] },
  'Ancient Curses': { skills: { Prayer: 50 }, quests: ['The Temple at Senntisten'], note: 'Soul Split at 92 Prayer, Turmoil at 95.' },
  'Piety': { skills: { Prayer: 70, Defence: 70 }, quests: ["King's Ransom"], note: 'Knight Waves training ground.' },
  'Rigour': { skills: { Prayer: 70, Defence: 70 }, quests: ["King's Ransom"], note: 'Knight Waves training ground.' },
  'Augury': { skills: { Prayer: 70, Defence: 70 }, quests: ["King's Ransom"], note: 'Knight Waves training ground.' },
  'Chivalry': { skills: { Prayer: 60, Defence: 65 }, quests: ["King's Ransom"], note: 'Knight Waves training ground.' },
  'Praesul Codex': { skills: { Prayer: 99 }, quests: ['The Temple at Senntisten'], note: 'Dropped by Nex: Angel of Death.' },
  'Bones to Peaches': { skills: { Magic: 60 }, note: 'Bought from the Mage Training Arena reward shop.' },
  'Dwarf Multicannon': { quests: ['Dwarf Cannon'] },
  'God Spells': { skills: { Magic: 60 }, note: 'Mage Arena (Kolodion) — Saradomin Strike / Claws of Guthix / Flames of Zamorak.' },
  'Greater Ability Codices': { note: 'Ability codices drop from high-level bosses; most need 90+ in the style.' },
  'Invention Perks': { skills: { Smithing: 80, Crafting: 80, Divination: 80 }, note: 'Invention is unlocked at the Invention Guild.' },
  'Archaeology Relics': { note: 'Relic powers are unlocked by restoring mysteries (Archaeology).' },
  'Necromancy Rituals': { quests: ['Necromancy!'], note: 'Um ritual site; Ungael site after Requiem for a Dragon.' },
  'Necromancy Incantations': { quests: ['Necromancy!'] },

  // ===== Minigames (hard gates only; many minigames have no requirement) =====
  'Pest Control': { note: 'Combat level 40+ (Novice lander).' },
  'Conquest': { note: 'Combat level 55+.' },
  'Dominion Tower': { note: 'At least 20 of the listed boss quests completed.' },
  "Champion's Challenge": { note: '33 Quest Points and a Champion\'s scroll.' },
  'Livid Farm': { skills: { Magic: 70, Agility: 60, Crafting: 60, Farming: 60, Construction: 50 }, quests: ['Lunar Diplomacy'], note: 'Lunar spellbook active.' },
  'Flash Powder Factory': { skills: { Thieving: 75, Agility: 75, Herblore: 50 } },
  'Deep Sea Fishing': { skills: { Fishing: 68 }, note: 'Talk to Goomah in the Fishing Guild.' },
  'Fishing Trawler': { skills: { Fishing: 15 } },
  'Player-Owned Ports': { note: 'Level 90 in at least one of the port skills to send voyages.' },
  'Rush of Blood': { skills: { Slayer: 85 }, quests: ["Plague's End"] },
  'Pyramid Plunder': { skills: { Thieving: 21 }, quests: ["Icthlarin's Little Helper"] },
  'Trouble Brewing': { skills: { Cooking: 40 }, quests: ['Cabin Fever'] },
  'Tai Bwo Wannai Cleanup': { quests: ['Jungle Potion'] },
  "Shades of Mort'ton": { quests: ["Shades of Mort'ton"] },
  'Temple Trekking': { quests: ['In Aid of the Myreque'] },
  'Impetuous Impulses': { skills: { Hunter: 17 }, quests: ['Lost City'] },
  'Rat Pits': { quests: ['Rat Catchers'] },
  'Tears of Guthix': { quests: ['Tears of Guthix'] },
  'Blast Furnace': { quests: ['The Giant Dwarf'], note: 'Keldagrim access; 60 Smithing to use it without paying the fee.' },
  "Sorceress's Garden": { note: 'Gardens gated by Thieving level (1 / 25 / 45 / 65).' },
  'Fist of Guthix': { note: 'Not available to Ironmen; at least four players.' },
  'Heist': { note: 'Not available to Ironmen; 2-5 players per team.' },
  'Goebie Supply Run': { note: 'Mazcab access.' },
  'Ranch Out of Time': { skills: { Farming: 42 }, note: 'Anachronia base camp upgrade.' },

  // ===== Mobility (quest-gated transport networks & items) ====================
  'Lodestone Network': { note: 'Each lodestone must be activated in person; some need quests (e.g. Prifddinas: Plague\'s End).' },
  'Fairy Rings': { note: 'Partway through the Fairy Tale quest series; a dramen/lunar staff until Fairy Tale III.' },
  'Spirit Trees': { quests: ['Tree Gnome Village'] },
  'Gnome Gliders': { quests: ['The Grand Tree'] },
  'Balloon Transport': { quests: ['Enlightened Journey'] },
  'Mine Carts': { quests: ['The Giant Dwarf'] },
  'Eagle Transport': { quests: ["Eagles' Peak"] },
  'Ectophial': { quests: ['Ghosts Ahoy'] },
  'Enchanted Lyre': { quests: ['The Fremennik Trials'] },
  'Camulet': { quests: ["Enakhra's Lament"] },
  "Drakan's Medallion": { quests: ['The Branches of Darkmeyer'] },
  'Crystal Teleport Seed': { quests: ["Mourning's End Part I"], note: 'Prifddinas destination needs Plague\'s End.' },
  'Ring of Fortune': { skills: { Crafting: 72, Magic: 87 }, note: 'Miscellania teleport needs Throne of Miscellania.' },
  'Ring of Kinship': { note: 'Free from the Daemonheim tutor.' },
  'Archaeology Journal': { note: 'Given during the Archaeology tutorial.' },
  'Wicked Hood': { note: 'Given by Tam McGrubor in Burthorpe; altar teleports need the Runecrafting level.' },
  'Sixth-Age Circuit': { quests: ['The World Wakes'] },
  'Max Guild Portals': { quests: ["Plague's End"], note: 'Max Guild access (99 in any skill).' },
  "Pharaoh's Sceptre": { note: 'Pyramid Plunder reward (Sophanem).' },
  'Abyss Teleport': { note: 'Mage of Zamorak in the Wilderness (Enter the Abyss miniquest).' },

  // ===== Farming patches (access/level-gated; basic patches need nothing) =====
  'Cactus': { skills: { Farming: 55 } },
  'Mushroom': { skills: { Farming: 53 } },
  'Belladonna': { skills: { Farming: 63 } },
  'Evil Turnip': { skills: { Farming: 42 } },
  'Calquat': { skills: { Farming: 72 } },
  'Jade Vine': { skills: { Farming: 78 }, quests: ['Back to my Roots'] },
  'Spirit Tree': { skills: { Farming: 83 } },
  'Elder Tree': { skills: { Farming: 90 } },
  'Player-Owned Farm': { skills: { Farming: 17 }, note: 'Manor Farm, north of Ardougne.' },
  'Dinosaur Farm': { skills: { Farming: 42 }, note: 'Ranch Out of Time, Anachronia.' },

  // ===== Player-owned house =====================================================
  // The July 2026 house rework replaced fixed room types with room layouts, so
  // only furniture-level gates that survived the rework are kept as notes.
  'Superior Garden Fairy Ring': { note: 'High-level garden furniture (Construction).' },
  'Superior Garden Spirit Tree': { quests: ['Tree Gnome Village'], note: 'High-level garden furniture (Construction + Farming).' },
  'Mounted Amulet of Glory': { note: 'Construction furniture — unlimited glory teleports.' },
  'Servant\'s Bedroom': { note: "Hire a servant from the Servants' Guild (Ardougne)." },

  // ===== Storage (notable sources) ==============================================
  'Bonecrusher': { note: 'Dungeoneering reward shop (Daemonheim).' },
  'Herbicide': { note: 'Dungeoneering reward shop (Daemonheim).' },
  'Charming Imp': { note: 'Dungeoneering reward shop (Daemonheim).' },
  'Gold Accumulator': { note: 'Dungeoneering reward shop (Daemonheim).' },
  'Seedicide': { note: 'Dungeoneering reward shop (Daemonheim).' },
  'Material Storage': { note: 'Invention material storage (Invention Guild).' },
  'Familiar Pack Yak': { skills: { Summoning: 96 } },
  'Essence Pouches': { note: 'Larger pouches need higher Runecrafting.' },
  'Sign of the Porter': { note: 'Crafted with Divination energy.' },
};

export const getActivityReq = (item: string): ActivityReq | undefined =>
  ACTIVITY_REQUIREMENTS[item];
