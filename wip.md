# Vibe Coding — Work in Progress

## What this is

A live workshop app for **mSchools Awards 2026**. Pairs of teachers build a prompt using physical cards on a table, then transcribe it by voice, Gemini generates a self-contained HTML educational mini-app, they iterate once, and receive a printed ticket with a QR code and the full prompt.

Everything is in **Catalan**.

Reference prototype: https://prompt-webapp-generator.vercel.app/

---

## Workshop flow (from design diagrams)

```
Intro → Warm-up → Pre-prompt construction → Generate → Iterate → Final app → Ticket (QR + prompt)
```

### Phase 1 — Intro vibe coding
A landing page that explains:
- Què és el Vibe Coding?
- Fortaleses i debilitats de la IA
- A qui va adreçada aquesta activitat
- Les etapes del taller

### Phase 2 — Warm-up (5 min)
Show 1–2 example webapps. Participants explore them and try to **reverse-engineer** what the pre-prompt was. Goal: understand the connection between prompt and output.

### Phase 3 — Pre-prompt construction (10 min)
Two modes (analog path is the primary one for the workshop):

**Analògic (primary):**
Participants work with **5 groups of physical cards** on the table:
1. **Eixos** — Thematic axis / subject area
2. **Persona (Usuari)** — Who will use the app (student, teacher, family…)
3. **Repte (Context)** — The challenge or educational problem to solve
4. **Estil i accessibilitat** — Visual style, tone, accessibility needs
5. **Restriccions** — Technical or content restrictions

Each card group maps to a sentence fragment of the **pre-prompt**. Once all 5 cards are chosen and arranged on the table, the full pre-prompt sentence is assembled.

Participants then **dictate the sentence by microphone** → speech-to-text transcribes it → they can edit it on screen before sending to Gemini.

**Puro digital (secondary):**
Same 5 groups but selected digitally on the tablet. The prompt preview is always visible and updates live as options are selected.

### Phase 4 — Pre-prompt → Prompt
The AI (Gemini) takes the assembled pre-prompt and **completes it into a full technical prompt**, adding expected output descriptions and educational context specific to each user profile.

### Phase 5 — Webapp generation
Gemini generates a self-contained HTML mini-app based on the full prompt.

### Phase 6 — Iteració
The generated webapp appears on screen alongside the **full prompt in an editable text area**. Participants can:
- Edit the prompt text directly (keyboard)
- Click "Regenerar" to generate a new version (one iteration allowed)

The prompt is always visible at this stage.

### Phase 7 — Final app + Ticket
- Final webapp displayed
- **Printed ticket**: QR code linking to the webapp URL + the full prompt text
- QR also appears in the gallery

---

## Key UX requirements

1. **Sempre en català** — all UI text, generated content, and prompts in Catalan
2. **Prompt always visible** — users must see the prompt being built at every step, so they understand what the app is constructing
3. **Physical cards → mic → screen** — the analog flow is primary; voice transcription is the bridge
4. **One iteration** — after generation, users can edit the prompt and regenerate once
5. **QR + prompt ticket** — printable output with QR linking to the webapp + the full prompt text
6. **Gallery shows QR codes** — each gallery card includes its QR

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Gemini 2.5 Flash** — generates the HTML mini-app
- **Firebase Firestore** — real-time sync across all stations and the collective screen
- **react-qr-code** — QR codes on result, ticket, and gallery
- **Web Speech API** — voice transcription (Chrome/Android)

---

## Current routes (to be refactored)

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | ✅ Built — needs redesign for workshop phases |
| `/create` | `app/create/page.tsx` | ⚠️ Built as 4 steps — needs 5-card + prompt preview redesign |
| `/api/generate` | `app/api/generate/route.ts` | ✅ Built — prompt improved |
| `/result/[id]` | `app/result/[id]/page.tsx` | ⚠️ Built — needs iteration UI |
| `/app/[id]` | `app/app/[id]/page.tsx` | ✅ Built |
| `/screen` | `app/screen/page.tsx` | ✅ Built |
| `/gallery` | `app/gallery/page.tsx` | ⚠️ Built — needs QR on cards |
| `/ticket/[id]` | not built | 🔴 Needed — printable QR + prompt |

---

## Routes to add

| Route | Purpose |
|---|---|
| `/intro` | Workshop intro page (what is Vibe Coding, phases) |
| `/warmup` | Warm-up: show example apps to reverse-engineer |
| `/ticket/[id]` | Printable ticket: QR + full prompt |

---

## 5 card groups (new prompt structure)

Replaces the current 4-step flow. Each group = one sentence fragment in the pre-prompt.

| Group | Cards (examples) | Prompt fragment |
|---|---|---|
| Eixos | Matemàtiques, Llengua, SEL, Ciències... | "Per a l'àrea de [X]..." |
| Persona | Alumne 6è, Família, Docent, Grup classe... | "dirigit a [X]..." |
| Repte | Autoavaluació, Comunicació, Resolució de conflictes... | "que necessita [X]..." |
| Estil | Visual, Lúdic, Formal, Accessible, Multilingüe... | "amb un estil [X]..." |
| Restriccions | Sense internet, Només text, Temps limitat, Senzill... | "i que [X]..." |

---

## Environment variables

```
GEMINI_API_KEY=                         # Google AI Studio
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=        # mschools-vibecoding
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SESSION_ID=mschools-2026
```

---

## Deployment

- **Platform**: Vercel (GitHub repo: MikelLG/mschools-vibecoding)
- **Serverless timeout**: 60s max on Hobby plan — sufficient for Gemini 2.5 Flash
- **Font**: avoid `next/font/google` in dev — causes 403 on network IP access
