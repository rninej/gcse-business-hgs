// Plan rules — the ONE place that decides what an account can do.
//
// Three states, in order of what the owner wants to happen:
//
//   trial   every teacher starts here for 30 days: unlimited classes, AI
//           question writing, everything. No card, no invoice, email only.
//   free    when the trial ends. One class still works forever — the teacher
//           keeps the class they have been using, so the product stays in the
//           school and the licence has a reason to exist.
//   school  the £250 licence: unlimited classes for every teacher.
//
// Nothing here deletes data or locks a teacher out of work they have already
// set. Expiry only changes what can be created next.

import { CONTACT_EMAIL, SCHOOL_PRICE } from './pricing';
import type { Teacher } from './types';

export type Plan = 'trial' | 'free' | 'school';

export const TRIAL_DAYS = 30;
export const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

export function trialEndFrom(now = Date.now()): number {
  return now + TRIAL_MS;
}

export const FREE_PLAN = {
  classes: 1,
  label: 'Free — one class',
  summary:
    'One class with unlimited students in it, every topic and every marking feature. No card, and the class you keep does not expire.',
} as const;

export const SCHOOL_PLAN = {
  price: SCHOOL_PRICE.price,
  cadence: SCHOOL_PRICE.cadence,
  label: 'School licence',
  summary: SCHOOL_PRICE.summary,
  contactEmail: CONTACT_EMAIL,
} as const;

/** The plan a teacher is on right now. `school` always wins; an unexpired
 *  trial beats free; anything without a trial date is free. */
export function planOf(
  t: Pick<Teacher, 'plan' | 'trialEndsAt'> | null | undefined,
  now = Date.now()
): Plan {
  if (t?.plan === 'school') return 'school';
  if (t?.trialEndsAt && t.trialEndsAt > now) return 'trial';
  return 'free';
}

export function trialDaysLeft(
  t: Pick<Teacher, 'plan' | 'trialEndsAt'> | null | undefined,
  now = Date.now()
): number {
  if (!t?.trialEndsAt) return 0;
  return Math.max(0, Math.ceil((t.trialEndsAt - now) / (24 * 60 * 60 * 1000)));
}

export function classLimit(plan: Plan): number {
  return plan === 'free' ? FREE_PLAN.classes : Number.POSITIVE_INFINITY;
}

export function planLabel(plan: Plan, daysLeft = 0): string {
  if (plan === 'school') return SCHOOL_PLAN.label;
  if (plan === 'trial') return `Trial — ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
  return FREE_PLAN.label;
}

/** What happens at the money step. Written once so the pricing page, the
 *  upgrade page and the in-app callout cannot drift apart. */
export const PAYMENT_STEPS = [
  {
    title: 'Send the school name and a PO number',
    body: 'One email. If your finance office needs a supplier form or a quote on letterhead, forward it to the same address and it gets completed.',
  },
  {
    title: 'Get the invoice and the signed DPA',
    body: 'The invoice and the data-processing agreement go back by email, normally within one working day. Nothing is charged to a card — this site never asks for card details.',
  },
  {
    title: 'The licence is switched on',
    body: 'The account becomes a school licence and every teacher, class and student in the school is unlimited. That switch is the one manual step, and it is done for you after the invoice is raised.',
  },
] as const;
