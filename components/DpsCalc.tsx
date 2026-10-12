// Equipment Lab → DPS: RS3 ability-damage / hit-chance calculator against the
// bundled RS3 boss stat blocks (data/rs3Bosses.ts). Formulas: utils/dps.ts
// (RuneScape Wiki "Ability damage" + "Hit chance"). No external data is loaded.
import React, { useState, useEffect, useMemo } from 'react';
import { Swords, Crosshair, Wand2, Skull, Target, Info, Zap, Clock, Crown, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { gearService } from '../services/GearService';
import { monsterService } from '../services/MonsterService';
import { GearItem, styleDamageBonus } from '../utils/gearStats';
import { computeDps, ROTATIONS, POTIONS, formatDuration, Style } from '../utils/dps';
import { bestLoadout, weaponSetupOf, STYLE_SKILLS, STYLE_LABEL, KILL_OVERHEAD_S, ARMOUR_SLOTS } from '../utils/bossPlanner';
import { COMBAT_STYLES } from '../data/rs3Gear';
import { WikiLink } from './WikiLink';

const STYLE_ICON: Record<Style, typeof Swords> = { melee: Swords, ranged: Crosshair, magic: Wand2, necromancy: Skull };

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-widest text-gray-500">{label}</span>
    {children}
  </label>
);
const selectCls = 'bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-gray-200 focus:outline-none focus:border-red-500/40';

type Source = 'auto' | 'equipped';

