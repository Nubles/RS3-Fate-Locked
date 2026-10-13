// Boss Kill Planner — RS3 readiness + estimated time-to-kill for every unlocked
// boss. Bosses: data/rs3Bosses.ts (RuneScape Wiki stat blocks); gear:
// data/rs3Gear.ts gated by your unlocked Fate tiers; engine: utils/bossPlanner.ts
// + utils/dps.ts (wiki ability-damage / hit-chance formulas). Offline.
import React, { useState, useMemo } from 'react';
import {
  X, Swords, Crosshair, Clock, Skull, Crown, Info, ChevronRight, FlaskConical, Box,
  Target, ShieldCheck, AlertTriangle, Lock, Pickaxe,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { SectionGuide } from './SectionGuide';
import { monsterService } from '../services/MonsterService';
import { planBoss, BossPlan, Readiness, STYLE_LABEL, STYLE_SKILLS } from '../utils/bossPlanner';
import { ROTATIONS, formatDuration } from '../utils/dps';
import { ACTIVITY_REQUIREMENTS } from '../data/activityRequirements';
import { EntityModel } from './EntityModel';
import { modelFor, orientationFor } from '../data/entityModels';
import { WikiLink } from './WikiLink';
import { SPECIAL_ICONS } from '../data/assets';

interface Props { onClose: () => void }

const bossImg = (boss: string) => `https://runescape.wiki/images/${(SPECIAL_ICONS[boss] ?? `${boss}.png`).replace(/ /g, '_')}`;

const READINESS: Record<Readiness, { label: string; cls: string; dot: string }> = {
  ready: { label: 'Ready', cls: 'text-emerald-300', dot: 'bg-emerald-400' },
  stretch: { label: 'Stretch', cls: 'text-amber-300', dot: 'bg-amber-400' },
  undergeared: { label: 'Undergeared', cls: 'text-red-300', dot: 'bg-red-400' },
  blocked: { label: 'Requirements missing', cls: 'text-gray-400', dot: 'bg-gray-500' },
  skilling: { label: 'Skilling boss', cls: 'text-sky-300', dot: 'bg-sky-400' },
};
const READY_ORDER: Readiness[] = ['ready', 'stretch', 'skilling', 'undergeared', 'blocked'];

export const BossKillPlanner: React.FC<Props> = ({ onClose }) => {
  const { unlocks } = useGame();
  useEscapeKey(onClose, true);

  const [rotationId, setRotationId] = useState('revolution');
  const [boostsOn, setBoostsOn] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const unlockedSet = useMemo(() => new Set(unlocks.bosses || []), [unlocks.bosses]);
  const plans = useMemo(() => {
    const input = {
      equipment: unlocks.equipment || {},
      levels: unlocks.levels || {},
      quests: unlocks.quests || [],
      rotationId,
      potionId: boostsOn ? 'elder' : 'none',
    };
    const names = showAll ? monsterService.all().map((b) => b.name) : (unlocks.bosses || []);
    const out: BossPlan[] = [];
    for (const name of names) {
      const boss = monsterService.byName(name);
      if (boss) out.push(planBoss(boss, ACTIVITY_REQUIREMENTS[name], input));
    }
    return out.sort((a, b) =>
      READY_ORDER.indexOf(a.readiness) - READY_ORDER.indexOf(b.readiness)
      || (a.best?.result.ttk ?? Infinity) - (b.best?.result.ttk ?? Infinity));
  }, [unlocks.equipment, unlocks.levels, unlocks.quests, unlocks.bosses, rotationId, boostsOn, showAll]);

  const current = plans.find((p) => p.boss.name === selected) ?? plans[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose} role="dialog" aria-modal="true" aria-label="Boss Kill Planner">
      <div className="bg-[#181614] border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl h-[82vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-[#1e1b18] shrink-0 flex-wrap">
          <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/30 text-red-300"><Skull size={18} /></div>
          <div className="flex-1 min-w-[180px]">
            <h2 className="text-base font-bold text-white leading-none flex items-center gap-1.5">Boss Kill Planner <SectionGuide id="KILL_PLANNER" /></h2>
            <p className="text-[11px] text-gray-500 mt-1">Readiness and estimated kill times against your RS3 bosses, from your unlocked gear tiers and levels.</p>
          </div>
          <select value={rotationId} onChange={(e) => setRotationId(e.target.value)} title="Assumed rotation" className="bg-[#221f1c] border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-gray-300">
            {ROTATIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <button onClick={() => setBoostsOn((b) => !b)} title="Toggle elder overloads" className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wide transition-colors ${boostsOn ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-white/10 bg-[#221f1c] text-gray-400'}`}>
            <FlaskConical size={11} /> Overload {boostsOn ? 'on' : 'off'}
          </button>
          <button onClick={() => setShowAll((s) => !s)} title="Include bosses you haven't unlocked" className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wide ${showAll ? 'border-sky-500/40 bg-sky-950/30 text-sky-300' : 'border-white/10 bg-[#221f1c] text-gray-400'}`}>
            {showAll ? 'All bosses' : 'Unlocked'}
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>

        {plans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-gray-500 px-8">
            <Skull size={26} className="text-gray-600" />
            <p className="text-[12px]">No bosses unlocked yet — unlock some via fate, or switch to <button className="text-sky-300 underline" onClick={() => setShowAll(true)}>all bosses</button> to plan ahead.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col min-h-0 border-r border-white/10 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {plans.map((p) => {
                const r = READINESS[p.readiness];
                const isActive = current?.boss.name === p.boss.name;
                return (
                  <button key={p.boss.name} onClick={() => setSelected(p.boss.name)} className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 border text-left transition-colors ${isActive ? 'border-red-500/40 bg-red-950/30' : 'border-transparent hover:bg-white/5'}`}>
                    <img src={bossImg(p.boss.name)} alt="" className="w-7 h-7 object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-gray-200 truncate flex items-center gap-1">
                        {showAll && !unlockedSet.has(p.boss.name) && <Lock size={10} className="text-gray-600 shrink-0" />}
                        {p.boss.name}
                      </div>
                      <div className={`text-[10px] flex items-center gap-1.5 ${r.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} /> {r.label}
                        {p.best && <span className="text-gray-500">· {STYLE_LABEL[p.best.style]} · {formatDuration(p.best.result.ttk)}</span>}
                      </div>
                    </div>
                    <ChevronRight size={13} className={isActive ? 'text-red-300' : 'text-gray-600'} />
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-4">
              {current && <Detail plan={current} levels={unlocks.levels || {}} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Detail: React.FC<{ plan: BossPlan; levels: Record<string, number> }> = ({ plan, levels }) => {
  const { boss } = plan;
  const r = READINESS[plan.readiness];
  const model = modelFor(boss.name);
  const { animationsEnabled } = useGame();
  const [show3D, setShow3D] = useState(true);
  const best = plan.best;
  const toggleBtn = (cls: string) => (
    <button onClick={() => setShow3D((s) => !s)} title={show3D ? 'Show 2D sprite' : 'Show 3D model'} className={`flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-black/40 text-[10px] font-bold text-gray-300 hover:text-white hover:border-white/20 transition-colors ${cls}`}>
      <Box size={11} /> {show3D ? '3D' : '2D'}
    </button>
  );
  const recLevelSkill = STYLE_SKILLS[boss.recStyle].damage;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {model && show3D && (
        <div className="relative w-full h-56 rounded-xl bg-gradient-to-b from-white/[0.05] to-black/30 border border-white/10 overflow-hidden">
          <EntityModel src={model} poster={bossImg(boss.name)} alt={boss.name} interactive autoRotate={animationsEnabled} orientation={orientationFor(boss.name)} fill />
          {toggleBtn('absolute top-2 right-2 z-10')}
        </div>
      )}

      <div className="flex items-center gap-3">
        {(!model || !show3D) && <img src={bossImg(boss.name)} alt="" className="w-12 h-12 object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white leading-tight truncate"><WikiLink name={boss.name} icon /></h3>
          <p className="text-[11px] text-gray-500">
            {boss.npc ? `${boss.npc} · ` : ''}{boss.combatLevel ? `Lvl ${boss.combatLevel.toLocaleString()} · ` : ''}
            {boss.skilling ? 'No health bar' : `${boss.lp.toLocaleString()} LP · Def ${boss.defence} · Armour ${boss.armour}`}
          </p>
        </div>
        {model && !show3D && toggleBtn('ml-auto shrink-0')}
      </div>

      {/* Readiness banner */}
      <div className="rounded-lg border px-3 py-2 bg-[#1d1a17] border-white/10 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${r.dot}`} />
          <span className={`text-[12px] font-bold ${r.cls}`}>{r.label}</span>
          {best && <span className="text-[10px] text-gray-500">· best as <span className="text-gray-300">{STYLE_LABEL[best.style]}</span>{best.loadout.slots.Weapon ? ` · ${best.loadout.slots.Weapon.name}` : ' · unarmed'}</span>}
        </div>
        {!boss.skilling && (
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <Gap label="Gear tier" have={best?.loadout.weaponTier ?? 0} need={boss.recTier} delta={plan.gearDelta} />
            <Gap label={`${best ? STYLE_SKILLS[best.style].damage : recLevelSkill} level`} have={(best ? levels[STYLE_SKILLS[best.style].damage] : levels[recLevelSkill]) || 1} need={boss.recLevel} delta={plan.levelDelta} />
          </div>
        )}
        {(plan.missingSkills.length > 0 || plan.missingQuests.length > 0) && (
          <div className="text-[10px] text-amber-300/90 flex items-start gap-1.5">
            <AlertTriangle size={11} className="shrink-0 mt-0.5" />
            <span>
              Needs {[...plan.missingSkills.map((m) => `${m.need} ${m.skill} (have ${m.have})`), ...plan.missingQuests.map((q) => q)].join(', ')}
            </span>
          </div>
        )}
        {ACTIVITY_REQUIREMENTS[boss.name]?.note && (
          <div className="text-[10px] text-gray-500 flex items-start gap-1.5"><Info size={11} className="shrink-0 mt-0.5" /> {ACTIVITY_REQUIREMENTS[boss.name]!.note}</div>
        )}
      </div>

      {boss.skilling ? (
        <div className="rounded-lg bg-[#171513] border border-white/5 px-3 py-3 text-[11px] text-gray-400 flex items-start gap-2">
          <Pickaxe size={14} className="text-sky-300 shrink-0 mt-0.5" /> Skilling boss — fought with {boss.skilling}. No combat DPS applies.
        </div>
      ) : best && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Time to kill" value={formatDuration(best.result.ttk)} accent="text-sky-300" Icon={Clock} />
            <Stat label="DPS" value={Math.round(best.result.dps).toLocaleString()} accent="text-emerald-300" Icon={Target} />
            <Stat label="Hit chance" value={`${Math.round(best.result.hitChance * 100)}%`} accent="text-amber-300" Icon={Crosshair} />
            <Stat label="Kills / hr" value={plan.killsPerHour || '—'} accent="text-yellow-300" Icon={Crown} />
          </div>

          {/* Per-style comparison */}
          <div className="rounded-xl bg-[#1d1a17] border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5"><Swords size={11} className="text-red-400" /> By style (best gear you've unlocked)</div>
            <div className="space-y-1">
              {plan.styles.map((s) => (
                <div key={s.style} className={`grid grid-cols-[80px_1fr_44px_60px] gap-2 items-center text-[10px] ${s === best ? 'text-gray-100' : 'text-gray-500'}`}>
                  <span className="font-bold">{STYLE_LABEL[s.style]}{boss.recStyle === s.style ? ' ★' : ''}</span>
                  <span className="truncate" title={s.loadout.slots.Weapon?.name}>{s.loadout.slots.Weapon?.name ?? 'Unarmed'}</span>
                  <span className="text-right font-mono">{Math.round(s.result.hitChance * 100)}%</span>
                  <span className="text-right font-mono">{formatDuration(s.result.ttk)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-gray-500 flex items-start gap-1.5">
            <ShieldCheck size={11} className="shrink-0 mt-0.5" />
            <span>
              Recommended: {STYLE_LABEL[boss.recStyle]} · RS3 tier {boss.recTier}+ · level {boss.recLevel}+
              {boss.weakness ? ` · weak to ${boss.weakness}` : ''}{boss.maxHit ? ` · max hit ${boss.maxHit.toLocaleString()}` : ''}
              {boss.group ? ` · ${boss.group}` : ''}{boss.enrage ? ` · ${boss.enrage}` : ''}
            </span>
          </div>
        </>
      )}

      <p className="text-[9px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Info size={11} className="shrink-0 mt-0.5" />
        <span>
          Kill times use the RuneScape Wiki ability-damage and hit-chance formulas with the best gear your unlocked Fate tiers allow,
          and assume the selected rotation's average damage per 1.8s GCD. Mechanics, phases, enrage and damage reduction make real
          kills longer — read it as a readiness gauge.{boss.derived ? ` Some values derived: ${boss.derived}.` : ''}
        </span>
      </p>
    </div>
  );
};

const Gap: React.FC<{ label: string; have: number; need: number; delta: number }> = ({ label, have, need, delta }) => (
  <div className="rounded bg-[#171513] border border-white/5 px-2 py-1">
    <div className="text-[8px] uppercase tracking-widest text-gray-600">{label}</div>
    <div className="font-mono">
      <span className={delta >= 0 ? 'text-emerald-300' : delta >= -10 ? 'text-amber-300' : 'text-red-300'}>{have}</span>
      <span className="text-gray-600"> / {need}</span>
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; accent: string; Icon: typeof Clock }> = ({ label, value, accent, Icon }) => (
  <div className="rounded-lg bg-[#171513] border border-white/5 px-3 py-2">
    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-gray-500 mb-0.5"><Icon size={10} /> {label}</div>
    <div className={`text-xl font-black leading-none ${accent}`}>{value}</div>
  </div>
);
