import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, put, values } from '@/lib/firebase';
import { hashPassword, randomPassword, slugifyName } from '@/lib/passwords';
import { requireRole } from '@/lib/session';
import type { Student, StudentClass } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

interface CreatedRow {
  displayName: string;
  username: string;
  password: string;
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const classes = await col<StudentClass>('classes');
  const cls = classes[id];
  if (!cls || cls.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  const body = (await req.json()) as { names?: string[] | string; passwordMode?: string; manualPassword?: string };
  const rawNames = Array.isArray(body.names)
    ? body.names
    : (body.names ?? '').toString().split(/\r?\n/);
  const names = rawNames.map((n) => n.toString().trim()).filter((n) => n.length >= 2 && n.length <= 40);
  if (names.length === 0) {
    return NextResponse.json({ error: 'Enter at least one student name (one per line).' }, { status: 400 });
  }
  if (names.length > 60) {
    return NextResponse.json({ error: 'Add up to 60 students at a time.' }, { status: 400 });
  }
  const manual = body.passwordMode === 'manual' && (body.manualPassword ?? '').toString().length >= 6;
  const manualPassword = manual ? (body.manualPassword ?? '').toString() : '';
  if (body.passwordMode === 'manual' && !manual) {
    return NextResponse.json({ error: 'Shared password must be at least 6 characters.' }, { status: 400 });
  }

  const students = await col<Student>('students');
  const taken = new Set(Object.values(students).map((s) => s.username));
  const created: CreatedRow[] = [];

  for (const rawName of names) {
    const displayName = rawName.replace(/\s+/g, ' ');
    const base = slugifyName(displayName) || `student`;
    let username = base;
    let n = 2;
    while (taken.has(username)) {
      username = `${base}${n}`;
      n += 1;
      if (n > 50) {
        username = `${base}${randomUUID().slice(0, 4)}`;
        break;
      }
    }
    taken.add(username);
    const password = manual ? manualPassword : randomPassword(7);
    const sid = `s_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
    const student: Student = {
      id: sid,
      teacherId: session.uid,
      classId: id,
      username,
      displayName,
      pw: hashPassword(password),
      createdAt: Date.now(),
    };
    await put('students', sid, student);
    created.push({ displayName, username, password });
  }

  const all = await col<Student>('students');
  const studentCount = values(all).filter((s) => s.classId === id).length;
  return NextResponse.json({ ok: true, created, studentCount });
}
