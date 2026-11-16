# Progress note — 15 Nov 2026, evening session

## What changed in the product

The product is a **30-day trial**: every class, every student, every feature, no
card. After it, one class stays free and the school licence covers the rest.

- `FREE_PLAN` is back to one class, `classLimit()` honours it, and the class
  cap is enforced server-side again (`402 upgrade_required` when a free account
  tries a second class).
- `/free`, `/pricing`, `/upgrade` and the register panel all say 30 days,
  unlimited classes and students, no card. No page still claims the product is
  free forever.
- Live and verified: `/free` title reads *"30 days free, no card — Edexcel GCSE
  Business homework that marks itself"*; `/pricing` reads *"Start with 30 days
  free"*.

## Proof the trial does what the page promises

A fresh account was created through the live registration endpoint on
production (`gcse.business.hgs+teacher.demo@gmail.com`, ref `selfcheck`):

| Check | Result |
| --- | --- |
| Plan straight after signup | `trial`, `daysLeft: 30`, `limit: null`, `canCreateClass: true` |
| Classes created | 3 (101/102/103 Business Set 1) |
| Students added to one class | 45 |
| Plan after 3 classes | `classes: 3`, `limit: null`, `canCreateClass: true` — no cap during trial |
| Trial forced to expire (owner endpoint, `trialDays: 0`) | plan `free`, `limit: 1`, `canCreateClass: false`, **all 3 classes and 45 students still present** |
| Second class while expired | `HTTP 402 {"code":"upgrade_required","limit":1,"upgradeUrl":"/upgrade"}` with a plain-English reason |
| Trial restored | `trialDays: 30` → `daysLeft: 30` again |

Nothing was deleted on expiry, which is exactly what `/upgrade` tells a teacher.

## Outreach this session

- **All 81 schools on the October list have now had a second touch**, each
  confirmed by Gmail's "Message sent" before the next send. The last 20 were
  sent one to four at a time because the cloud browser kept dropping CDP
  (`browserType.connectOverCDP: Timeout 10000ms`); closing the heavy Gmail tabs
  and reopening a single tab fixed it each time.
- **11 new named heads of business** were sourced and sent the trial offer
  (`?ref=newlead`) — list and sources in `new-leads-2026-11-15.md`.
- **1 personal email** to Mr Noel at Herschel Grammar, the only real teacher
  account in the database (created 6 Oct), asking what would make him use it.
- Target for new leads was 60; **12 delivered**. Reasons, recorded rather than
  disguised: GIAS bulk download needs an interactive form, DuckDuckGo and
  Mojeek block scripted search, and manual search yields about two usable
  department addresses each. `sales/harvest_business_contacts.py` is kept as
  the record of the failed automation.

## Tracker numbers at the end of the session

Visits **36**: direct 25, probe 1, github 1, quora 4, followup 3, newlead 2.
Signups **18**: one trial account created for this test (`selfcheck`), one real
teacher (Mr Noel, October), sixteen automated test accounts on `example.com` /
`test.uk` / `school.uk`.

Read honestly: the `followup` and `newlead` visits are almost certainly mail
scanner pre-fetches arriving seconds after each send — not teachers. **No
teacher has signed up from any campaign yet.** The only human on the platform is
the one from October.

## Delivery audit, from Gmail rather than the send toast

93 recipients in this campaign (81 October second touches, 11 new heads of
business, Mr Noel). Gmail's own bounce reports were read individually:

- **90 accepted with no bounce report.** Gmail offers no positive delivery
  receipt, so this is "no DSN after the observation window", not proof of inbox
  placement. Stated honestly rather than dressed up as delivery confirmation.
- **3 hard bounces**, all identical: `550 5.4.1 Recipient address rejected:
  Access denied` from Microsoft 365, for
  `aarcher@forgevalley.sheffield.sch.uk`,
  `T.Williamson@derbycathedralschool.org.uk` and
  `e.izegbu.scs@osborne.coop`. Each has bounced twice today — once from the
  morning campaign and once from this one — so the addresses themselves are dead,
  not a transient greylist.
