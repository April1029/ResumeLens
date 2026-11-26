import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../state/store';
import { POSTING, REQUIREMENTS } from '../data/demo';
import { analyzeLog } from '../data/logs';
import { LiveLog, type LogStep } from '../components/LiveLog';
import { Button, Card, PRESSABLE } from '../components/ui';
import type { Requirement } from '../types';

// Demo links: one site we can read (Greenhouse has a public postings API), one that blocks reading.
const DEMO_READABLE = 'https://boards.greenhouse.io/lumenlabs/jobs/4012876';
const DEMO_BLOCKED = 'https://www.linkedin.com/jobs/view/3912045871';

/** Sites known to block automatic reading. We don't try them; we go straight to paste. */
const BLOCKED: Record<string, string> = {
  'linkedin.com': 'LinkedIn',
  'indeed.com': 'Indeed',
  'joinhandshake.com': 'Handshake',
  'glassdoor.com': 'Glassdoor',
};
/** Job boards with public posting APIs, so a link reads reliably. */
const READABLE = ['greenhouse.io', 'lever.co', 'ashbyhq.com', 'jobs.example.com'];

type Stage = 'input' | 'reading' | 'check' | 'analyzing';
/** What happened to the link: nothing yet, known-blocked, tried and failed. */
type LinkIssue = null | { kind: 'blocked'; site: string } | { kind: 'failed'; host: string };

const hostOf = (s: string) => {
  try {
    return new URL(s.trim()).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};
const isLink = (s: string) => /^https?:\/\/\S+$/.test(s.trim());
const matches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);
const blockedSite = (host: string) => Object.entries(BLOCKED).find(([d]) => matches(host, d))?.[1];

