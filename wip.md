# Vibe Coding — Work in Progress

## What this is

A live event app for **mSchools Awards 2026**. Pairs of teachers go through a 4-step prompt-building flow, Gemini generates a self-contained HTML educational mini-app, and the result appears on a shared 75" screen in real time.

Inspired by: https://prompt-webapp-generator.vercel.app/

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Gemini 2.0 Flash** — generates the HTML mini-app
- **Firebase Firestore** — real-time sync across all stations and the collective screen
- **react-qr-code** — QR on result page so attendees can scan and use the app on their phone

---

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Landing page |
| `/create` | `app/create/page.tsx` | 4-step creation flow |
| `/api/generate` | `app/api/generate/route.ts` | Server-side Gemini call |
| `/result/[id]` | `app/result/[id]/page.tsx` | Output + QR code |
| `/app/[id]` | `app/app/[id]/page.tsx` | Full-screen mini-app runner |
| `/screen` | `app/screen/page.tsx` | Live collective display (75" screen) |
| `/gallery` | `app/gallery/page.tsx` | All generated resources, filterable |

---

## The 4 steps

1. **ROL** — Teacher profile (tutor, primary, ESO, coordinator, specialist, management)
2. **CONTEXT** — Educational theme (families, classroom, inclusion, assessment, wellbeing, organisation)
3. **TASCA** — Free-text challenge description (with voice input via Web Speech API)
4. **FORMAT** — Output type (quiz, activity, rubric, form, game, support material)

---

## Setup needed before running

1. Copy `.env.local.example` → `.env.local` and fill in:
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com)
   - `NEXT_PUBLIC_FIREBASE_*` — from Firebase Console → Project settings → Your apps
   - `NEXT_PUBLIC_SESSION_ID` — unique string per event (e.g. `mschools-2026`)

2. Create a **Firestore database** in Firebase Console (test mode is fine for the event day).

3. Run:
   ```
   npm run dev
   ```

---

## Pending / ideas

- [ ] Admin page to reset the session or export all generated apps
- [ ] Station ID per tablet (so the screen can show which station generated what)
- [ ] Timeout/retry UI if Gemini takes too long
- [ ] Download button for the generated HTML file on the result page
- [ ] Print-friendly QR sheet for each station
- [ ] Deploy to Vercel before the event day
