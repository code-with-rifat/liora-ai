import { NextRequest, NextResponse } from 'next/server';
import { listUsers, setUserDisabled } from '@/lib/app-store';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ users: await listUsers() });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'User id required' }, { status: 400 });
  await setUserDisabled(String(body.id), Boolean(body.disabled));
  return NextResponse.json({ ok: true });
}
