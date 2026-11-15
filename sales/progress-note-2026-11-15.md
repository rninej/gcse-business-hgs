

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

