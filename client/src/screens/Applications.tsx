import { useState } from 'react';
import { useStore } from '../state/store';
import type { AppStatus } from '../types';
import { Button, Card } from '../components/ui';

const STATUSES: { id: AppStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'applied', label: 'Applied' },
  { id: 'no-reply', label: 'No reply' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

const weeksSince = (iso: string) => Math.floor((Date.now() - new Date(iso + 'T00:00:00').getTime()) / (7 * 864e5));
const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export function Applications() {
  const { state, dispatch } = useStore();
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const apps = state.applications;
  const stale = apps.filter((a) => (a.status === 'applied' || a.status === 'no-reply') && weeksSince(a.date) >= 4 && !answered.has(a.id));

  const byVersion = new Map<string, { sent: number; interviews: number }>();
  for (const a of apps) {
    if (a.status === 'draft') continue;
    const v = byVersion.get(a.versionName) ?? { sent: 0, interviews: 0 };
    v.sent++;
    if (a.status === 'interview' || a.status === 'offer') v.interviews++;
    byVersion.set(a.versionName, v);
  }
  const sentTotal = [...byVersion.values()].reduce((n, v) => n + v.sent, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-1 text-sm text-slate-600">Which resume you sent where, and what happened.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (state.session) dispatch({ type: 'endSession' });
            dispatch({ type: 'go', view: 'tailor' });
          }}
        >
          New tailoring
        </Button>
      </div>

      {stale.map((a) => (
        <div key={a.id} className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-ink bg-accent-soft px-4 py-2.5 text-sm">
          <span>
            It’s been {weeksSince(a.date)} weeks since you applied to <strong>{a.company}</strong>. Any update?
          </span>
          <span className="flex gap-1.5">
            {(['interview', 'rejected', 'no-reply'] as AppStatus[]).map((s) => (
              <Button
                key={s}
                size="sm"
                onClick={() => {
                  dispatch({ type: 'setStatus', id: a.id, status: s });
                  setAnswered((x) => new Set(x).add(a.id));
                }}
              >
                {s === 'no-reply' ? 'Still no reply' : STATUSES.find((x) => x.id === s)!.label}
              </Button>
            ))}
          </span>
        </div>
      ))}

      {byVersion.size > 0 && (
        <Card className="mt-5 p-4">
          <h2 className="text-sm font-semibold">By resume version</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...byVersion.entries()].map(([name, v]) => (
              <div key={name} className="border-2 border-ink bg-cream p-3">
                <div className="text-sm font-medium">{name}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {v.sent} sent · <span className={v.interviews ? 'font-semibold text-emerald-700' : ''}>{v.interviews} interview{v.interviews === 1 ? '' : 's'}</span>
                </div>
                <div className="mt-2 flex h-3.5 overflow-hidden border-2 border-ink bg-paper" aria-hidden>
                  <div className="bg-found-strong" style={{ width: `${(v.interviews / v.sent) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Based on {sentTotal} application{sentTotal === 1 ? '' : 's'}. This is a record of what happened, not a prediction. Outcomes depend on much more than the resume.
          </p>
        </Card>
      )}

      <Card className="mt-5 overflow-x-auto">
        {apps.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No applications yet. When you finish a tailoring, choose “Save & mark as applied” and it shows up here.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b-2 border-ink bg-accent-soft text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Company</th>
                <th className="px-4 py-2.5 font-semibold">Role</th>
                <th className="px-4 py-2.5 font-semibold">Applied</th>
                <th className="px-4 py-2.5 font-semibold">Version sent</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...apps].reverse().map((a) => (
                <tr key={a.id} className="border-b border-ink last:border-0">
                  <td className="px-4 py-2.5 font-medium">{a.company}</td>
                  <td className="px-4 py-2.5 text-slate-600">{a.role}</td>
                  <td className="px-4 py-2.5 text-slate-600">{fmt(a.date)}</td>
                  <td className="px-4 py-2.5">{a.versionName}</td>
                  <td className="px-4 py-2.5">
                    <select
                      aria-label={`Status for ${a.company}`}
                      className="rounded-md border border-ink bg-paper px-2 py-1 text-sm"
                      value={a.status}
                      onChange={(e) => dispatch({ type: 'setStatus', id: a.id, status: e.target.value as AppStatus })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
