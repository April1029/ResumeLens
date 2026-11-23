import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../../state/store';
import { CHAT_FACT, CHAT_SUGGESTION, GAPS, REQUIREMENTS, SUGGESTIONS, TRIMS } from '../../data/demo';
import type { Decision, EvidenceState, Requirement, Suggestion } from '../../types';
import { applyDecisions, availableSuggestions, hasPlaceholder, reqState } from '../../lib/resume';
import { LINE_H, PAGE_LIMIT, ResumePaper } from '../../components/ResumePaper';
import { Button, Chip, EVIDENCE, EvidenceSwatch, Modal, PRESSABLE, SectionLabel } from '../../components/ui';
import { SuggestionCard } from './SuggestionCard';
import { ChatPanel, type ChatMessage } from './ChatPanel';
import { Summary } from './Summary';
import { NewTailoring } from '../NewTailoring';

const CHAT_SCRIPT = [
  'We actually put ClubHub on AWS for our final demo.',
  'I launched an EC2 instance and ran our Docker Compose setup on it. It was up for about two weeks.',
];

type Group = 'decide' | 'explore' | 'covered';
const GROUP_LABEL: Record<Group, string> = { decide: 'Needs a decision', explore: 'To explore', covered: 'Already covered' };

function targetOf(s: Suggestion, applied: boolean): string {
  if (s.op.kind === 'replace') return s.op.bulletId;
  if (s.op.kind === 'add') return applied ? `${s.id}-add` : s.op.entryId;
  return applied ? `${s.id}-entry` : s.op.removeEntryId;
}

/** A suggestion lives under its first requirement; any others are shown as "also covers". */
const primaryOf = (s: Suggestion) => s.reqIds[0];

export function Tailor() {
  const { state } = useStore();
  if (!state.session) return <NewTailoring />;
  return <Workspace />;
}

