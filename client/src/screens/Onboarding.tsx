import { useState } from 'react';
import { useStore } from '../state/store';
import { DETAIL_QUESTIONS, RESUME_TEXT } from '../data/demo';
import { PARSE_LOG } from '../data/logs';
import { LiveLog } from '../components/LiveLog';
import { Button, Card, Chip } from '../components/ui';
import type { Fact, FactCategory } from '../types';

const STEPS = ['Upload', 'Review facts', 'Add detail', 'Job posting'];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs" aria-label="Setup progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === current ? 'step' : undefined}>
          <span
            className={`flex h-7 w-7 items-center justify-center border-2 border-ink font-bold ${
              i < current ? 'bg-ink text-paper' : i === current ? 'bg-accent' : 'bg-paper text-slate-500'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </span>
          <span className={i === current ? 'font-bold' : 'font-medium text-slate-600'}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-0.5 w-6 bg-ink" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

export function Onboarding() {
  const { state } = useStore();
  const idx = { welcome: 0, parsing: 0, review: 1, detail: 2 }[state.step];
  return (
    <div className="min-h-full px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <span className="inline-block -rotate-2 rounded-xl border-2 border-ink bg-accent px-4 py-1.5 font-display text-2xl">ResumeLens</span>
        </div>
        <Stepper current={idx} />
        {state.step === 'welcome' && <Welcome />}
        {state.step === 'parsing' && <Parsing />}
        {state.step === 'review' && <ReviewFacts />}
        {state.step === 'detail' && <AddDetail />}
      </div>
    </div>
  );
}

function Welcome() {
  const { dispatch } = useStore();
  const [paste, setPaste] = useState(false);
  const [text, setText] = useState('');
  const start = () => dispatch({ type: 'goStep', step: 'parsing' });
  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Start with the resume you already have</h1>
      <p className="mt-2 text-slate-600">
        We’ll turn it into a <strong>fact bank</strong>: your courses, roles, projects and skills. Every suggestion we make later has to point back to one of
        these facts. It becomes your <strong>Master</strong> resume, which never changes when you tailor.
      </p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-ink bg-cream px-6 py-10 text-center hover:bg-accent-soft">
        <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-accent-soft font-display text-2xl" aria-hidden>↑</span>
        <span className="mt-3 font-bold">Drop your resume here, or click to choose a file</span>
        <span className="mt-1 text-xs text-slate-500">PDF or DOCX · in this prototype, any file loads the sample resume</span>
        <input type="file" accept=".pdf,.docx,.txt" className="sr-only" onChange={start} />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={start}>Use sample resume (Jordan Lee)</Button>
        <Button variant="ghost" onClick={() => setPaste((p) => !p)} aria-expanded={paste}>
          {paste ? 'Hide' : 'Or paste text instead'}
        </Button>
      </div>
      {paste && (
        <div className="mt-3">
          <textarea
            aria-label="Resume text"
            className="h-48 w-full rounded-lg border border-ink p-3 font-mono text-xs"
            placeholder="Paste your resume text…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => setText(RESUME_TEXT)}>Fill with sample</Button>
            <Button size="sm" variant="primary" disabled={!text.trim()} onClick={start}>Parse this text</Button>
          </div>
        </div>
      )}

      <p className="mt-6 flex gap-2 rounded-xl border-2 border-ink bg-blue-soft p-3 text-xs font-medium">
        <span className="shrink-0 bg-ink px-1.5 font-bold uppercase text-blue">Privacy</span>
        Your resume and facts are stored in your account only, and you can delete them anytime. We send only the text needed for each analysis to our AI provider.
      </p>

      <div className="mt-6 border-t border-ink pt-4 text-right">
        <button className="text-xs font-bold underline decoration-2 underline-offset-2 hover:text-accent-strong" onClick={() => dispatch({ type: 'returningUser' })}>
          Demo: skip setup and open as a returning user →
        </button>
      </div>
    </Card>
  );
}

function Parsing() {
  const { dispatch } = useStore();
  return (
    <Card className="mx-auto max-w-lg p-8">
      <h1 className="mb-5 text-xl">Building your fact bank</h1>
      <LiveLog steps={PARSE_LOG} onDone={() => dispatch({ type: 'parsed' })} />
    </Card>
  );
}

const GROUPS: { cat: FactCategory; label: string }[] = [
  { cat: 'education', label: 'Education' },
  { cat: 'experience', label: 'Experience' },
  { cat: 'project', label: 'Projects' },
  { cat: 'activity', label: 'Activities' },
  { cat: 'skill', label: 'Skills' },
];

function ReviewFacts() {
  const { state, dispatch } = useStore();
  const [confirmed, setConfirmed] = useState<Set<FactCategory>>(new Set());
  const [editing, setEditing] = useState<FactCategory | null>(null);

  const toggle = (c: FactCategory) => {
    setConfirmed((s) => new Set(s).add(c));
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Check what we found</h1>
        <p className="mt-1 text-slate-600">
          Suggestions are checked against these facts, so a mistake here would carry into every suggestion. Takes about 30 seconds.
        </p>
      </div>
      <div className="space-y-3">
        {GROUPS.map(({ cat, label }) => {
          const facts = state.facts.filter((f) => f.category === cat);
          const ok = confirmed.has(cat);
          return (
            <Card key={cat} className={`p-4 ${ok ? 'bg-found-soft' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">
                  {label} <span className="text-sm font-normal text-slate-500">· {cat === 'skill' ? skillChips(facts).length : facts.filter((f) => !f.parentId).length}</span>
                </h2>
                <div className="flex gap-2">
                  {ok ? (
                    <span className="inline-flex items-center gap-1 border-2 border-ink bg-found px-2 py-0.5 text-sm font-bold">✓ Confirmed</span>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => toggle(cat)}>Looks right</Button>
                  )}
                  <Button size="sm" onClick={() => setEditing(editing === cat ? null : cat)} aria-expanded={editing === cat}>
                    {editing === cat ? 'Done' : 'Fix'}
                  </Button>
                </div>
              </div>
              {editing === cat ? (
                <div className="mt-3 space-y-3">
                  {facts.map((f) => (
                    <FactEditor key={f.id} fact={f} onChange={(fact) => dispatch({ type: 'updateFact', fact })} />
                  ))}
                </div>
              ) : (
                <FactSummary cat={cat} facts={facts} />
              )}
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {confirmed.size} of {GROUPS.length} groups confirmed · Saved as your <strong>Master</strong> resume. Your master never changes when you tailor.
        </p>
        <Button variant="primary" onClick={() => dispatch({ type: 'goStep', step: 'detail' })}>Continue</Button>
      </div>
    </div>
  );
}

