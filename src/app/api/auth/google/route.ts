import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { appOrigin, googleConfigured } from '@/lib/google';

export async function GET(req: NextRequest) {
  const origin = appOrigin(req.nextUrl.origin);
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL('/signin?error=google-off', origin));
  }

  const state = randomBytes(16).toString('hex');
  const jar = await cookies();
  jar.set('liora_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