export const DpsCalc: React.FC = () => {
  const { unlocks, loadout: rawLoadout } = useGame();
  const loadout = rawLoadout || {};

  const combatBosses = useMemo(() => monsterService.all().filter((b) => !b.skilling), []);
  const unlockedSet = useMemo(() => new Set(unlocks.bosses || []), [unlocks.bosses]);
  const sortedBosses = useMemo(
    () => [...combatBosses].sort((a, b) => Number(unlockedSet.has(b.name)) - Number(unlockedSet.has(a.name)) || a.lp - b.lp),
    [combatBosses, unlockedSet],
  );

  const [bossName, setBossName] = useState<string>(() => sortedBosses[0]?.name ?? 'King Black Dragon');
  const [style, setStyle] = useState<Style>('melee');
  const [source, setSource] = useState<Source>('auto');
  const [rotationId, setRotationId] = useState('revolution');
  const [potionId, setPotionId] = useState('none');
  const [accLevel, setAccLevel] = useState(1);
  const [dmgLevel, setDmgLevel] = useState(1);

  // Prefill levels from the run for the chosen style.
  useEffect(() => {
    const L = unlocks.levels || {};
    const sk = STYLE_SKILLS[style];
    setAccLevel(L[sk.accuracy] || 1);
    setDmgLevel(L[sk.damage] || 1);
  }, [unlocks.levels, style]);

  const boss = monsterService.byName(bossName) ?? sortedBosses[0];

  // Loadout: best-in-tier for the style, or what's equipped in the Gear tab.
  const setup = useMemo(() => {
    if (source === 'auto') {
      const l = bestLoadout(unlocks.equipment, style, { ...unlocks.levels, [STYLE_SKILLS[style].damage]: dmgLevel });
      return { weapon: l.weapon, damageBonus: l.damageBonus, capTier: l.capTier, slots: l.slots, mismatch: false };
    }
    const get = (s: string) => gearService.byId(loadout[s]);
    const main = get('Weapon');
    const off = get('Shield');
    const ammo = get('Ammo');
    const slots: Record<string, GearItem | undefined> = {};
    for (const s of [...ARMOUR_SLOTS, 'Weapon', 'Shield', 'Ammo']) slots[s] = get(s);
    const usable = main && main.style === style ? main : undefined;
    const usableOff = off && off.style === style && off.hand === 'off-hand' ? off : undefined;
    let capTier: number | undefined;
    if (style === 'ranged' && usable?.ammo) capTier = ammo && ammo.ammoKind === usable.ammo ? ammo.tier : 0;
    return {
      weapon: weaponSetupOf(usable, usableOff),
      damageBonus: styleDamageBonus(Object.values(slots), style),
      capTier,
      slots,
      mismatch: !!main && main.style !== style,
    };
  }, [source, unlocks.equipment, unlocks.levels, style, dmgLevel, loadout]);

  const result = useMemo(() => boss && computeDps({
    style,
    levels: { accuracy: accLevel, damage: dmgLevel },
    weapon: setup.weapon,
    damageBonus: setup.damageBonus,
    capTier: setup.capTier,
    rotationId,
    potionId,
    target: { affinity: boss.affinity[style], defence: boss.defence, armour: boss.armour, lp: boss.lp },
  }), [boss, style, accLevel, dmgLevel, setup, rotationId, potionId]);

  if (!boss || !result) return null;
  const kph = isFinite(result.ttk) ? Math.floor(3600 / (result.ttk + KILL_OVERHEAD_S)) : 0;
  const weaponName = setup.slots.Weapon?.name;
  const offName = setup.slots.Shield?.hand === 'off-hand' ? setup.slots.Shield?.name : undefined;
  const sk = STYLE_SKILLS[style];

  return (
    <div className="flex flex-col gap-4">
      {/* Target */}
      <div className="bg-[#0e181d] border border-white/10 rounded-xl p-3 space-y-3">
        <Field label="Boss">
          <select value={boss.name} onChange={(e) => setBossName(e.target.value)} className={selectCls}>
            {sortedBosses.map((b) => (
              <option key={b.name} value={b.name}>{unlockedSet.has(b.name) ? '★ ' : ''}{b.name}{b.npc ? ` (${b.npc})` : ''}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <Info2 label="Life points" value={boss.lp.toLocaleString()} />
          <Info2 label="Defence / armour" value={`${boss.defence} / ${boss.armour}`} />
          <Info2 label={`${STYLE_LABEL[style]} affinity`} value={`${boss.affinity[style]}`} />
          <Info2 label="Weakness" value={boss.weakness ?? 'None'} />
        </div>
        <div className="text-[10px] text-gray-500">
          Recommended: <span className="text-gray-300">{STYLE_LABEL[boss.recStyle]}</span>, RS3 tier {boss.recTier}+ gear, level {boss.recLevel}+
          {boss.group ? ` · ${boss.group}` : ''}{boss.enrage ? ` · ${boss.enrage}` : ''}
          {' · '}<WikiLink name={boss.npc ?? boss.name} />
        </div>
      </div>

      {/* Setup */}
      <div className="bg-[#0e181d] border border-white/10 rounded-xl p-3 space-y-3">
        <div className="flex gap-1 flex-wrap">
          {COMBAT_STYLES.map((s) => {
            const Icon = STYLE_ICON[s];
            return (
              <button key={s} onClick={() => setStyle(s)} className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-bold ${style === s ? 'border-red-500/40 bg-red-950/30 text-red-200' : 'border-white/10 bg-[#121d24] text-gray-400 hover:text-gray-200'}`}>
                <Icon size={12} /> {STYLE_LABEL[s]}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Loadout">
            <select value={source} onChange={(e) => setSource(e.target.value as Source)} className={selectCls}>
              <option value="auto">Best from unlocked tiers</option>
              <option value="equipped">Equipped (Gear tab)</option>
            </select>
          </Field>
          <Field label="Rotation (per 1.8s GCD)">
            <select value={rotationId} onChange={(e) => setRotationId(e.target.value)} className={selectCls}>
              {ROTATIONS.map((r) => <option key={r.id} value={r.id}>{r.label} · {r.mult}× AD</option>)}
            </select>
          </Field>
          <Field label="Boost">
            <select value={potionId} onChange={(e) => setPotionId(e.target.value)} className={selectCls}>
              {POTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
          <Field label={`${sk.accuracy} level`}>
            <input type="number" min={1} max={120} value={accLevel} onChange={(e) => setAccLevel(Math.max(1, Math.min(120, Number(e.target.value) || 1)))} className={selectCls} />
          </Field>
          {sk.damage !== sk.accuracy && (
            <Field label={`${sk.damage} level`}>
              <input type="number" min={1} max={120} value={dmgLevel} onChange={(e) => setDmgLevel(Math.max(1, Math.min(120, Number(e.target.value) || 1)))} className={selectCls} />
            </Field>
          )}
        </div>
        <div className="text-[10px] text-gray-500 flex items-start gap-1.5">
          <Shield size={11} className="shrink-0 mt-0.5" />
          <span>
            {weaponName ? <><span className="text-gray-300">{weaponName}</span>{offName ? <> + <span className="text-gray-300">{offName}</span></> : null}</> : <span className="text-amber-300/80">Unarmed — unlock a Weapon tier</span>}
            {' · '}damage bonus <span className="text-gray-300">+{setup.damageBonus}</span>
            {style === 'ranged' && setup.capTier !== undefined && <> · ammo tier cap <span className="text-gray-300">{setup.capTier}</span></>}
            {setup.mismatch && <span className="text-amber-300"> · equipped weapon is not {STYLE_LABEL[style]}</span>}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Hit chance" value={`${Math.round(result.hitChance * 100)}%`} accent="text-amber-300" Icon={Crosshair} />
        <Stat label="Ability dmg" value={result.abilityDamage.toLocaleString()} accent="text-red-300" Icon={Zap} />
        <Stat label="DPS" value={Math.round(result.dps).toLocaleString()} accent="text-emerald-300" Icon={Target} />
        <Stat label="Time to kill" value={formatDuration(result.ttk)} accent="text-sky-300" Icon={Clock} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <Info2 label="Accuracy" value={result.accuracy.toLocaleString()} />
        <Info2 label="Armour rating" value={result.armourRating.toLocaleString()} />
        <Info2 label="Kills / hr" value={kph ? `~${kph}` : '—'} Icon={Crown} />
      </div>

      <p className="text-[9px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Info size={11} className="shrink-0 mt-0.5" />
        <span>
          Ability damage and hit chance use the RuneScape Wiki formulas (weapon tier capped by Strength / spell tier / ammo tier;
          H = affinity × accuracy ÷ armour rating). DPS assumes every 1.8s GCD deals the rotation's average multiple of ability
          damage ({ROTATIONS.find((r) => r.id === rotationId)?.blurb}), with crits, bleeds, prayers, perks and boss damage
          reduction folded in — a planning estimate, not a parse. Kills/hr adds ~{KILL_OVERHEAD_S}s between kills; enrage, phases
          and mechanics will lengthen real kills.
        </span>
      </p>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode; accent: string; Icon: typeof Zap }> = ({ label, value, accent, Icon }) => (
  <div className="rounded-lg bg-[#0e181d] border border-white/5 px-3 py-2">
    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-gray-500 mb-0.5"><Icon size={10} /> {label}</div>
    <div className={`text-xl font-black leading-none ${accent}`}>{value}</div>
  </div>
);

const Info2: React.FC<{ label: string; value: React.ReactNode; Icon?: typeof Zap }> = ({ label, value, Icon }) => (
  <div className="rounded bg-[#121d24] border border-white/5 px-2 py-1 min-w-0">
    <div className="text-[8px] uppercase tracking-widest text-gray-600 flex items-center gap-1">{Icon && <Icon size={9} />}{label}</div>
    <div className="text-[11px] font-bold text-gray-200 truncate" title={String(value)}>{value}</div>
  </div>
);
