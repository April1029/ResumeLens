import { useState } from 'react';
import { useStore } from '../../state/store';
import type { Decision, ResumeDoc, Suggestion } from '../../types';
import { Button, Card, Chip } from '../../components/ui';
import { ResumePaper } from '../../components/ResumePaper';
import { docToText, finalText, hasPlaceholder, isAccepted } from '../../lib/resume';

interface Props {
  suggestions: Suggestion[];
  decisions: Record<string, Decision>;
  tailored: ResumeDoc;
  company: string;
  role: string;
  link: string;
  baseName: string;
}

export function Summary({ suggestions, decisions, tailored, company, role, link, baseName }: Props) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(`${company} copy`);
  const accepted = suggestions.filter((s) => isAccepted(decisions[s.id]));
  const skipped = suggestions.filter((s) => decisions[s.id]?.status === 'skipped');
  const pending = suggestions.filter((s) => !decisions[s.id] || decisions[s.id].status === 'pending');
  const edited = accepted.filter((s) => decisions[s.id].status === 'edited').length;
  const hiddenCount = state.session?.hidden.length ?? 0;

  // Every accepted line that claims more than the resume used to say. You'll answer for these in an interview.
  const explain = accepted.flatMap((s) => {
    const d = decisions[s.id];
    const line = finalText(s, d);
    const facts = s.sources.join(', ');
    if (s.flag && !d.usedSafer)
      return [{ id: s.id, line, why: `You kept this even though ${s.flag.message.charAt(0).toLowerCase()}${s.flag.message.slice(1)}`, kept: true }];
    if (d.savedFact) return [{ id: s.id, line, why: `You added this detail and saved it to your fact bank as ${d.savedFact}.`, kept: false }];
    if (hasPlaceholder(s.suggested) && d.status === 'edited')
      return [{ id: s.id, line, why: 'You filled in this detail yourself. Know where the number comes from.', kept: false }];
    if (d.status === 'edited') return [{ id: s.id, line, why: 'You wrote this version. Be ready to walk through it.', kept: false }];
    if (s.kind !== 'detail') return [];
    if (d.usedSafer) return [{ id: s.id, line, why: `Safer wording, based on ${facts}.`, kept: false }];
    if (d.confirmed && s.claimCheck) return [{ id: s.id, line, why: `You confirmed: ${s.claimCheck}`, kept: false }];
    return [{ id: s.id, line, why: `Based on ${facts}.`, kept: false }];
  });

  const text = docToText(tailored);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: 'toast', text: 'Resume text copied' });
    } catch {
      dispatch({ type: 'toast', text: 'Couldn’t copy. Your browser blocked the clipboard.' });
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const save = (applied: boolean) => {
    const id = `v-${Date.now()}`;
    const versionName = name.trim() || `${company} copy`;
    dispatch({
      type: 'saveVersion',
      version: { id, name: versionName, kind: 'job', doc: tailored, note: `${role} · from ${baseName}` },
      application: applied
        ? { id: `app-${Date.now()}`, company, role, link, date: new Date().toISOString().slice(0, 10), versionName, status: 'applied' }
        : undefined,
    });
    dispatch({ type: 'toast', text: applied ? `Saved “${versionName}” and logged your application` : `Saved “${versionName}” to your resumes` });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_minmax(0,680px)]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review summary</h1>
          <p className="mt-1 text-slate-600">
            {company} · {role}. Your {baseName} resume is unchanged.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Accepted', accepted.length - edited, 'bg-found'],
            ['Edited', edited, 'bg-blue'],
            ['Skipped', skipped.length, 'bg-paper'],
          ].map(([label, n, cls]) => (
            <Card key={label as string} className={`p-3 ${cls}`}>
              <div className="font-display text-3xl">{n}</div>
              <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
            </Card>
          ))}
        </div>

        {pending.length > 0 && (
          <div className="rounded-xl border-2 border-ink bg-accent-soft p-3 text-sm font-medium">
            {pending.length} suggestion{pending.length > 1 ? 's are' : ' is'} still undecided and won’t be applied.{' '}
            <button className="font-medium underline" onClick={() => dispatch({ type: 'setPhase', phase: 'review' })}>Back to review</button>
          </div>
        )}

        <Card className="border-accent-strong p-4">
          <h2 className="font-display text-base">Be ready to explain</h2>
          <p className="mb-2.5 mt-0.5 text-xs text-slate-600">Interviewers may ask about these lines. You’re the one answering for them.</p>
          {explain.length === 0 ? (
            <p className="text-sm text-slate-600">Nothing new to prepare: every change you accepted is wording only.</p>
          ) : (
            <ul className="space-y-2.5">
              {explain.map((x) => (
                <li key={x.id} className={`text-sm ${x.kept ? 'rounded-lg border-4 border-flag bg-flag-soft p-2' : 'border-l-4 border-accent pl-2.5'}`}>
                  <p className="font-serif">“{x.line}”</p>
                  <p className="text-xs text-slate-600">
                    {x.kept ? '⚑ ' : ''}
                    {x.why}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">What changed</h2>
          {accepted.length === 0 ? (
            <p className="text-sm text-slate-500">No changes accepted.</p>
          ) : (
            <ul className="space-y-3">
              {accepted.map((s) => (
                <li key={s.id} className="text-sm">
                  <div className="mb-0.5 flex items-center gap-2">
                    <Chip>{s.id}</Chip>
                    <span className="text-xs text-slate-500">from {s.sources.join(', ')}</span>
                    {decisions[s.id].usedSafer && <span className="text-xs font-bold">· safer wording</span>}
                  </div>
                  <p className="text-slate-500 line-through decoration-slate-300">{s.current}</p>
                  <p className="font-medium text-slate-900">{finalText(s, decisions[s.id])}</p>
                </li>
              ))}
            </ul>
          )}
          {skipped.length > 0 && <p className="mt-3 text-xs text-slate-500">Skipped: {skipped.map((s) => s.id).join(', ')}</p>}
          {hiddenCount > 0 && <p className="mt-1 text-xs text-slate-500">{hiddenCount} line{hiddenCount === 1 ? '' : 's'} hidden from this copy to make room. Your master keeps them.</p>}
        </Card>


        {state.learning.length > 0 && (
          <Card className="p-4">
            <h2 className="mb-1 text-sm font-semibold">On your learning list</h2>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {state.learning.map((l) => (
                <li key={l.id}>{l.plan}</li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="space-y-3 p-4">
          <label className="block text-sm font-medium">
            Name this copy
            <input className="mt-1 w-full rounded-lg border border-ink px-3 py-2 text-sm font-normal" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => save(true)}>Save & mark as applied</Button>
            <Button onClick={() => save(false)}>Save copy only</Button>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink pt-3">
            <Button size="sm" variant="ghost" onClick={copy}>Copy text</Button>
            <Button size="sm" variant="ghost" onClick={download}>Download .txt</Button>
            <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'setPhase', phase: 'review' })}>← Back to review</Button>
          </div>
        </Card>
      </div>
      <div>
        <ResumePaper doc={tailored} showPageBreak />
      </div>
    </div>
  );
}