- **All three recovered** by re-sending to the office address published on each
  school's own contact page (`info@forgevalley.school`,
  `info@derbycathedralschool.org.uk`, `info@osborne.coop`), marked for the named
  head of department. No bounce report followed any of the three.
- **0 replies.** Inbox, spam and subject-based reply searches are all empty of
  teacher mail; the only inbox arrivals from this campaign are the three bounce
  reports.

Per-recipient states are in `campaign-log-2026-11-15.md`; no recipient is left as
a bare "sent".

## Copy audit against the live site

Checked on the deployed URLs, not local files: `/`, `/free`, `/pricing`,
`/upgrade`, `/demo`.

- Homepage and signup panel: "30 days free, no card — every class, every student,
  every feature."
- `/free`: "30 days… as many classes as you teach, as many students as you have";
  the after-trial line now reads "one class stays free" and "You keep 1 class at
  no cost after the trial, with unlimited students in it" — the words "free
  forever" were removed on the owner's instruction even though the claim was
  about the post-trial state.
- `/pricing`: "Start with 30 days free — no card. Every class, unlimited students
  and every feature for 30 days."
- `/upgrade`: describes the trial ending, the one free class, and the 402 a
  second class returns. No page claims the product is free indefinitely, and no
  page caps students.
- No outbound email template in the repository contains "free forever"; the
  campaign emails all say 30 days, every class, every student.

## Tracker at the end of this pass

Visits **48** — direct 36, quora 4, followup 3, newlead 2, bouncefix 1, github 1,
probe 1. Signups **18**: one test account created for verification, one real
teacher (Mr Noel), sixteen automated test accounts. Still no teacher signup from
any campaign.

## Full route sweep — every URL the live site serves, checked after deploy

The route list was derived, not remembered: `src/app/**/page.tsx` for the route
shapes, plus `/sitemap.xml` (58 URLs), plus `/upgrade` and `/debug` which are
reachable but outside the sitemap, plus a read of the homepage's nav and footer
links (which surface `/demo`, `/topics`, `/pricing`, `/legal`). Every URL was
then fetched from `https://www.gcse.business` and its trial wording quoted:

