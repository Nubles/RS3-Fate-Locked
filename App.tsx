
import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { GameProvider, useGame } from './context/GameContext';
import { usePortalHost } from './hooks/usePortalHost';
import { ProfileProvider, useProfiles } from './context/ProfileContext';
import { ActionSection } from './components/ActionSection';
import { GachaSection } from './components/GachaSection';
import { Dashboard } from './components/Dashboard';
import { LogViewer } from './components/LogViewer';
import { SectionGuide, GUIDES } from './components/SectionGuide';
import { PopOnChange } from './components/PopOnChange';
import { CommandPalette } from './components/CommandPalette';
import { GuidedTour } from './components/GuidedTour';
import { QuestCompleteOverlay } from './components/QuestCompleteOverlay';
import { WikiIcon } from './components/WikiIcon';
import { VoidAltar } from './components/VoidAltar';
import { TransmutationEffect } from './components/TransmutationEffect';
import { ClarityEffect, GreedEffect, ChaosEffect } from './components/RitualEffects';
import { EffectsLayer } from './components/EffectsLayer';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { PanelErrorBoundary } from './components/PanelErrorBoundary';
import { UpdateBanner } from './components/UpdateBanner';
import { ModalFallback } from './components/LoadingFallback';
import { JournalSummaryCard } from './components/JournalSummaryCard';
import { RibbonButton, ActionStat, ActionSlot, Rs3Window } from './components/Rs3Hud';
import { useEscapeKey } from './hooks/useEscapeKey';
import { resolveModeRules } from './config/gameModes';
import { showToast } from './utils/toast';

// Heavy, conditionally-rendered modals — code-split so they (and their deps,
// e.g. recharts in StatsModal) stay out of the initial bundle.
const StatsModal = lazy(() => import('./components/StatsModal').then(m => ({ default: m.StatsModal })));
const FateThread = lazy(() => import('./components/FateThread').then(m => ({ default: m.FateThread })));
const ReferenceModal = lazy(() => import('./components/ReferenceModal').then(m => ({ default: m.ReferenceModal })));
const OracleSearch = lazy(() => import('./components/OracleSearch').then(m => ({ default: m.OracleSearch })));
const StrategyGuide = lazy(() => import('./components/StrategyGuide').then(m => ({ default: m.StrategyGuide })));
const SupplyChainCalculator = lazy(() => import('./components/SupplyChainCalculator').then(m => ({ default: m.SupplyChainCalculator })));
const GameModePicker = lazy(() => import('./components/GameModePicker').then(m => ({ default: m.GameModePicker })));
const SyncCodeModal = lazy(() => import('./components/SyncCodeModal').then(m => ({ default: m.SyncCodeModal })));
import { obfuscateFateSave, deobfuscateFateSave } from './utils/encryption';
import { GameState } from './types';
import { Key, Sparkles, Download, Upload, RotateCcw, BarChart3, HelpCircle, Dna, PlayCircle, PauseCircle, Search, Swords, ShoppingBag, ScrollText, Compass, Database, SlidersHorizontal, Link2, Lightbulb, Flame, Spline } from 'lucide-react';

// --- Error Boundary ---
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1714] flex items-center justify-center p-8">
          <div className="bg-[#23201c] border border-red-500/30 rounded-xl p-8 max-w-lg text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">
              The application encountered an error. Your save data is preserved in localStorage.
            </p>
            <pre className="text-xs text-red-300/70 bg-black/30 rounded p-3 mb-6 text-left overflow-auto max-h-32">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Toast Component ---

