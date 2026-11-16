# Morning checklist — 16 Nov 2026

Everything below was checked overnight; this is what to do with it, in order.

## 1. Add one environment variable (the only thing only you can do)

Vercel → project → Settings → Environment Variables → add

    RESEND_API_KEY = (the key you made at resend.com)

for Production (and Preview), then redeploy.

Why: right now the deployed app has no mail transport. `/api/health` says
`"email":"none"`, so a licence request is stored on the site and mailed by a
GitHub Action instead — which is slower and depends on a scheduler that did not
fire once overnight. With the key in place the app mails on submit, instantly, and
`/api/health` will read `"email":"resend"`. The app's own sender was tested with
the key present: both the owner copy and the teacher's acknowledgement reported
`delivered`.

Nothing else needs changing for this.

## 2. Five minutes on the site

- `/debug` → **Licence requests**: any school that asked overnight is listed with
  its delivery badge. You can reply straight from there (`mailto:` with the
  teacher's address prefilled).
- `/debug` → **Teacher lock-out**: if a teacher emails "I can't get in", set them a
  temporary password here and send it to them.
- `/pricing` and `/upgrade` both carry the enquiry form; `/free` is the trial.
- Homepage now has three buttons: try a quiz, see pricing, **start the trial**.

## 3. What is proven, so you don't have to re-check it

- A cold visitor can register, get a class, add students, set homework, answer it
  as a student, and see marks — end to end, live.
- A perfect paper scores 16/16. Written answers are AI-marked on submit, without
  the student's browser being open.
- Trial end → free plan with one class; a second class is refused with the licence
  message; you switch a school to the licence from `/debug` (verified: unlimited
  classes afterwards).
- 16 messages through Resend, **16 delivered**, zero bounces. The enquiry
  acknowledgement lands in the Gmail inbox, not spam.
- The public demo marks 7/7 when answered correctly — and no longer shows every
  right answer as option A (it did, until last night).
- Ten wrong passwords for one account now return 429 for ten minutes; a class
  behind one school IP is unaffected.

## 4. Still true, and not fixable from here

- **0 replies from 93 schools.** Nothing about the site changes that; it needs a
  reply to arrive before it can convert.
- `gcse.business` has DKIM (Resend) but **no SPF and no DMARC record**. Resend
  mail is delivered fine; mail sent from the domain's own mailbox is not
  authenticated. Worth adding at your DNS host when you have ten minutes.
- GitHub's scheduler did not fire for the relay in its first hundred minutes;
  every push to `main` sweeps instead, and the Vercel key makes the relay
  unnecessary.