function Workspace() {
  const { state, dispatch } = useStore();
  const session = state.session!;
  const base = state.versions.find((v) => v.id === session.baseVersionId) ?? state.versions[0];

  const suggestions = useMemo(
    () => availableSuggestions([...SUGGESTIONS, ...session.extraSuggestions], state.facts),
    [session.extraSuggestions, state.facts],
  );
  const decisions = session.decisions;
  const tailored = useMemo(() => applyDecisions(base.doc, suggestions, decisions, session.hidden), [base.doc, suggestions, decisions, session.hidden]);
  const states = useMemo(() => {
    const m: Record<string, EvidenceState> = {};
    for (const r of REQUIREMENTS) m[r.id] = reqState(r, state.facts, decisions);
    return m;
  }, [state.facts, decisions]);

  const isPending = (s: Suggestion) => !decisions[s.id] || decisions[s.id].status === 'pending';
  const isApplied = (s: Suggestion) => !isPending(s) && decisions[s.id].status !== 'skipped';
  const rowSugs = (rid: string) => suggestions.filter((s) => primaryOf(s) === rid);
  const groupOf = (r: Requirement): Group => (rowSugs(r.id).some(isPending) ? 'decide' : states[r.id] === 'none' ? 'explore' : 'covered');
  const requiredFirst = (a: Requirement, b: Requirement) => (a.type === b.type ? 0 : a.type === 'required' ? -1 : 1);
  // Within "Needs a decision": required first, then weakest evidence first (the rows a suggestion helps most).
  const RANK: Record<EvidenceState, number> = { clearer: 0, bank: 1, none: 2, on: 3 };
  const decideOrder = (a: Requirement, b: Requirement) => requiredFirst(a, b) || RANK[states[a.id]] - RANK[states[b.id]];
  const groups: Record<Group, Requirement[]> = {
    decide: REQUIREMENTS.filter((r) => groupOf(r) === 'decide').sort(decideOrder),
    explore: REQUIREMENTS.filter((r) => groupOf(r) === 'explore').sort(requiredFirst),
    covered: REQUIREMENTS.filter((r) => groupOf(r) === 'covered').sort(requiredFirst),
  };
  // Display order of every suggestion, used for ←/→ and auto-advance.
  const ordered = [...groups.decide, ...groups.explore, ...groups.covered].flatMap((r) => rowSugs(r.id));

  const firstPending = ordered.find(isPending);
  const [openReq, setOpenReq] = useState<string | null>(() => (firstPending ? primaryOf(firstPending) : null));
  const [activeSid, setActiveSid] = useState<string | null>(() => firstPending?.id ?? null);
  const [groupOpen, setGroupOpen] = useState<Record<Group, boolean>>({ decide: true, explore: true, covered: false });
  const [showChanges, setShowChanges] = useState(true);
  const [pageHeight, setPageHeight] = useState(0);
  const [roomOpen, setRoomOpen] = useState(false);
  const [postingOpen, setPostingOpen] = useState(false);
  const [chatFor, setChatFor] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatStep, setChatStep] = useState(0);
  const keys = useRef<{ accept: () => void; edit: () => void; skip: () => void } | null>(null);
  const registerKeys = useCallback((h: typeof keys.current) => (keys.current = h), []);

  const openRow = REQUIREMENTS.find((r) => r.id === openReq);
  const openList = openReq ? rowSugs(openReq) : [];
  const active = openList.find((s) => s.id === activeSid) ?? openList.find(isPending) ?? openList[0];

  // Resume highlight: the open card's target line, or the open requirement's evidence.
  const targetId = active ? targetOf(active, isApplied(active)) : null;
  const evidenceFacts = useMemo(() => {
    if (!openRow || active || states[openRow.id] === 'none') return undefined;
    const ids = new Set<string>();
    for (const id of openRow.evidence) {
      ids.add(id);
      const f = state.facts.find((x) => x.id === id);
      if (f?.parentId) ids.add(f.parentId);
    }
    return ids;
  }, [openRow, active, states, state.facts]);

  useEffect(() => {
    if (targetId) document.getElementById(`r-${targetId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [targetId]);
  // Scroll the map to the open row, but not on first load, so the reassuring summary stays in view.
  const prevOpen = useRef(openReq);
  useEffect(() => {
    if (prevOpen.current === openReq) return;
    prevOpen.current = openReq;
    if (openReq) document.getElementById(`row-${openReq}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [openReq]);

  const focusSuggestion = (s: Suggestion) => {
    const rid = primaryOf(s);
    setOpenReq(rid);
    setActiveSid(s.id);
    const r = REQUIREMENTS.find((x) => x.id === rid);
    if (r && groupOf(r) === 'covered') setGroupOpen((g) => ({ ...g, covered: true }));
  };

  const toggleRow = (r: Requirement) => {
    if (openReq === r.id) {
      setOpenReq(null);
      return;
    }
    const list = rowSugs(r.id);
    setOpenReq(r.id);
    setActiveSid((list.find(isPending) ?? list[0])?.id ?? null);
  };

  const decide = (s: Suggestion, d: Decision) => {
    dispatch({ type: 'decide', id: s.id, decision: d });
    if (s.flag && state.hints.flag) dispatch({ type: 'setHint', key: 'flag', show: false });
    // Stay in this row if it has more to decide; otherwise open the next row that needs a decision.
    const sameRow = rowSugs(primaryOf(s)).find((x) => x.id !== s.id && isPending(x));
    const next = sameRow ?? ordered.find((x) => x.id !== s.id && isPending(x));
    if (next) {
      setOpenReq(primaryOf(next));
      setActiveSid(next.id);
    } else {
      setOpenReq(null);
      setActiveSid(null);
    }
  };

  const step = (dir: 1 | -1) => {
    if (!ordered.length) return;
    const i = active ? ordered.indexOf(active) : -1;
    focusSuggestion(ordered[(i + dir + ordered.length) % ordered.length]);
  };

  const openChatFor = (r: Requirement) => {
    setChatFor(r.id);
    if (chatFor !== r.id) {
      setChat([{ role: 'assistant', text: `Tell me about any real experience with ${r.short}. I’ll save it as a fact in your bank; I won’t edit your resume directly.` }]);
      setChatStep(0);
    }
  };

  const sendChat = (text: string) => {
    const msgs: ChatMessage[] = [...chat, { role: 'user', text }];
    if (chatFor !== 'R10') {
      msgs.push({
        role: 'assistant',
        text: 'In this prototype the chat is scripted for the AWS / cloud gap only. In the full version I’d ask follow-up questions here and save your answer as a fact.',
      });
    } else if (chatStep === 0) {
      msgs.push({ role: 'assistant', text: 'Got it. What did you do yourself: launch the server, set up the database, or something else? And how long did it run?' });
      setChatStep(1);
    } else if (chatStep === 1) {
      dispatch({ type: 'addFacts', facts: [CHAT_FACT] });
      dispatch({ type: 'addSuggestion', suggestion: CHAT_SUGGESTION });
      msgs.push({
        role: 'assistant',
        text: 'Thanks. I saved that as a fact. AWS / cloud is now “In your bank,” and I drafted one suggestion from it.',
        fact: CHAT_FACT,
        suggestionId: CHAT_SUGGESTION.id,
      });
      setChatStep(2);
    } else {
      msgs.push({ role: 'assistant', text: 'Anything else you want me to save? Otherwise, review the new suggestion card.' });
    }
    setChat(msgs);
  };

  // Keyboard shortcuts for the open card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (postingOpen || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (keys.current && e.key.toLowerCase() === 'a') keys.current.accept();
      else if (keys.current && e.key.toLowerCase() === 'e') keys.current.edit();
      else if (keys.current && e.key.toLowerCase() === 's') keys.current.skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (session.phase === 'summary')
    return (
      <Summary
        suggestions={suggestions}
        decisions={decisions}
        tailored={tailored}
        company={session.company}
        role={session.role}
        link={session.link}
        baseName={base.name}
      />
    );

  const decidedCount = suggestions.filter((s) => !isPending(s)).length;
  const lowRisk = suggestions.filter((s) => isPending(s) && s.kind === 'wording' && !s.flag && !hasPlaceholder(s.suggested));
  const required = REQUIREMENTS.filter((r) => r.type === 'required');
  const reqWithEvidence = required.filter((r) => states[r.id] !== 'none').length;
  const pendingCount = suggestions.length - decidedCount;

  const renderBody = (r: Requirement) => {
    const list = rowSugs(r.id);
    if (list.length && active) {
      const i = list.indexOf(active);
      const fromChat = chatFor === r.id && chatStep === 2;
      return (
        <>
        {fromChat && (
          <div className="flex items-start gap-2 rounded-xl border-2 border-ink bg-bank-soft p-2.5 text-xs" role="status">
            <Chip className="bg-bank">{CHAT_FACT.id}</Chip>
            <span>
              <strong>Saved to your fact bank from chat:</strong> {CHAT_FACT.title}. Here’s the suggestion it made possible.
            </span>
          </div>
        )}
        <SuggestionCard
          s={active}
          decision={decisions[active.id]}
          pos={{ i, n: list.length }}
          onPrev={() => setActiveSid(list[(i - 1 + list.length) % list.length].id)}
          onNext={() => setActiveSid(list[(i + 1) % list.length].id)}
          primaryReqId={r.id}
          facts={state.facts}
          reqs={REQUIREMENTS}
          onDecide={(d) => decide(active, d)}
          onUndo={() => dispatch({ type: 'decide', id: active.id, decision: { status: 'pending' } })}
          registerKeys={registerKeys}
          showFlagHint={state.hints.flag}
        />
        </>
      );
    }
    if (states[r.id] !== 'none') return <EvidenceBody r={r} />;
    return (
      <GapBody
        r={r}
        chatOpen={chatFor === r.id}
        onChat={() => openChatFor(r)}
        chat={
          chatFor === r.id ? (
            <div className="h-[380px] overflow-hidden rounded-xl border-2 border-ink bg-paper">
              <ChatPanel
                req={r}
                messages={chat}
                quickReplies={r.id === 'R10' && chatStep < 2 ? [CHAT_SCRIPT[chatStep]] : []}
                onSend={sendChat}
                onOpenSuggestion={(id) => {
                  const s = suggestions.find((x) => x.id === id);
                  if (s) focusSuggestion(s);
                }}
              />
            </div>
          ) : null
        }
      />
    );
  };

  const renderRow = (r: Requirement, g: Group) => {
    const st = states[r.id];
    const list = rowSugs(r.id);
    const pend = list.filter(isPending).length;
    const open = openReq === r.id;
    const openPending = open && !!active && isPending(active);
    // The row is the card. Raised = needs a decision; flat = done or optional.
    const shell = openPending
      ? 'border-ink bg-paper shadow-brut'
      : open
        ? 'border-ink bg-paper'
        : g === 'decide'
          ? 'border-ink bg-paper shadow-brut-sm hover:shadow-brut'
          : g === 'explore'
            ? 'border-dashed border-ink/60 bg-transparent hover:bg-paper'
            : 'border-transparent bg-transparent hover:border-ink/40 hover:bg-paper';
    return (
      <li key={r.id} id={`row-${r.id}`} className={`scroll-mt-3 rounded-xl border-2 transition-shadow ${shell}`}>
        <button onClick={() => toggleRow(r)} aria-expanded={open} title={r.text} className="flex w-full items-center gap-2.5 px-3 py-2 text-left">
          <EvidenceSwatch state={st} size="sm" />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-bold">{r.short}</span>
            {r.type === 'nice' && <span className="ml-1.5 text-xs text-slate-500">nice-to-have</span>}
          </span>
          <span className="shrink-0 text-xs text-slate-600">
            {EVIDENCE[st].label}
            {pend > 0 && <span className="ml-1.5 rounded-full bg-ink px-1.5 font-bold text-paper">{pend}</span>}
          </span>
        </button>
        {open && <div className="border-t-2 border-ink px-3 pb-3 pt-2.5">{renderBody(r)}</div>}
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Context bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink bg-accent-soft px-4 py-2.5">
        <div className="min-w-0">
          <div className="truncate text-sm">
            Tailoring for <strong>{session.company}</strong> · {session.role}
          </div>
          <div className="text-xs font-medium text-slate-700">
            Started from <strong>{base.name}</strong> · {base.name} stays unchanged
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold" aria-live="polite">
            <div className="h-3 w-32 overflow-hidden rounded-full border-2 border-ink bg-paper" aria-hidden>
              <div className="h-full bg-accent-strong transition-all" style={{ width: `${(decidedCount / Math.max(1, suggestions.length)) * 100}%` }} />
            </div>
            {decidedCount} of {suggestions.length} reviewed
          </div>
          {!state.hints.howTo && (
            <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'setHint', key: 'howTo', show: true })}>How this works</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setPostingOpen(true)}>View posting</Button>
          <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'setPhase', phase: 'summary' })}>Finish review →</Button>
        </div>
      </div>

      {state.hints.howTo && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b-2 border-ink bg-blue-soft px-4 py-2 text-sm" role="note" aria-label="How this works">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {[
              ['Review each suggestion', 'accept, edit or skip'],
              ['Explore gaps', 'optional'],
              ['Finish review', 'save your copy'],
            ].map(([step, note], i) => (
              <li key={step} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-slate-500">→</span>}
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-paper text-[11px] font-bold">{i + 1}</span>
                <span>
                  <strong>{step}</strong> <span className="text-slate-600">({note})</span>
                </span>
              </li>
            ))}
          </ol>
          <Button size="sm" className="ml-auto" onClick={() => dispatch({ type: 'setHint', key: 'howTo', show: false })}>
            Got it ✕
          </Button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        {/* Left: the resume (calm document) */}
        <main className="overflow-auto bg-[#EFEAE0] px-3 py-6 xl:px-5">
          <div className="mx-auto mb-3 max-w-[680px] rounded-lg border-2 border-ink bg-paper text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-1.5">
              <strong>Tailored copy</strong>
              <FitMeter textEnd={pageHeight} />
              {pageHeight > PAGE_LIMIT ? (
                <Button size="sm" variant="primary" onClick={() => setRoomOpen((o) => !o)} aria-expanded={roomOpen}>
                  Make room{session.hidden.length ? ` (${session.hidden.length} hidden)` : ''}
                </Button>
              ) : session.hidden.length > 0 ? (
                <button className="text-xs font-bold underline decoration-2 underline-offset-2 hover:text-accent-strong" onClick={() => setRoomOpen((o) => !o)} aria-expanded={roomOpen}>
                  {session.hidden.length} line{session.hidden.length === 1 ? '' : 's'} hidden
                </button>
              ) : null}
              <label className="ml-auto flex items-center gap-1.5">
                <input type="checkbox" checked={showChanges} onChange={(e) => setShowChanges(e.target.checked)} /> Show changes
              </label>
            </div>
            {roomOpen && (pageHeight > PAGE_LIMIT || session.hidden.length > 0) && <MakeRoom hidden={session.hidden} base={base.doc} onToggle={(id) => dispatch({ type: 'toggleTrim', bulletId: id })} />}
          </div>
          <ResumePaper
            showPageBreak
            onMeasure={setPageHeight}
            doc={tailored}
            targetId={targetId}
            evidenceFacts={evidenceFacts}
            showChanges={showChanges}
            onBulletClick={(b) => {
              const s = suggestions.find((x) => targetOf(x, isApplied(x)) === b.id);
              if (s) focusSuggestion(s);
              else if (b.factId) dispatch({ type: 'toast', text: `From fact ${b.factId}. No suggestion for this line.` });
            }}
          />
        </main>

        {/* Right: evidence map — requirements with their suggestions inline */}
        <aside className="order-first overflow-auto border-b-2 border-ink bg-cream px-4 py-5 lg:order-none lg:border-b-0 lg:border-l-2 xl:px-8" aria-label="Evidence map">
          <div className="mx-auto max-w-[760px] space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl">Evidence map</h2>
                {lowRisk.length > 0 && (
                  <Button
                    size="sm"
                    title="“Wording only” edits with no flags or placeholders"
                    onClick={() => {
                      dispatch({ type: 'decideMany', ids: lowRisk.map((s) => s.id), decision: { status: 'accepted' } });
                      dispatch({ type: 'toast', text: `Accepted ${lowRisk.map((s) => s.id).join(', ')}. You can undo each one.` });
                      if (active && lowRisk.includes(active)) {
                        const next = ordered.find((x) => isPending(x) && !lowRisk.includes(x));
                        if (next) focusSuggestion(next);
                      }
                    }}
                  >
                    Accept {lowRisk.length} low-risk
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-700">
                <strong>
                  {reqWithEvidence === required.length ? `All ${required.length}` : `${reqWithEvidence} of ${required.length}`} required items have evidence.
                </strong>{' '}
                {pendingCount > 0 ? `${pendingCount} to review` : 'All reviewed'}
                {groups.explore.length > 0 ? ` · ${groups.explore.length} to explore` : ''}
              </p>
            </div>

            {pendingCount === 0 && (
              <div className="rounded-xl border-2 border-ink bg-found-soft p-3 text-center text-sm font-bold">
                All suggestions reviewed.{' '}
                <button className="underline decoration-2 underline-offset-2" onClick={() => dispatch({ type: 'setPhase', phase: 'summary' })}>
                  See summary →
                </button>
              </div>
            )}

            {(['decide', 'explore', 'covered'] as Group[]).map((g) =>
              groups[g].length === 0 ? null : (
                <section key={g} aria-label={GROUP_LABEL[g]}>
                  <button
                    className="mb-1.5 flex w-full items-center gap-2 text-left"
                    onClick={() => setGroupOpen((o) => ({ ...o, [g]: !o[g] }))}
                    aria-expanded={groupOpen[g]}
                  >
                    <span aria-hidden className="text-xs">{groupOpen[g] ? '▾' : '▸'}</span>
                    <SectionLabel>
                      {GROUP_LABEL[g]} ({groups[g].length})
                    </SectionLabel>
                  </button>
                  {groupOpen[g] && <ul className="space-y-1.5">{groups[g].map((r) => renderRow(r, g))}</ul>}
                </section>
              ),
            )}
          </div>
        </aside>
      </div>

      {postingOpen && (
        <Modal title={`${session.company} · ${session.role}`} onClose={() => setPostingOpen(false)} wide>
          {session.link && <p className="mb-3 truncate text-xs text-slate-500">{session.link}</p>}
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{session.postingText}</pre>
        </Modal>
      )}
    </div>
  );
}

