import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { POSTING } from '../data/demo';
import { analyzeLog } from '../data/logs';
import { LiveLog } from '../components/LiveLog';
import { Button, Card } from '../components/ui';

export function NewTailoring() {
  const { state, dispatch } = useStore();
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const defaultVersion = state.versions.find((v) => v.isDefault) ?? state.versions[0];
  const [base, setBase] = useState(defaultVersion?.id ?? '');
  const [analyzing, setAnalyzing] = useState(false);
  const log = useMemo(() => analyzeLog(state.facts), [state.facts]);

  const fillSample = () => {
    setLink(POSTING.link);
    setText(POSTING.text);
    setCompany(POSTING.company);
    setRole(POSTING.role);
  };

  if (analyzing)
    return (
      <div className="px-4 py-16">
        <Card className="mx-auto max-w-lg p-8">
          <h1 className="text-xl">Comparing your resume with the posting</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">Suggestions only use facts from your bank.</p>
          <LiveLog
            steps={log}
            onDone={() =>
              dispatch({
                type: 'startSession',
                session: { company: company || POSTING.company, role: role || POSTING.role, link, postingText: text, baseVersionId: base },
              })
            }
          />
        </Card>
      </div>
    );

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">New tailoring</h1>
        <p className="mt-1 text-slate-600">
          We’ll make a separate copy for this job. Your {defaultVersion?.name ?? 'Master'} resume stays unchanged, and nothing carries over to other jobs.
        </p>
        <Card className="mt-6 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Job posting</span>
            <Button size="sm" variant="ghost" className="bg-blue-soft" onClick={fillSample}>Demo: use Lumen Labs posting</Button>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Job link <span className="font-normal text-slate-400">(optional)</span>
            <input
              className="mt-1 w-full rounded-lg border border-ink px-3 py-2 text-sm font-normal"
              placeholder="https://…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">Saved to your Applications log. Many job sites block automatic reading, so paste the text below too.</span>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Posting text
            <textarea
              className="mt-1 h-56 w-full rounded-lg border border-ink p-3 text-sm font-normal"
              placeholder="Paste the full job description…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
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
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">Prototype: analysis always uses the sample posting’s results.</span>
            <Button variant="primary" disabled={!text.trim()} onClick={() => setAnalyzing(true)}>Analyze posting</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
