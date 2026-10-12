// Equipment Lab → Gear: real RS3 items per slot, gated by the slot's unlocked
// Fate tier. Items + stats come from the bundled RS3 dataset (data/rs3Gear.ts,
// RuneScape Wiki–sourced; stats derived with the wiki formulas in
// utils/gearStats.ts). No external data is loaded.
import React, { useState, useMemo } from 'react';
import { X, Search, Trash2, Lock, Shirt, Wand2, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { EQUIPMENT_SLOTS, SLOT_CONFIG } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { gearService } from '../services/GearService';
import { GearItem, sumStats, styleDamageBonus, STAT_ROWS } from '../utils/gearStats';
import { maxRs3TierForFate } from '../utils/gearTiers';
import { bestLoadout, STYLE_LABEL } from '../utils/bossPlanner';
import { COMBAT_STYLES, CombatStyle } from '../data/rs3Gear';
import { equipTierColor } from '../utils/equipTiers';
import { WikiLink } from './WikiLink';

const emptySlotImg = (slot: string) =>
  `https://runescape.wiki/images/${SLOT_CONFIG[slot]?.file ?? 'Lodestone_map_icon.png'}`;
/** RS3 Wiki inventory image for an item (falls back to the slot icon on error). */
export const rs3ItemImg = (name: string) =>
  `https://runescape.wiki/images/${encodeURIComponent(name.replace(/ /g, '_'))}.png`;

const STYLE_CLS: Record<CombatStyle | 'all', string> = {
  melee: 'text-red-300', ranged: 'text-emerald-300', magic: 'text-sky-300', necromancy: 'text-violet-300', all: 'text-gray-400',
};

/** Compact one-line stat summary for a picker row. */
const itemSummary = (it: GearItem): string => {
  const parts: string[] = [`RS3 tier ${it.tier}`];
  if (it.hand) parts.push(it.hand === 'two-hand' ? '2H' : it.hand === 'off-hand' ? 'Off-hand' : 'Main-hand');
  if (it.armour) parts.push(it.armour);
  if (it.stats.weaponDamage) parts.push(`dmg ${it.stats.weaponDamage}`);
  if (it.stats.accuracy) parts.push(`acc ${it.stats.accuracy}`);
  if (it.stats.damageBonus) parts.push(`+${it.stats.damageBonus} bonus`);
  if (it.stats.armour) parts.push(`${it.stats.armour} armour`);
  if (it.stats.lp) parts.push(`+${it.stats.lp} LP`);
  if (it.ammoKind) parts.push(it.ammoKind === 'arrow' ? 'Arrows' : 'Bolts');
  if (it.note) parts.push(it.note);
  return parts.join(' · ');
};

export const GearView: React.FC = () => {
  const { unlocks, loadout, setLoadoutSlot } = useGame();
  const equipped = loadout || {};
  const [selected, setSelected] = useState<string | null>(null);
  const [autoStyle, setAutoStyle] = useState<CombatStyle>('melee');

  const items = useMemo(
    () => EQUIPMENT_SLOTS.map((s) => gearService.byId(equipped[s])).filter((x): x is GearItem => !!x),
    [equipped],
  );
  const totals = useMemo(() => sumStats(items), [items]);
  const weapon = gearService.byId(equipped['Weapon']);
  const weaponStyle = weapon?.style !== 'all' ? (weapon?.style as CombatStyle | undefined) : undefined;

  const equip = (item: GearItem) => {
    const clear: string[] = [];
    if (item.slot === 'Weapon' && item.hand === 'two-hand') clear.push('Shield');
    if (item.slot === 'Shield' && weapon?.hand === 'two-hand') clear.push('Weapon');
    setLoadoutSlot(item.slot, item.id, clear.length ? clear : undefined);
    setSelected(null);
  };

  const autoEquip = () => {
    const best = bestLoadout(unlocks.equipment, autoStyle, unlocks.levels);
    for (const slot of EQUIPMENT_SLOTS) setLoadoutSlot(slot, best.slots[slot]?.id ?? null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Auto-equip bar */}
      <div className="shrink-0 flex items-center gap-2 flex-wrap mb-3">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Best-in-tier</span>
        <div className="flex rounded-md overflow-hidden border border-white/10">
          {COMBAT_STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setAutoStyle(s)}
              className={`px-2 py-1 text-[10px] font-bold ${autoStyle === s ? `bg-white/10 ${STYLE_CLS[s]}` : 'bg-[#121d24] text-gray-500 hover:text-gray-300'}`}
            >
              {STYLE_LABEL[s]}
            </button>
          ))}
        </div>
        <button
          onClick={autoEquip}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-300 hover:bg-fuchsia-900/40 text-[10px] font-bold uppercase tracking-wide"
          title="Equip the strongest item per slot that your unlocked tiers allow"
        >
          <Wand2 size={11} /> Auto-equip
        </button>
      </div>

      {/* Paper-doll (real items) */}
      <div className="shrink-0 flex items-center justify-center bg-[#101a20] rounded-lg border border-[#243b48] shadow-inner relative min-h-[420px] py-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 45%, rgba(133,112,72,0.16), transparent 70%)' }}
        />
        <div className="grid grid-cols-3 gap-6 w-max relative z-10">
          {EQUIPMENT_SLOTS.map((slot) => {
            const config = SLOT_CONFIG[slot];
            if (!config) return null;
            const item = gearService.byId(equipped[slot]);
            const unlockedTier = unlocks.equipment[slot] || 0;
            return (
              <div key={slot} className={`${config.gridArea} relative group`}>
                <button
                  onClick={() => setSelected(slot)}
                  className="w-20 h-20 relative flex items-center justify-center rounded-lg bg-[#182730] border-2 border-[#2a4656] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-150 cursor-pointer hover:scale-105 hover:border-[#a88a45]"
                  title={item ? `${slot}: ${item.name}` : `${slot}: empty (unlocked ≤ T${unlockedTier})`}
                >
                  <img
                    src={item ? rs3ItemImg(item.name) : emptySlotImg(slot)}
                    alt={item?.name ?? slot}
                    className={`w-10 h-10 object-contain drop-shadow-md transition-all ${item ? 'opacity-100 brightness-110' : 'opacity-20 grayscale group-hover:opacity-40'}`}
                    onError={(e) => { (e.target as HTMLImageElement).src = emptySlotImg(slot); }}
                  />
                  {item && (
                    <div className={`absolute -bottom-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shadow-md ${equipTierColor(item.fateTier)} text-black/80 border-black/20`}>
                      T{item.fateTier}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gear stats */}
      <div className="mt-4 bg-[#0e181d] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Shirt size={12} className="text-amber-300" /> Gear Stats
          </h4>
          <span className="text-[10px] text-gray-600 font-mono">{items.length}/{EQUIPMENT_SLOTS.length} equipped</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {STAT_ROWS.map((row) => {
            const v = totals[row.key];
            return (
              <div key={row.key} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{row.label}</span>
                <span className={`font-mono font-bold ${v > 0 ? 'text-gray-200' : 'text-gray-600'}`}>{Number.isInteger(v) ? v : v.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMBAT_STYLES.map((s) => (
            <div key={s} className={`rounded bg-[#121d24] border px-2 py-1 ${weaponStyle === s ? 'border-white/20' : 'border-white/5'}`}>
              <div className={`text-[9px] uppercase tracking-widest ${STYLE_CLS[s]}`}>{STYLE_LABEL[s]} bonus</div>
              <div className="text-[12px] font-mono font-bold text-gray-200">+{styleDamageBonus(items, s)}</div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-600 mt-3 flex items-start gap-1">
          <AlertCircle size={10} className="shrink-0 mt-px" /> Items are gated by each slot's unlocked Fate tier (Codex ladder: T1 = RS3 tier 1–10 … T9 = tier 92–95).
          Stats use the RuneScape Wiki armour / accuracy / ability-damage formulas; set effects and jewellery passives are not modelled.
        </p>
      </div>

      {selected && (
        <GearPicker
          slot={selected}
          currentItemId={equipped[selected]}
          unlockedTier={unlocks.equipment[selected] || 0}
          onClose={() => setSelected(null)}
          onEquip={equip}
          onRemove={() => { setLoadoutSlot(selected, null); setSelected(null); }}
        />
      )}
    </div>
  );
};

// ── Item picker popover ──────────────────────────────────────────────────────
interface PickerProps {
  slot: string;
  currentItemId?: number;
  unlockedTier: number;
  onClose: () => void;
  onEquip: (item: GearItem) => void;
  onRemove: () => void;
}

const GearPicker: React.FC<PickerProps> = ({ slot, currentItemId, unlockedTier, onClose, onEquip, onRemove }) => {
  useEscapeKey(onClose, true);
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<CombatStyle | 'any'>('any');

  const all = gearService.bySlot(slot);
  const stylesHere = useMemo(() => COMBAT_STYLES.filter((s) => all.some((i) => i.style === s)), [all]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter((i) => (!q || i.name.toLowerCase().includes(q)) && (style === 'any' || i.style === style || i.style === 'all'));
    // Equippable first (strongest first), then locked ordered by how close they are.
    return [...list].sort((a, b) => {
      const la = a.fateTier > unlockedTier ? 1 : 0;
      const lb = b.fateTier > unlockedTier ? 1 : 0;
      if (la !== lb) return la - lb;
      if (la === 0) return b.tier - a.tier || b.fateTier - a.fateTier || a.name.localeCompare(b.name);
      return a.fateTier - b.fateTier || a.tier - b.tier || a.name.localeCompare(b.name);
    });
  }, [all, query, style, unlockedTier]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Choose ${slot}`}
    >
      <div className="bg-[#0f191f] border border-white/10 rounded-xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-[#131f26] shrink-0">
          <img src={emptySlotImg(slot)} alt="" className="w-6 h-6 object-contain opacity-70" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white leading-none">{slot}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Unlocked up to <span className="text-amber-300">Tier {unlockedTier}</span>
              {unlockedTier > 0 && <span className="text-gray-600"> · RS3 item tier ≤ {maxRs3TierForFate(unlockedTier)}</span>}
            </p>
          </div>
          {currentItemId != null && (
            <button onClick={onRemove} className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40 text-[10px] font-bold"><Trash2 size={11} /> Remove</button>
          )}
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" aria-label="Close"><X size={16} /></button>
        </div>

        <div className="p-2 border-b border-white/5 shrink-0 space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${slot.toLowerCase()}…`}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-[12px] text-gray-200 focus:outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
            />
          </div>
          {stylesHere.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {(['any', ...stylesHere] as (CombatStyle | 'any')[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style === s ? 'border-white/20 bg-white/10 text-gray-100' : 'border-white/5 bg-[#121d24] text-gray-500 hover:text-gray-300'}`}
                >
                  {s === 'any' ? 'All' : STYLE_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-1.5 space-y-1">
            {filtered.length === 0 && (
              <div className="text-center text-[11px] text-gray-600 py-10">
                {all.length === 0 ? 'No tiered RS3 items are modelled for this slot.' : 'No items match.'}
              </div>
            )}
            {filtered.map((item) => {
              const tier = item.fateTier;
              const locked = tier > unlockedTier;
              const isCurrent = item.id === currentItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => !locked && onEquip(item)}
                  disabled={locked}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 border text-left transition-colors ${
                    isCurrent ? 'border-cyan-500/40 bg-cyan-950/30'
                    : locked ? 'border-transparent opacity-45 cursor-not-allowed'
                    : 'border-transparent hover:bg-white/5 hover:border-white/10 cursor-pointer'
                  }`}
                  title={locked ? `Unlock Tier ${tier} in this slot to equip` : item.name}
                >
                  <img src={rs3ItemImg(item.name)} alt="" className="w-7 h-7 object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-gray-200 truncate"><WikiLink name={item.name} /></div>
                    <div className="text-[9px] text-gray-500 truncate">
                      <span className={STYLE_CLS[item.style]}>{item.style === 'all' ? 'Utility' : STYLE_LABEL[item.style]}</span> · {itemSummary(item)}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${locked ? 'bg-[#121d24] text-gray-500 border border-white/5' : `${equipTierColor(tier)} text-black/80`}`}>
                    {locked ? <span className="flex items-center gap-0.5"><Lock size={8} /> T{tier}</span> : `T${tier}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
