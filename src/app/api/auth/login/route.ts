import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, touchUser } from '@/lib/app-store';
import { setUserCookie, verifyPassword } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '');
    const password = String(body.password || '');
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }
    if (user.disabled) {
      return NextResponse.json({ error: 'This account has been disabled.' }, { status: 403 });
    }
    await touchUser(user.id);
    await setUserCookie({ id: user.id, email: user.email, name: user.name });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sign in failed' }, { status: 500 });
  }
}
