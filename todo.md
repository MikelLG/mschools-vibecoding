# Vibe Coding — TODO

---

## 🔴 Blockers (must work on event day)

### Deploy
- [ ] Fix git push (check branch name with `git branch`) and push to MikelLG/mschools-vibecoding
- [ ] Deploy to Vercel → set all env vars in dashboard
- [ ] Test full flow on Vercel URL from a phone

### Core flow (redesign needed)
- [ ] Redesign `/create` with 5 card groups (Eixos, Persona, Repte, Estil, Restriccions) replacing the current 4 steps
- [ ] Add **live prompt preview panel** — always visible as users select cards, showing the pre-prompt sentence being assembled
- [ ] Voice transcription step — mic button records the full pre-prompt sentence, speech-to-text fills the field
- [ ] Build `/ticket/[id]` — printable page with QR + full prompt (use `window.print()`)
- [ ] Add **iteration UI** on result page — editable prompt textarea + "Regenerar" button (one iteration allowed)
- [ ] Gallery cards must show QR code

### Infrastructure
- [x] Firebase project + Firestore database created
- [x] Gemini API key set
- [x] `.env.local` filled in
- [ ] Set `NEXT_PUBLIC_SESSION_ID` per event
- [ ] Test Firestore real-time sync on two devices

---

## 🟡 Important (should work on event day)

### Workshop phases (new pages)
- [ ] `/intro` — landing for workshop: what is Vibe Coding, strengths/weaknesses of AI, phases overview
- [ ] `/warmup` — show 2 example webapps embedded in iframes; participants reverse-engineer the prompt
- [ ] Home page redesign to reflect the phased flow (Intro → Warm-up → Create → Result)

### Prompt preview
- [ ] Prompt preview updates live as each card group is selected
- [ ] Show which parts of the prompt are still missing (greyed out placeholders)
- [ ] On the generating screen, show the full assembled prompt that was sent to Gemini

### Iteration
- [ ] After first generation, show editable prompt in a textarea
- [ ] "Regenerar" button triggers a second generation with the edited prompt
- [ ] Disable regeneration after first iteration (visual indicator)
- [ ] Keep both versions (original + iterated) accessible

### Ticket (`/ticket/[id]`)
- [ ] Large QR code (scannable from 1m distance)
- [ ] Full prompt text displayed below
- [ ] Pair name at the top
- [ ] `window.print()` triggers clean print layout (hide nav, full width)
- [ ] Link from result page: "Imprimir ticket"

### Screen (`/screen`)
- [ ] Each card shows QR code (small, scannable)
- [ ] Test grid with 1–6 cards simultaneously
- [ ] Confirm auto-reconnects if Firebase drops

---

## 🟢 Nice to have (if time allows)

### 5 card groups content
- [ ] Define full list of cards for each group (Eixos, Persona, Repte, Estil, Restriccions)
- [ ] Map each card selection to its prompt sentence fragment
- [ ] Consider custom card descriptions per combination (e.g. Eixos=Matemàtiques + Persona=Alumne 6è → specific pre-prompt)

### UX polish
- [ ] Timeout UI: if Gemini takes >20s, show "Encara generant…" with progress dots
- [ ] Retry button on error state
- [ ] Auto-grow textarea on voice transcription step
- [ ] Haptic feedback on mobile when a card is selected

### Gallery
- [ ] QR code on each gallery card (small)
- [ ] Filter by card group (Eixos, Persona, etc.)
- [ ] Search by prompt text

### Admin
- [ ] `/admin` — password protected (env var `ADMIN_PASSWORD`)
- [ ] Reset session button
- [ ] Export all submissions as ZIP

### Prompt quality
- [ ] Test all 6 format types (quiz, activitat, rúbrica, formulari, joc, suport)
- [ ] Refine format-specific instructions in `buildPrompt()` based on test results
- [ ] Add `temperature: 1.0` for more creative outputs

---

## ✅ Done

- [x] Next.js 16 scaffold (TypeScript + Tailwind + App Router)
- [x] Firebase + Gemini + react-qr-code installed
- [x] `lib/types.ts` — option constants and Submission type
- [x] `lib/firebase.ts` — save, get, list, subscribe helpers
- [x] `app/api/generate/route.ts` — Gemini call with rich format-specific prompt
- [x] `app/page.tsx` — home page
- [x] `app/create/page.tsx` — 4-step flow (to be redesigned to 5 card groups)
- [x] `app/result/[id]/page.tsx` — iframe preview + QR + prompt summary
- [x] `app/app/[id]/page.tsx` — full-screen sandboxed runner
- [x] `app/screen/page.tsx` — live collective 75" display
- [x] `app/gallery/page.tsx` — filterable gallery
- [x] `.env.local` filled with real Firebase + Gemini keys
- [x] End-to-end test on localhost: all 4 steps → generation → result ✅
- [x] `/screen` shows new submissions in real time ✅
- [x] Gemini prompt improved with format-specific instructions
- [x] `--hostname 0.0.0.0` added to dev script for network access