const ToastNotification = () => {
  const { lastEvent } = useGame();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<number | null>(null);

  // Imperative channel (import/export feedback, etc.).
  useEffect(() => {
    const onToast = (e: Event) => {
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message;
      if (!msg) return;
      setMessage(msg);
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setVisible(false), 5000);
    };
    window.addEventListener('fate:toast', onToast);
    return () => window.removeEventListener('fate:toast', onToast);
  }, []);

  useEffect(() => {
    if (!lastEvent) return;

    const undoableTypes = [
      'ROLL_SUCCESS', 'ROLL_FAIL', 'ROLL_OMNI', 'ROLL_PITY',
      'UNLOCK', 'RITUAL', 'LEVEL_UP'
    ];

    if (undoableTypes.includes(lastEvent.type)) {
      let msg = 'Action Complete';
      if (lastEvent.type.includes('ROLL')) msg = 'Roll Recorded';
      if (lastEvent.type === 'UNLOCK') msg = 'Content Unlocked';
      if (lastEvent.type === 'RITUAL') msg = 'Ritual Performed';
      if (lastEvent.type === 'LEVEL_UP') {
          // Check for Chaos Key award in metadata
          if (lastEvent.meta && 'chaosKeyAwarded' in lastEvent.meta && lastEvent.meta.chaosKeyAwarded) {
              msg = 'Level Up + Chaos Key!';
          } else {
              msg = 'Level Up';
          }
      }

      setMessage(msg);
      setVisible(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setVisible(false), 5000);
    }
  }, [lastEvent]);

  const host = usePortalHost('reveal-bottom');

  if (!visible || !host) return null;

  return createPortal(
    <div className="pointer-events-auto bg-[#27231f] border border-white/20 shadow-2xl rounded-lg p-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
       <span className="text-sm font-bold text-gray-200">{message}</span>
    </div>,
    host,
  );
};

interface HeaderProps {
  setShowAltar: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setShowReference: (show: boolean) => void;
  setShowOracle: (show: boolean) => void;
  setShowStrategy: (show: boolean) => void;
  setShowSupplyChain: (show: boolean) => void;
  setShowGameMode: (show: boolean) => void;
  setShowSyncCode: (show: boolean) => void;
}

