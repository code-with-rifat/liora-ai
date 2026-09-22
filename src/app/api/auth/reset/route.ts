import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, patchUser } from '@/lib/app-store';
import { hashPassword, setUserCookie, verifyPassword } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const password = String(body.password || '');

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the 6-digit recovery code.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.resetCodeHash || !user.resetExpires || user.resetExpires < Date.now()) {
      return NextResponse.json({ error: 'This code is invalid or has expired.' }, { status: 400 });
    }
    if (!(await verifyPassword(code, user.resetCodeHash))) {
      return NextResponse.json({ error: 'This code is invalid or has expired.' }, { status: 400 });
    }

    await patchUser(user.id, {
      passwordHash: await hashPassword(password),
      resetCodeHash: '',
      resetExpires: 0,
    });
    await setUserCookie({ id: user.id, email: user.email, name: user.name });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not reset password' }, { status: 500 });
  }
}
