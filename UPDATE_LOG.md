# Update log — public sales surface (15 November 2026)

**Author of this change:** an AI coding agent — Buffy, running in Codebuff. (Not DeepSeek; the
commit and this note credit the work accurately. If you want different attribution, edit this line
rather than inferring authorship from elsewhere.)

**Why:** the app was strong but unsellable from the outside. There was no price anywhere on the
site, no way to try the product without an account, no public pages for search engines to index,
and the Privacy Policy / DPA / Terms existed only inside `/debug` — next to the internal cost model
and the Educake comparison. A Head of Business evaluating the product had to email to learn the
cost, and a data protection lead had nothing to read. This update adds the missing public surface.

---

## 1. The commercial decision this encodes

**One price: £250 per year, per school.** No free tier, no per-teacher rate, no tier grid.
Every teacher, class and student in the school is included; one invoice, one DPA.

- Sold to the **school**, not to an individual teacher.
- Advertised as annual, invoiced, PO numbers welcome.
- The single source of truth is **`src/lib/pricing.ts`** (`SCHOOL_PRICE`, `INCLUDED`,
  `PRICING_PROMISES`, `CONTACT_EMAIL`). Change the price there — every page reads from it.

Nothing in the code enforces this price (see "Known gaps"), so £250 is currently an offer honoured
by invoice, not a paywall.

---

## 2. New routes

| Route | File | Rendering | What it does |
|---|---|---|---|
| `/demo` | `src/app/demo/page.tsx` | static | Six real bank questions, no sign-up, marked on the server |
| `/pricing` | `src/app/pricing/page.tsx` | static | One £250 school licence, what's included, how schools buy, 7-question FAQ |
| `/topics` | `src/app/topics/page.tsx` | static | The whole specification, Theme 1 and Theme 2 |
| `/topics/1.1` … `/topics/2.5` | `src/app/topics/[topic]/page.tsx` | SSG via `generateStaticParams` | Official sub-topics + focus bullets for each topic |
| `/legal` | `src/app/legal/page.tsx` | static | Renders the existing `LegalDocsSection` publicly |
| `/sitemap.xml` | `src/app/sitemap.ts` | static | 15 URLs (5 pages + 10 topics) |

### Supporting files

- `src/app/api/demo/mark/route.ts` — POST, marks the demo server-side with `markQuestion()` from
  `src/lib/marking.ts`. Answers are stripped before the questions leave the server.
- `src/data/demo.ts` — picks the six demo questions out of the human bank.
- `src/components/marketing/MarketingShell.tsx` — shared header/nav/footer for all public pages.
- `src/components/marketing/DemoQuiz.tsx` — client component; renders inputs per question type,
  POSTs answers, shows per-question marking with explanations and a total.

### Changed files

- `src/components/app/AuthView.tsx` (the landing page) — added the primary CTA "Try a real quiz —
  no sign-up" and "See pricing", the £250 price line, a 245-question proof bullet, and footer links
  to Pricing / All topics / Legal.
- `src/app/layout.tsx` — added `metadataBase: new URL('https://gcse.business')` so canonical URLs
  and the sitemap resolve absolutely.
- `.gitignore` — ignores `server.pid` (written when running the standalone server locally).

---

## 3. Gotchas for the next AI (please read before editing)

1. **Demo question ids are prefixed with the quiz SLUG, not the file's local prefix.**
   `compileQuiz()` re-keys every question as `<slug>:<localId>`, so the cashflow questions are
   `cashflow-breakeven:cb1`, not `cashflow:cb1`. Getting this wrong silently drops questions —
   `DEMO_IDS` filters unresolved ids with `.filter(Boolean)` and the demo shrinks without erroring.
   That bug happened once during this change: the demo served 3 questions instead of 6 while every
   page still returned 200. If you add demo questions, assert the count.
2. **Next.js 16 App Router:** page props are `params: Promise<{ topic: string }>` — you must
   `await params`. Building against the Next 15 synchronous signature will fail.