const Header = ({ setShowAltar, setShowStats, setShowReference, setShowOracle, setShowStrategy, setShowSupplyChain, setShowGameMode, setShowSyncCode }: HeaderProps) => {
  const { keys, specialKeys, chaosKeys, fatePoints, activeBuff, animationsEnabled, toggleAnimations, advisorsEnabled, toggleAdvisors, importSave, resetGame, getExportData, createBackup, gameModeId, customMode } = useGame();
  const pityRules = resolveModeRules(gameModeId, customMode);
  const pityCap = pityRules.pityEnabled ? pityRules.pityThreshold : 50; // 50 = visual-only fallback
  const nearPity = pityRules.pityEnabled && fatePoints >= pityRules.pityThreshold * 0.8;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const imported = deobfuscateFateSave(fileContent);

        if (imported) {
            createBackup('Before file import');
            importSave(imported as Partial<GameState>);
            showToast('Fate restored successfully');
        } else {
            showToast('Import failed — invalid save file');
        }
      } catch (err) {
          showToast('Import failed — could not read save data');
          console.error(err);
      }
    };
    reader.onerror = () => {
      showToast('Import failed — could not read the file');
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleExport = () => {
      const rawData = getExportData();
      if (!rawData) return;

      try {
          const jsonData = JSON.parse(rawData);
          const obfuscatedData = obfuscateFateSave(jsonData);

          const blob = new Blob([obfuscatedData], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fate_locked_${Date.now()}.fate`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('Save exported');
      } catch (e) {
          console.error("Export failed", e);
          showToast('Export failed');
      }
  };

  const openNav = (target: string) => window.dispatchEvent(new CustomEvent('fate:nav', { detail: { target } }));
  const fateShare = Math.min(1, fatePoints / pityCap);
  const altarGlow = activeBuff === 'GREED' ? 'rgba(251,191,36,0.55)' : activeBuff !== 'NONE' ? 'rgba(96,165,250,0.55)' : undefined;

  return (
    <>
      {/* Top: title on the left, the RS3 ribbon of menu buttons on the right. */}
      <header className="rs3-hudbar sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <div className="rs3-slot w-9 h-9 rounded-sm flex items-center justify-center">
              <WikiIcon file="Crystal_key.png" alt="Fate Locked" Fallback={Key} size={20} className="drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-lg rs3-title leading-none">RS3 Fate Locked Ironman</h1>
              <p className="text-[10px] text-[#c7a27f] font-mono mt-0.5 tracking-wide">RNG EDITION COMMAND CENTER</p>
            </div>
            <ProfileSwitcher />
          </div>

          {/* Accept .fate files and legacy .json files */}
          <input type="file" ref={fileInputRef} className="hidden" accept=".json,.fate" onChange={handleFileChange} />

          <nav className="rs3-ribbon flex items-center gap-1 p-1 overflow-x-auto max-w-full" aria-label="Menu">
            <RibbonButton label="Jump to… (⌘K)" data-tour="palette" onClick={() => window.dispatchEvent(new CustomEvent('fate:open-palette'))}><Search size={16} /></RibbonButton>
            <RibbonButton label="Hero — Stats" onClick={() => setShowStats(true)}><BarChart3 size={16} /></RibbonButton>
            <RibbonButton label="Adventures — Strategy Guide" onClick={() => setShowStrategy(true)}><Compass size={16} /></RibbonButton>
            <RibbonButton label="Rules" onClick={() => setShowReference(true)}><HelpCircle size={16} /></RibbonButton>
            <RibbonButton label="Game Mode" onClick={() => setShowGameMode(true)}><SlidersHorizontal size={16} /></RibbonButton>
            <div className="w-px h-6 bg-black/60 mx-0.5" />
            <RibbonButton label={animationsEnabled ? 'Animations: on' : 'Animations: off'} active={animationsEnabled} onClick={toggleAnimations}>
              {animationsEnabled ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
            </RibbonButton>
            <RibbonButton label={advisorsEnabled ? 'Advisor panels: on' : 'Advisor panels: off'} active={advisorsEnabled} onClick={toggleAdvisors}><Lightbulb size={16} /></RibbonButton>
            <RibbonButton label="Import Save" onClick={() => fileInputRef.current?.click()}><Upload size={16} /></RibbonButton>
            <RibbonButton label="Export Encrypted Save" onClick={handleExport}><Download size={16} /></RibbonButton>
            <RibbonButton label="Sync Code (move run between devices)" onClick={() => setShowSyncCode(true)}><Link2 size={16} /></RibbonButton>
            <RibbonButton label="Reset all progress" className="hover:!text-red-400" onClick={() => { if(window.confirm("Are you sure you want to reset ALL progress? This cannot be undone.")) resetGame(); }}><RotateCcw size={16} /></RibbonButton>
          </nav>
        </div>
      </header>

      {/* Bottom: the RS3 action bar — a stat row (keys and the Fate bar) over action slots. */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none px-2">
        <div className="rs3-actionbar pointer-events-auto flex flex-col gap-1.5 px-3 pt-2 pb-2 max-w-full overflow-x-auto">
          <div data-tour="keys" className="flex items-center gap-5 shrink-0">
            <ActionStat label="Keys" title="Keys — spend on a table in Spend Keys for a random unlock" value={<PopOnChange value={keys} />}
              icon={<WikiIcon file="Crystal_key.png" alt="Keys" Fallback={Key} size={18} className="drop-shadow" />} />
            <ActionStat label="Fate Points" className="w-40"
              title={pityRules.pityEnabled ? `Fate Points — pity triggers at ${pityRules.pityThreshold}` : 'Fate Points'}
              value={pityRules.pityEnabled ? `${fatePoints}/${pityRules.pityThreshold}` : `${fatePoints}`}
              fill={fateShare} tone={nearPity ? 'lp' : 'adren'}
              icon={<Flame size={18} className={nearPity ? 'text-red-400 animate-pulse' : 'text-[#efad74]'} />} />
            <ActionStat label="Omni-keys" title="Omni-keys — click any locked item in the Dashboard to unlock exactly it" value={<PopOnChange value={specialKeys} />} dim={specialKeys === 0}
              icon={<WikiIcon file="Enhanced_crystal_key.png" alt="Omni-keys" Fallback={Sparkles} size={18} className={specialKeys > 0 ? 'animate-pulse' : 'grayscale'} />} />
            {chaosKeys > 0 && (
              <ActionStat label="Chaos keys" title="Chaos keys (unlock from any category)" value={<PopOnChange value={chaosKeys} />}
                icon={<WikiIcon file="Sinister_key.png" alt="Chaos keys" Fallback={Dna} size={18} className="animate-pulse drop-shadow" />} />
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <ActionSlot label={activeBuff === 'NONE' ? 'Void Altar' : `Void Altar — ${activeBuff} active`} data-tour="altar" onClick={() => setShowAltar(true)} glow={altarGlow}>
              <Flame size={20} className={activeBuff === 'NONE' ? 'text-purple-300' : activeBuff === 'GREED' ? 'text-amber-300' : 'text-blue-300'} />
            </ActionSlot>
            <ActionSlot label="Oracle — search content" onClick={() => setShowOracle(true)}><Search size={18} /></ActionSlot>
            <ActionSlot label="Resource Engine" onClick={() => setShowSupplyChain(true)}><Database size={18} /></ActionSlot>
            <ActionSlot label="Fate Thread" onClick={() => openNav('open:fatethread')}><Spline size={18} /></ActionSlot>
            <ActionSlot label="Strategy Guide" onClick={() => setShowStrategy(true)}><Compass size={18} /></ActionSlot>
            <ActionSlot label="Stats" onClick={() => setShowStats(true)}><BarChart3 size={18} /></ActionSlot>
          </div>
        </div>
      </div>
    </>
  );
};

// --- New Control Panel Component ---
const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<'FARM' | 'SPEND' | 'LOG'>('FARM');

  // Command-palette navigation to a control tab.
  useEffect(() => {
    const onNav = (e: Event) => {
      const target = (e as CustomEvent<{ target?: string }>).detail?.target ?? '';
      if (target.startsWith('ctrl:')) setActiveTab(target.slice(5) as 'FARM' | 'SPEND' | 'LOG');
    };
    window.addEventListener('fate:nav', onNav);
    return () => window.removeEventListener('fate:nav', onNav);
  }, []);

  return (
    <Rs3Window title="Fate Actions" icon={<Key size={13} className="text-rs3-gold" />} className="h-full" bodyClassName="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#574930] bg-[#171412] px-1 shrink-0">
        <button
          data-tour="farm"
          onClick={() => setActiveTab('FARM')}
          className={`flex-1 py-2 text-[13px] rs3-tab-label flex items-center justify-center gap-2 transition-colors ${activeTab === 'FARM' ? 'rs3-tab-active text-green-400' : 'rs3-tab text-gray-500 hover:text-gray-300'}`}
        >
          <WikiIcon file="Slayer_icon.png" alt="Farm Keys" Fallback={Swords} size={15} className={activeTab === 'FARM' ? '' : 'opacity-60 grayscale'} /> Farm Keys
        </button>
        <button
          data-tour="spend"
          onClick={() => setActiveTab('SPEND')}
          className={`flex-1 py-2 text-[13px] rs3-tab-label flex items-center justify-center gap-2 transition-colors ${activeTab === 'SPEND' ? 'rs3-tab-active text-rs3-gold' : 'rs3-tab text-gray-500 hover:text-gray-300'}`}
        >
          <WikiIcon file="Mystery_box.png" alt="Spend Keys" Fallback={ShoppingBag} size={15} className={activeTab === 'SPEND' ? '' : 'opacity-60 grayscale'} /> Spend Keys
        </button>
        <button
          onClick={() => setActiveTab('LOG')}
          className={`flex-1 py-2 text-[13px] rs3-tab-label flex items-center justify-center gap-2 transition-colors ${activeTab === 'LOG' ? 'rs3-tab-active text-blue-400' : 'rs3-tab text-gray-500 hover:text-gray-300'}`}
        >
          <WikiIcon file="Watch.png" alt="History" Fallback={ScrollText} size={15} className={activeTab === 'LOG' ? '' : 'opacity-60 grayscale'} /> History
        </button>
      </div>

      {/* Contextual guide for the active panel */}
      <div className="flex items-center justify-end gap-1.5 px-3 py-1 bg-[#171513] border-b border-[#312c27] shrink-0 text-[10px] text-gray-500">
        <span>{GUIDES[activeTab]?.title}</span>
        <SectionGuide id={activeTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <div className={activeTab === 'FARM' ? 'block' : 'hidden'}>
           <ActionSection />
        </div>
        <div className={activeTab === 'SPEND' ? 'block' : 'hidden'}>
           <GachaSection />
        </div>
        <div className={activeTab === 'LOG' ? 'block h-full' : 'hidden'}>
           <LogViewer />
        </div>
      </div>
    </Rs3Window>
  );
};

const GameLayout = () => {
  const { lastEvent, animationsEnabled, hasSeenOnboarding, history } = useGame();
  const { recentlyCreatedId, activeProfileId, clearRecentlyCreated } = useProfiles();

  // UI States
  const [showStats, setShowStats] = useState(false);
  const [showFateThread, setShowFateThread] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showAltar, setShowAltar] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [showSupplyChain, setShowSupplyChain] = useState(false);
  const [supplyChainPreset, setSupplyChainPreset] = useState<string | undefined>(undefined);

  // Cross-component shortcut: any child can dispatch `open-resource-engine`
  // with `{ detail: { item: 'Vorago' } }` to open the modal pre-populated.
  // Used by the GoalTracker's Closest-unlocks chips so the dashboard can deep-
  // link into the engine without prop-drilling a callback through every layer.
  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ item?: string }>).detail;
      setSupplyChainPreset(detail?.item);
      setShowSupplyChain(true);
    };
    window.addEventListener('open-resource-engine', onOpen);
    return () => window.removeEventListener('open-resource-engine', onOpen);
  }, []);

  // Command-palette navigation: open the modals this layout owns.
  React.useEffect(() => {
    const onNav = (e: Event) => {
      const target = (e as CustomEvent<{ target?: string }>).detail?.target ?? '';
      const map: Record<string, (v: boolean) => void> = {
        'open:altar': setShowAltar,
        'open:stats': setShowStats,
        'open:fatethread': setShowFateThread,
        'open:reference': setShowReference,
        'open:oracle': setShowOracle,
        'open:strategy': setShowStrategy,
        'open:supply': setShowSupplyChain,
        'open:gamemode': setShowGameMode,
        'open:sync': setShowSyncCode,
      };
      map[target]?.(true);
    };
    window.addEventListener('fate:nav', onNav);
    return () => window.removeEventListener('fate:nav', onNav);
  }, []);
  const [showGameMode, setShowGameMode] = useState(false);
  const [showSyncCode, setShowSyncCode] = useState(false);
  const [syncImportCode, setSyncImportCode] = useState<string | undefined>(undefined);
  const [activeRitualAnim, setActiveRitualAnim] = useState<'NONE' | 'LUCK' | 'GREED' | 'CHAOS' | 'TRANSMUTE'>('NONE');

  // Deep link: a `#sync=<code>` fragment (from a shared link or scanned QR)
  // opens the Sync Code modal pre-filled on the Import tab, then clears the
  // hash so a refresh doesn't re-trigger it and the URL stays tidy.
  useEffect(() => {
    const hash = window.location.hash;
    const marker = '#sync=';
    if (hash.startsWith(marker)) {
      const code = hash.slice(marker.length);
      if (code) {
        setSyncImportCode(code);
        setShowSyncCode(true);
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Watch for ritual events to trigger animations
  React.useEffect(() => {
    if (lastEvent?.type === 'RITUAL' && animationsEnabled) {
       setActiveRitualAnim((lastEvent.meta as any).type);
    }
  }, [lastEvent, animationsEnabled]);

  // Ctrl/⌘+K now opens the command palette (which can jump to the Oracle and
  // everything else); the CommandPalette component owns that key handler.

  // A freshly-created profile prompts the player to choose a game mode while
  // the run is still empty (and the mode therefore still unlocked).
  useEffect(() => {
    if (recentlyCreatedId && recentlyCreatedId === activeProfileId) {
      setShowGameMode(true);
      clearRecentlyCreated();
    }
  }, [recentlyCreatedId, activeProfileId, clearRecentlyCreated]);

  // The first profile is created implicitly, so new players reach the game via
  // the onboarding wizard rather than `createProfile`. Catch that finish-line:
  // when onboarding flips to complete on a still-empty run, prompt the mode pick.
  const prevOnboarded = useRef(hasSeenOnboarding);
  useEffect(() => {
    if (!prevOnboarded.current && hasSeenOnboarding && history.length === 0) {
      setShowGameMode(true);
    }
    prevOnboarded.current = hasSeenOnboarding;
  }, [hasSeenOnboarding, history.length]);

  // Escape closes whichever top-level modal is open.
  const anyModalOpen = showStats || showReference || showAltar
    || showOracle || showStrategy || showSupplyChain || showGameMode || showSyncCode;
  useEscapeKey(() => {
    setShowStats(false);
    setShowReference(false);
    setShowAltar(false);
    setShowOracle(false);
    setShowStrategy(false);
    setShowSupplyChain(false);
    setShowGameMode(false);
    setShowSyncCode(false);
  }, anyModalOpen);

  return (
    <div className="min-h-screen bg-rs3-bg text-rs3-text font-sans selection:bg-rs3-gold selection:text-black relative">
      <EffectsLayer />

      {/* Shared notification stacks: every toast/reveal portals into one of
          these so they queue cleanly instead of overlapping in a corner. */}
      <div id="reveal-top" className="fixed top-24 right-5 z-[9998] flex flex-col gap-3 items-end pointer-events-none" />
      <div id="reveal-bottom" className="fixed bottom-28 right-5 z-[9997] flex flex-col-reverse gap-3 items-end pointer-events-none" />
      <ToastNotification />

      {!hasSeenOnboarding && <OnboardingWizard />}

      {activeRitualAnim === 'TRANSMUTE' && <TransmutationEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'LUCK' && <ClarityEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'GREED' && <GreedEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'CHAOS' && <ChaosEffect onComplete={() => setActiveRitualAnim('NONE')} />}

      {showAltar && <VoidAltar onClose={() => setShowAltar(false)} />}
      <Suspense fallback={<ModalFallback />}>
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
        {showFateThread && <FateThread onClose={() => setShowFateThread(false)} />}
        {showReference && <ReferenceModal onClose={() => setShowReference(false)} />}
        {showOracle && <OracleSearch onClose={() => setShowOracle(false)} />}
        {showStrategy && <StrategyGuide onClose={() => setShowStrategy(false)} />}
        {showSupplyChain && <SupplyChainCalculator initialQuery={supplyChainPreset} onClose={() => { setShowSupplyChain(false); setSupplyChainPreset(undefined); }} />}
        {showGameMode && <GameModePicker onClose={() => setShowGameMode(false)} />}
        {showSyncCode && <SyncCodeModal onClose={() => { setShowSyncCode(false); setSyncImportCode(undefined); }} initialImportCode={syncImportCode} />}
      </Suspense>

      <Header
        setShowAltar={setShowAltar}
        setShowStats={setShowStats}
        setShowReference={setShowReference}
        setShowOracle={setShowOracle}
        setShowStrategy={setShowStrategy}
        setShowSupplyChain={setShowSupplyChain}
        setShowGameMode={setShowGameMode}
        setShowSyncCode={setShowSyncCode}
      />

      {/* Global ⌘K command palette — navigates via fate:nav events. */}
      <CommandPalette />
      {/* Replayable spotlight tour — start via fate:start-tour. */}
      <GuidedTour />
      {/* Quest-complete celebration with the wiki reward scroll. */}
      <QuestCompleteOverlay />

      {/* Main Command Center Layout */}
      <main className="max-w-[1600px] mx-auto px-4 pt-3 pb-[96px] h-[calc(100vh-52px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">

          {/* LEFT: Journal summary + Interaction & Control (35%).
              The journal summary lives here (rather than inside a Dashboard tab)
              so it stays visible across every tab switch. Clicking a row fires a
              `navigate-journal` event the Dashboard listens for. */}
          <div className="lg:col-span-4 h-full min-h-[500px] flex flex-col gap-4">
            <div className="shrink-0">
              <PanelErrorBoundary name="Journal summary">
                <JournalSummaryCard
                  onNavClick={(tab) =>
                    window.dispatchEvent(new CustomEvent('navigate-journal', { detail: { tab } }))
                  }
                />
              </PanelErrorBoundary>
            </div>
            <div className="flex-1 min-h-0">
              <PanelErrorBoundary name="Control panel">
                <ControlPanel />
              </PanelErrorBoundary>
            </div>
          </div>

          {/* RIGHT: Dashboard Visualization (65%) */}
          <div className="lg:col-span-8 h-full min-h-[500px] flex flex-col gap-4">
             <div className="flex-1 overflow-hidden h-full">
               <PanelErrorBoundary name="Dashboard">
                 <Dashboard />
               </PanelErrorBoundary>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

/** Bridge reads profile context and passes storageKey to GameProvider.
 *  key={activeProfileId} forces a clean remount when switching profiles. */
const GameProviderBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeProfileId, storageKeyForActiveProfile } = useProfiles();
  return (
    <GameProvider key={activeProfileId} storageKey={storageKeyForActiveProfile}>
      {children}
    </GameProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <GameProviderBridge>
          <GameLayout />
        </GameProviderBridge>
      </ProfileProvider>
      <UpdateBanner />
    </ErrorBoundary>
  );
}

export default App;
