<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Vibe Coding — mSchools 2026

Educational webapp generator for workshops. Deployed at `mschools-vibecoding.vercel.app`.

## Branches
- `main` — production, always deployable
- `feature/sync-timers` — synchronized Firestore-backed phase timers (ready, pending Firestore rules check before merging)

## User flow (phases)
1. `/` — Home: what the tool is for + privacy disclaimer. Single CTA → Warm-up (no "Crear recurs" on home)
2. `/warmup` — Phase 1 (5 min): Explore one example webapp, guess its prompt. PhaseTimer synced.
3. `/create` — Phase 2 (8 min): Select 5 cards (Eix, Usuari, Repte, Acció, Estil) + optional extra context. PhaseTimer synced. Group name removed from here.
4. `/result/[id]` — Phase 3 (5 min): Preview app, refine with text/voice, edit full prompt to regenerate, add group name at the end. PhaseTimer synced.
5. `/screen` — Facilitator view: phase control panel (Firestore-backed, controls participant timers), workshop total timer (local), live card gallery.
6. `/gallery` — Public gallery of all generated resources.

## Key files
- `components/PhaseTimer.tsx` — synced timer bar for participant pages. Takes `pagePhase` prop only, reads phase/time from Firestore (`workshop/timer`). Falls back to "Esperant el facilitador..." if not started.
- `lib/workshop-phases.ts` — `WORKSHOP_PHASES` array (single source of truth for phase names, durations, colors) + `getSecondsLeft()` helper
- `lib/firebase.ts` — `saveSubmission`, `getSubmission`, `updateSubmission`, `subscribeSubmissions`, `subscribeWorkshopTimer`, `updateWorkshopTimer`, `DEFAULT_TIMER`
- `lib/types.ts` — `Submission`, `WorkshopTimer` types
- `lib/card-context.ts` — rich descriptions injected into Gemini prompt (EIX_CONTEXT, USUARI_CONTEXT, REPTE_CONTEXT, ACCIO_CONTEXT, ESTIL_CONTEXT). Source file `cards-context.md` is gitignored.
- `app/api/generate/route.ts` — main generation. Accepts `rawPrompt` to bypass card-based prompt building. 6-model cascade × 6 rounds.
- `app/api/refine/route.ts` — refinement/improvement of existing HTML. Same cascade.

## CSS design system
Always use CSS variables, never hardcode colors:
`var(--bg)`, `var(--heading)`, `var(--border)`, `var(--muted)`, `var(--accent)`, `var(--body)`

## Gemini model cascade (both routes)
```
gemini-2.5-flash → gemini-2.5-pro → gemini-2.0-flash-lite → gemini-1.5-flash → gemini-1.5-flash-8b → gemini-1.5-pro
```
- 6 models × 6 rounds = 36 attempts before giving up
- 1.5s pause between model hops, 5s pause between rounds
- 404 / "no longer available" / "deprecated" / 429 / 503 all treated as retryable (skip to next model)
- UI auto-retries up to 10 times with 10s countdown before showing a manual error

## Synchronized timer (feature/sync-timers)
- Firestore document: `workshop/timer` — type `WorkshopTimer`
- Timer state model: `startedAt` (ms) + `secondsAtStart` + `running` (no per-second writes)
- Facilitator controls on `/screen`: phase selector, start/pause/resume/reset → writes to Firestore
- Participants subscribe via `subscribeWorkshopTimer` → tick locally every 500ms
- **Before merging**: verify Firestore security rules allow read/write on `workshop` collection

## Behaviour notes
- `pairName` / group name is entered at the END (result page) via `updateSubmission`, not at the start
- When regenerating from edited prompt: `promptPreview: submission.tasca` must be passed to preserve the Pre-Prompt badge display
- Screen page uses `allSessions=true` so it shows all submissions regardless of sessionId
- `maxDuration = 240` on both API routes (Vercel serverless limit)
- Session ID: `process.env.NEXT_PUBLIC_SESSION_ID` (default `'mschools-2026'`)
