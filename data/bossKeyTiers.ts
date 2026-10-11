// Per-encounter key-roll tier for every entry in BOSSES_LIST.
//
// Replaces the old vague "Low/Mid/High boss" buttons: the Farm Keys UI now lists
// every boss by name with its own rate, grouped by these tiers, so it's obvious
// which encounter sits where. Elite Dungeons and Liberation of Mazcab live here
// too, at the raid tier.
//
// Tiers are a difficulty judgement (entry → endgame) and are intentionally easy
// to tweak in one place. A consistency test asserts every BOSSES_LIST entry is
// classified here.

import { DropSource } from '../types';

export type BossTier = 'low' | 'mid' | 'high' | 'raid';

export const BOSS_TIERS: Record<string, BossTier> = {
  // ── Raids & Elite Dungeons (group content, the best repeatable odds) ───────
  'Temple of Aminishi': 'raid',
  'Dragonkin Laboratory': 'raid',
  'The Shadow Reef': 'raid',
  'Zamorakian Undercity': 'raid',
  'Liberation of Mazcab': 'raid',

  // ── High (endgame solo/duo, enrage-scaling bosses, Zuk) ─────────────────────
  'Vorago': 'high',
  'Telos': 'high',
  'Solak': 'high',
  'Araxxor': 'high',
  'Nex: Angel of Death': 'high',
  'Raksha': 'high',
  'Arch-Glacor': 'high',
  'Kerapac': 'high',
  'Zamorak, Lord of Chaos': 'high',
  'TzKal-Zuk': 'high',
  'Rasial': 'high',
  'Sanctum of Rebirth': 'high',
  'Barrows: Rise of the Six': 'high',
  'Kalphite King': 'high',
  'Amascut, the Devourer': 'high',
  'The Magister': 'high',

  // ── Mid (God Wars 1 & 2, Corp, QBD, Legiones, Kiln, mid slayer bosses) ──────
  'Nex': 'mid',
  'General Graardor': 'mid',
  'Commander Zilyana': 'mid',
  "Kree'arra": 'mid',
  "K'ril Tsutsaroth": 'mid',
  'Helwyr': 'mid',
  'Twin Furies': 'mid',
  'Gregorovic': 'mid',
  'Vindicta & Gorvek': 'mid',
  'Corporeal Beast': 'mid',
  'Queen Black Dragon': 'mid',
  'Legiones': 'mid',
  'Har-Aken': 'mid',
  'Dagannoth Kings': 'mid',
  'Exiled Kalphite Queen': 'mid',
  'Black Stone Dragon': 'mid',
  'Hermod': 'mid',
  'Zemouregal & Vorkath': 'mid',
  'Rex Matriarchs': 'mid',
  'Flesh-hatcher Mhekarnahz': 'mid',

  // ── Low (entry bosses, skilling bosses, the Fight Cave) ─────────────────────
  'Kalphite Queen': 'low',
  'Giant Mole': 'low',
  'King Black Dragon': 'low',
  'Chaos Elemental': 'low',
  'Barrows Brothers': 'low',
  'Bork': 'low',
  'TzHaar Fight Cave': 'low',
  'Skeletal Horror': 'low',
  'Croesus': 'low',
  'Gate of Elidinis': 'low',
  'Ivar, King of Bones': 'low',
  'Silverquill, the Dreadhog': 'low',
};

export const TIER_SOURCE: Record<BossTier, DropSource> = {
  low: DropSource.BOSS_LOW,
  mid: DropSource.BOSS_MID,
  high: DropSource.BOSS_HIGH,
  raid: DropSource.RAID,
};

export const TIER_LABEL: Record<BossTier, string> = { low: 'Low', mid: 'Mid', high: 'High', raid: 'Raid' };

/** Display order of tiers (best rate first). */
export const TIER_ORDER: BossTier[] = ['raid', 'high', 'mid', 'low'];

export const bossTier = (name: string): BossTier => BOSS_TIERS[name] ?? 'mid';
