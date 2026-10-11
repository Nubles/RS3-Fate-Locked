import { describe, it, expect } from 'vitest';
import { BOSSES_LIST, EQUIPMENT_SLOTS } from '../data/items';
import { EQUIPMENT_TIER_MAX } from '../config/rules';
import { RS3_BOSSES, bossByName } from '../data/rs3Bosses';
import { RS3_GEAR, COMBAT_STYLES } from '../data/rs3Gear';
import { ACTIVITY_REQUIREMENTS } from '../data/activityRequirements';
import { ALL_GEAR, bestLoadout, planBoss, allowedItems, PlanInput } from './bossPlanner';

const tiers = (t: number) => Object.fromEntries(EQUIPMENT_SLOTS.map((s) => [s, t]));
const levels = (l: number) => ({
  Attack: l, Strength: l, Ranged: l, Magic: l, Necromancy: l, Defence: l, Constitution: l, Prayer: l, Summoning: l, Slayer: l, Agility: l,
});
const input = (over: Partial<PlanInput> = {}): PlanInput => ({
  equipment: tiers(EQUIPMENT_TIER_MAX), levels: levels(99), quests: [], rotationId: 'revolution', potionId: 'none', ...over,
});

describe('RS3 boss dataset', () => {
  it('has a boss record for every BOSSES_LIST entry, and nothing else', () => {
    for (const b of BOSSES_LIST) expect(bossByName(b), b).toBeDefined();
    expect(RS3_BOSSES.map((b) => b.name).sort()).toEqual([...BOSSES_LIST].sort());
  });

  it('every combat boss has sane RS3 stats', () => {
    for (const b of RS3_BOSSES) {
      if (b.skilling) continue;
      expect(b.lp, b.name).toBeGreaterThan(0);
      expect(b.defence, b.name).toBeGreaterThanOrEqual(1);
      expect(b.armour, b.name).toBeGreaterThan(0);
      expect(b.recTier, b.name).toBeGreaterThanOrEqual(1);
      expect(b.recTier, b.name).toBeLessThanOrEqual(95);
      for (const s of COMBAT_STYLES) expect(b.affinity[s], `${b.name} ${s}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('pins wiki-verified stat blocks', () => {
    expect(bossByName('Telos')).toMatchObject({ lp: 400_000, defence: 80, armour: 1924 });
    expect(bossByName('Rasial')).toMatchObject({ lp: 800_000, defence: 95, recStyle: 'necromancy' });
    expect(bossByName('Hermod')!.affinity.necromancy).toBe(90);
    expect(bossByName("Kree'arra")!.affinity.melee).toBe(10);
  });
});

describe('RS3 gear dataset', () => {
  it('only uses real equipment slots and unique names', () => {
    for (const it of RS3_GEAR) expect(EQUIPMENT_SLOTS, it.name).toContain(it.slot);
    const names = RS3_GEAR.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every style has a weapon and a body at Fate tier 1 and at Fate tier 9', () => {
    for (const style of COMBAT_STYLES) {
      for (const slot of ['Weapon', 'Body']) {
        const list = ALL_GEAR.filter((i) => i.slot === slot && i.style === style);
        expect(list.some((i) => i.fateTier === 1), `${style} ${slot} T1`).toBe(true);
        expect(list.some((i) => i.fateTier === 9), `${style} ${slot} T9`).toBe(true);
      }
    }
  });

  it('covers the meaningful RS3 tiers', () => {
    const tiersPresent = new Set(ALL_GEAR.map((i) => i.tier));
    for (const t of [1, 10, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 92, 95]) expect(tiersPresent.has(t), `tier ${t}`).toBe(true);
  });

  it('gates items by the unlocked Fate tier', () => {
    expect(allowedItems('Weapon', 0)).toHaveLength(0);
    for (const it of allowedItems('Weapon', 3)) expect(it.tier).toBeLessThanOrEqual(50);
  });
});

describe('loadout builder', () => {
  it('picks top-tier gear when everything is maxed', () => {
    const melee = bestLoadout(tiers(9), 'melee', levels(99));
    expect(melee.weaponTier).toBeGreaterThanOrEqual(92);
    expect(melee.slots.Body?.name).toBe('Trimmed masterwork platebody');
    const necro = bestLoadout(tiers(9), 'necromancy', levels(99));
    expect(necro.slots.Weapon?.name).toBe('Omni guard');
    expect(necro.slots.Shield?.name).toBe('Soulbound lantern');
  });

  it('is unarmed with every slot locked', () => {
    const l = bestLoadout(tiers(0), 'melee', levels(99));
    expect(l.weapon.kind).toBe('none');
    expect(l.damageBonus).toBe(0);
  });

  it('respects per-slot tiers and the ammo cap for ranged', () => {
    const eq = { ...tiers(9), Ammo: 3 }; // rune ammo at best
    const l = bestLoadout(eq, 'ranged', levels(99));
    expect(l.capTier === undefined || l.capTier <= 50).toBe(true);
    const weaponOnly = { ...tiers(0), Weapon: 2 };
    expect(bestLoadout(weaponOnly, 'melee', levels(99)).weaponTier).toBeLessThanOrEqual(30);
  });
});

describe('boss kill planner', () => {
  it('prefers Necromancy against Hermod (Necromancy weakness)', () => {
    const p = planBoss(bossByName('Hermod')!, ACTIVITY_REQUIREMENTS['Hermod'], input({ quests: ['The Spirit of War'] }));
    expect(p.best?.style).toBe('necromancy');
    expect(p.readiness).toBe('ready');
    expect(p.killsPerHour).toBeGreaterThan(0);
  });

  it('blocks on missing quests / skill gates from activityRequirements', () => {
    const p = planBoss(bossByName('Hermod')!, ACTIVITY_REQUIREMENTS['Hermod'], input());
    expect(p.readiness).toBe('blocked');
    expect(p.missingQuests).toContain('The Spirit of War');
    const g = planBoss(bossByName('General Graardor')!, ACTIVITY_REQUIREMENTS['General Graardor'], input({ levels: { ...levels(99), Strength: 60 }, quests: ['Troll Stronghold'] }));
    expect(g.missingSkills.map((m) => m.skill)).toContain('Strength');
  });

  it('better gear means a faster kill, and low gear is undergeared on an endgame boss', () => {
    const telos = bossByName('Telos')!;
    const strong = planBoss(telos, undefined, input());
    const weak = planBoss(telos, undefined, input({ equipment: tiers(3) }));
    expect(strong.best!.result.ttk).toBeLessThan(weak.best!.result.ttk);
    expect(weak.readiness).toBe('undergeared');
    expect(weak.gearDelta).toBeLessThan(0);
  });

  it('skilling bosses get no DPS plan', () => {
    const p = planBoss(bossByName('Croesus')!, undefined, input());
    expect(p.readiness).toBe('skilling');
    expect(p.styles).toHaveLength(0);
  });
});

describe('style tie-break', () => {
  it('prefers the recommended style when kill times tie (Rasial → Necromancy)', () => {
    const p = planBoss(bossByName('Rasial')!, undefined, input());
    expect(p.best?.style).toBe('necromancy');
  });
});
