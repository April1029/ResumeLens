import type { Decision, EvidenceState, Fact, Requirement, ResumeDoc, Suggestion } from '../types';

export const isAccepted = (d?: Decision) => d?.status === 'accepted' || d?.status === 'edited';

/** Final text that goes into the resume for a decided suggestion. */
export function finalText(s: Suggestion, d?: Decision): string {
  return d?.text ?? s.suggested;
}

/** Build the tailored copy: base doc + accepted suggestions, applied in order, minus hidden lines. The base doc is never mutated. */
export function applyDecisions(base: ResumeDoc, suggestions: Suggestion[], decisions: Record<string, Decision>, hidden: string[] = []): ResumeDoc {
  const doc: ResumeDoc = structuredClone(base);
  if (hidden.length) {
    const h = new Set(hidden);
    for (const section of doc.sections) {
      for (const e of section.entries) e.bullets = e.bullets.filter((b) => !h.has(b.id));
      section.entries = section.entries.filter((e) => e.title || e.bullets.length);
    }
  }
  for (const s of suggestions) {
    const d = decisions[s.id];
    if (!isAccepted(d)) continue;
    const text = finalText(s, d);
    for (const section of doc.sections) {
      if (s.op.kind === 'replace') {
        const op = s.op;
        for (const entry of section.entries) {
          const b = entry.bullets.find((x) => x.id === op.bulletId);
          if (b) {
            b.original = b.original ?? b.text;
            b.text = text;
            b.changedBy = s.id;
          }
        }
      } else if (s.op.kind === 'add') {
        const op = s.op;
        const entry = section.entries.find((e) => e.id === op.entryId);
        if (entry) entry.bullets.push({ id: `${s.id}-add`, text, factId: s.sources[0], changedBy: s.id });
      } else {
        const op = s.op;
        const idx = section.entries.findIndex((e) => e.id === op.removeEntryId);
        if (idx >= 0) {
          section.entries.splice(idx, 1, {
            id: `${s.id}-entry`,
            factId: op.factId,
            title: op.entryTitle,
            meta: op.entryMeta,
            changedBy: s.id,
            bullets: [{ id: `${s.id}-b`, text, factId: op.factId, changedBy: s.id }],
          });
        }
      }
    }
  }
  return doc;
}

export function hasFacts(facts: Fact[], ids: string[]) {
  const set = new Set(facts.map((f) => f.id));
  return ids.every((id) => set.has(id));
}

export function reqState(r: Requirement, facts: Fact[], decisions: Record<string, Decision>): EvidenceState {
  if (r.resolvedBy.some((id) => isAccepted(decisions[id]))) return 'on';
  if (r.unlockedBy && hasFacts(facts, [r.unlockedBy])) return 'bank';
  if (r.needs && !hasFacts(facts, r.needs)) return r.fallback ?? r.base;
  return r.base;
}

/** Suggestions are only offered when every fact they cite exists. No fact, no suggestion. */
export function availableSuggestions(all: Suggestion[], facts: Fact[]) {
  return all.filter((s) => hasFacts(facts, s.sources));
}

const STRONG_WORDS = ['led', 'lead', 'leading', 'spearheaded', 'managed', 'architected', 'headed', 'directed', 'founded', 'expert', 'senior'];
const SCALE_WORDS = ['hundreds', 'thousands', 'millions', 'dozens'];

/**
 * Lightweight claim check used when the user edits a suggestion.
 * Flags strong verbs and numbers that don't appear anywhere in the cited facts.
 * (The real version would ask the model to compare against facts; this keeps the prototype honest.)
 */
export function checkClaims(text: string, sources: Fact[]): string[] {
  const factText = sources.flatMap((f) => [f.title, ...f.details]).join(' ').toLowerCase();
  const words = text.toLowerCase().match(/[a-z’']+/g) ?? [];
  const warnings: string[] = [];
  for (const w of new Set(words)) {
    if (STRONG_WORDS.includes(w) && !factText.includes(w)) warnings.push(`“${w}” is stronger than your facts.`);
    if (SCALE_WORDS.includes(w) && !factText.includes(w)) warnings.push(`“${w}” isn’t supported by a number in your facts.`);
  }
  for (const n of new Set(text.match(/\d[\d,.]*%?/g) ?? [])) {
    if (!factText.includes(n.replace(/[.,]$/, ''))) warnings.push(`The number “${n}” doesn’t appear in your facts.`);
  }
  return warnings;
}

export function docToText(doc: ResumeDoc): string {
  const lines = [doc.name, doc.contact, ''];
  for (const s of doc.sections) {
    lines.push(s.title.toUpperCase());
    for (const e of s.entries) {
      if (e.title) lines.push(e.meta ? `${e.title} | ${e.meta}` : e.title);
      for (const b of e.bullets) lines.push(`- ${b.text}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** Fact ids referenced by a resume (for “On Master” badges). */
export function factIdsInDoc(doc: ResumeDoc): Set<string> {
  const ids = new Set<string>();
  for (const s of doc.sections)
    for (const e of s.entries) {
      if (e.factId) ids.add(e.factId);
      for (const b of e.bullets) if (b.factId) ids.add(b.factId);
    }
  return ids;
}

/** Bracketed placeholders like "[number]" must be filled in or removed before a line can be accepted. */
export const PLACEHOLDER_RE = /\[[^\]]+\]/g;
export const hasPlaceholder = (t: string) => /\[[^\]]+\]/.test(t);

export type DiffPart = { op: '=' | '+' | '-'; text: string };

/** Word-level diff (LCS) so a card shows exactly which words changed. */
export function diffWords(a: string, b: string): DiffPart[] {
  const A = a.split(/\s+/).filter(Boolean);
  const B = b.split(/\s+/).filter(Boolean);
  const norm = (w: string) => w.toLowerCase().replace(/[.,;:()]/g, '');
  const dp = Array.from({ length: A.length + 1 }, () => new Array<number>(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--)
    for (let j = B.length - 1; j >= 0; j--) dp[i][j] = norm(A[i]) === norm(B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffPart[] = [];
  const push = (op: DiffPart['op'], w: string) => {
    const last = out[out.length - 1];
    if (last && last.op === op) last.text += ' ' + w;
    else out.push({ op, text: w });
  };
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (norm(A[i]) === norm(B[j])) {
      push('=', B[j]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push('-', A[i++]);
    else push('+', B[j++]);
  }
  while (i < A.length) push('-', A[i++]);
  while (j < B.length) push('+', B[j++]);
  return out;
}
