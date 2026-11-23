export type FactCategory = 'education' | 'experience' | 'project' | 'activity' | 'skill';

export interface Fact {
  id: string;
  category: FactCategory;
  title: string;
  meta?: string;
  details: string[];
  /** Child facts hang off a parent fact (e.g. P1.a under P1). */
  parentId?: string;
  origin: 'resume' | 'user';
}

export interface Bullet {
  id: string;
  text: string;
  factId?: string;
  /** Set when a suggestion changed or added this bullet. */
  changedBy?: string;
  original?: string;
}

export interface Entry {
  id: string;
  factId?: string;
  title: string;
  meta?: string;
  bullets: Bullet[];
  changedBy?: string;
}

export interface Section {
  id: string;
  title: string;
  entries: Entry[];
}

export interface ResumeDoc {
  name: string;
  contact: string;
  sections: Section[];
}

export interface Version {
  id: string;
  name: string;
  kind: 'master' | 'role' | 'job';
  doc: ResumeDoc;
  isDefault?: boolean;
  note?: string;
}

/** on = clear evidence on resume · clearer = on resume but weak · bank = only in fact bank · none = nothing yet */
export type EvidenceState = 'on' | 'clearer' | 'bank' | 'none';

export interface Requirement {
  id: string;
  text: string;
  short: string;
  type: 'required' | 'nice';
  base: EvidenceState;
  evidence: string[];
  resolvedBy: string[];
  /** If any of these facts are missing, fall back to `fallback`. */
  needs?: string[];
  fallback?: EvidenceState;
  /** Fact that, once added, moves this requirement to 'bank'. */
  unlockedBy?: string;
  note: string;
}

export type SuggestionOp =
  | { kind: 'replace'; bulletId: string }
  | { kind: 'add'; entryId: string }
  | { kind: 'swap'; removeEntryId: string; entryTitle: string; entryMeta: string; factId: string };

export interface Flag {
  kind: 'stronger' | 'unsupported';
  message: string;
  saferText: string;
}

export interface Suggestion {
  id: string;
  reqIds: string[];
  sources: string[];
  current: string;
  suggested: string;
  why: string;
  flag?: Flag;
  fromBank?: boolean;
  /** wording = rewording/reordering only, nothing new claimed. detail = makes explicit something the resume doesn't say. */
  kind: 'wording' | 'detail';
  /** Yes/no question the user must confirm before accepting an "adds detail" suggestion. */
  claimCheck?: string;
  op: SuggestionOp;
}

export interface Trim {
  bulletId: string;
  reason: string;
}

export type DecisionStatus = 'pending' | 'accepted' | 'edited' | 'skipped';

export interface Decision {
  status: DecisionStatus;
  text?: string;
  usedSafer?: boolean;
  /** User ticked the "Is this true?" check. */
  confirmed?: boolean;
  /** Fact id created when the user saved their own new detail to the fact bank. */
  savedFact?: string;
}

export interface Gap {
  reqId: string;
  reframe: { possible: boolean; text: string };
  learn: string;
}

export type AppStatus = 'draft' | 'applied' | 'no-reply' | 'interview' | 'offer' | 'rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  date: string; // ISO yyyy-mm-dd
  versionName: string;
  status: AppStatus;
  link?: string;
}

export interface LearningItem {
  id: string;
  reqShort: string;
  plan: string;
}

export interface Session {
  company: string;
  role: string;
  link: string;
  postingText: string;
  baseVersionId: string;
  decisions: Record<string, Decision>;
  extraSuggestions: Suggestion[];
  /** Bullets hidden from this copy only ("Make room"). */
  hidden: string[];
  phase: 'review' | 'summary';
}
