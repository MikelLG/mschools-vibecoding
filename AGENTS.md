<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Vibe Coding — mSchools 2026

Educational webapp generator for workshops. Deployed at `mschools-vibecoding.vercel.app`.

## User flow (phases)
1. `/` — Home: overview of what the tool is for + privacy disclaimer. CTA → Warm-up
2. `/warmup` — Phase 1 (5 min): Explore a single example webapp, guess its prompt
3. `/create` — Phase 2 (8 min): Build a prompt by selecting 5 cards (Eix, Usuari, Repte, Acció, Estil) + optional extra context
4. `/result/[id]` — Phase 3 (5 min): Iterate — refine the app, edit the full prompt to regenerate, and optionally add a group name
5. `/screen` — Facilitator view: two big countdown timers (Workshop total + Current phase) + live gallery of all submissions
6. `/gallery` — Public gallery of all generated resources

## Key conventions
- Phase timers: `components/PhaseTimer.tsx` — used in warmup, create, result pages
- CSS design system: `var(--bg)`, `var(--heading)`, `var(--border)`, `var(--muted)`, `var(--accent)`, `var(--body)` — always use these, never hardcode dark colors
- Gemini model cascade: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` (retries on 503/429/quota errors)
- Firebase Firestore: `lib/firebase.ts` — `saveSubmission`, `getSubmission`, `updateSubmission`, `subscribeSubmissions`
- `pairName` / group name is entered at the END of the flow (result page), not at the start
- The result page shows the full prompt as an editable textarea; if edited, a "Regenerar" button appears that calls `/api/generate` with `rawPrompt`
- `/api/generate` accepts optional `rawPrompt` — if provided, bypasses `buildPrompt` and uses it directly
- `maxDuration = 240` on both generate and refine routes (Vercel serverless limit for long Gemini calls)
- Rich card context is in `lib/card-context.ts` (not committed: `cards-context.md`)
- Session ID: `process.env.NEXT_PUBLIC_SESSION_ID` (default `'mschools-2026'`)
- Screen page shows ALL submissions (`allSessions=true`) regardless of sessionId
