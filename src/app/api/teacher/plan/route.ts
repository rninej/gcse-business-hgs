import { NextResponse } from 'next/server';
import { colCached } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import {
  FREE_PLAN,
  SCHOOL_PLAN,
  TRIAL_DAYS,
  classLimit,
  planLabel,
  planOf,
  trialDaysLeft,
} from '@/lib/plan';
import type { StudentClass, Teacher } from '@/lib/types';

/** What the signed-in teacher is allowed to do right now. The UI uses this to
 *  show trial days remaining, and to show the licence path before a teacher
 *  hits the wall rather than only after. */
export async function GET() {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [teachers, classes] = await Promise.all([
    colCached<Teacher>('teachers'),
    colCached<StudentClass>('classes'),
  ]);
  const me = Object.values(teachers).find((t) => t.id === session.uid);
  const plan = planOf(me);
  const count = Object.values(classes).filter((c) => c.teacherId === session.uid).length;
  const limit = classLimit(plan);
  const daysLeft = plan === 'trial' ? trialDaysLeft(me) : 0;

  return NextResponse.json({
    plan,
    label: planLabel(plan, daysLeft),
    summary: plan === 'free' ? FREE_PLAN.summary : plan === 'school' ? SCHOOL_PLAN.summary : `Every feature for ${TRIAL_DAYS} days, no card.`,
    classes: count,
    limit: Number.isFinite(limit) ? limit : null,
    canCreateClass: count < limit,
    trialDays: TRIAL_DAYS,
    trialEndsAt: me?.trialEndsAt ?? null,
    daysLeft,
    price: SCHOOL_PLAN.price,
    cadence: SCHOOL_PLAN.cadence,
    contactEmail: SCHOOL_PLAN.contactEmail,
    upgradeUrl: '/upgrade',
  });
}
