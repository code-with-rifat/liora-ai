import { NextResponse } from 'next/server';
import { listActivity } from '@/lib/app-store';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ activity: await listActivity(60) });
}
