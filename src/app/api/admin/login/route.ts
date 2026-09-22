import { NextRequest, NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password = String(body.password || '');
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: 'Set ADMIN_PASSWORD in the environment first.' },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ error: 'Wrong admin password.' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
