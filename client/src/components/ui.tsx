import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { EvidenceState } from '../types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'flag';

/** Hard shadow is reserved for things you can press. It sinks on press and disappears when disabled. */
export const PRESSABLE =
  'border-2 border-ink shadow-brut-sm transition-[transform,box-shadow] duration-75 hover:-translate-x-px hover:-translate-y-px hover:shadow-brut active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: `bg-accent text-ink ${PRESSABLE}`,
  secondary: `bg-paper text-ink ${PRESSABLE}`,
  ghost: 'border-2 border-transparent text-ink hover:border-ink hover:bg-paper',
  flag: `bg-flag text-white ${PRESSABLE}`,
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'px-2.5 py-1 text-xs rounded-md' : 'px-4 py-2 text-sm rounded-lg';
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 font-bold disabled:cursor-not-allowed ${sz} ${variants[variant]} ${className}`}
    />
  );
}

/** Status palette: only used for evidence status, always with icon + label. */
export const EVIDENCE: Record<EvidenceState, { icon: string; label: string; fill: string; soft: string }> = {
  on: { icon: '●', label: 'On resume', fill: 'bg-found', soft: 'bg-found-soft' },
  clearer: { icon: '◐', label: 'Could be clearer', fill: 'bg-partial', soft: 'bg-partial-soft' },
  bank: { icon: '◆', label: 'In your bank', fill: 'bg-bank', soft: 'bg-bank-soft' },
  none: { icon: '○', label: 'No evidence yet', fill: 'bg-paper border-dashed', soft: 'bg-paper' },
};

export function EvidenceBadge({ state, compact = false }: { state: EvidenceState; compact?: boolean }) {
  const e = EVIDENCE[state];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-xs font-bold text-ink ${e.fill}`}>
      <span aria-hidden>{e.icon}</span>
      {compact ? <span className="sr-only">{e.label}</span> : e.label}
    </span>
  );
}

/** Square-ish swatch with the status icon, used in lists and legends. */
export function EvidenceSwatch({ state, size = 'md' }: { state: EvidenceState; size?: 'sm' | 'md' }) {
  const e = EVIDENCE[state];
  const sz = size === 'sm' ? 'h-4 w-4 text-[9px] rounded' : 'h-7 w-7 text-sm rounded-md';
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center border-2 border-ink ${sz} ${e.fill}`}>
      {e.icon}
    </span>
  );
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border-2 border-ink bg-paper px-1.5 py-px font-mono text-[11px] font-bold text-ink ${className}`}>{children}</span>
  );
}

/** Static surface: flat on purpose (no shadow = not clickable). */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border-2 border-ink bg-paper ${className}`}>{children}</div>;
}

/**
 * The one signature treatment for overstated or unsupported wording.
 * Thick red border + red header strip; `flag` red appears nowhere else in the UI.
 */
export function FlagBanner({ title, children, className = '' }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div role="note" className={`overflow-hidden rounded-xl border-4 border-flag bg-flag-soft text-ink ${className}`}>
      <div className="flex items-center gap-2 bg-flag px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
        <span aria-hidden>⚑</span> {title}
      </div>
      {children && <div className="space-y-2 px-3 py-2.5 text-sm">{children}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-auto rounded-2xl border-2 border-ink bg-cream ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-ink bg-accent-soft px-5 py-3">
          <h2 className="font-display text-base">{title}</h2>
          <Button size="sm" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">{children}</div>;
}
