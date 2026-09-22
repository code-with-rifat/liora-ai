import { NextResponse } from 'next/server';
import { getSettings, stats } from '@/lib/app-store';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [settings, counts] = await Promise.all([getSettings(), stats()]);
  return NextResponse.json({ settings, ...counts });
}
