import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AppStatus, Application, Decision, Fact, LearningItem, Session, Suggestion, Version } from '../types';
import { ALL_DETAIL_FACTS, BACKEND_VERSION, MASTER_DOC, PARSED_FACTS, PAST_APPLICATIONS } from '../data/demo';

export type View = 'profile' | 'tailor' | 'applications';
export type OnboardingStep = 'welcome' | 'parsing' | 'review' | 'detail';

export interface State {
  stage: 'onboarding' | 'app';
  step: OnboardingStep;
  view: View;
  facts: Fact[];
  versions: Version[];
  applications: Application[];
  learning: LearningItem[];
  session: Session | null;
  toast: { id: number; text: string } | null;
  /** One-time hints. true = still showing. Add ?hints=off to the URL to hide them (for A/B usability tests). */
  hints: { howTo: boolean; flag: boolean };
}

const hintsOn = typeof window === 'undefined' || new URLSearchParams(window.location.search).get('hints') !== 'off';

const masterVersion = (): Version => ({ id: 'v-master', name: 'Master', kind: 'master', isDefault: true, doc: structuredClone(MASTER_DOC) });

export const initialState: State = {
  stage: 'onboarding',
  step: 'welcome',
  view: 'profile',
  facts: [],
  versions: [],
  applications: [],
  learning: [],
  session: null,
  toast: null,
  hints: { howTo: hintsOn, flag: hintsOn },
};

export type Action =
  | { type: 'reset' }
  | { type: 'returningUser' }
  | { type: 'goStep'; step: OnboardingStep }
  | { type: 'parsed' }
  | { type: 'updateFact'; fact: Fact }
  | { type: 'addFacts'; facts: Fact[] }
  | { type: 'finishOnboarding' }
  | { type: 'go'; view: View }
  | { type: 'startSession'; session: Omit<Session, 'decisions' | 'extraSuggestions' | 'hidden' | 'phase'> }
  | { type: 'decide'; id: string; decision: Decision }
  | { type: 'decideMany'; ids: string[]; decision: Decision }
  | { type: 'addSuggestion'; suggestion: Suggestion }
  | { type: 'setPhase'; phase: Session['phase'] }
  | { type: 'endSession' }
  | { type: 'toggleTrim'; bulletId: string }
  | { type: 'saveVersion'; version: Version; application?: Application }
  | { type: 'setStatus'; id: string; status: AppStatus }
  | { type: 'addLearning'; item: LearningItem }
  | { type: 'removeLearning'; id: string }
  | { type: 'toast'; text: string }
  | { type: 'clearToast' }
  | { type: 'setHint'; key: keyof State['hints']; show: boolean };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'reset':
      return initialState;
    case 'returningUser':
      return {
        ...initialState,
        stage: 'app',
        view: 'profile',
        facts: [...PARSED_FACTS, ...ALL_DETAIL_FACTS],
        versions: [masterVersion(), structuredClone(BACKEND_VERSION)],
        applications: structuredClone(PAST_APPLICATIONS),
        // A returning user has tailored before; the how-to strip stays reachable via “How this works”.
        hints: { howTo: false, flag: hintsOn },
      };
    case 'goStep':
      return { ...state, step: a.step };
    case 'parsed':
      return { ...state, facts: structuredClone(PARSED_FACTS), versions: [masterVersion()], step: 'review' };
    case 'updateFact':
      return { ...state, facts: state.facts.map((f) => (f.id === a.fact.id ? a.fact : f)) };
    case 'addFacts': {
      const ids = new Set(a.facts.map((f) => f.id));
      return { ...state, facts: [...state.facts.filter((f) => !ids.has(f.id)), ...a.facts] };
    }
    case 'finishOnboarding':
      return { ...state, stage: 'app', view: 'tailor' };
    case 'go':
      return { ...state, view: a.view };
    case 'startSession':
      return { ...state, view: 'tailor', session: { ...a.session, decisions: {}, extraSuggestions: [], hidden: [], phase: 'review' } };
    case 'decide':
      if (!state.session) return state;
      return { ...state, session: { ...state.session, decisions: { ...state.session.decisions, [a.id]: a.decision } } };
    case 'decideMany': {
      if (!state.session) return state;
      const decisions = { ...state.session.decisions };
      for (const id of a.ids) decisions[id] = a.decision;
      return { ...state, session: { ...state.session, decisions } };
    }
    case 'addSuggestion':
      if (!state.session || state.session.extraSuggestions.some((s) => s.id === a.suggestion.id)) return state;
      return { ...state, session: { ...state.session, extraSuggestions: [...state.session.extraSuggestions, a.suggestion] } };
    case 'setPhase':
      if (!state.session) return state;
      return { ...state, session: { ...state.session, phase: a.phase } };
    case 'endSession':
      return { ...state, session: null };
    case 'toggleTrim': {
      if (!state.session) return state;
      const h = state.session.hidden;
      return { ...state, session: { ...state.session, hidden: h.includes(a.bulletId) ? h.filter((x) => x !== a.bulletId) : [...h, a.bulletId] } };
    }
    case 'saveVersion':
      return {
        ...state,
        versions: [...state.versions, a.version],
        applications: a.application ? [...state.applications, a.application] : state.applications,
        session: null,
        view: a.application ? 'applications' : 'profile',
      };
    case 'setStatus':
      return { ...state, applications: state.applications.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) };
    case 'addLearning':
      if (state.learning.some((l) => l.reqShort === a.item.reqShort)) return state;
      return { ...state, learning: [...state.learning, a.item] };
    case 'removeLearning':
      return { ...state, learning: state.learning.filter((l) => l.id !== a.id) };
    case 'toast':
      return { ...state, toast: { id: Date.now(), text: a.text } };
    case 'clearToast':
      return { ...state, toast: null };
    case 'setHint':
      return { ...state, hints: { ...state.hints, [a.key]: a.show } };
  }
}

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
}