3. **`next.config.ts` sets `typescript.ignoreBuildErrors: true`.** A green build does *not* mean the
   types are sound. Type-check separately if you touch anything non-trivial.
4. **The product is a single-page app at `/`.** `AuthView.tsx` is the landing page; the rest of the
   app lives behind the session in `HomeApp`. The new pages are real routes alongside it, not views
   inside the SPA — deliberately, so they are indexable and server-rendered.
5. **`/debug` is public and indexable.** It contains the cost model, AI free-tier capacity and a
   named competitor comparison (Educake, £550/yr + VAT). That is fine internally; indexed by Google
   it is a competitor's homework. Protect it before doing outreach.
6. **`LegalDocsSection.tsx` is imported by both `/debug` and `/legal`.** Edit it once; do not fork
   the clauses. Its print mode relies on body classes added by the `/debug` page's inline styles, so
   printing from `/legal` keeps the site chrome. Acceptable, but worth knowing.
7. **`prisma/schema.prisma` is vestigial** (template leftovers: `User`/`Post`). The app stores data
   in Firebase via REST. Do not "fix" the schema thinking it is live.

---

## 4. What was verified, and how

- `bun install --frozen-lockfile` — clean (858 packages).
- `bun run build` — exit 0; `/demo`, `/pricing`, `/topics`, `/legal` prerendered as static;
  `/topics/[topic]` generated all ten paths.
- Production server (`bun .next/standalone/server.js` on 0.0.0.0:3000): `/`, `/demo`, `/pricing`,
  `/topics`, `/topics/1.1`, `/topics/1.3`, `/topics/2.5`, `/legal`, `/sitemap.xml` all HTTP 200.
- `/api/demo/mark` returns exactly **5 of 7** for a scripted attempt with one answer deliberately
  wrong, and accepts `Public Limited Company` (capitals) for a lower-case accepted answer.
- `/demo` payload contains no `"correct":` answer index — answers do not reach the browser.
- `/pricing` renders only £250; no £99/£299/£699 remain anywhere in `src`.

**Not verified:** the quiz was never clicked through in a browser. Inputs, marking and layout are
verified through the API and server HTML only, so a visual/interaction pass is outstanding.

---

## 5. Known gaps (deliberate, not oversights)

- **No entitlements, no payment integration.** Registration is open; every user gets every feature.
  £250 is collected by invoice. If the school doesn't pay, nothing stops them using it.
- **No AQA/OCR bank.** `/pricing` says so plainly and the FAQ tells AQA teachers it isn't for them.
- **No analytics, no cookie banner, no ad tracking** — the Privacy Policy states no tracking, so
  adding any would make the published policy false.
- **No test suite was added.** The repo's `tests/` folder was not touched.

---

## 6. Where the sales material lives

