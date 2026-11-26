# ResumeLens Visual Rules (soft neo-brutalism)

Five rules. The theme tokens live in `client/tailwind.config.js`; shared components are in `client/src/components/ui.tsx`.

## 1. Loud chrome, calm content
- **Full style:** home/profile, onboarding, buttons, review cards, gap screens.
- **Calm:** the resume (`ResumePaper.tsx`) is a plain white document with a thin gray border, serif type and only subtle highlights, so it looks the way it will when exported.

## 2. The shadow means "you can press this"
- Only interactive elements get the hard offset shadow (`PRESSABLE` in `ui.tsx`): buttons, gap options, chat quick replies, the Required / Nice-to-have toggles on the requirements check, and the review card that is waiting for a decision.
- Static surfaces (`Card`, banners, toasts, modals, the resume) are flat.
- **An accepted or skipped card loses its shadow and goes flat** on the cream background, with a status strip and Undo. Raised = needs you; flat = done.

## 3. Status colors are for status only
| Token | Meaning | Always shown with |
|---|---|---|
| `found` (green) | On resume / applied | ● + "On resume" |
| `partial` (amber) | Could be clearer | ◐ + "Could be clearer" |
| `bank` (aqua) | In your fact bank, not on this resume | ◆ + "In your bank" |
| dashed paper | No evidence yet | ○ + "No evidence yet" |

Decorative accents come from a separate range: `accent` (purple) and `blue`. Primary buttons, selection, the tailoring bar and chat use these, never the status colors.

## 4. One signature treatment for flags
`FlagBanner` is a 4px red border with a red header strip ("⚑ Stronger than your facts"). It's used **only when an AI suggestion goes further than your facts** (and for lines you kept anyway, on the Summary). **`flag` red appears nowhere else.**

Follow-up checks are calm questions, not alarms (dashed outline, no red):
- "Could you explain this in an interview?" after accepting a flagged suggestion. The red flag above already says why.
- "Is this accurate?" when **your own** edit adds something not in your fact bank, with **Yes, save it to my facts** / **Yes, just here** / **Go back**. You're the author there, so it shouldn't read like an accusation.

The same calm dashed box is used when a job link can't be read ("LinkedIn doesn't let us read postings directly…"). It's the site's limit, not the user's mistake, so there's no error styling.

## 5. Soft, not aggressive
Rounded corners (6–18px), 2px borders, an off-white `paper` surface on a `cream` page. Gap copy leads with what's normal ("That's common for a nice-to-have") because reading requirements made P4 feel unqualified.

## Mapping to the class UI principles (for the Phase 3 report)
- **Visibility of system status:** step-by-step parsing, posting reading and analysis; raised vs. flat review cards; progress bar.
- **Error prevention & recovery:** extracted requirements are checked before analysis; a link that can't be read falls back to paste in place, keeping the link; Undo on every decision.
- **User control:** "Skip for now" on optional steps; nothing reaches the resume without a decision.
- **Consistency:** one status palette, one flag treatment, one meaning for shadows.
- **Feedback & affordances:** pressable things look and act pressable (shadow sinks on press).
- **Accessibility:** status is never color alone (icon + label); visible focus ring; keyboard shortcuts.
- **Simplicity:** the calm document panel keeps attention on content, not decoration.
