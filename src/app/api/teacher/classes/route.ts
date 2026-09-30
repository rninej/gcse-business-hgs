import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, colCached, put } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Student, StudentClass } from '@/lib/types';

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
