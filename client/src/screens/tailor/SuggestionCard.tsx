import { useEffect, useRef, useState } from 'react';
import type { Decision, Fact, Requirement, Suggestion } from '../../types';
import { Button, Chip, FlagBanner } from '../../components/ui';
import { checkClaims, diffWords, finalText, hasPlaceholder } from '../../lib/resume';
import { useStore } from '../../state/store';

interface Props {
  s: Suggestion;
  decision?: Decision;
  /** Position among this requirement's suggestions. */
  pos: { i: number; n: number };
  onPrev: () => void;
  onNext: () => void;
  /** The row this card is shown under; other requirements it covers are listed as "also covers". */
  primaryReqId: string;
  facts: Fact[];
  reqs: Requirement[];
  onDecide: (d: Decision) => void;
  onUndo: () => void;
  /** Exposed so the workspace can route keyboard shortcuts. */
  registerKeys: (h: { accept: () => void; edit: () => void; skip: () => void } | null) => void;
  /** One-time explanation of what the red flag means. */
  showFlagHint?: boolean;
}

/** One suggestion, embedded inside its requirement row in the evidence map. */
export function SuggestionCard({ s, decision, pos, onPrev, onNext, primaryReqId, facts, reqs, onDecide, onUndo, registerKeys, showFlagHint = false }: Props) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view');
  const [draft, setDraft] = useState(s.suggested);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [openFact, setOpenFact] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [editError, setEditError] = useState('');
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode('view');
    setDraft(decision?.text ?? s.suggested);
    setPendingText(null);
    setConfirmed(false);
    setEditError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  // Bring the interview check / edit controls into view when they open.
  useEffect(() => {
    if (mode !== 'view') footerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [mode]);

  const sources = facts.filter((f) => s.sources.includes(f.id));
  const { dispatch } = useStore();

  /** Save the user's own new detail as a child fact of the line's main source, so later suggestions can use it. */
  const saveAsFact = (text: string) => {
    const anchor = sources[0];
    const parentId = anchor?.parentId ?? anchor?.id ?? s.sources[0];
    const parent = facts.find((f) => f.id === parentId);
    const taken = new Set(facts.map((f) => f.id));
    let i = 1;
    while (taken.has(`${parentId}.${String.fromCharCode(96 + i)}`)) i++;
    const id = `${parentId}.${String.fromCharCode(96 + i)}`;
    dispatch({
      type: 'addFacts',
      facts: [{ id, parentId, category: parent?.category ?? 'project', title: 'Added while tailoring', details: [text], origin: 'user' }],
    });
    dispatch({ type: 'toast', text: `Saved to your fact bank as ${id}` });
    return id;
  };
  const draftWarnings = mode === 'edit' ? checkClaims(draft, sources) : [];
  const decided = !!decision && decision.status !== 'pending';
  const skipped = decision?.status === 'skipped';
  const alsoCovers = reqs.filter((r) => s.reqIds.includes(r.id) && r.id !== primaryReqId);

  // "Adds detail" cards need a yes/no truth check; any [placeholder] must be filled in or removed first.
  const needsCheck = s.kind === 'detail' && !!s.claimCheck && !s.flag;
  const phBlock = hasPlaceholder(s.suggested);
  const blocked = phBlock || (needsCheck && !confirmed);

  const accept = () => {
    if (blocked) return;
    if (s.flag) {
      setPendingText(null);
      setMode('confirm');
    } else onDecide({ status: 'accepted', confirmed: needsCheck || undefined });
  };
  const saveEdit = () => {
    const text = draft.trim();
    if (!text) return;
    if (hasPlaceholder(text)) {
      setEditError('Fill in or remove the highlighted [placeholder] first.');
      return;
    }
    setEditError('');
    if (checkClaims(text, sources).length) {
      setPendingText(text);
      setMode('confirm');
    } else onDecide({ status: 'edited', text });
  };

  useEffect(() => {
    if (decided || mode !== 'view') {
      registerKeys(null);
      return;
    }
    registerKeys({ accept, edit: () => setMode('edit'), skip: () => onDecide({ status: 'skipped' }) });
    return () => registerKeys(null);
  });

  const shown = decided ? (skipped ? s.current : finalText(s, decision)) : s.suggested;
  // Word-level highlighting only makes sense when one line replaces another.
  const rawDiff = s.op.kind === 'replace' && !skipped && mode !== 'edit' ? diffWords(s.current, shown) : null;
  // If under ~40% of the words carry over, a whole-line swap reads better than scattered highlights.
  const kept = rawDiff ? rawDiff.filter((d) => d.op === '=').reduce((n, d) => n + d.text.split(' ').length, 0) : 0;
  const diff = rawDiff && kept / Math.max(s.current.split(/\s+/).length, shown.split(/\s+/).length) >= 0.4 ? rawDiff : null;

  const statusLabel = { accepted: decision?.usedSafer ? 'Accepted (safer wording)' : 'Accepted', edited: 'Edited & accepted', skipped: 'Skipped', pending: '' };

  return (
    <div className="space-y-3">
      {decided && (
        <div className={`-mx-3 -mt-2.5 flex items-center justify-between border-b-2 border-ink px-3 py-1.5 text-xs font-bold ${skipped ? 'bg-slate-100' : 'bg-found'}`}>
          <span>
            {skipped ? '⤼' : '✓'} {statusLabel[decision!.status]}
          </span>
          <Button size="sm" onClick={onUndo}>Undo</Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border-2 px-2 font-bold text-ink ${s.kind === 'wording' ? 'border-slate-300 bg-paper' : 'border-ink bg-blue-soft'}`}
            title={s.kind === 'wording' ? 'Rewording or reordering only. Nothing new is claimed.' : 'Says something your resume doesn’t say yet.'}
          >
            {s.kind === 'wording' ? 'Wording only' : 'Adds detail'}
          </span>
          {alsoCovers.length > 0 && (
            <span>
              Also covers <strong className="text-ink">{alsoCovers.map((r) => r.short).join(', ')}</strong>
            </span>
          )}
        </span>
          {pos.n > 1 && (
            <span className="flex shrink-0 items-center gap-1 font-bold">
              <button className="rounded px-1.5 hover:bg-cream" onClick={onPrev} aria-label="Previous suggestion for this requirement">‹</button>
              {pos.i + 1} of {pos.n}
              <button className="rounded px-1.5 hover:bg-cream" onClick={onNext} aria-label="Next suggestion for this requirement">›</button>
            </span>
          )}
      </div>

      {/* Before → after in one block */}
      <div className="rounded-lg bg-accent-soft px-3 py-2.5">
        <OldLine s={s} diff={diff} />
        {mode === 'edit' ? (
          <textarea
            autoFocus
            aria-label="Edit suggested wording"
            className="mt-1.5 h-20 w-full p-2 text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <p className="mt-1 text-sm font-medium text-ink">
            <span aria-hidden className="mr-1 text-slate-500">→</span>
            {diff
              ? diff
                  .filter((d) => d.op !== '-')
                  .map((d, i) =>
                    d.op === '+' ? (
                      <ins key={i} className="rounded-sm bg-accent px-0.5 no-underline decoration-accent-strong decoration-2 underline-offset-2 [text-decoration-line:underline]">
                        <WithPlaceholders text={d.text} />
                      </ins>
                    ) : (
                      <span key={i}>
                        {' '}
                        <WithPlaceholders text={d.text} />{' '}
                      </span>
                    ),
                  )
              : <WithPlaceholders text={shown} />}
          </p>
        )}
      </div>
      {editError && <p className="text-xs font-bold text-ink">{editError}</p>}

      {mode === 'edit' && (
        <div aria-live="polite">
          {draftWarnings.length > 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-400 px-3 py-2 text-xs text-slate-700">
              <p className="font-bold text-ink">Not in your fact bank yet</p>
              <ul className="mt-0.5 space-y-0.5">
                {draftWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <p className="mt-1">That’s fine if it’s true. You can save it as a fact when you save the edit.</p>
            </div>
          ) : (
            <p className="text-xs font-bold text-found-strong">✓ Nothing goes beyond your facts</p>
          )}
        </div>
      )}

      {/* Source + why, as two quiet lines */}
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-1.5">
          <span>{s.fromBank ? '◆ From your bank:' : 'Based on'}</span>
          {sources.map((f) => (
            <button
              key={f.id}
              className="inline-flex items-center gap-1 rounded-md px-1 hover:bg-cream"
              onClick={() => setOpenFact(openFact === f.id ? null : f.id)}
              aria-expanded={openFact === f.id}
              title={f.details.join(' · ')}
            >
              <Chip className={f.origin === 'user' ? 'bg-bank' : ''}>{f.id}</Chip>
              <span className="text-ink">{f.title}</span>
            </button>
          ))}
        </div>
        {openFact && (
          <ul className="ml-4 list-disc space-y-0.5 pl-3">
            {sources.find((f) => f.id === openFact)?.details.map((d) => <li key={d}>{d}</li>)}
          </ul>
        )}
        <p>
          <span className="font-bold text-ink">Why:</span> {s.why}
        </p>
      </div>

      {s.flag && !(decided && decision?.usedSafer) && (
        <FlagBanner title={s.flag.kind === 'stronger' ? 'Stronger than your facts' : 'Not in your facts'}>
          {showFlagHint && !decided && (
            <p className="rounded-md bg-white/70 px-2 py-1 text-xs font-bold">Red means the wording goes further than your facts. You decide whether to keep it.</p>
          )}
          <p>{s.flag.message}</p>
          <p className="text-xs">
            <span className="font-bold">Safer:</span> “{s.flag.saferText}”
          </p>
          {!decided && mode !== 'confirm' && (
            <Button size="sm" onClick={() => onDecide({ status: 'accepted', text: s.flag!.saferText, usedSafer: true })}>
              Use safer wording
            </Button>
          )}
        </FlagBanner>
      )}

      {!decided && (
        <div ref={footerRef}>
          {mode === 'confirm' ? (
            pendingText ? (
              // Your own edit added something new: a neutral question, plus the option to keep it as a fact.
              <div className="space-y-2 rounded-lg border-2 border-dashed border-ink bg-paper px-3 py-2.5" role="group" aria-label="Confirm your new detail">
                <p className="text-sm">
                  <strong>Is this accurate?</strong> Your version adds something your fact bank doesn’t have yet.
                </p>
                <ul className="text-xs text-slate-600">
                  {checkClaims(pendingText, sources).map((w) => (
                    <li key={w}>· {w}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => onDecide({ status: 'edited', text: pendingText, savedFact: saveAsFact(pendingText) })}>
                    Yes, save it to my facts
                  </Button>
                  <Button size="sm" onClick={() => onDecide({ status: 'edited', text: pendingText })}>Yes, just here</Button>
                  <Button size="sm" variant="ghost" onClick={() => setMode('edit')}>Go back</Button>
                </div>
              </div>
            ) : (
              // Accepting flagged wording: the red flag above already explains why; this is just the question.
              <div className="space-y-2 rounded-lg border-2 border-dashed border-ink bg-paper px-3 py-2.5" role="group" aria-label="Confirm wording">
                <p className="text-sm">
                  <strong>Could you explain this in an interview?</strong> You’ll be the one answering for it.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => onDecide({ status: 'accepted', text: s.flag!.saferText, usedSafer: true })}>
                    Use safer wording
                  </Button>
                  <Button size="sm" onClick={() => onDecide({ status: 'accepted' })}>Yes, keep it</Button>
                  <Button size="sm" variant="ghost" onClick={() => setMode('view')}>Go back</Button>
                </div>
              </div>
            )
          ) : mode === 'edit' ? (
            <div className="flex gap-2">
              <Button variant="primary" onClick={saveEdit} disabled={!draft.trim()}>Save edit</Button>
              <Button variant="ghost" onClick={() => setMode('view')}>Cancel</Button>
            </div>
          ) : (
            <div className="space-y-2.5">
            {needsCheck && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border-2 border-dashed border-ink bg-paper px-3 py-2 text-sm">
                <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <span>
                  <strong>Is this true?</strong> {s.claimCheck}
                </span>
              </label>
            )}
            {blocked && (
              <p className="text-xs text-slate-600" aria-live="polite">
                {phBlock ? 'Choose Edit to fill in or remove the highlighted [placeholder].' : 'Tick “Is this true?” to accept.'}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="primary" onClick={accept} disabled={blocked} title="Accept (A)" aria-keyshortcuts="A">Accept</Button>
              <Button onClick={() => setMode('edit')} title="Edit (E)" aria-keyshortcuts="E">Edit</Button>
              <Button onClick={() => onDecide({ status: 'skipped' })} title="Skip (S)" aria-keyshortcuts="S">Skip</Button>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Renders [placeholders] as dashed chips so they can't be missed. */
function WithPlaceholders({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[[^\]]+\]$/.test(p) ? (
          <span key={i} className="rounded border-2 border-dashed border-accent-strong bg-paper px-1 font-sans text-xs font-bold text-accent-strong">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** The current line, with removed words struck through (or the whole line, when nothing lines up word for word). */
function OldLine({ s, diff }: { s: Suggestion; diff: ReturnType<typeof diffWords> | null }) {
  if (s.op.kind === 'add') return <p className="text-sm italic text-slate-500">{s.current}</p>;
  if (!diff) return <p className="text-sm text-slate-500 line-through decoration-slate-400">{s.current}</p>;
  return (
    <p className="text-sm text-slate-500">
      {diff
        .filter((d) => d.op !== '+')
        .map((d, i) =>
          d.op === '-' ? (
            <del key={i} className="rounded-sm bg-slate-200 px-0.5 text-slate-600 decoration-slate-500">
              {d.text}
            </del>
          ) : (
            <span key={i}> {d.text} </span>
          ),
        )}
    </p>
  );
}
