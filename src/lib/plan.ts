// Free-tier rules — the ONE place that decides what a free account can do.
//
// The free tier exists to remove the invoice from the first conversation: a
// teacher signs up, creates a class and sets real homework without talking to
// anyone. The limit is deliberately a single class, because that is the point
// where the product is already in use and a second class is a natural next
// question — not a barrier before any value has been seen.

import { CONTACT_EMAIL, SCHOOL_PRICE } from './pricing';
import type { Teacher } from './types';

export type Plan = 'free' | 'school';

export const FREE_PLAN = {
  classes: 1,
  label: 'Free — one class',
  summary:
    'One class, unlimited students in it, every topic and every marking feature. No card and no expiry.',
} as const;

export const SCHOOL_PLAN = {
  price: SCHOOL_PRICE.price,
  cadence: SCHOOL_PRICE.cadence,
  label: 'School licence',
  summary: SCHOOL_PRICE.summary,
  contactEmail: CONTACT_EMAIL,
} as const;

/** Anything without an explicit school licence is free — including every
 *  account created before plans existed. */
export function planOf(t: Pick<Teacher, 'plan'> | null | undefined): Plan {
  return t?.plan === 'school' ? 'school' : 'free';
}

export function classLimit(plan: Plan): number {
  return plan === 'school' ? Number.POSITIVE_INFINITY : FREE_PLAN.classes;
}

/** What happens at the money step. Written once here so the pricing page, the
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
