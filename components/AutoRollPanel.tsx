import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Sparkles, Dice5, CheckCircle2, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';

/**
 * Auto-Roll (PROTOTYPE)
 * ─────────────────────
 * Type an RS3 username → pull the account's real skill levels from the
 * official RuneScape 3 hiscores and "auto-roll" the run so the app's
 * progression matches what you've already earned in-game.
 *
 * Data source: the RS3 hiscores "lite" endpoint
 *   https://secure.runescape.com/m=hiscore/index_lite.ws?player=NAME
 * which returns one `rank,level,xp` CSV line per skill (Overall first, then
 * the 29 skills in HISCORE_ORDER), followed by activities.
 *
 * CORS: Jagex's hiscores (and RuneMetrics) do NOT send CORS headers, so a
 * direct browser fetch from this site is normally blocked. We therefore:
 *   1. go through a CORS proxy when one is configured — Vite env
 *      `VITE_HISCORES_PROXY` or localStorage `fateLocked.hiscoresProxy`
 *      (a URL prefix; the encoded hiscores URL is appended), else
 *   2. try the endpoint directly (works if the browser/extension allows it),
 *      and if that fails
 *   3. fall back to MANUAL mode: the user opens the hiscores link in a new tab
 *      and pastes the text (or "Skill level" lines) back here.
 *
 * This is a prototype: it syncs SKILL LEVELS only (the cleanest 1:1 mapping).
 */

const HISCORES_LITE = 'https://secure.runescape.com/m=hiscore/index_lite.ws?player=';
const PROXY_STORAGE_KEY = 'fateLocked.hiscoresProxy';

/** RS3 hiscores lite CSV order (after the Overall line). */
const HISCORE_ORDER = [
  'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic',
  'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting',
  'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming',
  'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering',
  'Divination', 'Invention', 'Archaeology', 'Necromancy',
] as const;

interface FetchedSkill { skill: string; level: number }
interface Fetched {
  displayName: string;
  totalLevel: number;
  combatLevel: number | null;
  skills: FetchedSkill[];
  updatedAt: string | null;
}

/** Thrown when the hiscores can't be reached from the browser (CORS/network). */
class HiscoresBlockedError extends Error {}

const hiscoresUrl = (name: string) => HISCORES_LITE + encodeURIComponent(name.trim());

const proxyPrefix = (): string | null => {
  const env = (import.meta as any).env?.VITE_HISCORES_PROXY as string | undefined;
  if (env) return env;
  try { return localStorage.getItem(PROXY_STORAGE_KEY); } catch { return null; }
};

/** RS3 combat level (pre-Necromancy formula extended with Necromancy as a 4th style). */
const rs3Combat = (lv: Record<string, number>): number => {
  const g = (k: string) => lv[k] ?? 1;
  const offence = Math.max(
    g('Attack') + g('Strength'),
    2 * g('Magic'),
    2 * g('Ranged'),
    2 * g('Necromancy'),
  );
  return Math.floor((13 / 10 * offence + g('Defence') + g('Constitution') + Math.floor(g('Prayer') / 2) + Math.floor(g('Summoning') / 2)) / 4);
};

const build = (displayName: string, levels: Record<string, number>, total?: number): Fetched => {
  // Fate Locked caps every skill at 99 (RS3's 120-cap skills included), so
  // real levels above 99 are clamped — the level-up engine can't go higher.
  const skills = HISCORE_ORDER.map(skill => ({ skill, level: Math.max(1, Math.min(99, levels[skill] ?? (skill === 'Constitution' ? 10 : 1))) }));
  return {
    displayName,
    totalLevel: total && total > 0 ? total : skills.reduce((a, s) => a + s.level, 0),
    combatLevel: rs3Combat(Object.fromEntries(skills.map(s => [s.skill, s.level]))),
    skills,
    updatedAt: null,
  };
};