function EvidenceBody({ r }: { r: Requirement }) {
  const { state } = useStore();
  const facts = state.facts.filter((f) => r.evidence.includes(f.id));
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700">{r.note}</p>
      {facts.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {facts.map((f) => (
            <li key={f.id} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-paper px-2 py-1 text-xs">
              <Chip className={f.origin === 'user' ? 'bg-bank' : ''}>{f.id}</Chip>
              <span className="font-medium">{f.title}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">The highlighted lines in your resume show where this evidence appears.</p>
    </div>
  );
}

function GapBody({ r, chatOpen, onChat, chat }: { r: Requirement; chatOpen: boolean; onChat: () => void; chat: ReactNode }) {
  const { state, dispatch } = useStore();
  const gap = GAPS.find((g) => g.reqId === r.id);
  const [reframeOpen, setReframeOpen] = useState(false);
  const onList = state.learning.some((l) => l.reqShort === r.short);

  return (
    <div className="space-y-2.5">
      <p className="rounded-xl border-2 border-dashed border-slate-400 bg-paper p-3 text-sm leading-relaxed">
        We didn’t find this in your resume or fact bank. That’s common{r.type === 'nice' ? ' for a nice-to-have' : ''}, and it doesn’t mean you shouldn’t apply. Here’s what
        you can do:
      </p>
      <div className={`overflow-hidden rounded-xl bg-paper ${PRESSABLE}`}>
        <button className="flex w-full items-center justify-between p-3 text-left text-sm font-bold" onClick={() => setReframeOpen((o) => !o)} aria-expanded={reframeOpen}>
          <span>↻ Reframe a related skill</span>
          <span className="text-slate-400">{reframeOpen ? '▾' : '▸'}</span>
        </button>
        {reframeOpen && gap && <p className="border-t-2 border-ink p-3 text-sm text-slate-700">{gap.reframe.text}</p>}
      </div>
      {chatOpen ? (
        chat
      ) : (
        <button className={`w-full rounded-xl bg-blue p-3 text-left text-sm font-bold ${PRESSABLE}`} onClick={onChat}>
          ＋ Add a real experience <span className="block text-xs font-normal text-slate-700">Tell us here; it’s saved as a fact first</span>
        </button>
      )}
      <button
        className={`w-full rounded-xl bg-accent-soft p-3 text-left text-sm font-bold disabled:cursor-default ${PRESSABLE}`}
        disabled={onList}
        onClick={() => {
          dispatch({ type: 'addLearning', item: { id: `l-${r.id}`, reqShort: r.short, plan: gap?.learn ?? `Learn ${r.short}` } });
          dispatch({ type: 'toast', text: 'Added to your learning list in Profile. It won’t go on your resume.' });
        }}
      >
        {onList ? '✓ On your learning list' : '◎ Plan to learn it'}
        {gap && <span className="block text-xs font-normal text-slate-700">{gap.learn}</span>}
      </button>
    </div>
  );
}

/** One-page fit. Fits = a plain "you're good"; over = how far over, in the "partial" status color (not the flag red). */
function FitMeter({ textEnd }: { textEnd: number }) {
  if (!textEnd) return null;
  if (textEnd <= PAGE_LIMIT)
    return (
      <span className="font-medium" aria-live="polite">
        <span className="text-found-strong">✓</span> You’re good: fits on one page
      </span>
    );
  const lines = Math.max(1, Math.ceil((textEnd - PAGE_LIMIT) / LINE_H));
  return (
    <span className="rounded bg-partial-soft px-1.5 py-0.5 font-bold" aria-live="polite">
      ◐ Over one page by ~{lines} line{lines === 1 ? '' : 's'}
    </span>
  );
}

/** Lines that earn the least space for this posting. Hiding affects this copy only. */
function MakeRoom({ hidden, base, onToggle }: { hidden: string[]; base: import('../../types').ResumeDoc; onToggle: (id: string) => void }) {
  const text = (id: string) => {
    for (const s of base.sections) for (const e of s.entries) for (const b of e.bullets) if (b.id === id) return b.text;
    return null;
  };
  const items = TRIMS.filter((t) => text(t.bulletId));
  return (
    <div className="border-t-2 border-ink px-3 py-2.5">
      <p className="mb-1.5 text-slate-600">Lines that earn the least space for this posting. Hiding them affects this copy only; your master keeps them.</p>
      <ul className="space-y-1">
        {items.map((t) => (
          <li key={t.bulletId}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-cream">
              <input type="checkbox" className="mt-0.5" checked={hidden.includes(t.bulletId)} onChange={() => onToggle(t.bulletId)} />
              <span>
                <span className={`font-serif text-[13px] ${hidden.includes(t.bulletId) ? 'text-slate-400 line-through' : 'text-ink'}`}>{text(t.bulletId)}</span>
                <span className="block text-slate-600">{t.reason}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