export function NewTailoring() {
  const { state, dispatch } = useStore();
  const defaultVersion = state.versions.find((v) => v.isDefault) ?? state.versions[0];
  const [stage, setStage] = useState<Stage>('input');
  const [input, setInput] = useState('');
  const [link, setLink] = useState('');
  const [pasted, setPasted] = useState('');
  const [issue, setIssue] = useState<LinkIssue>(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [reqs, setReqs] = useState<Requirement[]>(REQUIREMENTS);
  const [base, setBase] = useState(defaultVersion?.id ?? '');
  const pasteBox = useRef<HTMLTextAreaElement>(null);

  // A link from a known-blocked site gets the paste box right away: no waiting on a fetch we know will fail.
  const host = isLink(input) ? hostOf(input) : null;
  const blocked = host ? blockedSite(host) : undefined;
  useEffect(() => {
    if (blocked) {
      setLink(input.trim());
      setIssue({ kind: 'blocked', site: blocked });
    } else if (issue?.kind === 'blocked') setIssue(null);
  }, [blocked, input]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (issue) pasteBox.current?.focus();
  }, [issue]);

  const startFromInput = () => {
    if (!isLink(input)) {
      // Pasted text: go straight to extraction.
      setPasted(input);
      setStage('reading');
      return;
    }
    setLink(input.trim());
    setStage('reading');
  };

  const readSucceeded = !pasted && host != null && READABLE.some((d) => matches(host, d));
  const readSteps: LogStep[] = useMemo(() => {
    if (pasted)
      return [
        { label: 'Finding the posting in what you pasted', done: `Found ${POSTING.company} · ${POSTING.role}`, ms: 900 },
        extractStep(reqs),
      ];
    return [
      { label: `Opening ${host}`, done: `Read the posting from ${host}`, ms: 1000 },
      { label: 'Finding company and role', done: `${POSTING.company} · ${POSTING.role}`, ms: 700 },
      extractStep(reqs),
    ];
  }, [pasted, host]); // eslint-disable-line react-hooks/exhaustive-deps

  // An unknown site: try briefly, then fall back to paste without making it the user's fault.
  useEffect(() => {
    if (stage !== 'reading' || pasted || readSucceeded) return;
    const t = setTimeout(() => {
      setIssue({ kind: 'failed', host: host ?? 'this site' });
      setStage('input');
    }, 2200);
    return () => clearTimeout(t);
  }, [stage, pasted, readSucceeded, host]);

  const toCheck = () => {
    setCompany(POSTING.company);
    setRole(POSTING.role);
    setReqs(REQUIREMENTS);
    setStage('check');
  };

  const analyze = () => {
    setStage('analyzing');
  };

  const log = useMemo(() => analyzeLog(state.facts, reqs), [state.facts, reqs]);

  if (stage === 'analyzing')
    return (
      <Shell>
        <Card className="mx-auto max-w-lg p-8">
          <h1 className="text-xl">Comparing your resume with the posting</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">Suggestions only use facts from your bank.</p>
          <LiveLog
            steps={log}
            onDone={() =>
              dispatch({
                type: 'startSession',
                session: { company, role, link, postingText: pasted || POSTING.text, baseVersionId: base, requirements: reqs },
              })
            }
          />
        </Card>
      </Shell>
    );

  if (stage === 'reading')
    return (
      <Shell>
        <Card className="mx-auto max-w-lg p-8">
          <h1 className="text-xl">{pasted ? 'Reading what you pasted' : 'Reading the job posting'}</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">You’ll check what we found before anything is compared.</p>
          {pasted || readSucceeded ? (
            <LiveLog steps={readSteps} onDone={toCheck} />
          ) : (
            <div className="flex items-center gap-3 text-sm font-bold" aria-live="polite">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-ink bg-paper">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-strong border-t-transparent" />
              </span>
              Opening {host}…
            </div>
          )}
        </Card>
      </Shell>
    );

  if (stage === 'check') {
    const required = reqs.filter((r) => r.type === 'required').length;
    const update = (id: string, patch: Partial<Requirement>) => setReqs((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return (
      <Shell>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">Check what we found</h1>
          <p className="mt-1 text-slate-600">
            Found {required} required and {reqs.length - required} nice-to-have. Fix anything we misread; the evidence map is built from this list.
          </p>
          <Card className="mt-6 space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Company
                <input className="mt-1 w-full rounded-lg border border-ink px-3 py-2 text-sm font-normal" value={company} onChange={(e) => setCompany(e.target.value)} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Role
                <input className="mt-1 w-full rounded-lg border border-ink px-3 py-2 text-sm font-normal" value={role} onChange={(e) => setRole(e.target.value)} />
              </label>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-slate-700">Requirements</div>
              <ul className="divide-y-2 divide-ink/10 rounded-xl border-2 border-ink bg-paper">
                {reqs.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1">{r.text}</span>
                    <button
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${PRESSABLE} ${r.type === 'required' ? 'bg-accent-soft' : 'bg-paper'}`}
                      onClick={() => update(r.id, { type: r.type === 'required' ? 'nice' : 'required' })}
                      aria-label={`${r.short}: ${r.type === 'required' ? 'required' : 'nice-to-have'}. Click to switch.`}
                    >
                      {r.type === 'required' ? 'Required' : 'Nice to have'}
                    </button>
                    <button
                      className="shrink-0 rounded-md px-1.5 text-slate-500 hover:bg-cream hover:text-ink"
                      onClick={() => setReqs((rs) => rs.filter((x) => x.id !== r.id))}
                      aria-label={`Remove ${r.short}`}
                      title="Not a real requirement? Remove it"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              {reqs.length < REQUIREMENTS.length && (
                <button className="mt-2 text-xs font-medium underline" onClick={() => setReqs(REQUIREMENTS)}>
                  Restore removed ({REQUIREMENTS.length - reqs.length})
                </button>
              )}
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Start from
              <select className="mt-1 w-full rounded-lg border border-ink bg-paper px-3 py-2 text-sm font-normal" value={base} onChange={(e) => setBase(e.target.value)}>
                {state.versions
                  .filter((v) => v.kind !== 'job')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/10 pt-4">
              <span className="text-xs text-slate-500">
                {link ? 'Link and posting text are saved with this application.' : 'The posting text is saved with this application.'}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStage('input')}>← Back</Button>
                <Button variant="primary" disabled={!reqs.length} onClick={analyze}>Looks right, compare</Button>
              </div>
            </div>
          </Card>
        </div>
      </Shell>
    );
  }

  // Input stage: one box for a link or the posting text, with an in-place paste fallback.
  const fallbackReady = pasted.trim().length > 0;
  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">New tailoring</h1>
        <p className="mt-1 text-slate-600">
          We’ll make a separate copy for this job. Your {defaultVersion?.name ?? 'Master'} resume stays unchanged.
        </p>
        <Card className="mt-6 space-y-4 p-6">
          <label className="block text-sm font-medium text-slate-700">
            Job posting
            <textarea
              className={`mt-1 w-full rounded-lg border border-ink p-3 text-sm font-normal ${isLink(input) || !input ? 'h-12 resize-none' : 'h-48'}`}
              placeholder="Paste a job link, or the posting text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (issue?.kind === 'failed') setIssue(null);
              }}
            />
          </label>

          {issue && (
            <div className="space-y-3 rounded-xl border-2 border-dashed border-ink bg-cream p-4" role="status">
              <p className="text-sm">
                {issue.kind === 'blocked' ? (
                  <><strong>{issue.site} doesn’t let us read postings directly.</strong> Paste the text below instead; it takes about 10 seconds.</>
                ) : (
                  <><strong>We couldn’t read {issue.host}.</strong> Some sites block automatic reading. Paste the text below instead.</>
                )}{' '}
                <span className="text-slate-600">We’ll keep the link with this application.</span>
              </p>
              <ol className="list-decimal space-y-0.5 pl-5 text-sm text-slate-700">
                <li>
                  <a className="font-bold underline" href={link} target="_blank" rel="noreferrer">Open the posting ↗</a>
                </li>
                <li>Press <Kbd>⌘A</Kbd> then <Kbd>⌘C</Kbd> to copy the whole page</li>
                <li>Paste here. Menus and footers are fine; we’ll find the requirements.</li>
              </ol>
              <textarea
                ref={pasteBox}
                className="h-40 w-full rounded-lg border border-ink p-3 text-sm"
                placeholder="Paste the posting page here…"
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button size="sm" variant="ghost" className="bg-blue-soft" onClick={() => setPasted(POSTING.text)}>Demo: paste the page</Button>
                <Button variant="primary" disabled={!fallbackReady} onClick={() => setStage('reading')}>Find requirements</Button>
              </div>
            </div>
          )}

          {!issue && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" className="bg-blue-soft" onClick={() => setInput(DEMO_READABLE)}>Demo: Greenhouse link</Button>
                <Button size="sm" variant="ghost" className="bg-blue-soft" onClick={() => setInput(DEMO_BLOCKED)}>Demo: LinkedIn link</Button>
                <Button size="sm" variant="ghost" className="bg-blue-soft" onClick={() => setInput(POSTING.text)}>Demo: paste text</Button>
              </div>
              <Button variant="primary" disabled={!input.trim()} onClick={startFromInput}>
                {isLink(input) ? 'Read posting' : 'Find requirements'}
              </Button>
            </div>
          )}
          <p className="text-xs text-slate-400">Prototype: any posting reads as the Lumen Labs sample. Other links simulate a site we can’t read.</p>
        </Card>
      </div>
    </Shell>
  );
}

function extractStep(reqs: Requirement[]): LogStep {
  const required = reqs.filter((r) => r.type === 'required').length;
  return {
    label: 'Pulling out requirements',
    done: `Found ${required} required and ${reqs.length - required} nice-to-have`,
    ms: 1600,
    items: reqs.map((r) => (
      <>
        {r.short} <span className="text-slate-400">· {r.type === 'required' ? 'required' : 'nice-to-have'}</span>
      </>
    )),
  };
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10">{children}</div>;
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border-2 border-ink bg-paper px-1 font-mono text-[11px] font-bold">{children}</kbd>;
}
