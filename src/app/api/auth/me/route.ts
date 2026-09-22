import { NextResponse } from 'next/server';
import { findUserById } from '@/lib/app-store';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null });
  const user = await findUserById(session.id);
  if (!user || user.disabled) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
  });
}
