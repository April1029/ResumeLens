# ResumeLens API contract (draft v0.1)

Status: **proposal for team review.** Nothing here is implemented yet. The prototype currently reads scripted data from `client/src/data/demo.ts`; each endpoint below replaces one piece of it.

All request and response bodies are JSON. Types named here (`Fact`, `ResumeDoc`, `Requirement`, `Suggestion`, `Gap`, `Trim`, `EvidenceState`) are the ones in [`client/src/types.ts`](../client/src/types.ts). They are the contract: if the server returns these shapes, the existing UI works with few changes.

| # | Endpoint | Replaces in the prototype | Used by |
|---|---|---|---|
| 1 | `POST /api/parse-resume` | `PARSED_FACTS`, `MASTER_DOC`, `PARSE_LOG` | Onboarding |
| 2 | `POST /api/analyze-posting` | `REQUIREMENTS`, `SUGGESTIONS`, `GAPS`, `TRIMS` | New tailoring |
| 3 | `POST /api/chat` | `CHAT_SCRIPT`, `CHAT_FACT`, `CHAT_SUGGESTION` | Gap chat panel |
| 4 | `POST /api/check-claims` | regex `checkClaims` in `lib/resume.ts` | Editing a suggestion |
| 5 | `POST /api/detail-questions` and 5b `POST /api/extract-fact` | `DETAIL_QUESTIONS` | Onboarding detail step |

## Ground rules (apply to every endpoint)

These are the product's promises, so the **server enforces them in code**, not only in the prompt.

1. **No fact, no suggestion.** Every suggestion cites fact ids in `sources`. If any id is not in the `facts` the client sent, the server drops that suggestion before responding.
2. **The AI never writes to the resume.** The server only returns proposals. Applying them stays in the client (`applyDecisions`).
3. **Only the user's words become facts.** A new fact's `details` must restate what the user said, nothing added.
4. **Flag anything stronger than the facts.** Strong verbs ("led", "managed"), scale words ("hundreds"), and numbers that do not appear in the cited facts must produce a `flag`. The server runs a deterministic check on every suggestion after the model returns it, regardless of what the model said.
5. **Ids that point into the document must exist.** `op.bulletId`, `op.entryId`, `op.removeEntryId`, `sources`, `reqIds`, and `Trim.bulletId` are checked against the `doc`, `facts`, and `requirements` in the request.
6. **Minimal data to the AI provider.** Send only what the call needs. Never log resume text.

### Error shape

```json
{ "error": { "code": "invalid_input | model_error | model_output_invalid | rate_limited | timeout", "message": "human-readable", "retryable": true } }
```

