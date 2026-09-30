# gcsebusiness

**GCSE Business, made simple** — an [Educake](https://www.educake.co.uk)-style homework and quiz platform built for **Edexcel GCSE (9–1) Business (spec 1BS0)**.

Teachers set quizzes in under a minute. Students get instant, accurate marking, automatic feedback and full explanations. Every question is aligned to the official Edexcel topic tree (1.1 – 2.5), written in the style of a human examiner — case studies, diagrams and all.

---

## Features

### For teachers
- **Classes in seconds** — create a class, paste the class list, and every student account is generated automatically with usernames and printable passwords.
- **Three ways to set work** — pick a hand-written quiz from the library, generate fresh questions with AI, or type your own (any of the five question styles).
- **Timed or untimed, with due dates** — a countdown that auto-submits at zero, and late hand-ins are tagged automatically.
- **Smart results layout** — live hand-in progress, class average, topic gaps, hardest questions and full question-level analysis, with CSV export.
- **Integrity watch (anti-cheat)** — while students work, the platform quietly records timing, typing and tab behaviour. Each submission gets a weighted integrity score with a plain-English signal breakdown. Flags are indicators, not proof — the UI says so.
- **Question library preview** — read every question and its explanation before you set it.

### For students
- **Instant deterministic marking** — multiple choice, type-the-term, fill-the-blank, calculations (with rounding tolerances) and true/false. Capitals and stray punctuation never cost marks; spelling does.
- **Automatic feedback** after every attempt, plus full explanations for every question.
- **Practice quizzes** by theme, with unlimited retries and shuffled options.
- **Progress map** — mastery per spec topic, points, best scores.

### The question bank
15 quizzes · 245 questions · 286 marks · every topic 1.1–2.5 covered, in the style of a GCSE examiner:
- Real, verifiable UK business cases (Purplebricks/Strike, Sainsbury's/Argos, Morrisons/McColl's, Kraft/Cadbury, ABF/Primark, Innocent, Ryanair, ASOS, Deliveroo…)
- Fictional small firms with clean, internally consistent numbers for calculations
- Hand-coded SVG diagrams throughout (break-even, share price, cash flow, org charts, market share, average cost curves)
- Shareable class logins — CSV, PDF, copy, print and email sheets from the class page

### The AI chain
Question generation and student feedback run through a fallback chain: **Gemini → Groq → z.ai → the human-written bank**. Numeric questions are double-checked: an independent AI pass re-derives the arithmetic, then a deterministic guard requires the explanation's working to reach the claimed answer. If every provider fails, quizzes are served from the curated bank — students never see an error.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript, single-page app on `/` |
| UI | Tailwind CSS 4, shadcn/ui (New York), light-mode only, mobile bottom-nav |
| Data | Firebase Realtime Database (europe-west1) via REST |
| Auth | HMAC-signed httpOnly cookies, scrypt password hashing |
| Marking | Deterministic, server-side only — answers never reach the browser before submission |
| AI | Gemini → Groq → z-ai-web-dev-sdk (server-side only); human-written bank as final fallback |

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in your keys (see the file for where to get each)
bun run dev                  # http://localhost:3000
```

1. Register a teacher account from the landing page.
2. Create a class → add students (paste names, one per line).
3. Hand out the generated logins.
4. Set your first assignment from **New task**.

## Project structure

```
src/
  app/            page.tsx (SPA) + /api routes (auth, teacher, student, quizzes)
  components/     app views, quiz runner, result screens, SVG charts
  data/
    knowledge.ts  condensed per-topic textbook notes (AI context)
    bank/         the 15 human-authored quizzes
  lib/            marking, risk, AI chain, sessions, firebase client
public/cases/     case-study photography
```

## Notes

- The endorsed textbook is **not** redistributed with this repo (copyright — Hodder Education). Its content informs the condensed topic notes in `src/data/knowledge.ts`.
- Integrity flags are behavioural indicators intended to start conversations, not accusations. Thresholds are deliberately conservative so quick, honest students are rarely penalised.
- Firebase security rules: this project expects open read/write on the database it is given. Point it at a dedicated project, not one holding other data.
