# Vibe Coding — TODO

## 🔴 Blocker (must work on event day)

### Infrastructure
- [ ] Create Firebase project and Firestore database (test mode)
- [ ] Get Gemini API key from Google AI Studio
- [ ] Fill in `.env.local` with all keys
- [ ] Set `NEXT_PUBLIC_SESSION_ID` to a unique value per event (e.g. `mschools-2026`)
- [ ] Deploy to Vercel and verify all env vars are set in the dashboard
- [ ] Test Firestore real-time sync on two separate devices simultaneously

### Core flow
- [ ] End-to-end test: complete 4-step flow → generation → result page → `/app/[id]`
- [ ] Verify generated HTML renders correctly in the sandboxed iframe
- [ ] Verify QR code on result page opens `/app/[id]` on a real phone
- [ ] Test voice input (step 3 — TASCA) on Chrome/Android tablet
- [ ] Confirm `/screen` updates live when a new submission is created

---

## 🟡 Important (should work on event day)

### UX polish
- [ ] Add a loading skeleton to result page while Firestore fetch completes
- [ ] Add timeout UI: if Gemini takes >20s, show "still generating…" message
- [ ] Add retry button on the error state in `/create` (currently just shows error text)
- [ ] Handle Gemini rate limit errors gracefully (show friendly message)
- [ ] Make step 3 (TASCA) textarea auto-grow as user types
- [ ] Ensure the fixed bottom CTA button doesn't overlap content on small phone screens

### Station management
- [ ] Add station ID selector (1–6) at the start of the flow so the screen can label each card
- [ ] Show station number badge on each card in `/screen`
- [ ] Pre-configure each tablet URL with `?station=N` param to auto-set station ID

### Screen (`/screen`)
- [ ] Test the grid layout with 1, 2, 3, 4, 5, and 6 simultaneous cards
- [ ] Scale iframe previews correctly so they don't overflow their grid cell
- [ ] Add a subtle animation when a new card appears (currently just "NOU" badge)
- [ ] Confirm the screen auto-reconnects if Firebase WebSocket drops

---

## 🟢 Nice to have (if time allows)

### Result page
- [ ] Download button — saves the generated HTML file to disk
- [ ] Copy prompt button — copies the raw prompt text to clipboard
- [ ] Share button — copies the `/app/[id]` URL to clipboard

### Gallery (`/gallery`)
- [ ] Add format filter chips alongside the existing context theme chips
- [ ] Add a search bar (filters by tasca text)
- [ ] Pagination or infinite scroll if many submissions accumulate

### Admin
- [ ] `/admin` page protected by a simple password (env var `ADMIN_PASSWORD`)
- [ ] Button to clear all submissions for the current session (reset between runs)
- [ ] Export all submissions as a ZIP of HTML files
- [ ] Print-friendly QR sheet: one QR per station linking to `/create?station=N`

### Prompt quality
- [ ] Test Gemini output quality for each of the 6 FORMAT types
- [ ] Refine the system prompt if any FORMAT produces poor results
- [ ] Add a `temperature` param to the Gemini call (try 0.9 for more creative output)

### Misc
- [ ] Add a `favicon.ico` and Open Graph image for sharing
- [ ] Add `robots.txt` to block indexing (event-only app)
- [ ] Verify the app works offline-first if the venue WiFi is unreliable (at least the already-loaded iframe)
- [ ] Add a "com funciona" (how it works) tooltip or modal on the home page for first-time users

---

## ✅ Done

- [x] Scaffold Next.js 16 project (TypeScript + Tailwind + App Router)
- [x] Install Firebase, `@google/generative-ai`, `react-qr-code`
- [x] `lib/types.ts` — all option constants and Submission type
- [x] `lib/firebase.ts` — save, get, list, and subscribe (real-time) helpers
- [x] `app/api/generate/route.ts` — Gemini API call + HTML stripping
- [x] `app/page.tsx` — home page
- [x] `app/create/page.tsx` — 4-step form with progress bar, voice input, validation
- [x] `app/result/[id]/page.tsx` — iframe preview + QR code + prompt summary
- [x] `app/app/[id]/page.tsx` — full-screen sandboxed runner
- [x] `app/screen/page.tsx` — live collective display with real-time grid
- [x] `app/gallery/page.tsx` — filterable gallery with mini iframe previews
- [x] `.env.local.example` with all required keys documented
- [x] Clean production build (0 TypeScript errors)
