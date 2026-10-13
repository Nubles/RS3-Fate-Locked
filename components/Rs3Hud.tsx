import React, { ReactNode } from 'react';

/**
 * Building blocks for the RS3 game-screen layout: the ribbon of menu buttons
 * along the top, the action bar (stat readouts and slots) along the bottom,
 * and the bronze-framed interface windows the panels sit in.
 */

interface RibbonButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
  'data-tour'?: string;
}

/** A square, steel-framed ribbon button with its name shown on hover. */
export const RibbonButton: React.FC<RibbonButtonProps> = ({ label, onClick, children, active, className = '', ...rest }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    aria-pressed={active}
    data-tour={rest['data-tour']}
    className={`rs3-ribbon-btn group relative w-9 h-9 flex items-center justify-center ${active ? 'rs3-ribbon-btn-active' : ''} ${className}`}
  >
    {children}
    <span className="rs3-tooltip pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-[60]">
      {label}
    </span>
  </button>
);

interface ActionStatProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  /** 0–1 share of the stat bar to fill; omit for a count with no bar. */
  fill?: number;
  /** RS3 stat colour for the bar. */
  tone?: 'adren' | 'lp' | 'prayer' | 'summon';
  dim?: boolean;
  title?: string;
  className?: string;
}

/** One readout on the action bar's stat row: icon, value and a thin stat bar, like Life points or Adrenaline. */
export const ActionStat: React.FC<ActionStatProps> = ({ label, value, icon, fill, tone = 'adren', dim, title, className = '' }) => (
  <div className={`flex items-center gap-1.5 ${dim ? 'opacity-50' : ''} ${className}`} title={title ?? label}>
    <span className="w-6 h-6 shrink-0 flex items-center justify-center">{icon}</span>
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <span className="text-[12px] leading-none font-semibold text-[#f0e6d6] [text-shadow:1px_1px_0_#000] whitespace-nowrap">
        <span className="sr-only">{label}: </span>{value}
      </span>
      {fill !== undefined && (
        <div className="rs3-statbar w-full">
          <div className={`rs3-statbar-fill is-${tone}`} style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }} />
        </div>
      )}
    </div>
  </div>
);

interface ActionSlotProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** Small text in the slot's corner, like a stack count. */
  badge?: ReactNode;
  glow?: string;
  'data-tour'?: string;
}

/** A recessed square action-bar slot, like an RS3 ability slot. */
export const ActionSlot: React.FC<ActionSlotProps> = ({ label, onClick, children, badge, glow, ...rest }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    data-tour={rest['data-tour']}
    className="rs3-action-slot group relative w-11 h-11 shrink-0 flex items-center justify-center"
    style={glow ? { boxShadow: `inset 0 0 10px ${glow}, 0 0 6px ${glow}` } : undefined}
  >
    {children}
    {badge !== undefined && (
      <span className="rs3-stack absolute top-0.5 left-1 text-[10px] leading-none font-bold">{badge}</span>
    )}
    <span className="rs3-tooltip pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-[60]">
      {label}
    </span>
  </button>
);

interface Rs3WindowProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** An RS3 interface window: a dark title bar with a centred gold title over a bronze-framed body. */
export const Rs3Window: React.FC<Rs3WindowProps> = ({ title, icon, children, className = '', bodyClassName = '' }) => (
  <section className={`rs3-window rs3-frame rounded-[3px] flex flex-col overflow-hidden ${className}`} aria-label={title}>
    <div className="rs3-window-bar shrink-0 h-7 px-2.5 flex items-center justify-center gap-2">
      {icon && <span className="flex items-center">{icon}</span>}
      <h2 className="rs3-title text-[14px] leading-none truncate">{title}</h2>
    </div>
    <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
  </section>
);