- `400` for `invalid_input` (empty text, text over 30,000 characters, missing fields).
- `502` for `model_error` or `model_output_invalid` (the model's output still failed validation after one automatic retry).
- `429` / `504` for `rate_limited` / `timeout`.
- The client shows a plain-language message and keeps the user's input. It never falls back to invented content.

---

## 1. `POST /api/parse-resume`

Turns resume text into a fact bank plus a structured master resume.

**Request**

```json
{ "resumeText": "Jordan Lee\njordan.lee@example.edu | ...\n\nEDUCATION\n..." }
```

File upload (PDF/DOCX to text) happens before this call. For now the client sends pasted text.

**Response `200`**

```json
{
  "facts": [ /* Fact[] */ ],
  "doc":   /* ResumeDoc */ {},
  "warnings": ["Could not read the date range for 'Campus Bus Tracker'."]
}
```

**Rules**

- `facts[].origin` is always `"resume"`.
- Fact ids follow the prototype: `ED1`, `C1..Cn` (courses, `parentId: "ED1"`), `E1..`, `P1..`, `A1..`, and skills `K-LANG`, `K-TOOLS`.
- `details` are copied from the resume, not paraphrased.
- Every `doc` entry and bullet has a `factId` that exists in `facts`. Bullet `text` is **verbatim** from the resume.
- `warnings` lists anything the parser was unsure about. Optional, may be empty.

---

## 2. `POST /api/analyze-posting` (core)

Extracts requirements from the posting, matches each to evidence, drafts suggestions, and proposes gap options and lines to trim.

**Request**

```json
{
  "postingText": "We're looking for an intern ...",
  "company": "Lumen Labs",
  "role": "Software Engineering Intern, Summer 2027",
  "facts": [ /* Fact[]  the user's confirmed fact bank */ ],
  "doc":   /* ResumeDoc  the version the user is tailoring from */ {}
}
```

`company` and `role` are optional; if missing the server extracts them from the text.

**Response `200`**

```json
{
  "company": "Lumen Labs",
  "role": "Software Engineering Intern, Summer 2027",
  "requirements": [ /* Requirement[] */ ],
  "suggestions":  [ /* Suggestion[] */ ],
  "gaps":         [ /* Gap[] */ ],
  "trims":        [ /* Trim[] */ ]
}
```

**`requirements[]`** (type `Requirement`)

| Field | Server behavior |
|---|---|
| `id` | `R1..Rn`, in posting order |
| `text` | the requirement as written in the posting |
| `short` | 1 to 3 words for chips (e.g. "REST APIs") |
| `type` | `"required"` or `"nice"` |
| `base` | `EvidenceState`. `on`: clear evidence on the resume. `clearer`: on the resume but weakly stated. `bank`: only in the fact bank. `none`: nothing |
| `evidence` | fact ids that support it (empty when `none`) |
| `resolvedBy` | **computed by the server**: ids of suggestions that, if accepted, would make this requirement `on` |
| `note` | one plain sentence on why this state |
| `needs`, `fallback`, `unlockedBy` | **omit.** They only exist for the scripted demo. The client uses `base` directly |

Equivalent skills count as evidence. GitHub pull requests satisfy "code review through merge requests"; GitHub Actions satisfies "GitLab CI". Do not report a different tool name as a missing skill.

**`suggestions[]`** (type `Suggestion`)

| Field | Rule |
|---|---|
| `id` | `S-1..S-n` |
| `reqIds` | requirements it targets (all must exist) |
| `sources` | **required, at least one**, fact ids the edit is based on |
| `current` / `suggested` | exact current text, and the proposed text |
| `why` | one or two plain sentences, written for the user |
| `kind` | `"wording"` only rewords or reorders what the resume already says. `"detail"` makes explicit something the resume does not say |
| `claimCheck` | required when `kind` is `"detail"`: a yes/no question the user must answer before accepting |
| `fromBank` | `true` when `sources` come only from the fact bank and not the resume |
| `op` | `replace` (`bulletId` exists in `doc`), `add` (`entryId` exists), or `swap` (replace a whole entry with a bank fact; only when `fromBank`) |
| `flag` | set when the text is stronger than the sources. `{ kind: "stronger" or "unsupported", message, saferText }`. `saferText` is always provided and must itself pass the claim check |

Placeholders: if a number would help but is not in the facts, use `[number]` in `suggested`. The client forces the user to fill it in or delete it. Never guess a number.

**`gaps[]`** (type `Gap`): one per requirement whose `base` is `bank` or `none`.
`reframe.possible` is `true` only for a real, honest equivalent (Docker is related to, but is not, Kubernetes). `reframe.text` states the honest limit. `learn` is a concrete next step. Never propose wording that claims the skill.

**`trims[]`** (type `Trim`): up to 8 `bulletId`s ordered from least to most useful for this posting, each with a `reason`. Used by "Make room"; the client decides how many to hide.

**Limits:** at most 12 requirements and 14 suggestions. Target response time under 20 seconds; the client shows progress while waiting.

---

## 3. `POST /api/chat`

One turn of the gap conversation ("Tell me about real experience with AWS"). Can save a new fact and create a suggestion. Never edits the resume.

**Request**

```json
{
  "requirement": { /* Requirement being discussed */ },
  "message": "We actually put ClubHub on AWS for our final demo.",
  "history": [ { "role": "assistant", "text": "..." }, { "role": "user", "text": "..." } ],
  "facts": [ /* Fact[] */ ],
  "doc": /* ResumeDoc */ {},
  "existingSuggestionIds": ["S-1", "S-2"]
}
```

**Response `200`**

```json
{
  "reply": "Thanks. Did you set up the EC2 instance yourself, or did a teammate?",
  "newFact": null,
  "suggestion": null,
  "requirementUpdate": null
}
```

When the user gives enough to save a fact:

```json
{
  "reply": "Saved. Here's a suggestion that uses it.",
  "newFact": { /* Fact, origin "user", parentId set when it belongs to an existing fact */ },
  "suggestion": { /* Suggestion citing newFact.id, fromBank true, with claimCheck */ },
  "requirementUpdate": { "reqId": "R10", "base": "bank", "evidence": ["P1.f"] }
}
```

**Rules**

- If the message is vague, **ask one follow-up and return no fact**. Do not guess.
- `newFact.id` is chosen by the server and must not collide with `facts[].id`. Child facts use `parentId.letter` (e.g. `P1.f`).
- `newFact.details` restate only what the user said.
- `suggestion.id` must not collide with `existingSuggestionIds`. It follows all rules in endpoint 2.
- If the user claims something the resume contradicts, say so in `reply` and save nothing.

> **Front-end change needed:** the client currently reads requirements from the static `REQUIREMENTS` list. `requirementUpdate` needs the session to hold requirements in state so the evidence map can change after a chat.

---

## 4. `POST /api/check-claims`

Runs when the user edits a suggestion's text. Replaces the regex version in `checkClaims`.

**Request**

```json
{
  "text": "Led the ClubHub backend for 200 users",
  "sources": [ /* Fact[]  the facts the suggestion cites */ ],
  "original": "Worked with 3 other students on group project"
}
```

**Response `200`**

```json
{
  "warnings": [
    { "kind": "stronger",  "span": "Led", "message": "“Led” is stronger than your facts. Your fact says you owned the backend." },
    { "kind": "unsupported", "span": "200 users", "message": "The number “200” doesn't appear in your facts." }
  ],
  "addsNewDetail": true
}
```

- `kind`: `"stronger"`, `"unsupported"`, or `"new-detail"` (true but not in the fact bank; the UI then asks "Is this accurate?").
- `addsNewDetail` drives the "Yes, save it to my facts / Yes, just here / Go back" prompt.
- Deterministic rules run first (same word lists as today). The model is called only to catch what rules cannot, such as a paraphrase that changes scope. Target response under 3 seconds so it can run as the user pauses typing.
- An empty `warnings` array means nothing found, not that the text is verified.

---

## 5. `POST /api/detail-questions`

Follow-up questions during onboarding that draw out specifics the resume leaves out.

**Request**

```json
{ "facts": [ /* Fact[] from parse-resume */ ], "max": 5 }
```

**Response `200`**

```json
{
  "questions": [
    { "id": "Q1", "about": "ClubHub", "targetFactId": "P1", "question": "ClubHub: what did you personally build?" }
  ]
}
```

- Questions are about things that make a resume more concrete: your own role in a team project, scale (how many users), tools actually used, work not listed.
- One question per fact at most. No yes/no questions. Never ask the user to confirm something flattering.

## 5b. `POST /api/extract-fact`

Turns the user's answer to one question into facts.

**Request**

```json
{
  "question": "ClubHub: what did you personally build?",
  "answer": "I owned the backend: the REST endpoints for events and RSVPs. I wasn't the team lead.",
  "targetFactId": "P1",
  "facts": [ /* Fact[] */ ]
}
```

**Response `200`**

```json
{ "facts": [ /* Fact[], origin "user", parentId "P1", ids not colliding with request facts */ ] }
```

Same rule as chat: details restate only what the user said, including limits ("was not the team lead"). Facts are always shown to the user to confirm in the UI before they count.

---

## Test fixtures

The scripted scenario in `client/src/data/demo.ts` (Jordan Lee resume and Lumen Labs posting) is the golden test for endpoint 2. After the real server runs on it, these must hold:

| Check | Expected |
|---|---|
| "Led a team of 4 students" (S-2) | `flag.kind = "stronger"`; `saferText` keeps "owned the backend" |
| "hundreds of riders" (S-7) | `flag.kind = "unsupported"` |
| AWS (R10), Kubernetes (R11) | `base = "none"`; gap `reframe.possible = false` for AWS |
| GitHub PRs vs GitLab merge requests (R5) | not reported as a gap |
| GitHub Actions vs GitLab CI (R8) | `clearer`, resolved by a suggestion that does not claim GitLab |
| Unit tests bullet (S-10) | uses `[number]`, no invented count |
| Every suggestion | `sources` all exist in `facts`; every `op` target exists in `doc` |

## Open questions for the team

1. Backend language and where the routes live (README suggests Node.js + Express).
2. Which model and provider; the API key stays in a server environment variable and never in `client/`.
3. Does the client or the server own `requirements` after analysis (needed for `requirementUpdate` in `/api/chat`)?
4. PDF/DOCX to text: part of endpoint 1 or a separate upload step?
5. Persistence: until the database exists, the client keeps everything in memory and re-sends `facts` and `doc` on each call.