const skillChips = (facts: Fact[]) => facts.flatMap((f) => f.title.replace(/^[^:]+:\s*/, '').split(',').map((s) => s.trim()));

function FactSummary({ cat, facts }: { cat: FactCategory; facts: Fact[] }) {
  if (cat === 'skill')
    return (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skillChips(facts).map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
    );
  const top = facts.filter((f) => !f.parentId);
  return (
    <ul className="mt-3 space-y-2">
      {top.map((f) => {
        const kids = facts.filter((k) => k.parentId === f.id);
        return (
          <li key={f.id} className="text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-medium">{f.title}</span>
              {f.meta && <span className="text-xs text-slate-500">{f.meta}</span>}
              {f.details.length > 0 && <span className="text-xs text-slate-400">· {f.details.length} details</span>}
            </div>
            {kids.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {kids.map((k) => (
                  <Chip key={k.id}>{k.title.replace('Course: ', '')}</Chip>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FactEditor({ fact, onChange }: { fact: Fact; onChange: (f: Fact) => void }) {
  return (
    <div className="rounded-lg border border-ink p-3">
      <label className="block text-xs font-medium text-slate-500">
        Title
        <input
          className="mt-1 w-full rounded-md border border-ink px-2 py-1.5 text-sm text-slate-900"
          value={fact.title}
          onChange={(e) => onChange({ ...fact, title: e.target.value })}
        />
      </label>
      {fact.category !== 'skill' && fact.category !== 'activity' && !fact.parentId && (
        <label className="mt-2 block text-xs font-medium text-slate-500">
          Details (one per line)
          <textarea
            className="mt-1 h-24 w-full rounded-md border border-ink px-2 py-1.5 text-sm text-slate-900"
            value={fact.details.join('\n')}
            onChange={(e) => onChange({ ...fact, details: e.target.value.split('\n') })}
          />
        </label>
      )}
    </div>
  );
}

function AddDetail() {
  const { dispatch } = useStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, 'saved' | 'skipped'>>({});

  const save = (qid: string) => {
    const q = DETAIL_QUESTIONS.find((x) => x.id === qid)!;
    const a = (answers[qid] ?? '').trim();
    if (!a) return;
    const facts = a === q.demoAnswer ? q.creates : q.creates.map((f, i) => (i === 0 ? { ...f, details: [a] } : f));
    dispatch({ type: 'addFacts', facts });
    setStatus((s) => ({ ...s, [qid]: 'saved' }));
  };
  const savedCount = Object.values(status).filter((s) => s === 'saved').length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">A few details your resume doesn’t show</h1>
        <p className="mt-1 text-slate-600">
          Optional. Answers become facts in your bank, so we can suggest them later, even when they’re not on your resume. Skip anything; you can add more
          anytime, including while tailoring.
        </p>
      </div>
      <div className="space-y-3">
        {DETAIL_QUESTIONS.map((q) => {
          const st = status[q.id];
          return (
            <Card key={q.id} className={`p-4 ${st === 'saved' ? 'bg-found-soft' : st === 'skipped' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <label htmlFor={`a-${q.id}`} className="font-medium">{q.question}</label>
                {st && (
                  <span className={`shrink-0 text-xs font-medium ${st === 'saved' ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {st === 'saved' ? `✓ Saved as ${q.creates.map((f) => f.id).join(', ')}` : 'Skipped'}
                  </span>
                )}
              </div>
              {st !== 'saved' && (
                <>
                  <textarea
                    id={`a-${q.id}`}
                    className="mt-2 h-16 w-full rounded-lg border border-ink p-2 text-sm"
                    value={answers[q.id] ?? ''}
                    placeholder="Type a short answer…"
                    onChange={(e) => {
                      setAnswers((s) => ({ ...s, [q.id]: e.target.value }));
                      if (st === 'skipped')
                        setStatus((s) => {
                          const next = { ...s };
                          delete next[q.id];
                          return next;
                        });
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" disabled={!(answers[q.id] ?? '').trim()} onClick={() => save(q.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setStatus((s) => ({ ...s, [q.id]: 'skipped' }))}>Skip</Button>
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setAnswers((s) => ({ ...s, [q.id]: q.demoAnswer }))}>
                      Demo: fill Jordan’s answer
                    </Button>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{savedCount} new {savedCount === 1 ? 'fact group' : 'fact groups'} added to your bank</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => dispatch({ type: 'finishOnboarding' })}>I’ll add more later</Button>
          <Button variant="primary" onClick={() => dispatch({ type: 'finishOnboarding' })}>Continue to tailoring</Button>
        </div>
      </div>
    </div>
  );
}
