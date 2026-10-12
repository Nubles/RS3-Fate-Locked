import React, { ReactNode } from 'react';

/**
 * Building blocks for the RS3 game-screen layout: the ribbon of square menu
 * buttons along the top, the circular stat orbs, the action-bar slots along
 * the bottom, and the framed interface windows the panels sit in.
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

interface StatOrbProps {
  label: string;
  value: ReactNode;
  /** 0–1 share of the ring to fill. */
  fill: number;
  color: string;
  icon: ReactNode;
  dim?: boolean;
  title?: string;
}

/** A circular RS3 orb (like Life points or Prayer): a filled ring around an icon, value below. */
export const StatOrb: React.FC<StatOrbProps> = ({ label, value, fill, color, icon, dim, title }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, fill));
  return (
    <div className={`flex flex-col items-center gap-0.5 ${dim ? 'opacity-50' : ''}`} title={title ?? label}>
      <div className="rs3-orb relative w-12 h-12 rounded-full flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="4" />
          <circle
            cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={c} strokeDashoffset={c * (1 - f)}
            style={{ transition: 'stroke-dashoffset 500ms ease', filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
        <div className="relative w-8 h-8 rounded-full bg-[#081116] border border-black flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          {icon}
        </div>
      </div>
      <span className="rs3-stack text-[11px] leading-none font-bold">{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
};

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

/** An RS3 interface window: a slim title bar with a gold title over a framed body. */
export const Rs3Window: React.FC<Rs3WindowProps> = ({ title, icon, children, className = '', bodyClassName = '' }) => (
  <section className={`rs3-window rs3-frame rounded-md flex flex-col overflow-hidden ${className}`} aria-label={title}>
    <div className="rs3-window-bar shrink-0 h-7 px-2.5 flex items-center gap-2">
      {icon && <span className="flex items-center opacity-90">{icon}</span>}
      <h2 className="rs3-title text-[12px] font-bold tracking-wide truncate">{title}</h2>
    </div>
    <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
  </section>
);
