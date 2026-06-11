<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Vibe Coding — mSchools 2026

Educational webapp generator for workshops. Deployed at `mschools-vibecoding.vercel.app`.

## Branches
- `main` — production, always deployable

## User flow (phases) — total 15 min
1. `/` — Home: what the tool is for + privacy disclaimer. Single CTA → Warm-up (no "Crear recurs" on home)
2. `/warmup` — Phase 1 (4 min): Explore one example webapp, guess its prompt. PhaseTimer synced.
3. `/create` — Phase 2 (4 min): Voice-first — read pre-prompt sentence with physical cards, mic transcribes continuously, blanks fill automatically with detected card values. Digital selection available as fallback. PhaseTimer synced.
4. `/result/[id]` — Phase 3 (5 min): Preview app, request improvements ("Millores"), edit full prompt to regenerate. Refinements stored in submission and appended to prompt. PhaseTimer synced.
5. `/ticket/[id]` — Phase 4 (2 min): Enter group name (live preview on right), send to print queue → 🎉 "Has acabat el workshop!". PhaseTimer synced.
6. `/screen` — Facilitator view: phase control + auto-advance toggle, synced timers, live card gallery, print queue panel (Cua/Historial tabs, auto-print toggle, multi-select reprint).
7. `/gallery` — Public gallery of all generated resources.
8. `/guiadocent` — Facilitator guide.
9. `/print/[queueId]` — Thermal receipt page, auto-triggers window.print() on load, closes after print.

## Key files
- `components/PhaseTimer.tsx` — synced timer bar for participant pages. Takes `pagePhase` prop only, reads phase/time from Firestore (`workshop/timer`). Falls back to "Esperant el facilitador..." if not started.
- `lib/workshop-phases.ts` — `WORKSHOP_PHASES` array (single source of truth for phase names, durations, colors) + `getSecondsLeft()` helper
- `lib/firebase.ts` — `saveSubmission`, `getSubmission`, `updateSubmission`, `subscribeSubmissions`, `subscribeWorkshopTimer`, `updateWorkshopTimer`, `addToPrintQueue`, `updatePrintQueueItem`, `getPrintQueueItem`, `subscribePrintQueue`
- `lib/types.ts` — `Submission` (includes `refinements?: string[]`), `WorkshopTimer`, `PrintQueueItem` types
- `lib/card-context.ts` — rich descriptions injected into Gemini prompt. Source file `cards-context.md` is gitignored. Cards: 3 users (Docents/Alumnes/Famílies), 12 actions, 9 styles.
- `app/api/generate/route.ts` — main generation. Accepts `rawPrompt` to bypass card-based prompt building. Multi-model cascade × 6 rounds. `maxDuration = 240`.
- `app/api/refine/route.ts` — refinement/improvement of existing HTML. Same cascade. `maxDuration = 240`.

## CSS design system
Always use CSS variables, never hardcode colors:
`var(--bg)`, `var(--heading)`, `var(--border)`, `var(--muted)`, `var(--accent)`, `var(--body)`

## Synchronized timer
- Firestore document: `workshop/timer` — type `WorkshopTimer`
- Timer state model: `startedAt` (ms) + `secondsAtStart` + `running` (no per-second writes)
- Facilitator controls on `/screen`: phase selector, start/pause/resume/reset → writes to Firestore
- Participants subscribe via `subscribeWorkshopTimer` → tick locally every 500ms
- Auto-advance: timer reaching 0 triggers next phase after 1.5s delay. "Auto" toggle disables it.
- "Inicia el taller" button starts Phase 1 in Firestore immediately.

## Behaviour notes
- `pairName` / group name is entered at the END (ticket page) via `updateSubmission`, not at the start
- When regenerating from edited prompt: `promptPreview: submission.tasca` must be passed to preserve the Pre-Prompt badge display
- Screen page uses `allSessions=true` so it shows all submissions regardless of sessionId
- Session ID: `process.env.NEXT_PUBLIC_SESSION_ID` (default `'mschools-2026'`)
- Facilitator password: `mschools2026` (stored in sessionStorage, cleared on tab close)
- Print queue status lifecycle: `pending` → `printing` → `printed` / `error`
