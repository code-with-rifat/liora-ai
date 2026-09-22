import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { upsertGoogleUser } from '@/lib/app-store';
import { hashPassword, setUserCookie } from '@/lib/session';
import { appOrigin } from '@/lib/google';

export async function GET(req: NextRequest) {
  const origin = appOrigin(req.nextUrl.origin);
  const fail = (reason: string) => NextResponse.redirect(new URL(`/signin?error=${reason}`, origin));

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const jar = await cookies();
    const expected = jar.get('liora_oauth_state')?.value;
    jar.delete('liora_oauth_state');

    if (!code || !state || !expected || state !== expected) {
      return fail('google');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return fail('google-off');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return fail('google');
    const tokens = await tokenRes.json();
    const access = tokens.access_token as string | undefined;
    if (!access) return fail('google');

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!profileRes.ok) return fail('google');
    const profile = await profileRes.json();
    const email = String(profile.email || '').toLowerCase();
    const googleId = String(profile.sub || '');
    if (!email || !googleId) return fail('google');

    const user = await upsertGoogleUser({
      email,
      name: String(profile.name || email.split('@')[0]),
      googleId,
      picture: profile.picture,
      passwordHash: await hashPassword(googleId + Date.now()),
    });
    if ('error' in user) return fail('disabled');

    await setUserCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    return NextResponse.redirect(new URL('/', origin));
  } catch {
    return fail('google');
  }
}
