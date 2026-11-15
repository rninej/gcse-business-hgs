# Follow-up campaign — 15 Nov 2026

Second touch to the 81 schools emailed in October, because the offer changed and
the product no longer needs an invoice to start.

## What was sent

**Wave A (13 schools, before the owner corrected the offer):**
subject `gcse.business is free now — no invoice needed`, body said the product is
free "for as long as you want it". That was true for about twenty minutes and is
no longer the offer. The owner said not to correct these, so they stand. Anyone
who clicks now sees the 30-day trial page.

**Wave B (26 schools, after the correction):**
subject `30 days free for your GCSE Business classes — no card`, body:

> Straight follow-up to my email in October. gcse.business now gives every
> teacher a 30-day trial: every class, every student, every feature, no card and
> no invoice.
>
> It marks Edexcel 1BS0 homework against the mark scheme and shows the class
> breakdown instead of a pile of books.
>
> Start here, email only: https://www.gcse.business/free?ref=followup
>
> After the 30 days one class stays free; a school that wants it across the
> department takes the 250 pound licence.
>
> If it is not for you, reply "no" and I will not email again.

## Confirmed sends

Each send was read back as Gmail's "Message sent" before the next one started.

- Wave A: nina.bassett, shalstead, dpetrie, thowlett, CRamsamy, paul.chapman,
  P.Hodgson, e.izegbu, leet, KAhmed, wbetari, mgp, sda, b.read (14)
- Wave B: info@stccg, G.Broomhall, SAntill, reardley, pimeson, Graeme.McIntyre,
  cshepherd, jun, efry, aballard, dgreen, sshah, CCooke, dbowen, azb, lwilliams,
  s.mughal, gdavey, nlawrence, T.Williamson, mutumbah, vness, mroberts,
  nabarnett, s.gouldthorpe, schoudry (26)

**Total second-touch emails confirmed: 40.** Roughly 41 schools still untouched.

## Known failures to retry

- `r.follington@st-anselms.org.uk` — compose loaded, send not confirmed.
- `kainsworth@theregisschool.co.uk` — page error.
- `timothy.kendall@preston.mnsp.org.uk` — page error.
- The browser then stopped answering CDP entirely (repeated
  `browserType.connectOverCDP: Timeout 10000ms exceeded`) part-way through the
  next batch of six, so those four were never attempted:
  aholton@holytrinitycrawley.org.uk, loaderk@trinityhigh.net,
  dfw@barneyschool.org.uk, BucklerSR@droitwichspahigh.worcs.sch.uk.

## Result so far

No replies yet. These went out within the last hour, so that is expected rather
than a verdict. The honest read: the October wave produced 0 replies in three
weeks; a changed offer is a reason to expect a better rate, not a guarantee.

## What the tracker will show

Every Wave A/B email points at `/free?ref=followup`, so any teacher who arrives
is attributable. A visit with `ref=followup` is the first real signal that the
second touch is working — it means someone read the email and clicked, even if
they never reply.

## Final state, end of session

**Every school on the October list has now had a second touch.** 46 went out with
the template above (14 with the stale "free as long as you want it" wording, 32
with the 30-day wording); the remaining 35 (including the four failures logged
earlier and `mlennon`) were sent in this session, each confirmed by Gmail's
"Message sent" before the next. Two needed a retry (`parko`, `mlennon`) and
went on the second attempt.

Sending was done in batches of three or four. Larger batches exceeded the
115-second tool budget and left compose pages half-submitted; the browser also
lost CDP repeatedly, fixed each time by closing the Gmail tabs and reopening one.

Beyond the October list, 11 new named heads of business and one warm existing
user were emailed — see `new-leads-2026-11-15.md`.

## Replies

None yet at the time of writing. Bounces are being watched in the mailer-daemon
search; three arrived from the October wave and none from the second touch so
far.
