import { NextResponse } from 'next/server';
import { currentSession } from '@/lib/session';

export async function GET() {
  const session = await currentSession();
  if (!session) return NextResponse.json({ authenticated: false });
  return NextResponse.json({
    authenticated: true,
    role: session.role,
    name: session.name,
    sub: session.sub,
    classId: session.classId,
    className: session.className,
  });
}
