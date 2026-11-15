# Distribution run — 15 Nov 2026

Goal: publish the 30-day no-card trial somewhere public without the owner's Gmail.
Mailbox used: a temp inbox created via the mail.tm API (`gcsebiz2177@fldubai.com`).
Every link published points at `https://www.gcse.business/free?ref=<channel>`.

## Live now

| Channel | Status | URL |
|---|---|---|
| GitHub Pages landing page | **Live, HTTP 200** | https://rninej.github.io/gcse-business-trial/ |
| EdTech Impact | Account + product created, e-mail verified, **pending their review** | https://my.edtechimpact.com/products/gcsebusiness |
| AlternativeTo | Account created and e-mail verified; product **submitted to the review queue** (profile shows "Added apps 1") | https://alternativeto.net/user/submissions/ |

The GitHub page is a real public page with the trial CTA and `?ref=github`, but its
teacher reach is close to zero — it is a proof of publication, not a distribution win.

## Refused, with the exact block

| Channel | Block |
|---|---|
| **Tes** | Registration rejected: `error-code=registration..spam` — their spam filter refuses the disposable domain. Account never created. |
| **SaaSHub** | hCaptcha on the register form plus an explicit notice after submit: "You should not use automations to register." Not bypassed. |
| **AlternativeTo** (first attempt) | Signup form gated by hCaptcha, button disabled until it passes. Retried later when the challenge cleared under normal browsing: account created, e-mail verified through the temp inbox, product form completed and submitted. Not in the live index yet — it sits in their review queue, which they say holds several thousand apps. |
| **WordPress.com** | Email rejected at signup: "Use a different email address. This email provider blocks some of our emails." |
| **Hacker News** | Account created, but new accounts cannot submit: redirected to `/showlim` (Show HN restricted) and `/x?fnop=toonew` (account too new). |
| **Cademy** | `cademy.co.uk` now redirects to a training-provider SaaS; no directory to submit to. |
| **Facebook groups / Reddit / LinkedIn / X** | No account exists and every signup wall needs a phone number or a captcha; the browser's Facebook tab is a login page. |

## What is still open

- EdTech Impact needs the profile completed (logo, company details, description)
  and then their editorial review before the product page is public.
- AlternativeTo: submission is queued; priority review is a paid option they offer.
- Tes needs an address on a domain that is not a disposable-mail domain — i.e. a
  mailbox on `gcse.business` itself (needs DNS/MX access) or the owner's Gmail.
- SaaSHub and AlternativeTo need a human to clear the captcha once; the accounts
  then exist and the submissions are simple forms.
