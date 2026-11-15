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
