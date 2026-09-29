# HGSBusiness — Project Worklog

## Project Overview
Full replica of Educake for **Edexcel GCSE (9-1) Business** (spec 1BS0), named **HGSBusiness**.
- Stack: Next.js 16 (App Router, port 3000 only, single `/` route SPA), TypeScript, Tailwind 4, shadcn/ui, Zustand.
- Data store: **Firebase Realtime Database** (europe-west1, Belgium) via REST API (confirmed open rules: read/write/delete all HTTP 200).
- AI chain (fallback order): Gemini API → Groq API → z.ai (z-ai-web-dev-sdk). Final fallback for question generation: curated human-authored question bank.
- AI status from sandbox: Gemini blocked by location (HTTP 400 "User location is not supported") — stays in chain for other deployments; Groq key 403 (dead) — stays in chain; z.ai works.
- GitHub repo for final push: https://github.com/rninej/gcse-business-hgs (PAT provided by user, burner account).
- Textbook: extracted at /home/z/my-project/upload/textbook.txt (17,212 lines, pdftotext -layout). Full topic tree captured (Theme 1: 1.1–1.5, Theme 2: 2.1–2.5, Hodder Education, Ian Marcousé 2nd ed).

## Feature Checklist (target)
- [x] Teacher accounts (register/login), class creation, bulk student account creation w/ auto credentials
- [x] Student login; assignments (timed or not; due dates)
- [x] Assignment content modes: pre-made library quiz / AI-generated (topic+type+difficulty selection) / teacher custom typed questions / preset mixes
- [x] Question types: MCQ (4 options), type-the-term, fill-in-the-blank (one word), numeric (with tolerance, e.g. % calcs), true/false
- [x] Case study extracts (Educake style), SVG diagrams, case images
- [x] Deterministic server-side marking (never sends answers to client pre-submission)
- [x] Anti-cheat telemetry (secret): per-question time, keystrokes vs answer length, paste/copy events w/ pasted text capture, tab switches, blur, rapid-answer streaks, hidden-time ratio → weighted risk score 0–100 with band + signal breakdown for teachers
- [x] Teacher results: smart layout — per-student scores, risk meter bars, topic mastery, question difficulty analysis, class stats, live polling, CSV export
- [x] Student results: score, stats, per-question review with explanations, auto feedback (AI w/ template fallback), points
- [x] Self-study practice by theme/topic, mastery tracking
- [x] Pre-made quiz bank (Educake-level, human-authored from textbook)

## Architecture
```
src/lib:      types.ts topics.ts firebase.ts session.ts passwords.ts ai.ts marking.ts risk.ts ids.ts bankindex.ts
src/data:     knowledge/*.ts (per-topic condensed textbook notes — AI context)
              bank/*.ts (pre-made quizzes; quizzes reference case studies inline)
src/app/api:  auth/*, teacher/*, student/*, quizzes, health
src/components: app/* (SPA views), quiz/* (runner+results), charts/* (SVG diagrams + meters), shared/*
Session: HMAC-signed cookie `hgs_sess` (httpOnly). Passwords: scrypt.
Firebase paths: hgs/teachers, hgs/classes, hgs/students, hgs/assignments, hgs/attempts (all keyed by uuid)
```

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Project exploration + connectivity tests + textbook extraction

Work Log:
- Explored project: Next.js 16 scaffold, all shadcn/ui components present, dev server already running on :3000 (bun), git repo on main with no remote.
- Tested Firebase RTDB: GET/PUT/DELETE all HTTP 200 (open rules). DB empty.
- Tested Gemini: 2.5-flash → 404 (deprecated for new users); 3.8-flash → 400 location not supported. Key valid, blocked from sandbox region.
- Tested Groq: 403 Forbidden on /models and /chat/completions (key dead). Chain will skip.
- Extracted textbook with pdftotext -layout → /home/z/my-project/upload/textbook.txt (1.4MB, 17,212 lines). Captured full contents tree (Topics 1.1–1.5, 2.1–2.5 with all 54 numbered units).

Stage Summary:
- Environment verified. Firebase RTDB confirmed as primary datastore. AI fallback chain order set: Gemini → Groq → z.ai → curated bank. Next: core libs (Task 2).

---
Task ID: 2, 3, 4
Agent: Z.ai Code (main)
Task: Core libraries, API routes, exemplar banks, full frontend SPA

