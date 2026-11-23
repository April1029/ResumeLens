import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface LogStep {
  /** Shown while the step runs, e.g. "Pulling out requirements". */
  label: string;
  /** Replaces the label when the step finishes, e.g. "Found 6 required and 5 nice-to-have". */
  done: string;
  /** Findings that stream in one at a time while the step runs. */
  items?: ReactNode[];
  /** Rough duration in ms (jittered so it doesn't tick like a metronome). */
  ms: number;
}

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const jitter = (ms: number) => (reduced ? 120 : Math.round(ms * (0.7 + Math.random() * 0.6)));

/**
 * A live activity log: steps appear one by one, each streams what it finds, then collapses to a result line.
 * Visibility of system status without pretending everything is known up front.
 */
export function LiveLog({ steps, onDone }: { steps: LogStep[]; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0); // items revealed in the current step
  const doneCb = useRef(onDone);
  doneCb.current = onDone;

  useEffect(() => {
    if (step >= steps.length) {
      const t = setTimeout(() => doneCb.current(), jitter(500));
      return () => clearTimeout(t);
    }
    const cur = steps[step];
    const n = cur.items?.length ?? 0;
    const per = cur.ms / (n + 1);
    const t = setTimeout(
      () => {
        if (shown < n) setShown((x) => x + 1);
        else {
          setStep((x) => x + 1);
          setShown(0);
        }
      },
      jitter(shown === 0 && n > 0 ? per * 1.4 : per),
    );
    return () => clearTimeout(t);
  }, [step, shown, steps]);

  return (
    <ol className="space-y-3" aria-live="polite">
      {steps.slice(0, step + 1).map((s, i) => {
        const finished = i < step;
        const items = s.items ?? [];
        return (
          <li key={s.label} className="animate-[logIn_220ms_ease-out]">
            <div className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold ${
                  finished ? 'border-ink bg-accent' : 'border-ink bg-paper'
                }`}
              >
                {finished ? '✓' : <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-strong border-t-transparent" />}
              </span>
              <span className={finished ? 'font-medium text-ink' : 'font-bold text-ink'}>
                {finished ? s.done : `${s.label}…`}
              </span>
            </div>
            {!finished && items.length > 0 && shown > 0 && (
              <ul className="ml-9 mt-1.5 space-y-1 text-xs text-slate-600">
                {items.slice(0, shown).map((it, k) => (
                  <li key={k} className="animate-[logIn_180ms_ease-out]">
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