| URL | Status | What it says about the trial |
|---|---|---|
| `/` | 200 | Try a real quiz — no sign-up See pricing 30 days free, no card — every class, every student, every feature. |
| `/demo` | 200 | No trial, price or class-limit wording on this page (content page: topics/spec/legal sits behind the app shell) |
| `/pricing` | 200 | Start with 30 days free — no card Every class, unlimited students and every feature for 30 days, email only. |
| `/free` | 200 | 30 days free, no card — Edexcel GCSE Business homework that marks itself gcse business Edexcel 1BS0 Try a quiz Topics Calculators Pricing Sign in 30-day trial 30 days. |
| `/topics` | 200 | 5 — and a free quiz for each. |
| `/spec` | 200 | 4 Motivation Try six questions — no sign-up Free calculators Free scheme of work © 2026 gcsebusiness · Edexcel GCSE (9–1) Business, spec 1BS0 · arnavjain1009@gmail. |
| `/tools` | 200 | Free GCSE Business calculators — break-even, profit margin, ARR, cash flow gcse business Edexcel 1BS0 Try a quiz Topics Calculators Pricing Sign in Free tools · 1BS0 The four calculations that cost the most marks. |
| `/scheme-of-work` | 200 | Free Edexcel GCSE Business (1BS0) scheme of work — two years, every sub-topic gcse business Edexcel 1BS0 Try a quiz Topics Calculators Pricing Sign in Free resource · 1BS0 The whole two-year course, week by week. |
| `/legal` | 200 | Schools can delete students and classes at any time; everything else is deleted within 30 days of the licence ending. |
| `/topics/1.1` | 200 | 1 questions and answers — free worked examples Two questions on 1. |
| `/topics/1.2` | 200 | 2 questions and answers — free worked examples Two questions on 1. |
| `/topics/1.3` | 200 | 3 questions and answers — free worked examples Two questions on 1. |
| `/topics/1.4` | 200 | 4 questions and answers — free worked examples Two questions on 1. |
| `/topics/1.5` | 200 | 5 questions and answers — free worked examples Two questions on 1. |
| `/topics/2.1` | 200 | 1 questions and answers — free worked examples Two questions on 2. |
| `/topics/2.2` | 200 | 3 Promotion Appropriate promotion strategies for different market segments: advertising, sponsorship, product trials, special offers, branding. |
| `/topics/2.3` | 200 | 3 questions and answers — free worked examples Two questions on 2. |
| `/topics/2.4` | 200 | 4 questions and answers — free worked examples Two questions on 2. |
| `/topics/2.5` | 200 | Different ways of working: part-time, full-time and flexible hours; permanent, temporary and freelance contracts; the impact of technology on ways of working (efficiency, remote working). |
| `/spec/1.1.1` | 200 | 1 The dynamic nature of business Free notes on the dynamic nature of business , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.1.2` | 200 | 2 Risk and reward Free notes on risk and reward , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.1.3` | 200 | 3 The role of business enterprise Free notes on the role of business enterprise , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.2.1` | 200 | 1 Customer needs Free notes on customer needs , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.2.2` | 200 | 2 Market research Free notes on market research , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.2.3` | 200 | 3 Market segmentation Free notes on market segmentation , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.2.4` | 200 | 4 The competitive environment Free notes on the competitive environment , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.3.1` | 200 | 1 Business aims and objectives Free notes on business aims and objectives , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.3.2` | 200 | 2 Business revenues, costs and profits Free notes on business revenues, costs and profits , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.3.3` | 200 | 3 Cash and cash-flow Free notes on cash and cash-flow , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.3.4` | 200 | 4 Sources of business finance Free notes on sources of business finance , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.4.1` | 200 | 1 The options for start-up and small businesses Free notes on the options for start-up and small businesses , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.4.2` | 200 | 2 Business location Free notes on business location , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.4.3` | 200 | 3 The marketing mix Free notes on the marketing mix , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.4.4` | 200 | 4 Business plans Free notes on business plans , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.5.1` | 200 | 1 Business stakeholders Free notes on business stakeholders , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.5.2` | 200 | 2 Technology and business Free notes on technology and business , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.5.3` | 200 | 3 Legislation and business Free notes on legislation and business , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.5.4` | 200 | 4 The economy and business Free notes on the economy and business , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/1.5.5` | 200 | 5 External influences Free notes on external influences , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.1.1` | 200 | 1 Business growth Free notes on business growth , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.1.2` | 200 | 2 Changes in business aims and objectives Free notes on changes in business aims and objectives , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.1.3` | 200 | 3 Business and globalisation Free notes on business and globalisation , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.1.4` | 200 | 4 Ethics, the environment and business Free notes on ethics, the environment and business , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.2.1` | 200 | 1 Product Free notes on product , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.2.2` | 200 | 2 Price Free notes on price , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.2.3` | 200 | 3 covers Appropriate promotion strategies for different market segments: advertising, sponsorship, product trials, special offers, branding. |
| `/spec/2.2.4` | 200 | 4 Place Free notes on place , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.2.5` | 200 | 5 Using the marketing mix to make business decisions Free notes on using the marketing mix to make business decisions , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.3.1` | 200 | 1 Business operations Free notes on business operations , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.3.2` | 200 | 2 Working with suppliers Free notes on working with suppliers , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.3.3` | 200 | 3 Managing quality Free notes on managing quality , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.3.4` | 200 | 4 The sales process Free notes on the sales process , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.4.1` | 200 | 1 Business calculations Free notes on business calculations , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.4.2` | 200 | 2 Understanding business performance Free notes on understanding business performance , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.5.1` | 200 | 1 Organisational structures Free notes on organisational structures , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.5.2` | 200 | 2 Effective recruitment Free notes on effective recruitment , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.5.3` | 200 | 3 Effective training and development Free notes on effective training and development , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/spec/2.5.4` | 200 | 4 Motivation Free notes on motivation , the terms the examiner expects you to use, and a worked question with the answer explained. |
| `/upgrade` | 200 | The school licence — what happens next \| gcsebusiness gcse business Edexcel 1BS0 Try a quiz Topics Calculators Pricing Sign in School licence Your trial has done its job. |
| `/debug` | 200 | No trial, price or class-limit wording on this page (content page: topics/spec/legal sits behind the app shell) |

**Result: 60 URLs, 0 containing "free forever", "as long as you want", "no trial
clock", "never expires", "free for good", "no expiry", "no end date" or "does not
expire".** `/debug` is owner-gated (robots-disallowed, returns an unlock prompt);
`/demo` is the anonymous quiz demo and carries no price copy at all.

The one contradictory string this pass found was not on a page but in the plan
API: the free-plan summary used to read *"No card and no expiry"*, which next to a
30-day trial reads like the trial never ends. It now reads *"No card, and the
class you keep does not expire."* (`src/lib/plan.ts`, commit `c02bca3`).

## Email templates in the repository

There is no `emails/`, `templates/`, `mail/` or `mailer/` directory in the repo —
`find` returns only Next.js internals under `.next/`. All outbound mail was
composed in Gmail and is reproduced in `followup-campaign-2026-11-15.md` and
`new-leads-2026-11-15.md`. A repo-wide grep for `free forever`, `as long as you
want`, `no trial clock`, `never expires`, `no expiry`, `unlimited trial` finds
only historical prose in those two logs (describing the wording that was replaced)
and no template or page.

## Gmail re-check after this pass

- Bounce reports: **6 messages, 3 distinct addresses** — unchanged from the
  delivery audit. No new bounce since.
- Replies: **none** in the inbox (50 threads, all service mail or the three
  bounces), none in spam (`in:spam` returns no messages), and none under any
  campaign subject with `-from:me`.
- Counts stand: **93 recipients, 90 accepted with no bounce, 3 hard bounces
  (all re-sent to published office addresses and accepted), 0 replies.**

## Tracker at the time of this pass

Visits **51** — direct 39, quora 4, followup 3, newlead 2, bouncefix 1, github 1,
probe 1. Signups **18**: one verification account, one real teacher (Mr Noel),
sixteen automated test accounts. No teacher signup from any campaign.

## Funnel proven live on the deployed site

Walked as a cold visitor on 15 Nov with a throwaway account
(`gcse.business.hgs+funnelcheck2215@gmail.com`), signed up through the live form,
not through an owner shortcut:

- Trial banner the account actually saw: **"Free trial — 30 days left. Unlimited
  classes and students, every feature, no card."**
- Three classes created in the UI, three students added to one, then a fourth
  class to test the list; the live API reported `classes: 4, limit: null,
  canCreateClass: true`. No paywall, no error, no upgrade wall.
- No verification email exists: the project sends no mail at signup, so the
  teacher is signed in immediately. Nothing arrived in the inbox or spam because
  nothing is sent.

### Defects found on the walk

| # | Defect | Commit |
|---|---|---|
| 1 | Dashboard and Classes banners said "Unlimited classes and every feature", dropping the unlimited **students** promise | `a33030f` |
| 2 | A newly created class did not appear until the collection cache expired (~7s), so the list read "No classes yet" straight after "Class created" | `a33030f` |
| 3 | Buy path was a bare `mailto:` — blocked on many school devices; `/upgrade` now has an on-page enquiry form that stores the request and confirms on screen | `a33030f` |
| 4 | No way to clear a test enquiry from the owner queue — owner-gated `DELETE /api/enquiry` added | `6b2bd56` |

### Enquiry arrival — the one thing still open

A real enquiry was submitted through the live `/upgrade` form (and again against
the live API) and read back through the owner endpoint with sender and message
intact (`enq_d28603ebd6`, `enq_efb56f1586`). It is stored, not emailed: the
project has no mail transport and no provider key, and the owner address
(`arnavjain1009@gmail.com`) is not a mailbox this environment can open. The
endpoint is wired for Resend and will email the owner the moment
`RESEND_API_KEY` is set. **Inbox arrival and spam placement are therefore
unproven, not proven.**

Afterwards the test classes, their students and both test enquiries were deleted:
zero classes, zero students, zero enquiries left. The account itself remains and
is named here so it is never mistaken for a real school.

Recipient counts unchanged: **93 recipients, 90 accepted with no bounce, 3 hard
bounces (all re-sent to published office addresses and accepted), 0 replies** —
re-checked in Gmail during this pass (6 bounce messages, 3 distinct addresses,
no new ones; inbox and spam clear of teacher mail).

Tracker at the time of this pass: visits **61** — direct 47, quora 6, followup 3,
newlead 2, github 1, bouncefix 1, probe 1. Signups **19**: 16 automated test
accounts, 1 verification account, 1 funnel-check account, 1 real teacher
(Mr Noel). The funnel-check account is attributed to `quora` because the browser
still carried that referral cookie.

## Overnight 15–16 Nov — the enquiry email is proven, and it now sends itself

The last note left one thing open: an enquiry was stored but never mailed. That is
closed, and the reason it was open is now visible from outside.

**Why it never mailed.** `GET /api/health` now reports the mail mode, and the
production deployment said `"email":"none"` — the Resend key existed only in the
workspace, never in the Vercel environment. The old code swallowed the failure, so
nothing complained. That is fixed three ways:

1. **The app sends properly when it can.** Enquiries go from
   `enquiries@gcse.business` (the domain is verified in Resend) with the teacher as
   Reply-To, and the teacher gets a short acknowledgement that names the trial and
   invites a reply. The entry stores `emailed: sent | failed | skipped`, the
   provider id, or the exact error — a silent failure is no longer possible.
2. **A relay sends anything the app could not.** `.github/workflows/enquiry-relay.yml`
   runs every 5 minutes (and on any push that touches it), reads unsent enquiries
   straight from the database, mails them, and marks them so nothing is sent twice.
   The key lives in the repository secret `RESEND_API_KEY` — the repo is public, so
   it never appears in a file. Retries are capped (5 owner copies, 3 acknowledgements)
   and test domains are skipped.
3. **The owner sees the queue.** `/debug` now opens with "Licence requests" —
   school, contact, message, and whether the mail actually went out — which did not
   exist before, and the teacher feedback inbox that was written but never rendered
   is mounted beside it.

**Proof, end to end.**

| What | Evidence |
|---|---|
| Owner copy of a real form submission | Resend `last_event: delivered` for `Licence enquiry — Testbridge Academy` → `arnavjain@gcse.business` |
| Teacher acknowledgement | `delivered`, and found in the Gmail inbox (label: Inbox, not Spam) |
| Relay, with no human in the loop | GitHub run `43776953889` sent `enq_85b36c4a2f` — owner copy and acknowledgement both `delivered` |
| New-trial alert | `New trial signup — Alert Test` sent by the same job; the teacher record is flagged so it never repeats |
| Still unsent after the sweep | relay run reports `ownerSent: 0` — idempotent |

**What a teacher walks into, checked tonight on the live site.**

- Full journey, cold account: register → trial plan (`30 days left`) → class →
  two students with logins → library assignment (15 questions) → student login →
  attempt → submit → teacher results. Every step passed.
- **The marker is right:** a paper answered with the bank's own correct answers
  scores `16/16, 100%`. (Two earlier "failures" were my test sending option *text*
  where the client sends an index — the product was never wrong; the check now
  derives the index from the shuffled options.)
- **AI generation works:** Gemini, 5 questions in 3.8s, "passed 5/5 validation
  checks" — this is the feature the £250 is justified by, and it is not silently
  falling back to the bank.
- **Phone width:** `/free` at 390px has no horizontal overflow; the signup form is
  three fields at 294px and reads "30 days free, no card — every class, every
  student, every feature."
- The enquiry rate limit was 5/hour **per IP** — a school is one IP, so a
  department of six would have locked out the seventh. It is now 20/hour.

**Still open.** The Vercel environment has no `RESEND_API_KEY`, so the in-app send
is off and the relay carries every enquiry (worst case ~5 minutes late). Adding the
key in Vercel → Settings → Environment Variables removes the relay from the path
entirely; `"email":"resend"` on `/api/health` is the proof it took.

**Sales position, unchanged and not dressed up.** 93 recipients, 90 accepted with
no bounce, 3 hard bounces all re-sent to published office addresses, **0 replies**.
Re-checked in Gmail tonight: 27 inbox conversations in three days, none from a
school. Tracker now **72 visits** (direct 57, quora 7, followup 3, newlead 2,
github 1, bouncefix 1, probe 1) and **21 signups** — 19 test/QA accounts, 1
verification account, 1 real teacher (Mr Noel).

**Test data left behind, named so it is never mistaken for a school:**
`gcse.business.hgs+qa2311@gmail.com` (QA 11A Business class with several test
students and assignments) and `gcse.business.hgs+alerttest2311@gmail.com`
(signup-alert test). Both test enquiries were deleted from the queue.

## Activation fix, and the test data removed

The first click a cold teacher makes is "Create assignment". With no class yet,
the wizard used to answer "You need a class first — add one under Classes" and
leave them there: a dead end at the exact moment a trial either starts or dies.
The wizard now asks for a class name and creates it in place, selects it, and
carries on. Checked on the live site with a brand-new account: the input appears,
"11B Business" is created and selected, no console errors.

Both `/pricing` buttons now point at the same on-page licence form `/upgrade`
has, instead of a `mailto:` — a head of department on a school device could not
send anything from /pricing before this. Verified live by submitting the form as a
signed-out visitor: stored, mailed, and the page confirmed "Enquiry received."

Every test account this project created is gone — teachers, classes, students,
assignments and attempts were deleted from both database engines by
`scripts/cleanup-test-accounts.mjs` (dry run by default). The owner's signup list
now contains **3 real accounts**: Mr Noel (`bno@herschel.slough.sch.uk`), the
demo persona (`okafor@hgs.school.uk`) and the owner's own login. Nothing belonging
to a real teacher was touched; the script matches only throwaway addresses.

## 16 Nov, second pass — every mail delivered, every check green

Twelve messages have now gone through Resend and **all twelve report
`delivered`** — no bounce, no failure, no spam rejection:

| Kind | Recipient | Count |
|---|---|---|
| Owner copy of a licence enquiry | `arnavjain@gcse.business` | 4 |
| Acknowledgement to the teacher | teacher's own address | 4 |
| New-trial alert | `arnavjain@gcse.business` | 1 |
| Trial-ending reminder | teacher's own address | 1 |
| Earlier test sends | mixed | 2 |

The acknowledgement was opened in the inbox by hand (label "Inbox", not Spam),
so this is delivery to a mailbox a human reads, not just SMTP acceptance.

**Trial reminders now exist.** A teacher with 6 days left received "Your
gcse.business trial ends in 6 days", naming the price, the class that stays free
and the `/upgrade` page, and asking how many classes they teach so the reply is
one number. The flag is stored on the teacher record, so rerunning the job cannot
repeat it — the next run sent nothing.

**Written answers are marked without the student's browser.** Submitting a
4-mark written answer and closing the tab used to leave it unmarked until a
teacher noticed and pressed "mark now". Submission now starts the AI examiner
itself; the server-side check returned 4/4 with feedback and no client call.

**Small conversion fixes on the live site:** the homepage hero gained "Start the
30-day trial" (it had proof and price but no trial), the shared header gained
"Free trial" so a teacher landing on `/topics` from search sees the offer, and
`/pricing`'s two buttons now open the on-page licence form.

**What a teacher sees when a trial ends** — checked with a throwaway account:
dashboard reads "Free plan — one class. Your trial has ended; existing work keeps
running. Licence for the whole school →", and `/upgrade` explains the same thing
in full. A second class is refused with HTTP 402 and the licence message.

**The database is clean.** Every throwaway account, class, student, assignment and
attempt created while testing has been deleted from both engines. `teachers` now
holds exactly three: Mr Noel (the one real teacher), `okafor@hgs.school.uk` (the
demo persona) and the owner's login. Zero test enquiries remain.

**Honest caveats, unchanged or newly found:**

1. The Vercel environment still has no `RESEND_API_KEY` (`/api/health` says
   `"email":"none"`). Every school-facing mail is therefore sent by the GitHub
   job, not the app. Adding the key to Vercel removes the relay from the path.
2. GitHub's scheduler had not fired a scheduled run in the first hour after the
   workflow was created — only the push and manual runs fired. If it stays
   dormant, an enquiry is still stored and visible in `/debug`, and any deploy
   sweeps it, but the instant mail depends on the Vercel key.
3. `gcse.business` publishes DKIM for Resend but has **no SPF TXT record and no
   DMARC record**. Mail sent through Resend is fine (DKIM-aligned, delivered 12
   from 12), but anything sent through the domain's own mailbox is not
   authenticated. Adding `v=spf1 include:...` for that provider plus a `p=none`
   DMARC record is a DNS job for the owner.
4. Still **0 replies** from 93 schools. Nothing in this pass changes that; the
   product and the reply path are ready for the first one.

### The app's own sender works — it just isn't switched on in production

Run locally with `RESEND_API_KEY` in the environment, the production build reports
`"email":"resend"` at `/api/health` and a licence request returns
`{"ok":true,"delivered":true,"acknowledged":true}` with both messages (owner copy
and teacher acknowledgement) reporting `delivered` at Resend. So the missing
Vercel variable is the only difference between "stored and swept by the relay"
and "mailed instantly"; nothing else needs building for it.

### A locked-out teacher has a way back in

Testing turned up no password reset anywhere: a teacher who forgot theirs could
not reach a paid school again and had nobody to ask. `/debug` now has a small
"Teacher lock-out" panel (owner-gated `POST /api/owner/password`) that sets a
temporary password for a given email. Checked by resetting a throwaway account,
signing in with the temporary password, and confirming the route returns 401
without an owner session. A proper emailed reset link is the honest next step,
but it needs the in-app key first.

### Speed and wording, measured on the live site

`/` 0.36s, `/free` 0.23s, `/pricing` 0.23s, `/upgrade` 0.23s, `/demo` 0.24s,
`/topics` 0.22s time-to-first-byte. Every public page repeats the same promise in
the same words: "30 days free, no card". Nothing says "forever", and the free
plan is always described as one class, not as the trial.

### The demo page was showing every right answer as option A

The bank authors case studies with the correct option first, and `/demo` served
that order untouched — so all three multiple-choice questions had their answer in
slot A. Anyone evaluating the product would spot it in ten seconds and conclude
the demo was staged. Options now rotate by a hash of the question id, computed in
both the page and the marking route, so the browser still receives no answer data
and the two processes cannot disagree.

Verified as a visitor on the live page in a real browser: clicked the correct
label for all three, typed "public limited company", "variable" and "840", pressed
"Mark my answers" — 7 / 7, six green badges, nothing marked wrong. The correct
options now sit in slots C, C and D.

### One gap found but deliberately not changed overnight

`/api/auth/login` has no failed-attempt limit: twenty wrong-password requests in a
row all returned 401 and none were slowed. Student usernames are predictable
(first.last), so a bored pupil could grind a classmate's password. The fix belongs
in the login route, and a mistake there locks every teacher out of the product on
the one night nobody can undo it — so it is written down here instead of shipped
blind. Recommended shape: key on identifier + IP, allow ~10 failures in 10
minutes, clear on success, return 429 with a plain message. Note that keying on IP
alone would be wrong: a whole class shares one school NAT address.
