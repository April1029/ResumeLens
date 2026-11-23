// Live-log scripts for parsing and analysis. Built from the demo data so what streams in matches what you see next.
import type { LogStep } from '../components/LiveLog';
import { EVIDENCE, EvidenceSwatch } from '../components/ui';
import { availableSuggestions, reqState } from '../lib/resume';
import type { Fact } from '../types';
import { POSTING, REQUIREMENTS, SUGGESTIONS } from './demo';

export const PARSE_LOG: LogStep[] = [
  { label: 'Reading your resume', done: 'Read 1 page · 5 sections', ms: 1100 },
  { label: 'Finding education', done: 'Found 1 degree and 4 courses', ms: 900, items: ['B.S. Computer Science, State University', 'Courses: Data Structures, Operating Systems, Databases, Software Engineering'] },
  { label: 'Finding experience', done: 'Found 2 roles', ms: 1000, items: ['Teaching Assistant, CS 101 · 4 bullets', 'IT Help Desk Assistant · 3 bullets'] },
  { label: 'Finding projects', done: 'Found 4 projects', ms: 1300, items: ['ClubHub (Flask, PostgreSQL, Docker)', 'Pathfinder Visualizer (JavaScript)', 'Campus Bus Tracker (Python)', 'Personal Finance Tracker (Java)'] },
  { label: 'Finding activities and skills', done: 'Found 4 activities and 9 skills', ms: 900, items: ['4 activities', 'Java · JavaScript · Python · SQL', 'Git · GitHub Actions · Docker · PostgreSQL · Linux'] },
  { label: 'Building your fact bank', done: 'Fact bank ready for you to check', ms: 800 },
];

export function analyzeLog(facts: Fact[]): LogStep[] {
  const required = REQUIREMENTS.filter((r) => r.type === 'required');
  const nice = REQUIREMENTS.filter((r) => r.type === 'nice');
  const sugs = availableSuggestions(SUGGESTIONS, facts);
  const flagged = sugs.filter((s) => s.flag).length;
  return [
    { label: 'Reading the posting', done: `Read ${POSTING.company} · ${POSTING.role.split(',')[0]}`, ms: 1000 },
    {
      label: 'Pulling out requirements',
      done: `Found ${required.length} required and ${nice.length} nice-to-have`,
      ms: 1600,
      items: REQUIREMENTS.map((r) => (
        <>
          {r.short} <span className="text-slate-400">· {r.type === 'required' ? 'required' : 'nice-to-have'}</span>
        </>
      )),
    },
    {
      label: 'Matching each one to your resume and fact bank',
      done: `Matched all ${REQUIREMENTS.length} requirements`,
      ms: 2000,
      items: REQUIREMENTS.map((r) => {
        const st = reqState(r, facts, {});
        return (
          <span className="inline-flex items-center gap-1.5">
            <EvidenceSwatch state={st} size="sm" /> {r.short} <span className="text-slate-400">· {EVIDENCE[st].label}</span>
          </span>
        );
      }),
    },
    {
      label: 'Drafting suggestions from your facts only',
      done: `${sugs.length} suggestions ready${flagged ? ` · ${flagged} flagged for a closer look` : ''}`,
      ms: 1500,
      items: [`Drafted ${sugs.length} edits, each tied to a fact`, `Checked every edit against your facts`, ...(flagged ? [`${flagged} go further than your facts; marked for you to decide`] : [])],
    },
  ];
}
