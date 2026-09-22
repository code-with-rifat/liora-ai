import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, patchUser } from '@/lib/app-store';
import { hashPassword } from '@/lib/session';

async function sendResetEmail(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.MAIL_FROM || 'Liora <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your Liora recovery code',
      text: `Your Liora password recovery code is ${code}. It expires in 15 minutes. If you did not ask for this, you can ignore this email.`,
    }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || user.disabled) {
      return NextResponse.json({
        ok: true,
        emailed: false,
        message: 'If that email has an account, a recovery code is on the way.',
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await patchUser(user.id, {
      resetCodeHash: await hashPassword(code),
      resetExpires: Date.now() + 15 * 60 * 1000,
    });

    let emailed = false;
    try {
      emailed = await sendResetEmail(user.email, code);
    } catch {
      emailed = false;
    }

    return NextResponse.json({
      ok: true,
      emailed,
      code: emailed ? undefined : code,
      message: emailed
        ? 'We sent a 6-digit code to your email.'
        : 'Use this recovery code to set a new password. It expires in 15 minutes.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not start recovery' }, { status: 500 });
  }
}