/**
 * Parse pasted hiscores data. Accepts either the raw index_lite CSV
 * (`rank,level,xp` per line, Overall first) or free-form "Skill level" lines
 * such as "Attack 99" / "Necromancy: 120".
 */
export function parseHiscores(text: string, displayName: string): Fetched {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const csv = lines.filter(l => /^-?\d+,-?\d+(,-?\d+)?$/.test(l));
  if (csv.length >= HISCORE_ORDER.length + 1) {
    const levels: Record<string, number> = {};
    HISCORE_ORDER.forEach((skill, i) => {
      const lvl = Number(csv[i + 1].split(',')[1]);
      if (lvl > 0) levels[skill] = lvl;
    });
    return build(displayName, levels, Number(csv[0].split(',')[1]));
  }
  const levels: Record<string, number> = {};
  const byLower = new Map<string, string>(HISCORE_ORDER.map(s => [s.toLowerCase(), s]));
  byLower.set('hitpoints', 'Constitution');
  byLower.set('runecraft', 'Runecrafting');
  for (const l of lines) {
    const m = l.match(/^([A-Za-z]+)\s*[:=,\s]\s*(\d{1,3})\b/);
    const skill = m && byLower.get(m[1].toLowerCase());
    if (skill) levels[skill] = Number(m![2]);
  }
  if (Object.keys(levels).length === 0) {
    throw new Error('Couldn\'t read any levels — paste the hiscores page text, or lines like "Attack 99".');
  }
  return build(displayName, levels);
}

async function fetchPlayer(name: string): Promise<Fetched> {
  const target = hiscoresUrl(name);
  const proxy = proxyPrefix();
  const url = proxy ? proxy + encodeURIComponent(target) : target;
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    // A CORS rejection surfaces as an opaque network TypeError.
    throw new HiscoresBlockedError('The RS3 hiscores block direct browser requests (no CORS headers).');
  }
  if (res.status === 404) throw new Error(`"${name}" isn't on the RS3 hiscores — check the spelling.`);
  if (!res.ok) throw new Error(`RS3 hiscores error (${res.status}).`);
  const text = await res.text();
  // The hiscores answer an unknown player with an HTML error page, not CSV.
  if (!/^-?\d+,-?\d+,-?\d+/.test(text.trim())) throw new Error(`"${name}" isn't on the RS3 hiscores — check the spelling.`);
  return parseHiscores(text, name.trim());
}