A separate sales kit was written alongside this change but is **not in this repo** (it contains
target lists, a rival's pricing comparison and outreach scripts). It sits in the working workspace
outside the repository. Ask the operator before adding it here, especially if the repo may go public.

---

## 7. R47 — acquisition content (same day)

- **`/topics/[topic]` now publishes two worked questions with answers and explanations per topic**
  (`src/data/topicExamples.ts`, `src/components/marketing/WorkedExample.tsx`). Deliberate: search is
  the only acquisition channel that needs neither an ad budget nor a social account. 2 of 245
  questions are public; the rest stay behind the product. To pull them back, delete the
  worked-example section from `app/topics/[topic]/page.tsx` — nothing else depends on it.
- **FAQPage structured data** on topic pages (the two Q&As) and on `/pricing` (the seven FAQ
  entries), so Google can surface them directly in results.
- **Open Graph / Twitter metadata** on `/`, `/demo`, `/pricing`, `/topics` and `/topics/[id]`, so a
  link shared by a teacher previews properly.
- **`sales/launch-kit.md`** (outside the repo): paste-ready posts for the Edexcel Facebook group,
  Business Educators, X, LinkedIn, TES and cold email, with tagged links and a channel order.

Note for the next AI: the published worked examples are the real bank questions. If the bank
changes, those pages change with it — that is intended, but confirm `examplesForTopic()` still
returns two per topic (it silently returns fewer if a topic has no eligible questions).

## Free one-class tier (R53)

Access is now governed by `teacher.plan` (`'free' | 'school'`, absent = free).

- **Limit:** one class on free, enforced server-side in `POST /api/teacher/classes`
  (402 + `code: 'upgrade_required'`), not just hidden in the UI.
- **AI generation** is school-plan only (`/api/teacher/generate`), because each
  call costs money. Everything else — bank questions, marking, analytics — is free.
- **`GET /api/teacher/plan`** returns plan, class count, limit and upgrade URL.
- **Fulfilment (the single manual step):** `POST /api/owner/plan` with
  `{ email, plan: 'school' | 'free', note }`, gated by the owner cookie from
  `/debug`'s unlock. `GET` on the same route lists every teacher and their plan.
  No payment provider exists; invoicing stays manual by design.
- **Copy:** `/free` (landing), `/upgrade` (payment steps), `/pricing` (free strip
  + payment step section). Step text lives in `PAYMENT_STEPS` in `lib/plan.ts`.
- **Test account:** `qa.freetier@example.com` exists in the database with two
  classes (created while testing the licence switch). Delete it when convenient.

- **Second test account:** `qa.live@example.com` (created during the live walkthrough).
- **Grandfathering:** every teacher account that existed before this change was set to `school` so nobody lost classes they already had.

## 30-day trial (R56)

- New teachers get `trialEndsAt = now + 30 days` at registration. `planOf()`
  returns `trial` while that is in the future, `free` after, `school` always wins.
- During the trial: unlimited classes and AI generation. After it: one class
  (the work keeps working), no AI, new classes blocked with the licence message.
- Owner route now takes `trialDays` to set or end a trial for testing and for
  extending a school's trial: `POST /api/owner/plan { email, trialDays: 0 }`.
- Copy: `/free`, `/upgrade`, `/pricing` and the signup tab all say 30 days, no card.

## First-touch attribution (R58)

- `POST /api/track` counts page views into `meta/traffic` (total, per day, per
  source, per path, plus the last hit). No IP, no user agent, no identifiers.
- `MarketingShell` and `AuthView` mount `TrafficBeacon`, which fires once per
  page per session and records `?ref=` (or the referring host) as first touch.
- `/api/auth/register` stores `signupRef` + `signupReferrer` on the teacher.
- `GET /api/owner/stats` (owner only) returns visits by source/path/day and
  signups by source, which is how a published link gets judged.

## Email delivery, relay and the buy inbox (R47)

- `POST /api/enquiry` mails the owner from `enquiries@gcse.business` (verified in
  Resend) with the teacher as Reply-To, acknowledges the teacher, and stores
  `emailed`/`emailId`/`emailError`/`ackEmailed` on the entry. `GET /api/health`
  reports `email: resend | none` and the contact address.
- `PATCH /api/enquiry?id=` marks a request read (owner only).
- `scripts/relay-enquiries.mjs` + `.github/workflows/enquiry-relay.yml`: every
  five minutes, and on push, send anything the app could not, mark it in both
  database engines, cap retries, skip test domains, and announce every new trial
  signup. Key lives in the repository secret `RESEND_API_KEY`.
- `/debug` renders `EnquiriesSection` (licence requests, delivery badge, reply
  link) and finally mounts `FeedbackSection`.
- Enquiry rate limit is per IP: 20/hour, because a school shares one address.
- `scripts/journey-check.py` and `scripts/marking-check.py` are repeatable checks
  against the deployed site: the full teacher→student→results journey, and a
  perfect paper that must score 100%.
