# ResumeLens

**CS5340 – Human-Computer Interaction · Group 3 (F26_3)**

## Team Members
- Jingjing Ji
- Chanyuan Liu
- Weisi Chen
- Zhuoying Xue

## Project Description
ResumeLens compares your resume with a job posting. It shows which requirements your resume already has evidence for, suggests edits tied to that evidence, and explains why it made each suggestion. You accept, edit, or skip every change; nothing goes onto your resume without your decision.

We started with a broader question: how do job seekers (starting with computer science students and early-career candidates) understand, judge, and use AI resume recommendations? Our research narrowed that to one problem: people don't lack AI rewriting. They lack **evidence** that a change is true, relevant, and worth the time.

## Current Status
**Phase 3: Prototype & Implementation (in progress).** Research, problem definition, and ideation are done. An interactive prototype of the full flow runs on a scripted demo scenario; the backend and real AI analysis are next.

| Phase | Focus | Status |
|---|---|---|
| 1 | Background research, competitor analysis, stakeholders, design-thinking plan, technical foundation | ✅ Done |
| 2 | User interviews (6 participants) and online user research | ✅ Done |
| 3 | Research synthesis, problem definition, ideation, interactive prototype | 🟡 In progress |

## Phase 1: Research & Planning
- **Problem area:** AI resume tools are hard to understand (why was this suggested?), hard to act on (a score or keyword list doesn't say what to do honestly), and can be inaccurate (the applicant answers for anything the AI invents).
- **Competitors reviewed:** Jobscan, Teal, general-purpose chatbots (ChatGPT, Claude, Gemini), and university career services. Common gaps: scores without meaning, no link between a suggestion and its reason, accuracy left to the user, and little support for novices.
- **Target users:** CS students seeking internships, and early-career engineers (0–2 years).

## Phase 2: User Research
We ran **6 semi-structured interviews** (P1–P6: CS students, a PhD student, and early-career and experienced engineers) and reviewed Reddit threads, industry reports, and academic work from 2025–2026.

Key findings:
- **Tailoring is incremental.** People keep a master resume (or 2–3 versions) and make small edits rather than rewriting.
- **Job descriptions drive what to emphasize**, but fitting it all on one page is a real struggle.
- **People can't tell whether their changes work.** P1 called ATS matching "a black box."
- **Truthfulness is a line users draw themselves.** P5 wants projects to "sound strong but still true."
- **A missing keyword isn't always a missing skill.** GitHub vs. GitLab is the same practice under different names.
- **Preferences differ:** some want to review every change, others want more automation.

## Phase 3: Synthesis, Problem Definition & Ideation
**Five themes** from affinity analysis:
1. Tailoring is a cost-benefit trade-off, so people minimize it.
2. Users can't tell whether their changes work.
3. Truthfulness is a line users draw themselves.
4. Trust depends on explanation, but checking fades with habit (P4, P6).
5. Users want gap analysis and direction, not just polish, framed so it doesn't make them feel unqualified.

**Problem statement:** Students and early-career engineers tailoring a resume to a posting can't easily tell which requirements their resume actually supports, or why an AI suggests a change. So they either spend too long tailoring, or accept AI edits they can't verify and may not be true.

**Ideation:** 4 "How might we" questions → 12 ideas → 7 scored against five criteria (grounded, fast to check, user control, saves time, feasible). The chosen concept, **evidence-linked review**, combines a requirement evidence map, evidence-linked suggestions, and one-at-a-time review cards, with supporting features for flagging overstated wording, turning gaps into next steps, keeping a separate copy per job, and logging outcomes. We deliberately rejected a single fit score (it recreates the "black box") and an auto-apply agent (fastest, but fails on grounding and control).

## The Prototype
The prototype follows the concept and adds what we learned while building it:

- **Fact bank (Profile).** Upload a resume once; it's parsed into facts (courses, roles, projects, skills) you can confirm and add to. Every suggestion has to cite a fact, so the tool can also suggest real experience that isn't on your resume yet.
- **Tailor workspace.** Your resume on the left; the **evidence map** on the right. Each requirement is marked *On resume*, *Could be clearer*, *In your bank*, or *No evidence yet*, and opens into its suggestion card.
- **Review cards** show the exact words that change, the fact behind them, and why. "Adds detail" cards ask a yes/no truth check before you can accept; `[placeholders]` must be filled in or removed; wording that goes beyond your facts gets a red flag and a safer alternative.
- **Gaps** offer three options: reframe a related skill, add a real experience (through a short chat that saves it as a fact), or plan to learn it. ResumeLens never writes in a skill you don't have.
- **One-page fit.** The copy is measured on a real Letter page; if it runs over, **Make room** suggests the lines that earn the least space for this posting.
- **Summary and Applications.** See what changed, what you'll need to **be ready to explain** in an interview, and log which version you sent where and what happened.

Design notes: [`docs/design-system.md`](docs/design-system.md) (visual rules and how they map to UI principles) · [`docs/demo-scenario.md`](docs/demo-scenario.md) (the scripted demo data).

### Running the prototype
The prototype is a React + TypeScript + Tailwind app in [`client/`](client/). It runs on the scripted demo scenario (no backend or AI calls yet).

```bash
cd client
npm install
npm run dev      # then open the printed http://localhost:5173 link
```

Add `?hints=off` to the URL (e.g. `http://localhost:5173/?hints=off`) to hide the one-time hints, for comparing participants with and without them in usability tests.

Use **Reset demo** (top right) to start over, or "skip setup and open as a returning user" on the welcome screen to jump straight to a profile with past applications.

## Next Steps
- Node.js + Express backend with a language-model API for real parsing and analysis, keeping the "no invented facts" rules in the prompt and validating every returned reference.
- Saved accounts and data (PostgreSQL), with deletion and minimal data sent to the AI provider.
- Usability testing with think-aloud tasks: review all suggestions, handle a gap, and find which resume version led to an interview.
