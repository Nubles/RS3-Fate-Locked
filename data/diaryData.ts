import { DropSource } from '../types';

export interface DiaryTier {
  id: string; // e.g. "Ardougne Easy"
  region: string; // home continent (REGION_GROUPS key, or 'Misthalin')
  // RS3 diaries are Easy/Medium/Hard/Elite, except Lumbridge which is
  // Beginner/Easy/Medium/Hard (no Elite).
  tier: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Elite';
  difficulty: DropSource;
  skills: Record<string, number>;
  quests: string[];
  requiredRegions: string[]; // Continents the tier's tasks need (home region first)
}

/**
 * RuneScape 3 Achievement Diaries (https://runescape.wiki/w/Achievement_Diary):
 * 13 areas — Ardougne, Daemonheim, Desert, Falador, Fremennik, Karamja,
 * Lumbridge, Morytania, Seers' Village, Tirannwn, Underworld (City of Um),
 * Varrock and Wilderness. Skill / quest gates are the union of every task's
 * requirements in that tier (see diaryTasks.ts), which is how the wiki's tier
 * requirement tables are built; `Combat` is the tier's combat-level gate.
 */
export const DIARY_DATA: Record<string, DiaryTier> = {
  // --- ARDOUGNE ---
  'Ardougne Easy': {
    id: 'Ardougne Easy', region: 'Kandarin', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Construction': 10, 'Thieving': 16 },
    quests: ['Plague City', 'Biohazard', 'Gertrude\'s Cat', 'Tower of Life', 'Monk\'s Friend'], requiredRegions: ['Kandarin']
  },
  'Ardougne Medium': {
    id: 'Ardougne Medium', region: 'Kandarin', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 39, 'Farming': 47, 'Firemaking': 50, 'Fishing': 3, 'Magic': 51, 'Mining': 46, 'Ranged': 21, 'Strength': 38, 'Thieving': 38 },
    quests: ['A Fairy Tale II - Cure a Queen', 'Kennith\'s Concerns', 'Plague City', 'Enlightened Journey', 'The Hand in the Sand', 'Meeting History', 'Sea Slug', 'Tower of Life'], requiredRegions: ['Kandarin']
  },
  'Ardougne Hard': {
    id: 'Ardougne Hard', region: 'Kandarin', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 57, 'Combat': 63, 'Farming': 57, 'Hunter': 59, 'Magic': 71, 'Slayer': 59, 'Thieving': 65, 'Woodcutting': 72 },
    quests: ['Legends\' Quest', 'Lunar Diplomacy', 'Tower of Life', 'Monkey Madness', 'Back to my Roots', 'Watchtower', 'Catapult Construction'], requiredRegions: ['Kandarin']
  },
  'Ardougne Elite': {
    id: 'Ardougne Elite', region: 'Kandarin', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Crafting': 10, 'Fishing': 81, 'Fletching': 83, 'Runecrafting': 75, 'Smithing': 80, 'Summoning': 93, 'Thieving': 82 },
    quests: ['Enter the Abyss'], requiredRegions: ['Kandarin']
  },
  // --- DAEMONHEIM ---
  'Daemonheim Easy': {
    id: 'Daemonheim Easy', region: 'Daemonheim', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Divination': 10, 'Dungeoneering': 23, 'Smithing': 7 },
    quests: [], requiredRegions: ['Daemonheim']
  },
  'Daemonheim Medium': {
    id: 'Daemonheim Medium', region: 'Daemonheim', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Attack': 30, 'Divination': 45, 'Dungeoneering': 35, 'Farming': 40, 'Fletching': 43, 'Herblore': 36, 'Hunter': 40, 'Magic': 32, 'Ranged': 30, 'Thieving': 40 },
    quests: [], requiredRegions: ['Daemonheim']
  },
  'Daemonheim Hard': {
    id: 'Daemonheim Hard', region: 'Daemonheim', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 55, 'Attack': 60, 'Construction': 75, 'Cooking': 69, 'Divination': 70, 'Dungeoneering': 71, 'Farming': 68, 'Magic': 30, 'Prayer': 65, 'Ranged': 30, 'Runecrafting': 54, 'Smithing': 50, 'Strength': 75, 'Thieving': 55 },
    quests: ['Salt in the Wound', 'A Clockwork Syringe'], requiredRegions: ['Daemonheim', 'Morytania']
  },
  'Daemonheim Elite': {
    id: 'Daemonheim Elite', region: 'Daemonheim', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Constitution': 80, 'Cooking': 90, 'Crafting': 98, 'Divination': 86, 'Dungeoneering': 95, 'Magic': 90, 'Mining': 90, 'Smithing': 95 },
    quests: [], requiredRegions: ['Daemonheim']
  },
  // --- DESERT ---
  'Desert Easy': {
    id: 'Desert Easy', region: 'Kharidian Desert', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Hunter': 5, 'Magic': 7, 'Runecrafting': 14, 'Thieving': 21 },
    quests: ['Diamond in the Rough', 'Stolen Hearts', 'Icthlarin\'s Little Helper', 'One Piercing Note'], requiredRegions: ['Kharidian Desert']
  },
  'Desert Medium': {
    id: 'Desert Medium', region: 'Kharidian Desert', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 30, 'Crafting': 33, 'Herblore': 36, 'Mining': 45, 'Prayer': 45, 'Ranged': 37, 'Strength': 19, 'Summoning': 25, 'Woodcutting': 30 },
    quests: ['Eagles\' Peak', 'The Feud', 'Spirits of the Elid', 'A Fairy Tale II - Cure a Queen', 'Missing My Mummy'], requiredRegions: ['Kharidian Desert', 'Kandarin']
  },
  'Desert Hard': {
    id: 'Desert Hard', region: 'Kharidian Desert', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Cooking': 58, 'Dungeoneering': 75, 'Farming': 55, 'Fletching': 52, 'Magic': 70, 'Runecrafting': 50, 'Slayer': 65, 'Thieving': 61 },
    quests: ['Dream Mentor', 'Dealing with Scabaras', 'Smoking Kills', 'Spirits of the Elid', 'Enakhra\'s Lament', 'Do No Evil', 'A Tail of Two Cats', 'Hermit Permits', 'Desert Treasure', 'Contact!', 'Deadliest Catch'], requiredRegions: ['Kharidian Desert']
  },
  'Desert Elite': {
    id: 'Desert Elite', region: 'Kharidian Desert', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Agility': 80, 'Crafting': 89, 'Herblore': 85, 'Mining': 81, 'Slayer': 77, 'Thieving': 91 },
    quests: ['Smoking Kills', 'Desert Treasure', 'The Chosen Commander', 'The Void Stares Back', 'Blood Runs Deep', 'The Curse of Arrav', 'Nomad\'s Requiem', 'Recipe for Disaster', 'While Guthix Sleeps', 'The Temple at Senntisten', 'One Piercing Note', 'The Restless Ghost', 'Diamond in the Rough', 'Do No Evil', 'As a First Resort'], requiredRegions: ['Kharidian Desert']
  },
  // --- FALADOR ---
  'Falador Easy': {
    id: 'Falador Easy', region: 'Asgarnia', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Construction': 16, 'Defence': 25 },
    quests: [], requiredRegions: ['Asgarnia']
  },
  'Falador Medium': {
    id: 'Falador Medium', region: 'Asgarnia', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 26, 'Crafting': 36, 'Defence': 20, 'Farming': 23, 'Firemaking': 49, 'Mining': 10, 'Prayer': 10, 'Ranged': 19, 'Smithing': 10, 'Strength': 37, 'Thieving': 40 },
    quests: ['Wanted!', 'Recruitment Drive', 'The Knight\'s Sword', 'Garden of Tranquillity', 'Gertrude\'s Cat'], requiredRegions: ['Asgarnia']
  },
  'Falador Hard': {
    id: 'Falador Hard', region: 'Asgarnia', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Construction': 16, 'Defence': 30, 'Farming': 60, 'Mining': 60, 'Prayer': 70, 'Runecrafting': 56, 'Slayer': 72, 'Summoning': 56, 'Woodcutting': 70 },
    quests: ['The Hand in the Sand', 'A Fairy Tale II - Cure a Queen', 'The Slug Menace'], requiredRegions: ['Asgarnia']
  },
  'Falador Elite': {
    id: 'Falador Elite', region: 'Asgarnia', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Cooking': 93, 'Farming': 75, 'Fishing': 90, 'Magic': 80, 'Mining': 80, 'Prayer': 95, 'Summoning': 80, 'Woodcutting': 80 },
    quests: ['Lunar Diplomacy', 'The Temple at Senntisten'], requiredRegions: ['Asgarnia']
  },
  // --- FREMENNIK ---
  'Fremennik Easy': {
    id: 'Fremennik Easy', region: 'Fremennik', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Slayer': 10 },
    quests: [], requiredRegions: ['Fremennik', 'Kandarin']
  },
  'Fremennik Medium': {
    id: 'Fremennik Medium', region: 'Fremennik', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Cooking': 48, 'Crafting': 33, 'Defence': 20, 'Hunter': 55, 'Thieving': 42 },
    quests: ['The Fremennik Trials', 'The Fremennik Isles', 'Garden of Tranquillity', 'A Fairy Tale II - Cure a Queen'], requiredRegions: ['Fremennik']
  },
  'Fremennik Hard': {
    id: 'Fremennik Hard', region: 'Fremennik', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 35, 'Crafting': 52, 'Defence': 50, 'Firemaking': 52, 'Fishing': 55, 'Magic': 65, 'Mining': 60, 'Strength': 35, 'Woodcutting': 54 },
    quests: ['The Fremennik Trials', 'Lunar Diplomacy', 'Royal Trouble'], requiredRegions: ['Fremennik', 'Kandarin']
  },
  'Fremennik Elite': {
    id: 'Fremennik Elite', region: 'Fremennik', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Agility': 90, 'Attack': 75, 'Crafting': 85, 'Firemaking': 85, 'Fishing': 96, 'Herblore': 80, 'Runecrafting': 82, 'Slayer': 93, 'Smithing': 50, 'Strength': 76 },
    quests: ['The Fremennik Trials', 'Lunar Diplomacy', 'Tai Bwo Wannai Trio', 'Blood Runs Deep'], requiredRegions: ['Fremennik', 'Kandarin']
  },
  // --- KARAMJA ---
  'Karamja Easy': {
    id: 'Karamja Easy', region: 'Karamja', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Agility': 15, 'Mining': 40 },
    quests: [], requiredRegions: ['Karamja']
  },
  'Karamja Medium': {
    id: 'Karamja Medium', region: 'Karamja', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 12, 'Cooking': 16, 'Farming': 27, 'Fishing': 65, 'Hunter': 41, 'Mining': 40, 'Woodcutting': 60 },
    quests: ['Dragon Slayer', 'Shilo Village', 'Jungle Potion', 'Tai Bwo Wannai Trio', 'The Grand Tree'], requiredRegions: ['Karamja', 'Kandarin']
  },
  'Karamja Hard': {
    id: 'Karamja Hard', region: 'Karamja', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 53, 'Combat': 100, 'Cooking': 50, 'Ranged': 42, 'Runecrafting': 44, 'Slayer': 50, 'Strength': 21 },
    quests: ['Tai Bwo Wannai Trio', 'Legends\' Quest', 'Shilo Village'], requiredRegions: ['Karamja']
  },
  'Karamja Elite': {
    id: 'Karamja Elite', region: 'Karamja', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Agility': 32, 'Combat': 100, 'Cooking': 80, 'Herblore': 63, 'Hunter': 27, 'Runecrafting': 91, 'Slayer': 50, 'Summoning': 95 },
    quests: ['Shilo Village', 'While Guthix Sleeps'], requiredRegions: ['Karamja']
  },
  // --- LUMBRIDGE ---
  'Lumbridge Beginner': {
    id: 'Lumbridge Beginner', region: 'Misthalin', tier: 'Beginner', difficulty: DropSource.DIARY_EASY,
    skills: {  },
    quests: ['The Restless Ghost'], requiredRegions: ['Misthalin', 'Kharidian Desert']
  },
  'Lumbridge Easy': {
    id: 'Lumbridge Easy', region: 'Misthalin', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Crafting': 4, 'Fishing': 25, 'Mining': 10, 'Runecrafting': 5, 'Smithing': 20 },
    quests: ['The Restless Ghost'], requiredRegions: ['Misthalin']
  },
  'Lumbridge Medium': {
    id: 'Lumbridge Medium', region: 'Misthalin', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Cooking': 40, 'Crafting': 16, 'Firemaking': 30, 'Fishing': 30, 'Magic': 31, 'Mining': 20, 'Smithing': 20, 'Woodcutting': 20 },
    quests: ['Cook\'s Assistant', 'Dragon Slayer'], requiredRegions: ['Misthalin', 'Kharidian Desert']
  },
  'Lumbridge Hard': {
    id: 'Lumbridge Hard', region: 'Misthalin', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Cooking': 50, 'Crafting': 50, 'Firemaking': 60, 'Magic': 59, 'Prayer': 45, 'Runecrafting': 57, 'Smithing': 40 },
    quests: ['Cook\'s Assistant'], requiredRegions: ['Misthalin']
  },
  // --- MORYTANIA ---
  'Morytania Easy': {
    id: 'Morytania Easy', region: 'Morytania', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Agility': 25, 'Cooking': 12, 'Crafting': 15, 'Farming': 26 },
    quests: ['Priest in Peril', 'Creature of Fenkenstrain', 'Nature Spirit', 'In Aid of the Myreque'], requiredRegions: ['Morytania']
  },
  'Morytania Medium': {
    id: 'Morytania Medium', region: 'Morytania', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Cooking': 14, 'Farming': 53, 'Herblore': 22, 'Hunter': 29, 'Magic': 33, 'Mining': 30, 'Slayer': 45, 'Smithing': 35, 'Woodcutting': 45 },
    quests: ['Ghosts Ahoy', 'The Restless Ghost', 'Shades of Mort\'ton', 'A Fairy Tale II - Cure a Queen', 'Priest in Peril', 'In Aid of the Myreque', 'The Darkness of Hallowvale', 'In Search of the Myreque', 'Dwarf Cannon', 'Haunted Mine'], requiredRegions: ['Morytania']
  },
  'Morytania Hard': {
    id: 'Morytania Hard', region: 'Morytania', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 65, 'Construction': 50, 'Crafting': 64, 'Defence': 70, 'Farming': 63, 'Firemaking': 62, 'Fletching': 70, 'Magic': 70, 'Runecrafting': 50, 'Slayer': 67, 'Woodcutting': 76 },
    quests: ['Haunted Mine', 'Legacy of Seergaze', 'Creature of Fenkenstrain', 'Desert Treasure', 'The Branches of Darkmeyer', 'In Aid of the Myreque', 'All Fired Up'], requiredRegions: ['Morytania']
  },
  'Morytania Elite': {
    id: 'Morytania Elite', region: 'Morytania', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Farming': 91, 'Firemaking': 80, 'Fishing': 96, 'Herblore': 94, 'Runecrafting': 77, 'Slayer': 85, 'Strength': 76, 'Summoning': 87 },
    quests: ['Legacy of Seergaze', 'The Darkness of Hallowvale', 'Shades of Mort\'ton', 'Ritual of the Mahjarrat', 'The Branches of Darkmeyer'], requiredRegions: ['Morytania']
  },
  // --- SEERS' VILLAGE ---
  'Seers\' Village Easy': {
    id: 'Seers\' Village Easy', region: 'Kandarin', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Cooking': 21, 'Farming': 13, 'Fishing': 16 },
    quests: ['Murder Mystery'], requiredRegions: ['Kandarin']
  },
  'Seers\' Village Medium': {
    id: 'Seers\' Village Medium', region: 'Kandarin', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 48, 'Cooking': 43, 'Firemaking': 45, 'Fishing': 46, 'Magic': 45, 'Ranged': 40, 'Summoning': 46 },
    quests: ['Scorpion Catcher', 'One Small Favour', 'Elemental Workshop I'], requiredRegions: ['Kandarin']
  },
  'Seers\' Village Hard': {
    id: 'Seers\' Village Hard', region: 'Kandarin', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 36, 'Cooking': 80, 'Defence': 70, 'Firemaking': 75, 'Fishing': 76, 'Fletching': 80, 'Magic': 56, 'Prayer': 70, 'Ranged': 39, 'Strength': 22, 'Woodcutting': 70 },
    quests: ['King\'s Ransom', 'A Fairy Tale II - Cure a Queen', 'Family Crest'], requiredRegions: ['Kandarin']
  },
  'Seers\' Village Elite': {
    id: 'Seers\' Village Elite', region: 'Kandarin', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Cooking': 70, 'Crafting': 10, 'Fishing': 35, 'Fletching': 85, 'Herblore': 92, 'Magic': 83, 'Ranged': 40, 'Smithing': 40 },
    quests: ['Lunar Diplomacy'], requiredRegions: ['Kandarin']
  },
  // --- TIRANNWN ---
  'Tirannwn Easy': {
    id: 'Tirannwn Easy', region: 'Tirannwn', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Defence': 5, 'Magic': 52, 'Mining': 10, 'Slayer': 56, 'Thieving': 50 },
    quests: ['Underground Pass', 'Regicide', 'Mourning\'s End Part I', 'A Fairy Tale II - Cure a Queen', 'Desert Treasure', 'Mourning\'s End Part II', 'The Path of Glouphrie'], requiredRegions: ['Tirannwn']
  },
  'Tirannwn Medium': {
    id: 'Tirannwn Medium', region: 'Tirannwn', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 56, 'Farming': 57, 'Fishing': 76, 'Fletching': 75, 'Herblore': 48, 'Hunter': 77, 'Runecrafting': 65, 'Summoning': 64, 'Woodcutting': 70 },
    quests: ['Mourning\'s End Part I', 'Regicide', 'Deadliest Catch', 'The Prisoner of Glouphrie', 'Underground Pass', 'Mourning\'s End Part II', 'Within the Light'], requiredRegions: ['Tirannwn']
  },
  'Tirannwn Hard': {
    id: 'Tirannwn Hard', region: 'Tirannwn', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 77, 'Attack': 70, 'Combat': 120, 'Crafting': 75, 'Divination': 81, 'Farming': 75, 'Herblore': 77, 'Hunter': 74, 'Magic': 50, 'Mining': 40, 'Prayer': 75, 'Ranged': 70, 'Slayer': 85, 'Summoning': 88, 'Woodcutting': 80 },
    quests: ['Plague\'s End', 'Legacy of Seergaze', 'Desert Treasure', 'Bringing Home the Bacon'], requiredRegions: ['Tirannwn']
  },
  'Tirannwn Elite': {
    id: 'Tirannwn Elite', region: 'Tirannwn', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Crafting': 89, 'Dungeoneering': 95, 'Farming': 90, 'Fletching': 90, 'Herblore': 76, 'Mining': 81, 'Slayer': 95, 'Smithing': 90, 'Thieving': 95, 'Woodcutting': 90 },
    quests: ['Plague\'s End', 'Fate of the Gods', 'The Branches of Darkmeyer', 'Ritual of the Mahjarrat', 'The World Wakes', 'The Eyes of Glouphrie', 'As a First Resort'], requiredRegions: ['Tirannwn', 'Asgarnia']
  },
  // --- UNDERWORLD ---
  'Underworld Easy': {
    id: 'Underworld Easy', region: 'Morytania', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Crafting': 15, 'Necromancy': 20, 'Prayer': 10 },
    quests: ['Necromancy!', 'Rune Mythos', 'Kili Row'], requiredRegions: ['Morytania']
  },
  'Underworld Medium': {
    id: 'Underworld Medium', region: 'Morytania', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Crafting': 45, 'Defence': 37, 'Herblore': 11, 'Necromancy': 50, 'Runecrafting': 40, 'Slayer': 32 },
    quests: ['Rune Mythos', 'Kili Row'], requiredRegions: ['Morytania']
  },
  'Underworld Hard': {
    id: 'Underworld Hard', region: 'Morytania', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Cooking': 66, 'Crafting': 79, 'Farming': 74, 'Fishing': 66, 'Fletching': 82, 'Hunter': 68, 'Magic': 68, 'Necromancy': 80, 'Runecrafting': 60, 'Smithing': 70 },
    quests: ['Curse of the Empty Lord', 'Rune Mythos'], requiredRegions: ['Morytania']
  },
  'Underworld Elite': {
    id: 'Underworld Elite', region: 'Morytania', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Herblore': 96, 'Necromancy': 90, 'Prayer': 95, 'Runecrafting': 90 },
    quests: ['Requiem for a Dragon', 'Necromancy!', 'Nomad\'s Elegy', 'The Temple at Senntisten', '\'Phite Club', 'Icthlarin\'s Little Helper', 'Soul Searching', 'Housing of Parliament'], requiredRegions: ['Morytania']
  },
  // --- VARROCK ---
  'Varrock Easy': {
    id: 'Varrock Easy', region: 'Misthalin', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: { 'Agility': 13, 'Crafting': 8, 'Fishing': 20, 'Mining': 10 },
    quests: [], requiredRegions: ['Misthalin']
  },
  'Varrock Medium': {
    id: 'Varrock Medium', region: 'Misthalin', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 21, 'Combat': 30, 'Construction': 40, 'Firemaking': 40, 'Magic': 49, 'Mining': 42, 'Runecrafting': 35, 'Thieving': 40 },
    quests: ['What Lies Below', 'Rat Catchers', 'Tree Gnome Village', 'Gertrude\'s Cat', 'Garden of Tranquillity', 'A Soul\'s Bane', 'The Dig Site', 'Enlightened Journey', 'A Fairy Tale II - Cure a Queen', 'Dragon Slayer'], requiredRegions: ['Misthalin']
  },
  'Varrock Hard': {
    id: 'Varrock Hard', region: 'Misthalin', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Agility': 51, 'Construction': 67, 'Cooking': 32, 'Crafting': 66, 'Farming': 70, 'Magic': 66, 'Smithing': 40, 'Woodcutting': 57 },
    quests: ['Family Crest', 'Desert Treasure'], requiredRegions: ['Misthalin']
  },
  'Varrock Elite': {
    id: 'Varrock Elite', region: 'Misthalin', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Cooking': 95, 'Dungeoneering': 65, 'Farming': 15, 'Fletching': 83, 'Magic': 80, 'Prayer': 92, 'Runecrafting': 78, 'Smithing': 80, 'Woodcutting': 80 },
    quests: ['What Lies Below', 'Nomad\'s Requiem', 'All Fired Up', 'Land of the Goblins', 'Troll Stronghold', 'The Temple at Senntisten'], requiredRegions: ['Misthalin', 'Wilderness']
  },
  // --- WILDERNESS ---
  'Wilderness Easy': {
    id: 'Wilderness Easy', region: 'Wilderness', tier: 'Easy', difficulty: DropSource.DIARY_EASY,
    skills: {  },
    quests: [], requiredRegions: ['Wilderness', 'Misthalin']
  },
  'Wilderness Medium': {
    id: 'Wilderness Medium', region: 'Wilderness', tier: 'Medium', difficulty: DropSource.DIARY_MEDIUM,
    skills: { 'Agility': 52, 'Cooking': 55, 'Crafting': 55, 'Farming': 57, 'Herblore': 57, 'Hunter': 67, 'Magic': 60, 'Thieving': 32, 'Woodcutting': 57 },
    quests: [], requiredRegions: ['Wilderness']
  },
  'Wilderness Hard': {
    id: 'Wilderness Hard', region: 'Wilderness', tier: 'Hard', difficulty: DropSource.DIARY_HARD,
    skills: { 'Attack': 25, 'Defence': 25, 'Farming': 57, 'Herblore': 65, 'Magic': 66 },
    quests: ['Summer\'s End'], requiredRegions: ['Wilderness']
  },
  'Wilderness Elite': {
    id: 'Wilderness Elite', region: 'Wilderness', tier: 'Elite', difficulty: DropSource.DIARY_ELITE,
    skills: { 'Agility': 83, 'Farming': 57, 'Fletching': 93, 'Herblore': 82, 'Hunter': 88, 'Slayer': 94, 'Woodcutting': 85 },
    quests: [], requiredRegions: ['Wilderness']
  },
};
