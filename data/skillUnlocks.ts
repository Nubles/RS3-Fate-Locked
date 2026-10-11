/**
 * RS3 skill unlocks, keyed by skill (exactly as in SKILLS_LIST) → tier → notes.
 *
 * Tier N opens the +10 level band (tier 1 = levels 1–10 … tier 9 = 81–90,
 * tier 10 = 91–99). Each entry is a notable RuneScape 3 unlock at that level,
 * sourced from the RS3 wiki "<Skill>/Level up table" pages. Levels above 99
 * (to 110/120) are out of scope for tiers; tier 10 covers 99 and implies the
 * post-99 content too.
 */
export const SKILL_UNLOCK_DATA: Record<string, Record<number, string[]>> = {
  'Attack': {
    1: [
      'Lvl 1: Wield bronze weapons',
      'Lvl 1: Slice & Slaughter abilities',
      'Lvl 5: Havoc ability',
      'Lvl 10: Wield iron weapons',
      'Lvl 10: Backhand ability',
    ],
    2: [
      'Lvl 15: Forceful Backhand ability',
      'Lvl 20: Wield steel weapons',
      'Lvl 20: Smash ability',
    ],
    3: [
      'Lvl 25: Wield black weapons',
      'Lvl 30: Wield mithril weapons',
      'Lvl 30: Barge ability',
    ],
    4: [
      'Lvl 37: Flurry ability',
      'Lvl 40: Wield adamant weapons',
    ],
    5: [
      'Lvl 45: Sever ability',
      'Lvl 45: Gravite weapons (Dungeoneering)',
      'Lvl 50: Wield rune weapons',
    ],
    6: [
      'Lvl 55: Hurricane ability',
      'Lvl 55: Granite maul / mace',
      'Lvl 60: Wield dragon & orikalkum weapons',
    ],
    7: [
      'Lvl 65: Bladed Dive ability',
      'Lvl 66: Massacre ability',
      'Lvl 70: Abyssal whip, Barrows & necronium weapons',
      'Lvl 70: Blisterwood polearm',
    ],
    8: [
      'Lvl 75: Godswords & Saradomin sword',
      'Lvl 75: Abyssal vine whip & Balmung',
      'Lvl 78: Korasi\'s sword & Ancient Warriors\' weapons',
      'Lvl 80: Chaotic weapons (Dungeoneering) & bane weapons',
    ],
    9: [
      'Lvl 81: Meteor Strike ability',
      'Lvl 82: Khopesh of the Kharidian & Masuta\'s warspear',
      'Lvl 85: Blade of Nymora & Blade of Avaryss',
      'Lvl 90: Drygore weapons, Noxious scythe & elder rune weapons',
    ],
    10: [
      'Lvl 92: Zaros godsword, Khopesh of Tumeken & Abyssal scourge',
      'Lvl 95: Dark Shard / Sliver of Leng',
      'Lvl 99: Skill Mastery (Attack cape)',
    ],
  },

  'Constitution': {
    1: [
      'Passive: +100 life points per Constitution level',
      'Lvl 10: Starting level — 1,000 life points',
      'Lvl 10: Portent of restoration I (Daemonheim)',
    ],
    2: [
      'Lvl 15: Portent of restoration II',
      'Lvl 20: Siphon ability',
      'Lvl 20: 2,000 life points',
    ],
    3: [
      'Lvl 24: Incite ability',
      'Lvl 25: Portent of restoration III',
      'Lvl 30: 3,000 life points',
    ],
    4: [
      'Lvl 35: Portent of restoration IV',
      'Lvl 40: 4,000 life points',
    ],
    5: [
      'Lvl 42: Void Knight equipment (with other 42s)',
      'Lvl 50: Start Salt in the Wound',
      'Lvl 50: Tuska\'s Wrath ability',
      'Lvl 50: 5,000 life points',
    ],
    6: [
      'Lvl 60: Portent of restoration (higher tiers)',
      'Lvl 60: 6,000 life points',
    ],
    7: [
      'Lvl 70: Enter Zamorak\'s Fortress (God Wars Dungeon)',
      'Lvl 70: Storm Shards & Shatter abilities',
      'Lvl 70: 7,000 life points',
    ],
    8: [
      'Lvl 74: Vital Drain ability (codex)',
      'Lvl 75: Start The Lord of Vampyrium',
      'Lvl 76: Start The Firemaker\'s Curse',
      'Lvl 78: Start The Mighty Fall',
      'Lvl 80: Wear Torva, Pernix & Virtus (with 80 Defence)',
    ],
    9: [
      'Lvl 82: Vampyre Slayer ability (codex)',
      'Lvl 85: Guthix\'s Blessing ability',
      'Lvl 90: Onslaught ability',
      'Lvl 90: 9,000 life points',
    ],
    10: [
      'Lvl 91: Ice Asylum ability (Codex Ultimatus)',
      'Lvl 99: 9,900 life points',
      'Lvl 99: Skill Mastery (Constitution cape)',
    ],
  },

  'Mining': {
    1: [
      'Lvl 1: Copper, tin & clay; bronze pickaxe',
      'Lvl 1: Common gem rocks (opal, lapis lazuli)',
      'Lvl 7: Ore box stores copper & tin',
      'Lvl 10: Iron, blurite & limestone; iron pickaxe',
    ],
    2: [
      'Lvl 15: Energetic Mining (stamina boost)',
      'Lvl 18: Ore box stores iron',
      'Lvl 20: Coal & silver; steel pickaxe',
      'Lvl 20: Uncommon gem rocks',
    ],
    3: [
      'Lvl 29: Ore box stores coal',
      'Lvl 30: Mithril ore; mithril pickaxe',
    ],
    4: [
      'Lvl 35: Sandstone',
      'Lvl 37: Ore box stores mithril',
      'Lvl 40: Adamantite, luminite & gold; adamant pickaxe',
    ],
    5: [
      'Lvl 45: Granite',
      'Lvl 46: Rubium (Kennith\'s Concerns)',
      'Lvl 50: Runite ore; rune pickaxe',
      'Lvl 50: Concentrated sandstone',
    ],
    6: [
      'Lvl 55: Ore box stores runite',
      'Lvl 60: Orichalcite & drakolith',
      'Lvl 60: Mining Guild access',
      'Lvl 60: Orikalkum & dragon pickaxes',
    ],
    7: [
      'Lvl 66: Ore box stores orichalcite & drakolith',
      'Lvl 70: Necrite & phasmatite',
      'Lvl 70: Necronium & crystal pickaxes',
      'Lvl 70: Concentrated coal (Living Rock Caverns)',
    ],
    8: [
      'Lvl 72: Ore box stores necrite & phasmatite',
      'Lvl 80: Banite ore',
      'Lvl 80: Bane & Imcando pickaxes',
      'Lvl 80: Concentrated gold (Living Rock Caverns)',
    ],
    9: [
      'Lvl 85: Ore box stores banite',
      'Lvl 89: Seren stones (Prifddinas)',
      'Lvl 90: Light & dark animica',
      'Lvl 90: Elder rune pickaxe',
    ],
    10: [
      'Lvl 95: Ore box stores light & dark animica',
      'Lvl 99: Skill Mastery (Mining cape)',
      'Note: 100+ opens primal ore, porcelain clay & platinum',
    ],
  },

  'Strength': {
    1: [
      'Passive: Critical strike damage rises every 10 levels from 20',
      'Lvl 1: Dwarven army axe',
      'Lvl 8: Start Zogre Flesh Eaters',
    ],
    2: [
      'Lvl 15: Leaping trout (Barbarian Fishing, with 15 Agility)',
      'Lvl 19: Lumbridge Swamp river crossing to Al Kharid',
      'Lvl 20: Full slayer helmet (Smoking Kills)',
      'Lvl 20: +15% critical strike damage',
    ],
    3: [
      'Lvl 21: Karamja mith grapple crossing',
      'Lvl 22: Grapple shortcut Water Obelisk → Catherby',
      'Lvl 30: Leaping salmon (Barbarian Fishing)',
    ],
    4: [
      'Lvl 35: Barehanded tuna',
      'Lvl 35: White Wolf Mountain cliff climb',
      'Lvl 37: Falador wall shortcut',
      'Lvl 40: Barrelchest anchor (60 Attack)',
    ],
    5: [
      'Lvl 42: Void Knight mace & armour',
      'Lvl 45: Leaping sturgeon (Barbarian Fishing)',
      'Lvl 46: Start The Chosen Commander',
      'Lvl 50: Barehanded swordfish',
    ],
    6: [
      'Lvl 55: Granite maul & mace',
      'Lvl 60: TzHaar-Ket-Om',
      'Lvl 60: God Wars Dungeon Strength entrance',
    ],
    7: [
      'Lvl 64: Start The Curse of Arrav',
      'Lvl 69: Start Forgiveness of a Chaos Dwarf',
      'Lvl 70: Bandos Stronghold (God Wars Dungeon)',
      'Lvl 70: Dharok\'s greataxe & Torag\'s hammers',
    ],
    8: [
      'Lvl 75: Balmung (Blood Runs Deep)',
      'Lvl 76: Barehanded shark',
      'Lvl 77: Start King of the Dwarves',
      'Lvl 79: Start The Mighty Fall',
      'Lvl 80: Dorgesh-Kaan cave crossing',
    ],
    9: [
      'Lvl 85: Start Birthright of the Dwarves',
      'Lvl 90: +50% critical strike damage',
      'Lvl 90: Promethium maul (Dungeoneering)',
    ],
    10: [
      'Lvl 95: Ek-ZekKil',
      'Lvl 99: Primal maul (Dungeoneering)',
      'Lvl 99: Skill Mastery (Strength cape)',
    ],
  },

  'Agility': {
    1: [
      'Lvl 1: Burthorpe Agility Course',
      'Lvl 1: Gnome Stronghold Agility Course',
      'Lvl 1: Brimhaven Agility Arena (low obstacles)',
      'Lvl 5: Falador west bank shortcut',
      'Lvl 8: Lumbridge Swamp river crossing',
      'Lvl 10: Rope swing to Moss Giant Island',
    ],
    2: [
      'Lvl 11: Falador wall shortcut',
      'Lvl 15: Edgeville Dungeon monkey bars',
      'Lvl 15: Barbarian Fishing (with 15 Strength)',
      'Lvl 16: Yanille underwall tunnel',
      'Lvl 20: Brimhaven Arena medium obstacles',
    ],
    3: [
      'Lvl 21: Grand Exchange underwall tunnel',
      'Lvl 23: Start Death to the Dorgeshuun',
      'Lvl 25: Eagles\' Peak shortcut & Werewolf Skullball',
      'Lvl 30: Agility Pyramid',
      'Lvl 30: Penguin Agility Course (Cold War)',
      'Lvl 30: Anachronia Agility Course (beginner)',
    ],
    4: [
      'Lvl 31: River Lum stepping stones',
      'Lvl 35: Barbarian Outpost Agility Course',
      'Lvl 37: Grand Tree north-west shortcut',
      'Lvl 40: Brimhaven Arena high obstacles',
    ],
    5: [
      'Lvl 45: Isafdar log balance',
      'Lvl 48: Ape Atoll Agility Course',
      'Lvl 48: Start Recipe for Disaster',
      'Lvl 50: Anachronia course (novice sections)',
    ],
    6: [
      'Lvl 51: Edgeville Dungeon ↔ Varrock Sewers crevice',
      'Lvl 52: Wilderness Agility Course',
      'Lvl 60: Werewolf Agility Course',
      'Lvl 60: Bandos Agility Course (60 Ranged & Strength)',
      'Lvl 60: God Wars Dungeon Agility entrance',
    ],
    7: [
      'Lvl 65: Het\'s Oasis Agility Course',
      'Lvl 65: Paterdomus → Morytania shortcut',
      'Lvl 66: Zanaris walkway to the Cosmic altar',
      'Lvl 70: Saradomin Encampment rope descent (GWD)',
      'Lvl 70: Anachronia course (advanced sections)',
    ],
    8: [
      'Lvl 74: Shilo Village stepping stones',
      'Lvl 75: Hefin Serenity Posts (Prifddinas)',
      'Lvl 77: Hefin Agility Course (Prifddinas)',
      'Lvl 80: Dorgesh-Kaan Agility Course',
    ],
    9: [
      'Lvl 85: Advanced Gnome Stronghold Agility Course',
      'Lvl 85: Full Anachronia Agility Course',
      'Lvl 86: Kuradal\'s Dungeon wall climb',
      'Lvl 90: Advanced Barbarian Outpost Agility Course',
    ],
    10: [
      'Lvl 94: Gemstone Cavern shortcut',
      'Lvl 99: Wilderness Agility Course no longer fails',
      'Lvl 99: Skill Mastery (Agility cape)',
    ],
  },

  'Smithing': {
    1: [
      'Lvl 1: Smelt & smith bronze',
      'Lvl 4: Heat cap increases begin',
      'Lvl 9: Extra bar chance begins',
      'Lvl 10: Smelt & smith iron',
    ],
    2: [
      'Lvl 20: Smelt & smith steel',
      'Lvl 20: Silver bars',
    ],
    3: [
      'Lvl 30: Smelt & smith mithril',
    ],
    4: [
      'Lvl 35: Cannonballs (Dwarf Cannon)',
      'Lvl 40: Smelt & smith adamant',
      'Lvl 40: Gold bars',
      'Lvl 40: Artisans\' Workshop adamant burial armour',
    ],
    5: [
      'Lvl 50: Smelt & smith rune',
      'Lvl 50: Artisans\' Workshop rune burial armour',
    ],
    6: [
      'Lvl 60: Smelt & smith orikalkum',
      'Lvl 60: Artisans\' Workshop orikalkum burial armour',
    ],
    7: [
      'Lvl 70: Smelt & smith necronium',
      'Lvl 70: Artisans\' Workshop necronium burial armour',
    ],
    8: [
      'Lvl 80: Smelt & smith bane',
      'Lvl 80: Invention requirement (with 80 Crafting & Divination)',
    ],
    9: [
      'Lvl 90: Smelt & smith elder rune',
      'Lvl 90: Artisans\' Workshop elder rune burial armour',
    ],
    10: [
      'Lvl 95: Dark Shard of Leng (with 95 Crafting)',
      'Lvl 99: Masterwork smithing (promethium → masterwork armour)',
      'Lvl 99: Skill Mastery (Smithing cape)',
    ],
  },

  'Defence': {
    1: [
      'Lvl 1: Bronze armour, soft leather & wizard robes',
      'Lvl 3: Anticipation ability',
      'Lvl 8: Bash ability',
      'Lvl 10: Iron armour, hard leather & imphide',
    ],
    2: [
      'Lvl 15: Revenge ability',
      'Lvl 20: Steel armour, studded body & combat robes',
    ],
    3: [
      'Lvl 24: Provoke ability',
      'Lvl 25: Black armour',
      'Lvl 29: Immortality ability',
      'Lvl 30: Mithril armour, snakeskin & carapace',
    ],
    4: [
      'Lvl 34: Freedom ability',
      'Lvl 37: Reflect ability',
      'Lvl 40: Adamant armour & green dragonhide',
    ],
    5: [
      'Lvl 42: Void Knight equipment',
      'Lvl 45: Berserker & warrior/archer/farseer helms',
      'Lvl 48: Resonance ability',
      'Lvl 50: Rune armour, Mystic robes & blue dragonhide',
      'Lvl 50: Rock-shell, spined & skeletal armour',
    ],
    6: [
      'Lvl 52: Rejuvenate ability',
      'Lvl 55: Debilitate ability',
      'Lvl 55: Helm of Neitiznot, granite & red dragonhide',
      'Lvl 60: Dragon & orikalkum armour, black dragonhide',
    ],
    7: [
      'Lvl 65: Third-age armour & royal dragonhide',
      'Lvl 67: Preparation ability',
      'Lvl 70: Barrows, Bandos & Armadyl armour',
      'Lvl 70: Subjugation robes & necronium armour',
      'Lvl 70: Dragonfire shield',
    ],
    8: [
      'Lvl 75: Spirit shields (divine/elysian) & ganodermic armour',
      'Lvl 75: Undead dragonhide',
      'Lvl 80: Torva, Pernix & Virtus',
      'Lvl 80: Bane armour & Anima cores',
      'Lvl 80: Barricade ability',
    ],
    9: [
      'Lvl 85: Battle-mage, Vanguard & Trickster armour',
      'Lvl 85: Death Lotus, Tetsu & Sea Singer armour',
      'Lvl 90: Malevolent, Sirenic & Tectonic armour',
      'Lvl 90: Masterwork & elder rune armour',
    ],
    10: [
      'Lvl 92: Elite Sirenic/Tectonic & trimmed Masterwork',
      'Lvl 92: Elite Dracolich armour',
      'Lvl 95: Vestments of havoc & Robes of the First Necromancer',
      'Lvl 99: Skill Mastery (Defence cape)',
    ],
  },

  'Herblore': {
    1: [
      'Lvl 1: Attack potion',
      'Lvl 3: Ranging potion',
      'Lvl 5: Magic potion',
      'Lvl 7: Strength potion',
      'Lvl 9: Defence potion',
    ],
    2: [
      'Lvl 13: Antipoison',
      'Lvl 18: Guthix rest tea',
      'Lvl 20: Clean harralander',
    ],
    3: [
      'Lvl 22: Restore potion',
      'Lvl 25: Clean ranarr',
      'Lvl 26: Energy potion',
    ],
    4: [
      'Lvl 34: Agility potion',
      'Lvl 36: Combat potion',
      'Lvl 38: Prayer potion',
      'Lvl 40: Summoning potion',
    ],
    5: [
      'Lvl 45: Super attack potion',
      'Lvl 43: Divination potion',
      'Lvl 48: Super antipoison',
      'Lvl 50: Fishing potion',
    ],
    6: [
      'Lvl 52: Super energy',
      'Lvl 53: Hunter potion',
      'Lvl 54: Juju hunter potions (Herblore Habitat)',
      'Lvl 55: Super strength potion',
      'Lvl 60: Weapon poison',
    ],
    7: [
      'Lvl 63: Super restore potion',
      'Lvl 66: Super defence potion',
      'Lvl 69: Antifire potion',
    ],
    8: [
      'Lvl 72: Super ranging potion',
      'Lvl 75: Saradomin\'s blessing, Guthix\'s gift & Zamorak\'s favour',
      'Lvl 78: Grand attack potion & Zamorak brew',
      'Lvl 77: Invention potion',
    ],
    9: [
      'Lvl 81: Saradomin brew',
      'Lvl 82: Aggression potion',
      'Lvl 88: Extreme attack',
      'Lvl 89: Extreme strength',
      'Lvl 90: Extreme defence',
    ],
    10: [
      'Lvl 91: Extreme magic',
      'Lvl 92: Extreme ranging',
      'Lvl 93: Supreme potions',
      'Lvl 96: Overload',
      'Lvl 97: Holy overload',
      'Lvl 98: Supreme overload',
      'Lvl 99: Skill Mastery (Herblore cape)',
    ],
  },

  'Fishing': {
    1: [
      'Lvl 1: Shrimp, crayfish & minnows',
      'Lvl 5: Sardines',
      'Lvl 10: Herring',
    ],
    2: [
      'Lvl 15: Anchovies',
      'Lvl 20: Trout',
    ],
    3: [
      'Lvl 23: Cod',
      'Lvl 25: Pike',
      'Lvl 30: Salmon',
    ],
    4: [
      'Lvl 35: Tuna',
      'Lvl 38: Rainbow fish',
      'Lvl 40: Lobster',
    ],
    5: [
      'Lvl 46: Bass',
      'Lvl 48: Leaping trout (Barbarian Fishing)',
      'Lvl 50: Swordfish',
    ],
    6: [
      'Lvl 52: Desert sole (Menaphos)',
      'Lvl 53: Lava eels',
      'Lvl 55: Barehanded tuna',
      'Lvl 58: Leaping salmon',
      'Lvl 60: Catfish',
    ],
    7: [
      'Lvl 62: Monkfish',
      'Lvl 65: Karambwan',
      'Lvl 66: Ghostly soles',
      'Lvl 68: Fishing Guild & Deep Sea Fishing hub',
      'Lvl 70: Leaping sturgeon & barehanded swordfish',
    ],
    8: [
      'Lvl 72: Beltfish',
      'Lvl 75: Floating crystals (Prifddinas)',
      'Lvl 76: Sharks',
      'Lvl 79: Sea turtles',
      'Lvl 80: Great white sharks',
    ],
    9: [
      'Lvl 81: Manta rays',
      'Lvl 82: Giant crayfish',
      'Lvl 85: Cavefish',
      'Lvl 88: Fungal algae',
      'Lvl 90: Rocktails',
    ],
    10: [
      'Lvl 91: Seerfish & blue blubber jellyfish',
      'Lvl 94: Fishing Frenzy (Deep Sea hub)',
      'Lvl 96: Barehanded sharks',
      'Lvl 97: Sailfish',
      'Lvl 99: Skill Mastery (Fishing cape)',
    ],
  },

  'Ranged': {
    1: [
      'Lvl 1: Shortbow, shieldbow & bronze crossbow',
      'Lvl 2: Snapshot ability',
      'Lvl 5: Oak bows',
      'Lvl 10: Iron javelins & throwing knives',
    ],
    2: [
      'Lvl 13: Piercing Shot ability',
      'Lvl 16: Blurite crossbow',
      'Lvl 20: Willow bows & steel thrown weapons',
    ],
    3: [
      'Lvl 21: Deadshot ability',
      'Lvl 25: Black knives & darts',
      'Lvl 26: Iron crossbow',
      'Lvl 30: Maple bows & mithril thrown weapons',
    ],
    4: [
      'Lvl 31: Binding Shot ability',
      'Lvl 33: Black crossbow',
      'Lvl 36: Bombardment ability',
      'Lvl 40: Yew bows & adamant thrown weapons',
    ],
    5: [
      'Lvl 45: Chinchompas',
      'Lvl 45: Gravite shortbow (Dungeoneering)',
      'Lvl 46: Adamant crossbow',
      'Lvl 50: Magic bows, rune crossbow & Seercull',
    ],
    6: [
      'Lvl 55: God bows (Saradomin/Guthix/Zamorak)',
      'Lvl 55: Red chinchompas',
      'Lvl 58: Galeshot ability',
      'Lvl 60: Dragon crossbow & darts',
    ],
    7: [
      'Lvl 62: Rapid Fire ability',
      'Lvl 67: Ricochet ability',
      'Lvl 70: Dark bow, Crystal bow & Karil\'s crossbow',
      'Lvl 70: Corruption Shot ability',
    ],
    8: [
      'Lvl 75: Armadyl crossbow & hand cannon',
      'Lvl 76: Death\'s Swiftness ability',
      'Lvl 78: Morrigan\'s javelins & throwing axes',
      'Lvl 80: Royal crossbow, Zaryte bow & Chaotic crossbow',
    ],
    9: [
      'Lvl 85: Death Lotus darts',
      'Lvl 90: Noxious longbow & Ascension crossbows',
      'Lvl 90: Hellfire bow & Kalphite repriser',
    ],
    10: [
      'Lvl 92: Seren godbow & Eldritch crossbow',
      'Lvl 95: Bow of the Last Guardian',
      'Lvl 99: Skill Mastery (Ranged cape)',
    ],
  },

  'Thieving': {
    1: [
      'Lvl 1: Pickpocket men & women',
      'Lvl 2: Vegetable, baker\'s, tea & crafting stalls',
      'Lvl 10: Pickpocket farmers',
    ],
    2: [
      'Lvl 13: Simple chests (Ardougne)',
      'Lvl 15: Pickpocket H.A.M. members',
    ],
    3: [
      'Lvl 21: Pyramid Plunder room 1',
      'Lvl 22: Wine stall',
      'Lvl 25: Pickpocket warriors',
      'Lvl 27: Seed stall',
    ],
    4: [
      'Lvl 31: Pyramid Plunder room 2',
      'Lvl 32: Pickpocket rogues',
      'Lvl 35: Fur stall',
      'Lvl 38: Pickpocket Master farmers',
      'Lvl 40: Pickpocket guards',
    ],
    5: [
      'Lvl 41: Pyramid Plunder room 3',
      'Lvl 42: Pickpocket Crux Eqal druids & fish stall',
      'Lvl 46: Menaphos marketeers',
      'Lvl 50: Silver stall & shifting tombs',
    ],
    6: [
      'Lvl 51: Pyramid Plunder room 4',
      'Lvl 53: Pickpocket desert bandits',
      'Lvl 55: Pickpocket Knights of Ardougne',
    ],
    7: [
      'Lvl 62: Misthalin safecracking',
      'Lvl 64: Pickpocket Wizards\' Tower mages',
      'Lvl 65: Menaphite thugs; magic, scimitar & spice stalls',
      'Lvl 69: Kharidian Desert safecracking',
      'Lvl 70: Pickpocket paladins',
    ],
    8: [
      'Lvl 75: Pickpocket gnomes; gem stall',
      'Lvl 76: Asgarnia safecracking',
      'Lvl 78: Pickpocket archaeologists',
      'Lvl 80: Pickpocket heroes',
    ],
    9: [
      'Lvl 81: Pyramid Plunder room 7',
      'Lvl 83: Pickpocket Crux Eqal knights',
      'Lvl 83: Kandarin safecracking',
      'Lvl 85: Pickpocket elves (Prifddinas)',
      'Lvl 90: Hidden safes',
    ],
    10: [
      'Lvl 91: Pyramid Plunder room 8',
      'Lvl 91: Prifddinas clan workers (91–98)',
      'Lvl 95: Vault of Hereditas heist',
      'Lvl 99: Skill Mastery (Thieving cape)',
    ],
  },

  'Cooking': {
    1: [
      'Lvl 1: Shrimp, anchovies, crayfish & sardines',
      'Lvl 5: Herring',
      'Lvl 10: Redberry pie',
    ],
    2: [
      'Lvl 14: Cider',
      'Lvl 15: Trout',
      'Lvl 18: Cod',
      'Lvl 20: Pike & meat pie',
    ],
    3: [
      'Lvl 25: Salmon & stew',
      'Lvl 30: Tuna & apple pie',
    ],
    4: [
      'Lvl 32: Cooks\' Guild access',
      'Lvl 35: Plain pizza',
      'Lvl 40: Lobster',
    ],
    5: [
      'Lvl 43: Bass',
      'Lvl 45: Swordfish & meat pizza',
      'Lvl 47: Fish pie',
    ],
    6: [
      'Lvl 55: Anchovy pizza',
      'Lvl 60: Curry',
    ],
    7: [
      'Lvl 62: Monkfish',
      'Lvl 64: Cooking gauntlets stop burning lobster/swordfish',
      'Lvl 65: Pineapple pizza',
      'Lvl 70: Admiral pie',
    ],
    8: [
      'Lvl 72: Beltfish & green blubber jellyfish',
      'Lvl 80: Shark',
    ],
    9: [
      'Lvl 82: Sea turtle',
      'Lvl 84: Great white shark',
      'Lvl 85: Wild pie',
      'Lvl 88: Cavefish',
    ],
    10: [
      'Lvl 91: Manta ray',
      'Lvl 93: Rocktail',
      'Lvl 95: Tiger shark & summer pie',
      'Lvl 99: Sailfish',
      'Lvl 99: Skill Mastery (Cooking cape)',
    ],
  },

  'Prayer': {
    1: [
      'Lvl 1: Thick Skin',
      'Lvl 4: Burst of Strength',
      'Lvl 7: Clarity of Thought',
      'Lvl 8: Sharp Eye & Unrelenting Force',
      'Lvl 9: Mystic Will & Charge',
      'Lvl 10: Rock Skin',
    ],
    2: [
      'Lvl 13: Superhuman Strength',
      'Lvl 16: Improved Reflexes',
      'Lvl 19: Rapid Restore',
      'Lvl 20: Proselyte armour',
    ],
    3: [
      'Lvl 22: Rapid Heal',
      'Lvl 25: Protect Item',
      'Lvl 26: Hawk Eye & Overpowering Force',
      'Lvl 27: Mystic Lore & Super Charge',
      'Lvl 28: Steel Skin',
    ],
    4: [
      'Lvl 31: Ultimate Strength',
      'Lvl 34: Incredible Reflexes',
      'Lvl 35: Protect from Summoning',
      'Lvl 37: Protect from Magic',
      'Lvl 40: Protect from Ranged',
    ],
    5: [
      'Lvl 43: Protect from Melee',
      'Lvl 44: Eagle Eye & Unstoppable Force',
      'Lvl 45: Mystic Might & Overcharge',
      'Lvl 49: Redemption',
      'Lvl 50: Ancient Curses (The Temple at Senntisten)',
    ],
    6: [
      'Lvl 52: Smite',
      'Lvl 52: Sap curses (52–58)',
      'Lvl 59: Berserker curse',
      'Lvl 60: Chivalry',
    ],
    7: [
      'Lvl 62: Deflect Summoning',
      'Lvl 65: Deflect Magic & Rapid Renewal',
      'Lvl 68: Deflect Missiles',
      'Lvl 70: Piety, Rigour & Augury',
    ],
    8: [
      'Lvl 71: Deflect Melee',
      'Lvl 74: Leech curses (74–86)',
      'Lvl 75: Eclipsed Soul',
      'Lvl 75: Start Plague\'s End',
    ],
    9: [
      'Lvl 85: Divine Rage',
      'Lvl 89: Wrath',
      'Lvl 90: Sigil crafting & demon horn necklaces',
    ],
    10: [
      'Lvl 92: Soul Split',
      'Lvl 94: Fortitude',
      'Lvl 95: Turmoil, Anguish & Torment',
      'Lvl 99: Malevolence, Desolation & Affliction',
      'Lvl 99: Skill Mastery (Prayer cape)',
    ],
  },

  'Crafting': {
    1: [
      'Lvl 1: Leather armour & opal cutting',
      'Lvl 5: Gold rings',
      'Lvl 8: Gold amulets',
    ],
    2: [
      'Lvl 11: Leather vambraces',
      'Lvl 12: Oil lamps & fragile urns',
      'Lvl 13: Cut jade',
      'Lvl 16: Cut red topaz',
      'Lvl 20: Cut sapphire & sapphire jewellery',
    ],
    3: [
      'Lvl 23: Spider silk robes',
      'Lvl 26: Oil lanterns',
      'Lvl 27: Cut emerald & emerald jewellery',
    ],
    4: [
      'Lvl 32: Plain urns',
      'Lvl 34: Cut ruby & ruby jewellery',
      'Lvl 40: Crafting Guild access',
      'Lvl 40: Green dragonhide armour',
    ],
    5: [
      'Lvl 43: Cut diamond & diamond jewellery',
      'Lvl 48: Strong urns',
      'Lvl 49: Lantern lenses',
      'Lvl 50: Blue dragonhide armour',
    ],
    6: [
      'Lvl 54: Water battlestaff',
      'Lvl 55: Red dragonhide armour',
      'Lvl 55: Slayer helmet (Smoking Kills)',
      'Lvl 58: Earth battlestaff',
      'Lvl 60: Black dragonhide armour',
    ],
    7: [
      'Lvl 62: Fire battlestaff',
      'Lvl 65: Royal dragonhide armour',
      'Lvl 66: Air battlestaff',
      'Lvl 67: Cut moonstone',
    ],
    8: [
      'Lvl 71: Dragonstone jewellery',
      'Lvl 72: Cut onyx',
      'Lvl 75: Undead dragonhide armour',
      'Lvl 76: Decorated urns',
      'Lvl 77: Armadyl battlestaff',
      'Lvl 79: Cut hydrix',
      'Lvl 80: Invention requirement (with 80 Smithing & Divination)',
    ],
    9: [
      'Lvl 82: Onyx jewellery (82–84)',
      'Lvl 85: Top-tier moonstone jewellery',
    ],
    10: [
      'Lvl 95: Dark Shard of Leng (with 95 Smithing)',
      'Lvl 99: Skill Mastery (Crafting cape)',
    ],
  },

  'Firemaking': {
    1: [
      'Lvl 1: Burn logs & use bonfires (+1% max life points)',
      'Lvl 1: Achey logs',
      'Lvl 6: Start The Tale of the Muspah',
      'Lvl 10: Bonfire boost +2%',
    ],
    2: [
      'Lvl 11: Barbarian pyre ships',
      'Lvl 12: Oil lamps',
      'Lvl 15: Oak logs',
      'Lvl 20: Bonfire boost +3%',
    ],
    3: [
      'Lvl 26: Oil lanterns',
      'Lvl 30: Willow logs',
    ],
    4: [
      'Lvl 33: Bug lanterns (Harpie bug swarms)',
      'Lvl 35: Teak logs',
      'Lvl 40: Bonfire boost +5%',
    ],
    5: [
      'Lvl 43: All Fired Up beacons',
      'Lvl 45: Maple logs',
      'Lvl 50: Mahogany logs',
    ],
    6: [
      'Lvl 58: Eucalyptus logs',
      'Lvl 60: Yew logs',
    ],
    7: [
      'Lvl 61: Hand cannons (with 75 Ranged)',
      'Lvl 70: Light fires faster',
      'Lvl 70: Bonfire boost +8%',
    ],
    8: [
      'Lvl 71: Burn two incense sticks at once',
      'Lvl 74: Start The Firemaker\'s Curse',
      'Lvl 75: Magic logs',
      'Lvl 79: Flame gloves',
      'Lvl 80: Magic pyre logs',
    ],
    9: [
      'Lvl 90: Elder logs',
      'Lvl 90: Bonfire boost +10%',
    ],
    10: [
      'Lvl 91: Ancient effigies (starved) & Char\'s training cave',
      'Lvl 92: Inferno adze',
      'Lvl 95: Burn three incense sticks at once',
      'Lvl 99: Skill Mastery (Firemaking cape)',
    ],
  },

  'Magic': {
    1: [
      'Lvl 1: Wind Strike & basic staves',
      'Lvl 5: Water Strike',
      'Lvl 9: Earth Strike',
    ],
    2: [
      'Lvl 13: Fire Strike',
      'Lvl 17: Wind Bolt',
    ],
    3: [
      'Lvl 21: Low Level Alchemy',
      'Lvl 23: Water Bolt',
      'Lvl 25: Varrock Teleport',
      'Lvl 29: Earth Bolt',
      'Lvl 30: Battlestaves',
    ],
    4: [
      'Lvl 31: Lumbridge Teleport',
      'Lvl 35: Fire Bolt',
      'Lvl 37: Falador Teleport',
    ],
    5: [
      'Lvl 41: Wind Blast',
      'Lvl 43: Superheat Item',
      'Lvl 45: Camelot Teleport',
      'Lvl 50: Ancient Magicks (Desert Treasure)',
    ],
    6: [
      'Lvl 51: Ardougne Teleport',
      'Lvl 53: Earth Blast',
      'Lvl 55: High Level Alchemy',
      'Lvl 59: Fire Blast',
    ],
    7: [
      'Lvl 62: Wind Wave',
      'Lvl 65: Lunar Spellbook (Lunar Diplomacy)',
      'Lvl 65: Water Wave',
      'Lvl 70: Earth Wave',
    ],
    8: [
      'Lvl 75: Fire Wave & polypore staves',
      'Lvl 80: Virtus robes',
    ],
    9: [
      'Lvl 81: Wind Surge & Tsunami ability',
      'Lvl 85: Water Surge',
      'Lvl 86: Plank Make (Lunar)',
      'Lvl 90: Earth Surge',
      'Lvl 90: Noxious staff & Seismic wand/singularity',
    ],
    10: [
      'Lvl 92: Wand of the Praesul & Imperium core',
      'Lvl 94: Vengeance (Lunar) & Ice Barrage (Ancient)',
      'Lvl 95: Fire Surge',
      'Lvl 95: Fractured Staff of Armadyl',
      'Lvl 99: Skill Mastery (Magic cape)',
    ],
  },

  'Fletching': {
    1: [
      'Lvl 1: Arrow shafts, shortbows & bronze arrows',
      'Lvl 3: Bronze crossbow & bolts',
      'Lvl 5: Longbows',
      'Lvl 10: Oak shortbow & iron arrows',
    ],
    2: [
      'Lvl 11: Bronze darts',
      'Lvl 13: Iron crossbow & bolts',
      'Lvl 15: Oak longbow',
      'Lvl 20: Willow shortbow & steel arrows',
    ],
    3: [
      'Lvl 22: Iron darts',
      'Lvl 23: Steel crossbow & bolts',
      'Lvl 25: Willow longbow',
      'Lvl 30: Mithril arrows',
    ],
    4: [
      'Lvl 33: Mithril crossbow & bolts',
      'Lvl 37: Steel darts',
      'Lvl 40: Maple shortbow & adamant arrows',
    ],
    5: [
      'Lvl 43: Adamant crossbow & bolts',
      'Lvl 45: Maple longbow',
      'Lvl 50: Rune arrows',
    ],
    6: [
      'Lvl 52: Broad arrows & mithril darts',
      'Lvl 53: Rune crossbow & bolts',
      'Lvl 55: Broad-tipped bolts',
      'Lvl 60: Dragon & orikalkum arrows',
    ],
    7: [
      'Lvl 63: Dragon & orikalkum crossbows',
      'Lvl 67: Adamant darts',
      'Lvl 70: Yew shortbow, necronium & dark arrows',
    ],
    8: [
      'Lvl 71: Dragonstone bolts',
      'Lvl 73: Onyx & necronium bolts',
      'Lvl 75: Yew longbow',
      'Lvl 80: Magic shortbow',
    ],
    9: [
      'Lvl 81: Rune darts',
      'Lvl 83: Bane crossbow & bolts',
      'Lvl 85: Magic longbow',
      'Lvl 90: Elder shortbow, elder rune arrows & ascension bolts',
    ],
    10: [
      'Lvl 92: Death Lotus darts',
      'Lvl 93: Elder rune bolts',
      'Lvl 95: Elder longbow, dragon darts & Bow of the Last Guardian',
      'Lvl 96: Eldritch crossbow',
      'Lvl 99: Skill Mastery (Fletching cape)',
    ],
  },

  'Woodcutting': {
    1: [
      'Lvl 1: Normal & achey trees; bronze hatchet',
      'Lvl 10: Oak trees; iron hatchet',
    ],
    2: [
      'Lvl 12: Log canoes',
      'Lvl 15: Evil oak (Evil Tree)',
      'Lvl 20: Willow trees; steel hatchet',
    ],
    3: [
      'Lvl 25: Black hatchet',
      'Lvl 27: Stable canoes',
      'Lvl 30: Teak trees; mithril hatchet',
    ],
    4: [
      'Lvl 40: Maple trees; adamant hatchet',
    ],
    5: [
      'Lvl 42: Stable dugout canoes',
      'Lvl 44: Lumberjack outfit',
      'Lvl 50: Acadia trees (Menaphos); rune hatchet',
    ],
    6: [
      'Lvl 54: Arctic pine',
      'Lvl 57: Waka canoes',
      'Lvl 58: Eucalyptus',
      'Lvl 60: Mahogany; dragon & orikalkum hatchets',
    ],
    7: [
      'Lvl 68: Ivy',
      'Lvl 70: Yew trees; necronium & crystal hatchets',
    ],
    8: [
      'Lvl 75: Evil magic (Evil Tree)',
      'Lvl 80: Magic trees; bane & Imcando hatchets',
    ],
    9: [
      'Lvl 82: Cursed magic',
      'Lvl 85: Bloodwood',
      'Lvl 90: Elder trees & bamboo; elder rune hatchet',
    ],
    10: [
      'Lvl 94: Crystal trees (Prifddinas)',
      'Lvl 96: Golden bamboo',
      'Lvl 99: Skill Mastery (Woodcutting cape)',
    ],
  },

  'Runecrafting': {
    1: [
      'Lvl 1: Air & mind runes; small pouch',
      'Lvl 1: The Runespan & Ourania altar',
      'Lvl 1: Spirit runes (Rune Mythos)',
      'Lvl 5: Water runes',
      'Lvl 9: Earth runes',
      'Lvl 10: Wicked hood',
    ],
    2: [
      'Lvl 11: Double air runes',
      'Lvl 14: Fire runes',
      'Lvl 20: Body & bone runes',
    ],
    3: [
      'Lvl 23: Lava runes',
      'Lvl 25: Medium pouch',
      'Lvl 27: Cosmic runes',
      'Lvl 30: Wicked cape',
    ],
    4: [
      'Lvl 33: Runespan middle level',
      'Lvl 35: Chaos runes',
      'Lvl 40: Astral & flesh runes',
    ],
    5: [
      'Lvl 44: Nature runes',
      'Lvl 50: Large pouch',
      'Lvl 50: Runespan high-level entrance',
    ],
    6: [
      'Lvl 54: Law runes',
      'Lvl 55: Wicked robe bottoms',
      'Lvl 59: Double cosmic runes',
      'Lvl 60: Miasma runes',
    ],
    7: [
      'Lvl 65: Death runes',
      'Lvl 66: Runespan top level',
      'Lvl 70: Triple fire runes',
    ],
    8: [
      'Lvl 72: Armadyl runes',
      'Lvl 74: Double chaos runes',
      'Lvl 75: Giant pouch',
      'Lvl 77: Blood runes',
      'Lvl 80: Wicked robe top',
    ],
    9: [
      'Lvl 82: Double astral runes',
      'Lvl 90: Soul runes',
      'Lvl 90: Massive pouch',
    ],
    10: [
      'Lvl 91: Double nature runes',
      'Lvl 92: Triple body runes',
      'Lvl 99: Skill Mastery (Runecrafting cape)',
      'Note: 100+ opens time runes',
    ],
  },

  'Slayer': {
    1: [
      'Lvl 1: Turael tasks (Burthorpe)',
      'Lvl 5: Crawling hands',
      'Lvl 7: Cave bugs',
      'Lvl 10: Cave crawlers',
    ],
    2: [
      'Lvl 15: Banshees (earmuffs)',
      'Lvl 17: Cave slimes',
      'Lvl 20: Rockslugs',
    ],
    3: [
      'Lvl 22: Desert lizards',
      'Lvl 25: Cockatrices (mirror shield)',
      'Lvl 30: Pyrefiends',
    ],
    4: [
      'Lvl 32: Mogres',
      'Lvl 35: Wall beasts',
      'Lvl 35: Slayer helmet (Smoking Kills)',
      'Lvl 37: Killerwatts',
      'Lvl 40: Basilisks & terror dogs',
    ],
    5: [
      'Lvl 42: Fever spiders',
      'Lvl 45: Infernal mages',
      'Lvl 47: Brine rats',
      'Lvl 50: Bloodveld',
    ],
    6: [
      'Lvl 52: Jellies',
      'Lvl 55: Turoth; leaf-bladed weapons & broad ammo',
      'Lvl 58: Cave horrors',
      'Lvl 60: Aberrant spectres',
    ],
    7: [
      'Lvl 63: Spiritual rangers',
      'Lvl 65: Dust devils',
      'Lvl 68: Spiritual warriors',
      'Lvl 70: Kurask',
    ],
    8: [
      'Lvl 72: Skeletal wyverns',
      'Lvl 73: Jungle strykewyrms',
      'Lvl 75: Gargoyles (rock hammer)',
      'Lvl 77: Desert strykewyrms',
      'Lvl 78: Aquanites',
      'Lvl 80: Nechryael',
    ],
    9: [
      'Lvl 83: Spiritual mages',
      'Lvl 84: Glacors',
      'Lvl 85: Abyssal demons',
      'Lvl 88: Grifolapines',
      'Lvl 90: Dark beasts, edimmu & feral dinosaurs',
    ],
    10: [
      'Lvl 92: Airut',
      'Lvl 93: Ice strykewyrms',
      'Lvl 94: Lava strykewyrms',
      'Lvl 95: Ganodermic beasts & dragonstone dragons',
      'Lvl 96: Ripper demons, camel warriors & acheron mammoths',
      'Lvl 98: Onyx dragons',
      'Lvl 99: Soulgazers & Skill Mastery (Slayer cape)',
    ],
  },

  'Farming': {
    1: [
      'Lvl 1: Potatoes',
      'Lvl 5: Onions',
      'Lvl 7: Cabbages',
      'Lvl 9: Guam herbs',
    ],
    2: [
      'Lvl 12: Tomatoes',
      'Lvl 14: Marrentill',
      'Lvl 15: Oak trees',
      'Lvl 17: Player-owned farm: rabbits',
      'Lvl 19: Tarromin',
      'Lvl 20: Sweetcorn',
    ],
    3: [
      'Lvl 26: Harralander',
      'Lvl 27: Apple trees',
      'Lvl 28: Player-owned farm: chickens',
      'Lvl 30: Willow trees',
    ],
    4: [
      'Lvl 31: Strawberries',
      'Lvl 32: Ranarr',
      'Lvl 33: Banana trees',
      'Lvl 35: Player-owned farm: sheep',
      'Lvl 38: Toadflax',
      'Lvl 39: Orange trees',
    ],
    5: [
      'Lvl 42: Curry trees; Ranch Out of Time frogs',
      'Lvl 44: Irit',
      'Lvl 45: Maple trees',
      'Lvl 47: Watermelons',
      'Lvl 49: Player-owned farm: cows',
      'Lvl 50: Avantoe',
    ],
    6: [
      'Lvl 51: Pineapple trees',
      'Lvl 54: Player-owned farm: chinchompas',
      'Lvl 56: Kwuarm',
      'Lvl 57: Papaya trees',
      'Lvl 60: Yew trees & Livid Farm',
    ],
    7: [
      'Lvl 62: Snapdragon',
      'Lvl 64: Player-owned farm: spiders',
      'Lvl 67: Cadantine',
      'Lvl 68: Palm trees',
    ],
    8: [
      'Lvl 71: Player-owned farm: yaks',
      'Lvl 72: Calquat trees',
      'Lvl 73: Lantadyme',
      'Lvl 75: Magic trees',
      'Lvl 76: Ranch Out of Time jadinkos',
      'Lvl 79: Dwarf weed',
    ],
    9: [
      'Lvl 81: Player-owned farm: zygomites',
      'Lvl 83: Spirit trees',
      'Lvl 85: Torstol',
      'Lvl 87: Sunchokes',
      'Lvl 90: Elder trees',
    ],
    10: [
      'Lvl 91: Fellstalk',
      'Lvl 92: Player-owned farm: dragons',
      'Lvl 97: Ranch Out of Time varanusaurs',
      'Lvl 99: Skill Mastery (Farming cape)',
    ],
  },

  'Construction': {
    1: [
      'Lvl 1: Player-owned house — parlour & garden',
      'Lvl 5: Kitchen',
      'Lvl 10: Dining room',
      'Lvl 10: Fort Forinthry Town Hall',
    ],
    2: [
      'Lvl 15: Workshop',
      'Lvl 15: Fort Forinthry Chapel',
      'Lvl 20: Bedroom',
      'Lvl 20: Start The Fremennik Isles',
    ],
    3: [
      'Lvl 25: Skill hall',
      'Lvl 25: Fort Forinthry Command Centre',
      'Lvl 30: Games room',
      'Lvl 30: Rooms on upper floors; Rellekka house portal',
    ],
    4: [
      'Lvl 32: Combat room',
      'Lvl 35: Quest hall',
      'Lvl 37: Menagerie',
      'Lvl 40: Study',
      'Lvl 40: Hire a butler; Construction Contracts',
    ],
    5: [
      'Lvl 42: Costume room',
      'Lvl 45: Chapel',
      'Lvl 50: Portal chamber',
      'Lvl 50: Demon butler',
    ],
    6: [
      'Lvl 55: Formal garden',
      'Lvl 60: Throne room',
    ],
    7: [
      'Lvl 63: Aquarium',
      'Lvl 65: Oubliette',
      'Lvl 70: Dungeon rooms',
    ],
    8: [
      'Lvl 75: Treasure room',
      'Lvl 75: Gilded altar',
      'Lvl 75: Spirit tree in garden (with 83 Farming)',
    ],
    9: [
      'Lvl 85: Fairy ring in garden',
    ],
    10: [
      'Lvl 95: Spirit tree & fairy ring combined',
      'Lvl 99: Demonic throne (throne room)',
      'Lvl 99: Skill Mastery (Construction cape)',
    ],
  },

  'Hunter': {
    1: [
      'Lvl 1: Crimson swifts & polar kebbits (2 traps)',
      'Lvl 3: Common kebbits',
      'Lvl 5: Golden warblers',
      'Lvl 7: Feldip weasels',
      'Lvl 9: Copper longtails',
    ],
    2: [
      'Lvl 13: Desert devils',
      'Lvl 15: Ruby harvest butterflies',
      'Lvl 17: Baby implings (Puro-Puro)',
      'Lvl 19: Tropical wagtails',
    ],
    3: [
      'Lvl 23: Wild kebbits (deadfall)',
      'Lvl 25: Sapphire glacialis',
      'Lvl 27: Ferrets & cobalt skillchompas',
      'Lvl 30: 3 traps at once',
    ],
    4: [
      'Lvl 33: Barb-tailed kebbits',
      'Lvl 37: Prickly kebbits',
      'Lvl 36: Earth implings',
    ],
    5: [
      'Lvl 41: Horned graahk',
      'Lvl 43: Spotted kebbits (falconry)',
      'Lvl 45: Black warlocks & penguins',
      'Lvl 46: Viridian skillchompas',
      'Lvl 49: Razor-backed kebbits',
    ],
    6: [
      'Lvl 51: Sabre-toothed kebbits',
      'Lvl 53: Grey chinchompas',
      'Lvl 55: Sabre-toothed kyatts',
      'Lvl 60: 4 traps at once',
    ],
    7: [
      'Lvl 63: Carnivorous (red) chinchompas',
      'Lvl 66: Pawyas',
      'Lvl 68: Azure skillchompas',
      'Lvl 69: Dashing kebbits',
      'Lvl 70: Common jadinkos',
    ],
    8: [
      'Lvl 72: Charm sprites',
      'Lvl 74: Ninja implings',
      'Lvl 77: Grenwalls',
      'Lvl 79: Divine implings',
      'Lvl 80: 5 traps at once; draconic jadinkos',
    ],
    9: [
      'Lvl 83: Dragon implings',
      'Lvl 87: Zombie implings',
      'Lvl 89: Crimson skillchompas',
      'Lvl 90: Tortles & Big Game Hunter (Anachronia)',
    ],
    10: [
      'Lvl 91: Kingly implings',
      'Lvl 95: Crystal implings',
      'Lvl 96: Ornate tortles & giant chinchompas',
      'Lvl 97: Crystal skillchompas',
      'Lvl 99: Skill Mastery (Hunter cape)',
    ],
  },

  'Summoning': {
    1: [
      'Lvl 1: Spirit wolf',
      'Lvl 4: Dreadfowl',
      'Lvl 10: Spirit spider',
    ],
    2: [
      'Lvl 13: Thorny snail (beast of burden)',
      'Lvl 16: Granite crab',
      'Lvl 18: Desert wyrm',
      'Lvl 19: Spirit scorpion',
    ],
    3: [
      'Lvl 22: Spirit Tz-Kih',
      'Lvl 23: Albino rat',
      'Lvl 25: Spirit kalphite (beast of burden)',
      'Lvl 28: Compost mound',
      'Lvl 29: Giant chinchompa',
    ],
    4: [
      'Lvl 31: Vampyre bat',
      'Lvl 32: Honey badger',
      'Lvl 33: Beaver',
      'Lvl 34: Void ravager/shifter/spinner/torcher',
      'Lvl 36: Bronze minotaur',
      'Lvl 40: Bull ant (beast of burden)',
    ],
    5: [
      'Lvl 41: Macaw',
      'Lvl 46: Iron minotaur & pyrelord',
      'Lvl 47: Magpie',
      'Lvl 49: Bloated leech',
      'Lvl 50: Spirit capes (with 50 Defence)',
    ],
    6: [
      'Lvl 52: Spirit terrorbird (beast of burden)',
      'Lvl 54: Abyssal parasite',
      'Lvl 56: Steel minotaur & ibis',
      'Lvl 57: Spirit graahk/kyatt/larupia',
      'Lvl 58: Karamthulhu overlord',
    ],
    7: [
      'Lvl 61: Smoke devil',
      'Lvl 63: Spirit cobra',
      'Lvl 66: Barker toad & mithril minotaur',
      'Lvl 67: War tortoise (beast of burden)',
      'Lvl 69: Fruit bat',
    ],
    8: [
      'Lvl 73: Obsidian golem; blood reaver contracts',
      'Lvl 74: Granite lobster',
      'Lvl 76: Adamant minotaur & forge regent',
      'Lvl 79: Fire, moss & ice titans',
      'Lvl 80: Hydra',
    ],
    9: [
      'Lvl 83: Lava titan',
      'Lvl 85: Swamp titan',
      'Lvl 86: Rune minotaur',
      'Lvl 88: Unicorn stallion',
      'Lvl 89: Geyser titan',
    ],
    10: [
      'Lvl 92: Wolpertinger',
      'Lvl 93: Abyssal titan',
      'Lvl 95: Iron titan',
      'Lvl 96: Pack yak (beast of burden); ripper demon contracts',
      'Lvl 99: Steel titan & pack mammoth',
      'Lvl 99: Skill Mastery (Summoning cape)',
    ],
  },

  'Dungeoneering': {
    1: [
      'Lvl 1: Daemonheim floors 1+ (Frozen)',
      'Lvl 1: One bound item slot',
      'Lvl 10: Edgeville chaos druid resource dungeon',
    ],
    2: [
      'Lvl 15: Dwarven Mine resource dungeon',
      'Lvl 19: Floor 10',
      'Lvl 20: Edgeville hill giant resource dungeon',
      'Lvl 20: Two bound item slots',
    ],
    3: [
      'Lvl 23: Abandoned floors',
      'Lvl 25: Karamja Volcano resource dungeon',
      'Lvl 25: Gem bag & scroll of life',
      'Lvl 30: Daemonheim Peninsula resource dungeon',
      'Lvl 30: Arcane pulse necklace',
    ],
    4: [
      'Lvl 35: Furnished floors',
      'Lvl 35: Baxtorian Falls resource dungeon',
      'Lvl 35: Coal bag',
    ],
    5: [
      'Lvl 45: Gravite weapons',
      'Lvl 45: Mining Guild resource dungeon',
      'Lvl 50: Arcane blast necklace & spirit cape',
    ],
    6: [
      'Lvl 55: Taverley hellhound resource dungeon',
      'Lvl 59: Abandoned II floors',
      'Lvl 60: Taverley blue dragon resource dungeon',
    ],
    7: [
      'Lvl 62: Ring of vigour',
      'Lvl 65: Varrock Sewers resource dungeon',
      'Lvl 65: Rapid Renewal prayer (with 65 Prayer)',
      'Lvl 70: Chaos Tunnels resource dungeon',
    ],
    8: [
      'Lvl 71: Occult floors',
      'Lvl 75: Al Kharid mining resource dungeon',
      'Lvl 80: Chaotic weapons & arcane stream necklace',
      'Lvl 80: Brimhaven Dungeon resource dungeon',
    ],
    9: [
      'Lvl 82: Polypore resource dungeon',
      'Lvl 85: Asgarnian Ice Dungeon resource dungeon',
      'Lvl 90: Four bound item slots',
    ],
    10: [
      'Lvl 95: Warped floors',
      'Lvl 95: Gorajo resource dungeon',
      'Lvl 99: Floor 50 & Skill Mastery (Dungeoneering cape)',
      'Note: Elite dungeons, Sinkholes & floors 51–60 continue past 99',
    ],
  },

  'Divination': {
    1: [
      'Lvl 1: Pale wisps',
      'Lvl 2: Portent of restoration I',
      'Lvl 6: Sign of the porter I',
      'Lvl 10: Flickering wisps & boon',
    ],
    2: [
      'Lvl 12: Divine herb patch I',
      'Lvl 15: Portent of restoration II',
      'Lvl 20: Bright wisps & boon',
    ],
    3: [
      'Lvl 23: Sign of respite II',
      'Lvl 28: Sign of the porter II',
      'Lvl 30: Glowing wisps & boon',
    ],
    4: [
      'Lvl 35: Guthixian Cache access',
      'Lvl 38: Sign of respite III',
      'Lvl 40: Sparkling wisps & boon',
    ],
    5: [
      'Lvl 44: Divine maple tree',
      'Lvl 45: Portent of restoration V',
      'Lvl 48: Sign of the porter III',
      'Lvl 50: Gleaming wisps & boon',
    ],
    6: [
      'Lvl 51: Divine herb patch II',
      'Lvl 59: Enriched memory chance 4%',
      'Lvl 60: Vibrant wisps & boon',
    ],
    7: [
      'Lvl 62: Divine yew tree',
      'Lvl 65: Empty Throne Room',
      'Lvl 68: Sign of the porter IV',
      'Lvl 69: Sign of item protection',
      'Lvl 70: Lustrous wisps & Hall of Memories',
    ],
    8: [
      'Lvl 75: Elder wisps & portent of degradation I',
      'Lvl 78: Sign of life',
      'Lvl 79: Sign of death',
      'Lvl 80: Brilliant wisps & boon',
      'Lvl 80: Invention requirement (with 80 Crafting & Smithing)',
    ],
    9: [
      'Lvl 82: Divine herb patch III',
      'Lvl 83: Divine magic tree',
      'Lvl 85: Radiant wisps & boon',
      'Lvl 88: Sign of the porter V',
      'Lvl 90: Luminous wisps; positive & negative energy (The Arc)',
    ],
    10: [
      'Lvl 91: Divine rocktail bubble',
      'Lvl 95: Incandescent wisps & ancestral energy (The Arc)',
      'Lvl 99: Sign of the porter VII',
      'Lvl 99: Skill Mastery (Divination cape)',
    ],
  },

  'Invention': {
    1: [
      'Prerequisite: Invention needs 80 Crafting, Smithing & Divination to start',
      'Lvl 1: Invention Guild, disassembly & charge pack',
      'Lvl 2: Augment weapons',
      'Lvl 3: Gizmo devices',
      'Lvl 8: Gizmo dissolver',
    ],
    2: [
      'Lvl 16: Augment body armour & shields',
      'Lvl 20: Skill fragment research',
    ],
    3: [
      'Lvl 22: Augmented tools (hatchet/pickaxe/mattock)',
      'Lvl 24: Soul-in-a-box & urn enhancer',
      'Lvl 27: Equipment siphon (item level 10)',
    ],
    4: [
      'Lvl 34: Knightly components',
      'Lvl 40: Specialisation (cave goblin or dwarven tech)',
    ],
    5: [
      'Lvl 43: Spring cleaner',
      'Lvl 45: Augment leg armour',
      'Lvl 49: Explosive & dragonfire components',
      'Lvl 50: Skilling accumulators',
    ],
    6: [
      'Lvl 54: Crystal tool siphon',
      'Lvl 55: Faceted & clockwork components',
      'Lvl 60: Machines (power generator, auto disassembler) & item level 15',
    ],
    7: [
      'Lvl 69: Shifting components & lab coat',
      'Lvl 70: Kinetic cyclone, auto sanctifier & others',
    ],
    8: [
      'Lvl 72: Alchemiser',
      'Lvl 74: God components (Bandos/Zamorak/Saradomin/Armadyl)',
      'Lvl 75: Small gizmo bag',
      'Lvl 77: Mechanised siphon',
      'Lvl 80: Large generator',
    ],
    9: [
      'Lvl 81: Auto disassembler mk. II',
      'Lvl 83: Third-age, Seren & Zaros components',
      'Lvl 85: Ancient gizmos (Ancient Invention)',
      'Lvl 88: Slayer ability codices',
      'Lvl 89: Shadow, cywir & ilujankan components',
      'Lvl 90: Partial potion producer',
    ],
    10: [
      'Lvl 92: Spirit tree re-rooter',
      'Lvl 94: Portable fairy ring',
      'Lvl 95: Medium gizmo bag',
      'Lvl 99: Item level 20 & plank maker',
      'Lvl 99: Skill Mastery (Invention cape)',
    ],
  },

  'Archaeology': {
    1: [
      'Lvl 1: Bronze mattock',
      'Lvl 5: Kharid-et dig site',
      'Lvl 10: Iron mattock',
    ],
    2: [
      'Lvl 20: Infernal Source dig site',
      'Lvl 20: Steel mattock',
    ],
    3: [
      'Lvl 24: Lodge art storage',
      'Lvl 30: Mithril mattock',
      'Lvl 30: Start Osseous Rex',
    ],
    4: [
      'Lvl 38: Screening XP increase',
      'Lvl 40: Adamant mattock',
      'Lvl 40: Assistant qualification; research teams',
    ],
    5: [
      'Lvl 42: Everlight dig site',
      'Lvl 43: Sprite Focus 3x precision',
      'Lvl 50: Rune mattock',
    ],
    6: [
      'Lvl 52: Moonrise dig site',
      'Lvl 58: Start Azzanadra\'s Quest',
      'Lvl 60: Senntisten dig site',
      'Lvl 60: Orikalkum & dragon mattocks',
    ],
    7: [
      'Lvl 70: Stormguard Citadel dig site',
      'Lvl 70: Associate qualification',
      'Lvl 70: Necronium & crystal mattocks',
    ],
    8: [
      'Lvl 73: Daemonheim dig site',
      'Lvl 76: Warforge dig site',
      'Lvl 80: Bane & Imcando mattocks',
    ],
    9: [
      'Lvl 82: Sprite Focus 4x precision',
      'Lvl 86: Start Requiem for a Dragon',
      'Lvl 90: Orthen dig site',
      'Lvl 90: Elder rune mattock & Professor qualification',
    ],
    10: [
      'Lvl 99: Guildmaster qualification',
      'Lvl 99: Skill Mastery (Archaeology cape)',
    ],
  },

  'Necromancy': {
    1: [
      'Lvl 1: Tier 10 Death guard & Skull lantern; ritual site',
      'Lvl 2: Conjure Skeleton Warrior',
      'Lvl 5: Lesser necroplasm & communion rituals',
      'Lvl 8: Finger of Death',
      'Lvl 10: Deathwarden robes (T10)',
    ],
    2: [
      'Lvl 13: Touch of Death',
      'Lvl 20: Command Skeleton Warrior',
      'Lvl 20: Tier 20 Death guard & Skull lantern',
    ],
    3: [
      'Lvl 24: City of Um Teleport (Rune Mythos)',
      'Lvl 25: Lesser Bone Shield',
      'Lvl 28: Death Skulls',
      'Lvl 30: Tier 30 Death guard & Skull lantern',
    ],
    4: [
      'Lvl 36: Blood Siphon',
      'Lvl 40: Conjure Putrid Zombie & Vengeful Ghost',
      'Lvl 40: Tier 40 Death guard & Skull lantern',
    ],
    5: [
      'Lvl 44: Threads of Fate',
      'Lvl 48: Bloat',
      'Lvl 50: Tier 50 Death guard & Skull lantern',
    ],
    6: [
      'Lvl 52: Two conjures at once',
      'Lvl 54: Soul Sap & Soul Strike',
      'Lvl 60: Greater rituals; tier 2 ritual site',
      'Lvl 60: Tier 60 Death guard & Skull lantern',
    ],
    7: [
      'Lvl 62: Spectral Scythe',
      'Lvl 66: Volley of Souls',
      'Lvl 70: Conjure Phantom Guardian',
      'Lvl 70: Tier 70 gear & Deathdealer robes',
    ],
    8: [
      'Lvl 73: Greater Bone Shield',
      'Lvl 76: Living Death & Life Transfer',
      'Lvl 78: Invoke Lord of Bones',
      'Lvl 80: Invoke Death',
      'Lvl 80: Tier 80 Death guard & Skull lantern',
    ],
    9: [
      'Lvl 84: Three conjures at once',
      'Lvl 86: Darkness',
      'Lvl 90: Powerful rituals; tier 3 ritual site',
      'Lvl 90: Tier 90 Death guard & Skull lantern',
    ],
    10: [
      'Lvl 92: Split Soul',
      'Lvl 95: Omni guard, Soulbound lantern & Robes of the First Necromancer',
      'Lvl 99: Conjure Undead Army',
      'Lvl 99: Skill Mastery (Necromancy cape)',
    ],
  },
};