export function AutoRollPanel() {
  const { unlocks, createBackup, levelUpSkill, keys, specialKeys, chaosKeys, linkedAccount, setLinkedAccount } = useGame() as any;
  // Each run binds to one RS3 account: once set, the input is locked to it.
  const [name, setName] = useState(linkedAccount ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'loaded'>('idle');
  const [error, setError] = useState('');
  // Manual paste fallback, shown when the hiscores can't be fetched (CORS).
  const [manual, setManual] = useState(false);
  const [pasted, setPasted] = useState('');
  const [fetched, setFetched] = useState<Fetched | null>(null);
  const [rolledTo, setRolledTo] = useState(0); // how many skills the roll animation has revealed
  const [applied, setApplied] = useState(false);
  const [skillRolling, setSkillRolling] = useState(false);
  const [skillKeysGained, setSkillKeysGained] = useState<{ keys: number; special: number; chaos: number } | null>(null);

  const currentLevels: Record<string, number> = unlocks?.levels ?? {};
  const unlockedSkills: Record<string, number> = unlocks?.skills ?? {};
  // A skill can only be levelled once it's been unlocked in the run.
  const isUnlocked = useCallback((skill: string) => (unlockedSkills[skill] ?? 0) > 0, [unlockedSkills]);
  // Fresh refs for the level-up loop: levelUpSkill closes over state, so we read
  // it fresh each tick (between ticks the component re-renders) to keep the
  // per-level key rate ramping correctly. Counts let us tally what was earned.
  const levelUpRef = useRef(levelUpSkill);
  levelUpRef.current = levelUpSkill;
  const countsRef = useRef({ keys, specialKeys, chaosKeys });
  countsRef.current = { keys, specialKeys, chaosKeys };
  const skillTimer = useRef<number | null>(null);

  // Skills where the real account is ahead AND the skill is unlocked in the run.
  // Locked skills can't be levelled, so they're never rolled.
  const gains = useMemo(() => {
    if (!fetched) return [];
    return fetched.skills
      .map(s => ({ ...s, current: currentLevels[s.skill] ?? 1 }))
      .filter(s => s.level > s.current && isUnlocked(s.skill));
  }, [fetched, currentLevels, isUnlocked]);

  const onFetch = useCallback(async () => {
    // Once bound, only that account can be fetched for this run.
    const query = (linkedAccount ?? name).trim();
    if (!query) return;
    setStatus('loading'); setError(''); setFetched(null); setRolledTo(0); setApplied(false);
    setSkillRolling(false); setSkillKeysGained(null);
    if (skillTimer.current) window.clearInterval(skillTimer.current);
    try {
      const data = await fetchPlayer(query);
      setFetched(data);
      setStatus('loaded');
      // Bind the run to this account on the first successful fetch.
      if (!linkedAccount) { setLinkedAccount?.(data.displayName); setName(data.displayName); }
    } catch (e: any) {
      if (e instanceof HiscoresBlockedError) setManual(true);
      setError(e?.message ?? 'Failed to reach the RS3 hiscores.');
      setStatus('error');
    }
  }, [name, linkedAccount, setLinkedAccount]);

  // Manual fallback: parse what the user pasted from the hiscores page.
  const onParsePasted = useCallback(() => {
    const who = (linkedAccount ?? name).trim();
    if (!who) { setError('Enter your RS3 username first.'); setStatus('error'); return; }
    setRolledTo(0); setApplied(false); setSkillRolling(false); setSkillKeysGained(null);
    try {
      const data = parseHiscores(pasted, who);
      setFetched(data);
      setStatus('loaded');
      setError('');
      if (!linkedAccount) { setLinkedAccount?.(data.displayName); setName(data.displayName); }
    } catch (e: any) {
      setError(e?.message ?? 'Couldn\'t read the pasted levels.');
      setStatus('error');
    }
  }, [pasted, name, linkedAccount, setLinkedAccount]);

  // If the run is already bound, pull that account's hiscores on open.
  useEffect(() => { if (linkedAccount) onFetch(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  // "Auto-roll": walk each unlocked skill up to its real level through the LIVE
  // level-up engine — every level fires its key roll (chance = ceil(level/5)%),
  // the 2% chaos-key chance and the omni chance — so the run earns exactly the
  // keys those levels would have. Runs in batches for a responsive slot-machine
  // feel; tallies the keys/omni/chaos earned at the end.
  const autoRoll = useCallback(() => {
    if (!fetched || gains.length === 0 || skillRolling) return;
    createBackup?.('Before Auto-Roll skill sync');
    const before = { ...countsRef.current };

    // One queue entry per level still to gain, plus per-skill reveal boundaries.
    const queue: string[] = [];
    const bounds: number[] = [];
    for (const g of gains) {
      for (let lvl = g.current; lvl < g.level; lvl++) queue.push(g.skill);
      bounds.push(queue.length);
    }
    const total = queue.length;
    if (total === 0) return;

    setRolledTo(0); setApplied(false); setSkillRolling(true); setSkillKeysGained(null);
    const BATCH = Math.min(25, Math.max(1, Math.ceil(total / 50)));
    let i = 0;
    if (skillTimer.current) window.clearInterval(skillTimer.current);
    skillTimer.current = window.setInterval(() => {
      const levelUp = levelUpRef.current;
      for (let b = 0; b < BATCH && i < total; b++, i++) levelUp(queue[i]);
      let revealed = 0;
      for (const bnd of bounds) if (bnd <= i) revealed++;
      setRolledTo(revealed);
      if (i >= total) {
        if (skillTimer.current) window.clearInterval(skillTimer.current);
        setSkillRolling(false);
        window.setTimeout(() => {
          const a = countsRef.current;
          setSkillKeysGained({ keys: a.keys - before.keys, special: a.specialKeys - before.specialKeys, chaos: a.chaosKeys - before.chaosKeys });
          setApplied(true);
        }, 250);
      }
    }, 70);
  }, [fetched, gains, skillRolling, createBackup]);

  const totalGain = gains.reduce((a, s) => a + (s.level - s.current), 0);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Dice5 size={20} className="text-fuchsia-400" /> Auto-Roll
            <span className="text-[10px] uppercase tracking-wide bg-fuchsia-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded">Prototype</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Pull your real account from the RuneScape 3 hiscores and auto-roll your run to match what you've already earned.
            Currently syncs all 29 skill levels. The official hiscores block browser requests, so if the lookup fails you can paste your levels instead.
          </p>
        </div>
      </div>

      {/* Username input — locked to the bound account once set */}
      <div className="flex items-center gap-2 max-w-md">
        <div className={`flex items-center gap-2 flex-1 bg-black/40 border rounded-lg px-3 py-2 ${linkedAccount ? 'border-white/10' : 'border-white/15 focus-within:border-fuchsia-500/60'}`}>
          {linkedAccount ? <Lock size={14} className="text-fuchsia-400 shrink-0" /> : <Search size={14} className="text-gray-500 shrink-0" />}
          <input
            value={linkedAccount ?? name}
            onChange={(e) => !linkedAccount && setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFetch()}
            placeholder="RS3 username…"
            readOnly={!!linkedAccount}
            title={linkedAccount ? 'This run is permanently bound to this account' : undefined}
            className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${linkedAccount ? 'text-gray-300 cursor-default' : 'text-gray-100 placeholder:text-gray-600'}`}
            maxLength={12}
          />
        </div>
        <button
          onClick={onFetch}
          disabled={status === 'loading' || (!linkedAccount && !name.trim())}
          className="px-3 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-1.5 shrink-0"
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {linkedAccount ? 'Refresh' : 'Fetch'}
        </button>
      </div>
      {linkedAccount && (
        <p className="text-[10px] text-gray-500 -mt-2 flex items-center gap-1">
          <Lock size={9} /> This run is bound to <span className="text-gray-300">{linkedAccount}</span> — the account can't be changed.
        </p>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-sm text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2 max-w-xl">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {/* Manual fallback (CORS) */}
      {(manual || status === 'error') && (
        <div className="max-w-xl space-y-2 bg-white/5 border border-white/10 rounded-lg px-3 py-3">
          <div className="text-xs text-gray-300 font-semibold">Paste your levels instead</div>
          <p className="text-[11px] text-gray-500">
            Open{' '}
            <a
              href={hiscoresUrl((linkedAccount ?? name) || 'Zezima')}
              target="_blank"
              rel="noreferrer"
              className="text-fuchsia-300 underline"
            >your hiscores data</a>{' '}
            in a new tab, select all, copy and paste it below — or type one skill per line, e.g. <span className="font-mono">Attack 99</span>.
          </p>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={5}
            placeholder={'1234,2898,5600000000\n…  or  Attack 99\nNecromancy 120'}
            className="w-full bg-black/40 border border-white/15 rounded px-2 py-1.5 text-xs font-mono text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-500/60"
          />
          <button
            onClick={onParsePasted}
            disabled={!pasted.trim()}
            className="px-3 py-1.5 rounded bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold"
          >
            Use pasted levels
          </button>
        </div>
      )}

      {/* Result */}
      {fetched && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            <div>
              <div className="text-base font-bold text-white">{fetched.displayName}</div>
              <div className="text-[11px] text-gray-500">
                Total level <span className="text-gray-300 font-mono">{fetched.totalLevel}</span>
                {fetched.combatLevel != null && <> · Combat <span className="text-gray-300 font-mono">{fetched.combatLevel}</span></>}
              </div>
            </div>
            <div className="flex-1" />
            {!applied && !skillRolling && gains.length > 0 && (
              <button
                onClick={autoRoll}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-emerald-600 hover:from-fuchsia-500 hover:to-emerald-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg"
              >
                <Sparkles size={16} /> Auto-roll {gains.length} skill{gains.length === 1 ? '' : 's'} (+{totalGain})
              </button>
            )}
            {skillRolling && (
              <div className="flex items-center gap-2 text-fuchsia-300 text-sm font-semibold">
                <Loader2 size={16} className="animate-spin" /> Rolling levels…
              </div>
            )}
            {applied && (
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold flex-wrap">
                <CheckCircle2 size={18} /> Synced
                {skillKeysGained && (skillKeysGained.keys + skillKeysGained.special + skillKeysGained.chaos) > 0 && (
                  <span className="font-normal text-gray-300">
                    · earned <span className="text-amber-300 font-semibold">{skillKeysGained.keys} key{skillKeysGained.keys === 1 ? '' : 's'}</span>
                    {skillKeysGained.special > 0 && <>, <span className="text-purple-300 font-semibold">{skillKeysGained.special} omni</span></>}
                    {skillKeysGained.chaos > 0 && <>, <span className="text-red-400 font-semibold">{skillKeysGained.chaos} chaos</span></>}
                  </span>
                )}
              </div>
            )}
            {!applied && !skillRolling && gains.length === 0 && (
              <div className="text-sm text-gray-400">
                {fetched.skills.some(s => !isUnlocked(s.skill) && s.level > (currentLevels[s.skill] ?? 1))
                  ? 'No unlocked skills to roll — unlock more skills in the run first.'
                  : 'Your unlocked skills already match or exceed this account.'}
              </div>
            )}
          </div>

          {/* Skill grid: current → real, gains highlighted; reveal during roll. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {fetched.skills.map((s) => {
              const current = currentLevels[s.skill] ?? 1;
              const unlocked = isUnlocked(s.skill);
              const isGain = s.level > current && unlocked;
              const gainIdx = gains.findIndex(g => g.skill === s.skill);
              const revealed = !isGain || applied || (gainIdx > -1 && gainIdx < rolledTo);
              return (
                <div
                  key={s.skill}
                  title={!unlocked ? `${s.skill} isn't unlocked yet — unlock it in the run before it can be rolled` : undefined}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-xs transition-colors ${
                    !unlocked
                      ? 'border-white/5 bg-black/20 opacity-50'
                      : isGain && !applied
                        ? revealed ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-fuchsia-500/30 bg-fuchsia-950/20'
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className="text-gray-300 truncate flex items-center gap-1">
                    {!unlocked && <Lock size={9} className="text-gray-500 shrink-0" />}
                    {s.skill}
                  </span>
                  <span className="font-mono shrink-0 flex items-center gap-1">
                    {!unlocked ? (
                      <span className="text-gray-600 text-[10px] uppercase tracking-wide">locked</span>
                    ) : (
                      <>
                        {isGain && !applied && (
                          <>
                            <span className="text-gray-600">{current}</span>
                            <span className="text-gray-600">→</span>
                          </>
                        )}
                        <span className={isGain ? (revealed ? 'text-emerald-300 font-bold' : 'text-gray-600') : 'text-gray-400'}>
                          {revealed ? s.level : '··'}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-600">
            Data from the RuneScape 3 hiscores · each synced level runs through the live RNG engine, so it awards keys, Omni and
            Chaos exactly as levelling it would — all logged to History · a backup is created first.
          </p>
        </div>
      )}

      {status === 'idle' && !linkedAccount && (
        <div className="text-xs text-gray-600 max-w-xl border border-dashed border-white/10 rounded-lg px-4 py-6 text-center">
          Enter your RS3 username to bind this run to your account. It's saved permanently to the run and can't be changed afterward.
        </div>
      )}
    </div>
  );
}

export default AutoRollPanel;
