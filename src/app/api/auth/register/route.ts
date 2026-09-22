import { NextRequest, NextResponse } from 'next/server';
import { createUser, getSettings } from '@/lib/app-store';
import { hashPassword, setUserCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const settings = await getSettings();
    if (!settings.allowSignup) {
      return NextResponse.json({ error: 'Sign up is currently closed.' }, { status: 403 });
    }
    const body = await req.json();
    const email = String(body.email || '');
    const password = String(body.password || '');
    const confirm = String(body.confirm || body.password || '');
    const name = String(body.name || '');
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }
    const created = await createUser({
      email,
      name,
      passwordHash: await hashPassword(password),
    });
    if ('error' in created) {
      return NextResponse.json({ error: created.error }, { status: 400 });
    }
    await setUserCookie({ id: created.id, email: created.email, name: created.name });
    return NextResponse.json({ user: { id: created.id, email: created.email, name: created.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sign up failed' }, { status: 500 });
  }
}