Work Log:
- src/lib: types.ts (domain model), topics.ts (spec taxonomy), firebase.ts (RTDB REST client), passwords.ts (scrypt + credential gen), session.ts (HMAC cookies), ai.ts (Gemini→Groq→z.ai chain + feedback templates), marking.ts (deterministic marking + numeric parsing), risk.ts (integrity scoring), questions.ts (AI generation + validation + arithmetic cross-check + bank fallback), sanitize.ts, bank.ts (quiz compiler), store.ts (zustand SPA router), api.ts (client fetch).
- src/data: knowledge.ts (per-topic condensed textbook notes — AI context); bank/growth.ts (22 Q, real cases: Purplebricks/Strike £1 sale, Biscuiteers, ABF/Primark, Sainsbury's/Argos, Dough House); bank/finance.ts (16 Q, break-even/margins/ROCE with Dough House consistent numbers).
- API routes: auth (register/login/logout/me), teacher (classes CRUD, bulk student creation with credential sheet, assignments CRUD+create, results analytics with risk, AI generate preview, library preview), student (overview, assignments, start, attempt get/submit with marking+risk+feedback, practice), quizzes, health.
- Frontend SPA on `/`: AuthView (teacher register/login, student login), AppShell (desktop sidebar + mobile bottom nav + sticky footer, dark mode), TeacherHome, ClassesView (bulk add + printable credentials), AssignmentsView, NewAssignment 3-step wizard (library/AI/custom), ResultsView (score rings, integrity tab with RiskMeter+signals, topic+question analysis, CSV, live polling), LibraryView, StudentHome, PracticeView, StudentHistory, QuizRunner (timer, extracts, diagrams, palette, autosave, silent telemetry via RunStore class), ResultScreen (score ring, feedback, review with explanations).
- Theme: emerald/amber palette (no blue/indigo), dark mode, sticky footer, a11y (roles, aria, sr-only live regions), scroll-slim lists.
- Lint passes with 0 errors (react-hooks/immutability satisfied via module-scope RunStore class).

Stage Summary:
- Full stack working end-to-end against Firebase RTDB. Pre-made bank currently registers 2 quizzes (growth, finance); bank/index.ts lists DEFS — new bank files from subagents get wired there by the main agent only.
- Diagram keys available in src/components/charts.tsx: breakeven (Dough House: price £2.50, VC £1.00, FC £4,500/mo, BE 3,000, current 4,200, MoS 1,200), plc, cashflow (Rise & Shine: inflows 9.0/8.5/10.5/9.5/11.0/10.0, outflows 10.5/8.0/9.0/9.5/10.5/9.5, closing 0.5/1.0/2.5/2.5/3.0/3.5, £000s Jan–Jun), orgchart (Fernfield Foods: MD → Ops/Marketing/Finance, Production Mgr + Quality Mgr under Ops, Sales Mgr + Digital Marketing Mgr under Marketing, span 3, 4 layers), marketshare (Tesco 25/Sainsbury 15/Asda 14/Aldi 10/Lidl 8/Others 28), growthchart (Rise & Shine revenue £m 2019–2024: 0.8, 1.4, 2.6, 4.1, 5.2, 6.0), economies (LRAC, MES at £8).

---
Task ID: 5-a
Agent: general-purpose (Theme 1 banks)
Task: Author Theme 1 question banks (Topics 1.1–1.5)

Work Log:
- Read worklog, schema (bank.ts, types.ts), exemplars (growth.ts, finance.ts), knowledge.ts and charts.tsx diagram data before writing.
- Created src/data/bank/enterprise.ts (slug 'enterprise', Topic 1.1, 15 Q: 6 mcq / 4 term / 2 fib / 2 truefalse / 1 numeric). Innocent Drinks extract (1999, three friends, £500 festival stall, 'yes/no' bins, Coca-Cola majority owner 2013) used on 3 Q; Maya's Candles fictional extract for value-added calc (£12.00 − £4.50 = £7.50).
- Created src/data/bank/opportunity.ts (slug 'opportunity', Topic 1.2, 15 Q: 6 mcq / 4 term / 3 fib / 2 truefalse). Covers customer needs, primary vs secondary, qual vs quant, segmentation (uses 1.2m UK vegetarians textbook fact), marketshare diagram Qs (Tesco 25% single-chain leader), Mill Lane fictional coffee-shop market-map extract (gap = high quality at low price), ASOS online-only fact.
- Created src/data/bank/finance-sources.ts (slug 'financesources', Topic 1.3, 16 Q: 7 mcq / 3 term / 1 fib / 3 numeric / 2 truefalse). SMART, revenue/costs/profit, cash vs profit, sources of finance, capital vs revenue expenditure. THREE Qs reference the cashflow diagram with exact Rise & Shine numbers: net cash flow March +£1.5k, closing balance June £3.5k, worst month January (−£1.5k, mcq). Sam's Sandwich Bar profit calc: 400×£3.50=£1,400 rev; TC £800; profit £600.
- Created src/data/bank/ownership.ts (slug 'ownership', Topic 1.4, 16 Q: 7 mcq / 4 term / 3 fib / 2 truefalse). Liability (sole trader/partnership/Ltd), franchising (McDonald's/Krispy Kreme), location/footfall, ASOS e-commerce, 4Ps, business plans, stakeholders; Hallam Supermarkets fictional extract for stakeholder conflict Q.
- Created src/data/bank/external.ts (slug 'external', Topic 1.5, 15 Q: 7 mcq / 4 term / 2 fib / 2 truefalse). Blockbuster/Kodak tech failure, ASOS place, ethics (Fairtrade) & environment (Innocent 100% recycled bottles), economy (interest rates, inflation, unemployment, exchange rate £1=$1.20→$1.60 import question + weaker-pound export truefalse), legislation (CRA 2015, HSWA 1974, Equality Act 2010, NMW).
- Self-check: strict tsc type-check of all 5 files against Question union (isolated /tmp project, PASS); validation script confirmed question counts, mixes, 4-option mcqs with valid indices, accept arrays 2–6 entries, tol within 0.05–0.5, extracts ≤900 chars, cashflow diagram arithmetic internally consistent (opening Jan £2.0k), and all arithmetic re-done; answers spot-checked against the real marking.ts engine (case/£/hyphen/bracket handling) — all pass. No repo files other than the 5 banks touched; index.ts left for main agent.

Stage Summary:
- Theme 1 bank complete: 5 new files, 77 questions total (15+15+16+16+15), all British English, Educake-style conventions, real facts verifiable, fictional businesses internally consistent. Slugs: enterprise, opportunity, financesources, ownership, external. Local id prefixes e/o/c/ow/x (collision-free). Next: main agent wires them into src/data/bank/index.ts DEFS.

---
Task ID: 5-b
Agent: general-purpose (Theme 2 banks)
Task: Authored four Theme 2 question bank files (marketing, operations, hr, globalisation)

Work Log:
- Created src/data/bank/marketing.ts (slug 'marketing', 'Marketing: Product, Price, Promotion & Place', Theme 2, Topic 2.2) — 18 questions: 8 mcq, 4 term, 3 fib, 2 truefalse, 1 numeric. Covers USP (Innocent extract), Apple branding/premium pricing, product life cycle with the `plc` diagram referenced twice (growth-stage ID + extension-strategy timing), Boston Matrix (cash cow mcq + star term), pricing: skimming (Apple iPhone extract), penetration, psychological, loss leader, cost-plus, competitive (in loss-leader/Ryanair explains), dynamic (Uber surge extract); promotion: Google Ads keyword bidding, PR-vs-advertising-vs-influencer-vs-sponsorship identification mcq; place: ASOS online-only (term, extract) + click and collect. Ryanair extract uses approved facts (no frills, fast turnarounds, secondary airports). Numeric: fictional Bramble & Bean, £4.00 → £4.60 = +15% (value 15, tol 0.5), full working in explain.
- Created src/data/bank/operations.ts (slug 'operations', 'Business Operations & Quality', Theme 2, Topic 2.3) — 18 questions: 8 mcq, 4 term, 3 fib, 2 truefalse, 1 numeric. Covers job (wedding cake), batch (bakery loaves), flow (Cadbury/Mars extract), productivity formula (fib) + calculation, Amazon warehouse robots (extract), buffer stock (term + truefalse), Toyota JIT risk (extract), re-order level (fib), procurement + single-supplier risk, quality control vs assurance, TQM, Kaizen, sales process (live chat pre-sale, post-sale, reviews). Numeric: fictional Halstead Manufacturing, 24,000 units ÷ 30 employees = 800 units per worker (value 800, tol 0.5, unit 'units').
- Created src/data/bank/hr.ts (slug 'hr', 'People & HR', Theme 2, Topic 2.5) — 18 questions: 8 mcq, 5 term, 3 fib, 2 truefalse (no numeric per spec). References the `orgchart` diagram in three questions (Quality Manager reports to Operations Director; MD span of control = 3; four layers → tall structure). Covers delayering, internal recruitment, job description vs person specification, assessment centres, induction, on/off-the-job training, jargon barrier, gig economy (Deliveroo riders self-employed, extract), remote working, zero-hours contracts, span of control, financial vs non-financial motivation, Herzberg hygiene vs motivators (D3 truefalse).
- Created src/data/bank/globalisation.ts (slug 'globalisation', 'Globalisation, Ethics & Environment', Theme 2, Topic 2.1) — 12 questions: 5 mcq, 3 term, 2 fib, 2 truefalse. Covers globalisation definition, multinationals (Nike/Unilever extract; Apple named), import vs export, trade blocs (EU single market, UK left end of 2020), internet + cheaper transport, Fairtrade, child labour boycotts (false statement), Innocent 100% recycled bottles, green measures cutting costs, sustainable growth.
- Self-checks: (1) all four files transpile cleanly (Bun TS parse); (2) structural validation against the Question union passed 100% — every mcq has exactly 4 options with a valid correct index, term/fib have 2–6 accept spellings, numeric tol within 0.05–0.5, extracts ≤900 chars and 2–4 sentences, every question has topic/difficulty/marks/stem/explain; (3) marking engine simulation: 116/116 checks correct (all accept variants, hyphen forms via normalisation, mcq indices, numeric values); (4) numeric arithmetic re-derived independently: (4.60−4.00)÷4.00×100 = 15 exactly; 24,000÷30 = 800 exactly; (5) mcq correct-answer positions distributed across all four slots in every file.
- All real-world claims restricted to knowledge.ts + approved facts (Innocent 1999 three friends/natural ingredients/100% recycled bottles; Apple high launch prices; Uber surge pricing; ASOS no stores; Amazon robots with human pickers; Toyota JIT; Deliveroo self-employed riders; Cadbury/Mars flow production; Nike made in Asia; Unilever 400+ brands; EU single market). No invented statistics; fictional firms (Bramble & Bean, Halstead Manufacturing) have clean, internally consistent numbers. Local ids prefixed mk/op/hr/gl; no existing files touched; bank/index.ts wiring left to the main agent.

Stage Summary:
- Theme 2 bank now has 4 new quizzes (66 questions, 68 marks total: marketing 18/19, operations 18/19, hr 18/18, globalisation 12/12). Main agent to register DEFS in src/data/bank/index.ts next. Flag for review: gl10 fib accepts 'recyclable' as well as 'recycled' (marking generosity — the stem pins the meaning with "old plastic that has been reprocessed"); gl12 fib accepts 'green' as well as 'sustainable'.

---
Task ID: 5-c
Agent: general-purpose (exam-style banks)
Task: Author 4 flagship exam-style quiz banks (Theme 1 + Theme 2 exam practice, growth case studies, finance case studies)

Work Log:
- Read worklog, bank.ts/types.ts schema, growth.ts + finance.ts exemplars, knowledge.ts and charts.tsx (diagram data) before writing.
- Created src/data/bank/exam-t1.ts — slug 'examt1', 18 Q across all five Theme 1 topics (1.1×3, 1.2×4, 1.3×4, 1.4×4, 1.5×3), 17/18 with extracts. Case families: Crumb & Craft bakery (Nadia), Style on Wheels mobile hairdresser (Priya), Rise & Shine market-stall coffee. Numerics: value added £2.00 (3.20−1.20), first-month profit £450 (600×2.50−1,050), bean price % rise 25% (8→10). Diagrams: marketshare (four largest chains = 64%) and cashflow (only January has negative net cash flow, −£1,500). Types: 9 mcq / 3 term / 2 fib / 3 numeric / 1 truefalse.
- Created src/data/bank/exam-t2.ts — slug 'examt2', 18 Q across all five Theme 2 topics (2.1×5, 2.2×3, 2.3×3, 2.4×4, 2.5×3), 18/18 with extracts. Real takeovers: Morrisons/McColl's £190m 2022 (speed benefit), Kraft/Cadbury ~£11.5bn 2010 (hostile takeover term), Facebook/Instagram ~$1bn 2012 (horizontal integration), JLR/Tata £15bn 2023 (organic via own-factory investment). Dough House parameter-sheet maths: productivity 700 loaves (4,200÷6), net margin 17.1% (1,800÷10,500), MoS as % of output 28.6% (1,200÷4,200). Fernfield Foods ROCE 16% (96k÷600k). Diagrams: economies (purchasing economy) + breakeven (MoS %) + orgchart (Production Mgr → Operations Director). HR: span of control term, job rotation mcq. Operations: JIT term, quality control mcq. Types: 8 mcq / 4 term / 1 fib / 4 numeric / 1 truefalse.
- Created src/data/bank/cases-growth.ts — slug 'casesgrowth', 14 Q, EVERY question with extract, all 2.1 (cg12 tagged 2.4 like growth.ts exemplar does for its calcs). Mix exactly 6 mcq / 4 term / 2 fib / 2 numeric. Case families: (a) Purplebricks/Strike — why £1 (mcq), 1,000 shares at £0.76 = £760 (numeric), competitor fib; (b) Biscuiteers — Dior co-brand benefit, organic growth term, why stay private; (c) ABF/Primark — why no online store, diversification term, benefit of ABF ownership; (d) fictional Old Mill Bakery (Ludlow→Shrewsbury) — takeover speed, diseconomies term, 2,500÷(2.00−0.75)=2,000 loaves (numeric), market share fib, backward vertical term. No stems duplicated from growth.ts (checked programmatically; used only NEW angles on the shared real cases).
- Created src/data/bank/cases-finance.ts — slug 'casesfinance', 14 Q, EVERY question with extract, all 2.4, 10 numerics with full working. Dough House NEW angles only: BE after +10% FC = 3,300; BE at £3.00 price = 2,250; revenue at BE = £7,500 (TR=TC check); FC-rise→MoS-falls truefalse. New fictional firms with clean numbers: Brookfield Bikes (GPM 40%, NPM 15%, ROCE 12%, margins-gap mcq) and Glow Candles (contribution £8, BE 200, MoS 150, target profit 450, BE-formula fib 'contribution'). Vale Drinks used for ROCE-fall interpretation only (15%→12% because capital employed £1.6m→£2m) — NOT the ROCE calc that finance.ts f5 already asks. No stems duplicated from finance.ts (checked programmatically).
- Verification (one-off bun script, deleted after use): all 19 numeric answers re-derived independently and matched exactly; every mcq has exactly 4 options, unique, one defensible correct; correct-answer indices deliberately distributed across positions (overall 3/9/8/5) so answers aren't positionally guessable (practice route shuffles, assignment route doesn't); all term/fib accept arrays 2–6 entries; all tol within 0.05–0.5; extracts ≤900 chars; id prefixes x/y/cg/cf; no stem overlap vs exemplars or across my own files. `tsc --noEmit` reports 0 errors in all 4 new files (remaining project errors are pre-existing in other files).
- Consistency: Rise & Shine narrative runs Theme 1 (start-up: stall, cash-flow forecast, market map) → Theme 2 (grown: six cafés + roastery, bulk buying, JIT, cans); supermarket shares and cash-flow figures match charts.tsx exactly; Dough House sheet untouched (price 2.50/VC 1.00/FC 4,500/output 4,200/BE 3,000/MoS 1,200); Fernfield Foods matches orgchart.

Stage Summary:
- 4 new bank files authored, 64 questions total (18+18+14+14), all verified. NOT wired into bank/index.ts (main agent wires it — add examt1, examt2, casesgrowth, casesfinance to DEFS). Real-world facts used are from the approved list only; supermarket shares labelled 'illustrative'; ABF deliberately given no nationality claim (growth.ts's 'Irish' wording avoided). One judgement call flagged: cf12 target-profit question (Glow Candles, 450) is a stretch beyond the core Edexcel formula set but is fully determined by the stem and marked difficulty 3.

---
Task ID: 5 (a, b, c), 6, 7
Agent: Z.ai Code (main) + 3 general-purpose subagents
Task: Question bank authoring, case images, E2E verification

Work Log:
- 5-a/5-b/5-c (parallel subagents): authored 13 additional bank files — enterprise, opportunity, financesources, ownership, external, marketing, operations, hr, globalisation, examt1, examt2, casesgrowth, casesfinance. All registered in src/data/bank/index.ts.
- Validated the full bank with a one-off script (deleted after use) against the real marking engine: schema per type, id collisions, duplicate stems, extract lengths, mcq option counts, numeric tolerance sanity, self-marking (correct answers must mark correct; nonsense must mark wrong). Fixed: 3 duplicate stems reworded, growth.ts accept lists trimmed to ≤6, ABF "Irish company" corrected to "London-headquartered".
- Final bank: 15 quizzes · 245 questions · 286 marks, covering every spec topic 1.1–2.5 with Educake-style case studies and diagrams.
- Task 6: generated 6 case-study images (z-ai image CLI) into public/cases/ (bakery, estate, biscuits, coffee, warehouse, highstreet) and attached them to 11 case-study extracts across growth/cases-growth/exam-t2/operations.
- Bug fixes found during E2E: markAttempt was not returning topicStats (submit 500); topicStats Record with dot keys ("2.1") is illegal in Firebase RTDB — refactored to TopicStat[] arrays across types, marking, ai feedback, submit, overviews, results routes, ResultScreen, ResultsView; added submit-retry button in QuizRunner error state.
- AI generation hardening: added deterministic numericMatchesExplanation guard (explanation working must reach the claimed value within tol) after the AI cross-check — caught a case where the AI cross-check passed a question whose explanation computed 0.0% but value claimed 2.2.
- E2E verified with agent-browser: teacher register → class → bulk student credentials (4 students) → student login → practice quiz (shuffled) → submit (19/25=76%, risk 96/high with 5 signals, paste-match fired, tolerance accepted 2dp, feedback via z.ai) → timed assignment creation (20 min) → Ben takes it under timer (19:58) with synthetic paste event → 24/25=96% → teacher results view (avg 96%, integrity tab: Ben 95% high with full signal breakdown, risk distribution) → student history (points, mastery) → mobile 390px sticky footer (docH=vh, zero gap) → dark mode → zero console errors.
- Lint: 0 errors 0 warnings.

Stage Summary:
- Platform feature-complete and browser-verified end to end. Remaining: GitHub push + 15-min webDevReview cron.

---
Task ID: 8
Agent: Z.ai Code (main)
Task: GitHub push, cron job, project close-out

Work Log:
- Pushed the full project to https://github.com/rninej/gcse-business-hgs (branches: main, app). GitHub push protection (secret scanning) blocked committing raw API keys, so the repo ships .env.example with placeholders; the sandbox keeps the real .env.local so the live preview runs with real keys.
- Added README.md (features, stack, setup, structure, integrity-notes, copyright note for the textbook — not redistributed).
- Created cron job id 424289: fixed_rate 900s (every 15 minutes), kind=webDevReview, tz Europe/London, using the mandated task description.
- Final state: lint 0 errors/warnings; dev server clean; E2E verified.

Stage Summary:
- HGSBusiness is live and feature-complete: 15 quizzes / 245 questions / 286 marks; deterministic marking; Gemini→Groq→z.ai AI chain with curated-bank fallback; anti-cheat integrity engine; teacher analytics; class management with credential sheets; timed assignments; practice quizzes with auto-feedback; dark mode; mobile bottom-nav with sticky footer; 6 AI-generated case images + 7 hand-drawn SVG diagrams.
- Next-phase ideas (for the 15-min review loop): streaks/leaderboard gamification, spaced-repetition practice, teacher question editing after set, class-level export to spreadsheets, per-question analytics drill-down charts, more banks (e.g. dedicated 1.3 break-even bank), AI diagram generation.

---
Task ID: 9
Agent: Z.ai Code (main)
Task: UX/perf overhaul round — instant loading, per-question feedback, teacher credential management, memorable passwords, resume, mobile formatting, human-made design, new logo, light-only mode

Work Log:
- PERF: page.tsx is now a server component that reads the HMAC session cookie directly (currentSession) and passes initialSession to a new HomeApp client component which adopts it synchronously via useState initializer — zero boot splash, zero /api/auth/me round-trip. Removed the pulsing "Loading HGSBusiness…" animation entirely. store.ts lost `booting`.
- PERF: firebase.ts gained an in-process TTL cache (colCached, 5s) with write invalidation in fb.set/patch/remove; all hot read routes switched to colCached (teacher overview/classes/assignments/results, student assignments/overview, login/register). Repeat API reads dropped from ~1.5s (Belgium RTDB round-trip) to ~5-40ms.
- PERF: client api.ts memoises GETs for 10s and busts the memo on any successful POST/PATCH/DELETE; added api.patch. AppShell prefetches role-based data on mount so nav clicks are instant. Login/register now return the full SessionInfo and AuthView calls start(session) — no more window.location.reload().
- FEATURE (per-question feedback): new POST /api/student/attempts/[id]/check — marks one answer server-side, persists it plus a checked record {a, correct, expected, explain, at}, replays stored outcome on repeat calls (no answer-guessing). GET attempt now returns the checked map. Submit merges stored answers (checked answers locked; unchecked take client values). QuizRunner reworked: "Check answer" button → outcome panel (Correct / Not quite + your answer + the correct answer + explanation) → Next question / Finish; MCQ options show green correct + red chosen after confirm; palette shows green/red per question; confirmed inputs locked.
- FEATURE (resume): confirmed answers live server-side, so closing the browser (or switching device) resumes exactly where the student left off; unchecked answers + telemetry restored from localStorage; timed attempts compute remainingMs from startedAt server-side so the clock keeps running while away (verified: exit at 19:47, re-enter 45s later → 18:54 with Q1 state restored). Student home already shows Continue.
- BUGFIX: practice resume never matched (route compared assignmentTitle === quiz.title but stored "${quiz.title} · practice") AND RTDB drops null values so assignmentId===null never matched (reads back undefined) — fixed with practiceTitle match + !x.assignmentId.
- FEATURE (teacher credential management): Student gains pwEnc (AES-256-GCM reversible copy, key scrypt-derived from SESSION_SECRET); passwords.ts has encryptPassword/decryptPassword/memorablePassword (adjective-noun-number, e.g. brave-otter-23, school-safe British English word lists). GET class returns decrypted passwords; new PATCH /api/teacher/classes/[id]/students/[sid] edits username (uniqueness-checked), password (typed or regenerated) and name. ClassesView: Password column always visible (click to copy), edit dialog with New password button, updated copy.
- UX: NewAssignment step 1 label is now "Give your assignment a name" with placeholder "e.g. Half-term homework".
- DESIGN: new logo (deep-emerald tile, white ascending bars, amber growth bar, baseline) in Brand.tsx + src/app/icon.svg favicon + public/logo.svg; forced light mode (html class="light" + color-scheme, removed next-themes + toggles, single light palette); --radius 0.75rem → 0.5rem; AuthView redesigned flat (no gradient, real Biscuiteers sample-question preview card instead of stats row, hero above auth on mobile); sidebar crisper (solid primary active state, borders); QuizRunner header/cards tightened.
- MOBILE: fixed horizontal overflow (642px!) in QuizRunner — question palette + grid items needed min-w-0 so the CSS grid track stops listening to unwrapped min-content; extract panel now renders FIRST on mobile (case study before question), images capped (max-h-44/56 object-cover), option buttons min-h-12 with responsive text sizes, inputs h-12 sm:h-14.
- Fixed pre-existing tsc errors (LibraryView QuizPreview signature, questions.ts bad cast).
- E2E verified with agent-browser (390px + 1280px): teacher register→dashboard instant (no reload), class create, bulk add 3 students (ideal-owl-65 / lively-robin-70 / trusted-hare-46), passwords always visible, edit dialog (regenerated Ben→sharp-ray-20, renamed ben.carter.x, 409 on taken username handled), student login with edited creds, practice check-flow (correct + wrong + fill-blank), palette states, exit→resume (server states restored), timed assignment Half-term check (20 min) exit at 19:47 → resume 45s later at 18:54 with Q1 correct restored, submit→result screen with AI feedback, mobile class table (scrolls, no page overflow), sticky footer both viewports, zero console errors. VLM review of screenshots: mobile quiz "clean, no overflow, professional", desktop quiz 9/10, landing 8.5/10 → fixed mobile hero/auth order per VLM feedback.
- Investigated two dev.log 500s on at_7d2eeae520 (old-format attempt from previous session auto-submitted by the OLD client bundle mid-recompile): clean API-level repro of practice→check→submit passes on current code; errors were transient stale-module artifacts, not live bugs.

Stage Summary:
- All 12 user requests delivered: instant loads, human-made design, per-question right/wrong with correct answer, teacher password visibility + editing, memorable word passwords, "Give your assignment a name", no start animation, new logo, always light mode, mobile+desktop question formatting, whole-app QA, mid-test resume.
- Platform verified end-to-end on mobile + desktop with zero console errors. Lint 0/0, tsc clean in src/.
- Next-phase ideas: streaks/leaderboard, spaced repetition, per-question analytics drill-down charts, teacher question editing after set, more banks, AI diagram generation.

---
Task ID: 10 (15-min review round)
Agent: Z.ai Code (main)
Task: QA pass + fix expired-timed-attempt finalization + streaks & weekly class leaderboard + styling polish

Work Log:
- QA pass (agent-browser, 1280px + 390px): teacher dashboard/results, student flow, landing — all working, zero fresh console errors. Found two real issues (below).
- BUGFIX (data integrity): timed attempts whose clock ran out while the student was away stayed "in-progress" forever (teacher saw "1 still working" indefinitely; class stats missed the attempt). New src/lib/finalize.ts — finalizeExpired() marks stored answers deterministically, computes risk from stored telemetry, uses instant template feedback (no slow AI in read-route hot path), in-flight Set guards double sweeps. Swept in GET /api/student/assignments and GET /api/teacher/assignments/[id]/results. Verified: backdated attempt (20-min limit, 30 min old) auto-finalized on next student home load → teacher results now "1 of 3 submitted, 0 still working", class average 8.3%.
- FEATURE (gamification): src/lib/streaks.ts — streaksFrom() computes current/best/activeDays from submitted-attempt days (streak survives until end of "yesterday" so midnight doesn't punish). New GET /api/student/leaderboard: weekly (last-7-days) points per classmate + total points + streaks, my rank; students only ever see their own class. /api/student/overview now returns streak; attempt GET (submitted) returns streak for the result screen. AppShell prefetches the leaderboard for students.
- UI (StudentHome): streak flame chip (amber) + points chip in header; "2 active days · best streak N" under the average card; new Class leaderboard card — rank chips (gold/silver/bronze), initials avatars, flame count for 2+ day streaks, relative points bars, "You" row highlighted (pinned below top-5 if outside it), weekly-reset footer note, friendly empty state for solo students.
- UI (ResultScreen): streak badge in the headline card + "Do a quiz tomorrow to keep your streak alive" nudge; Next steps card gains a "Practice these topics" CTA button.
- FIX: fixed bottom nav covered the footer on mobile (measured 60px overlap at full scroll) — footer now pb-20 md:pb-0, content clears the nav by 20px.
- Verified end-to-end: auto-finalization (student + teacher views), leaderboard rows (Ben 20pts #1 of 3, Amelia/Priya 0pts), streak chip appears at 2+ days (backdated one submission to yesterday → "2-day streak" chip on home + result screen), no mobile overflow, VLM reviews: student home 9/10 ("premium EdTech product"), mobile leaderboard readable with no visual bugs. Lint 0/0, tsc clean, zero console errors.

Stage Summary:
- Platform now: 15 quizzes / 245 questions; per-question feedback; server-side resume; expired timed attempts auto-finalize; streaks; weekly class leaderboard; teacher credential management; memorable passwords; anti-cheat; analytics; light-only human-made design; instant loads (server + client caching).
- Unresolved/risks: streak day boundary is UTC (fine for UK); leaderboard "week" is a rolling 7 days rather than Monday-reset (footer copy says "resets each week" — acceptable approximation, could switch to ISO week later); finalize uses template feedback only (AI feedback reserved for live submits).
- Next-phase ideas: spaced-repetition practice queue, teacher question editing after set, per-question drill-down charts in results, more banks (dedicated 1.3 break-even), AI diagram generation, Monday-aligned leaderboard weeks.

---
Task ID: 11
Agent: Z.ai Code (main)
Task: Rebrand to "Learn Business" + uploaded logo + mobile login-first + quiz redo with teacher-visible history + coded SVG visuals replacing AI images + hyphen-free passwords

Work Log:
- REBRAND: app renamed HGSBusiness → Learn Business everywhere user-visible: layout.tsx title/keywords, AuthView + AppShell footers, assignments route generatedBy ("Learn Business bank · …"), questions.ts AI-fallback note, README title, all 16 bank-file header comments. NOT renamed: Firebase DB URL, /hgs data path, SESSION_SECRET fallback, localStorage key hgs_run_* (stability of existing data/sessions).
- LOGO: user-uploaded artwork (upload/learn business.png, 318×276, opaque white bg) processed with PIL — content bounds + gap detection split the icon cluster (rows 18–143) from the wordmark. Assets: public/logo.png (full 312×248), public/logo-icon.png (icon cluster 309×130), src/app/icon.png (512×512 square favicon; old icon.svg deleted). Brand.tsx rewritten: full logo tile + spec subtitle in sidebar/landing header; compact bar (mobile) uses icon crop + "Learn Business" text with new --brand-red CSS var. Landing hero shows the full logo at h-24 (desktop).
- MOBILE LOGIN-FIRST: AuthView main reordered — auth card `order-1 lg:order-2`, hero `order-2 lg:order-1`, mobile padding tightened (py-5). Verified at 390px: auth card top at 123px, fully above the fold without scrolling.
- PASSWORDS: memorablePassword() now wordwordnumber ("braveotter23", no hyphens). Updated all example copy (ClassesView ×2, AuthView placeholder). Existing hyphenated passwords keep working (exact-match verification); teachers can regenerate.
- REDO (backend): start route no longer 409s on submitted — resumes any in-progress attempt, otherwise creates a fresh one (returns attemptN). Attempt gains optional quizId (set by practice route) so practice redos reshuffle the same quiz. Result GET returns assignmentId + quizId. student/assignments route: per-assignment attempts sorted by startedAt, latest decides status/result, returns attemptCount + bestPct. Teacher results route: attempts grouped per student (oldest first), latest = headline row, new AttemptSummary[] history on every row; topic/question stats now use each student's latest submitted go. Teacher assignments + overview routes: hand-in counts now count UNIQUE students (redo no longer inflates "2/2 handed in" — verified 1/2 after fix).
- REDO (frontend): ResultScreen "Redo this quiz" (assignment → start route; practice → practice route with quizId) in header + footer with "Every attempt is saved — your teacher can see all of them" note; practice keeps "Choose a different quiz". StudentHome submitted rows: Review + Redo buttons + "N goes · best X%" badge. ResultsView students table: new Tries column, ×N chip expands a history sub-row listing every go (date, marks, %, time, integrity band) with the latest highlighted; CSV gains a Tries column.
- CODED VISUALS: 7 new hand-coded SVG diagrams in charts.tsx (shareprice — Purplebricks £1.89→£0.76 line; luxgrowth — Biscuiteers revenue bars to £11m; primarkstores — 408/197 donut; qcflow — Dough House production flow with END-of-process inspection; financesources — internal vs external £175k classification; automation — picking productivity bars; growpaths — organic 12mo vs takeover 1mo timelines). 10 extract image refs in growth/cases-growth/exam-t2/operations swapped to diagram refs (y4 coffee.jpg simply removed — already had economies chart). public/cases/*.jpg deleted; /cases no longer referenced anywhere. Invented intermediate data explicitly labelled illustrative; real anchors (408/197, £1.89/£0.76, £11m) verifiable.
- MISTAKE + RECOVERY: first image→diagram python pass inserted diagram lines INSIDE extract objects; the corrective pass over-matched pre-existing question-level diagram lines and corrupted 4 bank files → restored from git, redid the swap correctly (verified by tsc + grep).
- E2E (agent-browser, 390px + 1280px): mobile landing (auth card above fold, logo in header — VLM confirmed), desktop landing (full logo above headline, card right). Registered teacher "E2e Check" (e2e-lb@test.uk/testpass123) → class LB Test 11Z → 2 students with hyphen-free passwords (ava.stone/dizzydolphin91, noah.reid/cheerfulrobin43) → assignment "Growth case studies check" from the bank → Ava completed it (3/16), Redo from result screen → fresh 0/14 attempt → 1/16 → home shows "2 goes · best 18.8%" + Review + Redo; teacher results: 1/2 handed in (post-fix), Ava ×2 with expandable history (Go 1 18.8% 1m17s, Go 2 · latest 6.3% 0m34s, integrity both). Practice redo path verified at API level (quizId stored, second start = new attempt). Mobile practice quiz: walked all 14 questions — zero horizontal overflow, case study always above the question, 4 diagrams render; desktop: no overflow, aside left, chart 386px. Zero console errors; lint 0/0; tsc clean in src/.

Stage Summary:
- All 6 user requests delivered: Learn Business name, mobile login-at-top, full redo with teacher-visible history, uploaded logo as brand, AI images replaced by coded business charts, hyphen-free passwords.
- Bonus fixes found during E2E: hand-in counts and dashboard stats double-counted redos (now unique-student / latest-attempt based).
- E2E artefacts: screenshots qa-lb-01…06 in download/. Test accounts (isolated under teacher E2e Check): e2e-lb@test.uk / testpass123; students ava.stone/dizzydolphin91, noah.reid/cheerfulrobin43.
- Next-phase ideas: Monday-aligned leaderboard weeks, spaced-repetition queue, per-question drill-down charts, teacher question editing, more banks (dedicated 1.3 break-even), AI diagram generation.

---
Task ID: 10
Agent: main (Z.ai Code)
Task: Revert logo to the original SVG mark (user regretted the uploaded PNG logo); ensure logo never shows twice on desktop

Work Log:
- Read worklog + git history: original logo (commit 654aadb) was an SVG BrandMark — ascending bar chart in emerald tile (#0d5c46) with amber growth bar (#f0a63c) — later replaced by uploaded PNGs (logo.png / logo-icon.png).
- Rewrote src/components/app/Brand.tsx: restored BrandMark SVG + BrandLockup (mark + "Learn Business" wordmark, "Business" in text-primary emerald to match the mark). Dropped BrandLogo/BrandLockup PNG paths.
- AuthView.tsx: removed the duplicate `<img src="/logo.png">` (hidden lg:block) in the desktop pitch column — root cause of the logo appearing twice on desktop (header BrandLockup + pitch image). Header lockup is now the only logo.
- Restored src/app/icon.svg (old bar-chart favicon) from git history; deleted src/app/icon.png, public/logo.png, public/logo-icon.png.
- globals.css: removed now-unused --brand-red / --brand-navy vars (only existed for the PNG artwork).
- Verified with agent-browser + VLM at 1280px and 390px: desktop landing = exactly 1 logo (header), no duplicate in pitch column; mobile landing = 1 logo in header + auth card above fold; desktop sidebar + mobile top bar = 1 logo each. Favicon /icon.svg 200, /logo.png 404.
- Console check: a hydration error seen in the agent-browser buffer was isolated to the Fast Refresh transition while editing (stale HTML + new code); fresh cache-busted loads show no error dialog/badge in the Next.js dev overlay. Lint 0/0, tsc clean in src/.
- Committed aa215ff and pushed to github.com/rninej/gcse-business-hgs.

Stage Summary:
- Logo reverted to the original coded SVG bar-chart mark everywhere (sidebar, mobile top bar, landing header, favicon); name remains "Learn Business".
- Desktop double-logo fixed (pitch-column image removed); no PNG logo assets remain in the repo.
- Test accounts still valid: teacher e2e-lb@test.uk/testpass123; students ava.stone/dizzydolphin91, noah.reid/cheerfulrobin43.
