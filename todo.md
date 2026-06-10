# Vibe Coding — TODO

---

## 🔴 Must do before workshop

- [ ] **Test with concurrent users** — simulate 20 people generating at once
  - Confirm model cascade + auto-retry handles the load
  - Check Gemini API quota settings in Google Cloud Console

- [ ] **Confirm warm-up example app**
  - Currently showing: "Emocions a l'aula" quiz
  - Replace with the final example before workshop day

---

## 🟡 Important improvements

- [ ] **mSchools logo files** — replace text-based `MSchoolsLogo` with official SVG
  - Files not yet provided; component uses `#00e082` box + "Schools" text for now

- [ ] **Gallery QR codes** — add small QR to each gallery card

- [ ] **Test `/app/[id]`** — confirm full-screen sandboxed runner works for all generated formats

---

## 🟢 Nice to have

- [ ] **Admin panel** — reset session / clear all submissions / export ZIP

- [ ] **Refine auto-retry UI** — same countdown/auto-retry as generate (only in create page now)

- [ ] **Gallery filters** — by Eix, by format, by group name

- [ ] **Screen projector mode** — hide card gallery, show only the phase timer

---

## ✅ Done

- [x] Firestore rules confirmed OK (wildcard rule covers `workshop` until July 2026)
- [x] Merged `feature/sync-timers` → `main`, pushed to Vercel

### This session (2026-06-09)
- [x] Phase 4 "Publica i imprimeix" added to WORKSHOP_PHASES (2 min, red)
- [x] Final timings: 4+4+5+2 = 15 min total
- [x] `/ticket/[id]` page — thermal CK710 format (80mm), QR, group name, pre-prompt, 5 card badges, print button
- [x] Result page: "🎫 Imprimir tiquet del grup" button → `/ticket/[id]`
- [x] `/screen` login gate — password via `NEXT_PUBLIC_FACILITATOR_PASSWORD`, sessionStorage auth
- [x] Create page: voice-first flow — pre-prompt template with blanks, big mic button, transcript → generate
- [x] Digital card picker collapsed behind "Selecció digital" toggle
- [x] Card definitions updated to match physical Miro cards:
  - Usuari: Docents / Alumnes / Famílies (removed Equip del centre)
  - Reptes Docents: +Planificació de situacions d'aprenentatge, removed Preparació/Benestar
  - Reptes Famílies: +Seguiment del procés, +Complementar des de casa, Omplir→Emplenar
  - Accions: full new set of 12 cards
  - Estils: 9 cards (Creatiu/artístic, Ludificat, Interactiu, Narratiu per passos)

### Previous session (2026-06-08)
- [x] `/guiadocent` — full teacher's guide page (mSchools style)
- [x] mSchools branding — `MSchoolsLogo` component, `#00e082` green + `#5e2440` aubergine CSS vars
- [x] Logo in all page headers (home, warmup, create, result)
- [x] Phase timings: 4+4+7 = 15 min (then updated to 4+4+5+2 = 15 min with phase 4)
- [x] Warm-up: two-column layout, left sidebar + 85vh iframe, scrollable

### Core flow
- [x] Voice-first create: read pre-prompt aloud → transcript → generate
- [x] 5-card digital fallback (hidden toggle)
- [x] Live prompt preview bar
- [x] Extra context field (voice + text)
- [x] Group name at END of flow (result page)
- [x] Generating screen with prompt preview + auto-retry countdown

### Generation & AI
- [x] Gemini cascade: 6 models × 6 rounds = 36 attempts
- [x] 404 / deprecated / 429 / 503 all retryable
- [x] UI auto-retry: 10 × 10s countdown
- [x] `rawPrompt` bypass for direct prompt editing
- [x] Pre-Prompt preserved when regenerating from edited full prompt

### Pages
- [x] Home: disclaimer, single CTA → Warm-up
- [x] Warm-up: example app, reveal mechanic, phase timer
- [x] Create: voice-first, digital fallback, phase timer
- [x] Result: iframe, QR, refine panel, editable prompt, group name, ticket button
- [x] Ticket: thermal print (CK710 80mm), QR, cards, pre-prompt
- [x] Screen: login gate, phase controls, workshop timer, live gallery
- [x] Gallery: all submissions
- [x] Guia docent: full teacher guide

### Infrastructure
- [x] Firebase Firestore (submissions + workshop timer)
- [x] Gemini API with billing
- [x] Vercel deploy at `mschools-vibecoding.vercel.app`
- [x] `maxDuration = 240`, session ID env var
- [x] Firestore-backed synced timers on `feature/sync-timers` branch

---

#### PREGUNTES:

1. ~~Al final el tema tiquets si que es fará o no?~~ ✅ Fet
2. ~~La organització dels timings será 4/4/5/5?~~ ✅ 4+4+5+2 = 15 min
3. Quina app volem enseñar com a exemple de warm-up?
4. ~~Tema veure el warmup gran i visualitzar correctament.~~ ✅ Fet (2-col layout)
5. ~~Com volem la part de crear el prompt?~~ ✅ Veu principal + selecció digital oculta
6. Do we want the timer to work automatically? I mean, when we press start workshop it keeps running the different sections with the specified time. ??
