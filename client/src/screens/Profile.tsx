import { useState } from 'react';
import { useStore } from '../state/store';
import type { Fact, FactCategory, Version } from '../types';
import { Button, Card, Chip, Modal, SectionLabel } from '../components/ui';
import { ResumePaper } from '../components/ResumePaper';
import { factIdsInDoc } from '../lib/resume';

const CATS: { id: FactCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'project', label: 'Projects' },
  { id: 'activity', label: 'Activities' },
  { id: 'skill', label: 'Skills' },
];

export function Profile() {
  const { state, dispatch } = useStore();
  const [cat, setCat] = useState<FactCategory | 'all'>('all');
  const [viewing, setViewing] = useState<Version | null>(null);
  const [adding, setAdding] = useState<{ parent?: Fact } | null>(null);
  const master = state.versions.find((v) => v.isDefault);
  const onMaster = master ? factIdsInDoc(master.doc) : new Set<string>();

  const top = state.facts.filter((f) => !f.parentId && (cat === 'all' || f.category === cat));
  const userAdded = state.facts.filter((f) => f.origin === 'user').length;

  const startTailoring = () => {
    if (state.session) dispatch({ type: 'endSession' });
    dispatch({ type: 'go', view: 'tailor' });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your fact bank</h1>
            <p className="mt-1 text-sm text-slate-600">
              Everything ResumeLens is allowed to use. {state.facts.length} facts · {userAdded} added by you that aren’t on your resume.
            </p>
          </div>
          <Button onClick={() => setAdding({})}>＋ Add fact</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Fact categories">
          {CATS.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={`border-2 border-ink px-3 py-1 text-sm font-bold rounded-full ${cat === c.id ? 'bg-ink text-paper' : 'bg-paper hover:bg-accent-soft'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {top.map((f) => {
            const kids = state.facts.filter((k) => k.parentId === f.id);
            return (
              <Card key={f.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip className={f.origin === 'user' ? 'bg-bank' : ''}>{f.id}</Chip>
                      <span className="font-medium">{f.title}</span>
                    </div>
                    {f.meta && <p className="mt-0.5 text-xs text-slate-500">{f.meta}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {onMaster.has(f.id) ? (
                      <span className="rounded-full border-2 border-ink bg-found px-2 text-xs font-bold">● On Master</span>
                    ) : (
                      <span className="rounded-full border-2 border-ink bg-bank px-2 text-xs font-bold">◆ Bank only</span>
                    )}
                    {f.category !== 'skill' && f.category !== 'activity' && (
                      <Button size="sm" variant="ghost" onClick={() => setAdding({ parent: f })}>＋ Detail</Button>
                    )}
                  </div>
                </div>
                {f.details.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
                    {f.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
                {kids.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-4 border-ink pl-3">
                    {kids.map((k) => (
                      <div key={k.id} className="text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip className={k.origin === 'user' ? 'bg-bank' : ''}>{k.id}</Chip>
                          <span className="font-medium">{k.title.replace('Course: ', '')}</span>
                          {k.origin === 'user' && <span className="rounded bg-bank px-1.5 text-[11px] font-bold">◆ Added by you · not on resume</span>}
                        </div>
                        {k.details.length > 0 && (
                          <ul className="ml-1 mt-0.5 list-disc pl-5 text-xs text-slate-600">
                            {k.details.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Button variant="primary" className="w-full" onClick={startTailoring}>Start a new tailoring</Button>

        <Card className="p-4">
          <SectionLabel>Resumes</SectionLabel>
          <ul className="mt-2 space-y-2">
            {state.versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 border-2 border-ink bg-cream p-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {v.name}
                    {v.isDefault && <Chip className="bg-accent">Default</Chip>}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {v.kind === 'master' ? 'Master · never changed by tailoring' : v.kind === 'role' ? `Role version · ${v.note}` : `Job copy · ${v.note}`}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setViewing(v)}>View</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionLabel>Learning list</SectionLabel>
          {state.learning.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Things you plan to learn show up here. They never go on your resume.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {state.learning.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-2 text-sm">
                  <span>
                    <span className="font-medium">{l.reqShort}:</span> {l.plan}
                  </span>
                  <Button size="sm" variant="ghost" aria-label={`Remove ${l.reqShort}`} onClick={() => dispatch({ type: 'removeLearning', id: l.id })}>✕</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <SectionLabel>Recent applications</SectionLabel>
          {state.applications.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">None yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {state.applications.slice(-3).reverse().map((a) => (
                <li key={a.id} className="flex justify-between gap-2">
                  <span className="truncate">{a.company}</span>
                  <span className="text-xs capitalize text-slate-500">{a.status.replace('-', ' ')}</span>
                </li>
              ))}
            </ul>
          )}
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => dispatch({ type: 'go', view: 'applications' })}>Open Applications →</Button>
        </Card>
      </div>

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} wide>
          <ResumePaper doc={viewing.doc} showChanges={viewing.kind === 'job'} />
        </Modal>
      )}
      {adding && <AddFactModal parent={adding.parent} onClose={() => setAdding(null)} />}
    </div>
  );
}

function AddFactModal({ parent, onClose }: { parent?: Fact; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [category, setCategory] = useState<FactCategory>(parent?.category ?? 'project');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const save = () => {
    const prefix = parent ? `${parent.id}.` : { education: 'C', experience: 'E', project: 'P', activity: 'A', skill: 'K' }[category];
    let n = 1;
    const ids = new Set(state.facts.map((f) => f.id));
    const make = (i: number) => (parent ? `${prefix}${String.fromCharCode(96 + i)}` : `${prefix}${i}`);
    while (ids.has(make(n))) n++;
    const fact: Fact = {
      id: make(n),
      category,
      title: title.trim(),
      details: details.split('\n').map((d) => d.trim()).filter(Boolean),
      parentId: parent?.id,
      origin: 'user',
    };
    dispatch({ type: 'addFacts', facts: [fact] });
    dispatch({ type: 'toast', text: `Saved ${fact.id} to your fact bank` });
    onClose();
  };

  return (
    <Modal title={parent ? `Add detail to ${parent.title}` : 'Add a fact'} onClose={onClose}>
      <div className="space-y-3">
        {!parent && (
          <label className="block text-sm font-medium">
            Category
            <select className="mt-1 w-full rounded-lg border border-ink bg-paper px-3 py-2 text-sm font-normal" value={category} onChange={(e) => setCategory(e.target.value as FactCategory)}>
              {CATS.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm font-medium">
          Title
          <input className="mt-1 w-full rounded-lg border border-ink px-3 py-2 text-sm font-normal" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Built the RSVP API" />
        </label>
        <label className="block text-sm font-medium">
          Details <span className="font-normal text-slate-400">(one per line, as specific as you can)</span>
          <textarea className="mt-1 h-24 w-full rounded-lg border border-ink p-2 text-sm font-normal" value={details} onChange={(e) => setDetails(e.target.value)} />
        </label>
        <p className="text-xs text-slate-500">Only add things you could explain in an interview. Suggestions will treat this as true.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!title.trim()} onClick={save}>Save fact</Button>
        </div>
      </div>
    </Modal>
  );
}
