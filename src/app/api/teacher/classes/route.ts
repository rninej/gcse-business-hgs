import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, colCached, put } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { FREE_PLAN, planOf } from '@/lib/plan';
import type { Student, StudentClass, Teacher } from '@/lib/types';

export async function GET() {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const classes = await colCached<StudentClass>('classes');
  const students = await colCached<Student>('students');
  const mine = Object.values(classes).filter((c) => c.teacherId === session.uid);
  return NextResponse.json({
    classes: mine
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((c) => ({
        ...c,
        studentCount: Object.values(students).filter((s) => s.classId === c.id).length,
      })),
  });
}

export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as { name?: string };
  const name = (body.name ?? '').toString().trim();
  if (name.length < 2 || name.length > 50) {
    return NextResponse.json({ error: 'Class name must be 2-50 characters.' }, { status: 400 });
  }

  const classes = await col<StudentClass>('classes');

  // Free accounts get one class. Enforced here, not in the UI, so the limit
  // cannot be bypassed by calling the API directly.
  const teachers = await colCached<Teacher>('teachers');
  const me = Object.values(teachers).find((t) => t.id === session.uid);
  const plan = planOf(me);
  const mine = Object.values(classes).filter((c) => c.teacherId === session.uid);
  if (plan === 'free' && mine.length >= FREE_PLAN.classes) {
    return NextResponse.json(
      {
        error: me?.trialEndsAt
          ? `Your 30-day trial has ended, and the free plan covers ${FREE_PLAN.classes} class. The school licence adds unlimited classes for every teacher in the school.`
          : `The free plan covers ${FREE_PLAN.classes} class. The school licence adds unlimited classes for every teacher in the school.`,
        code: 'upgrade_required',
        plan,
        limit: FREE_PLAN.classes,
        upgradeUrl: '/upgrade',
      },
      { status: 402 }
    );
  }

  const duplicate = Object.values(classes).some(
    (c) => c.teacherId === session.uid && c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json({ error: 'You already have a class with this name.' }, { status: 409 });
  }

  const id = `c_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const cls: StudentClass = { id, teacherId: session.uid, name, createdAt: Date.now() };
  await put('classes', id, cls);
  return NextResponse.json({ ok: true, class: { ...cls, studentCount: 0 } });
}
