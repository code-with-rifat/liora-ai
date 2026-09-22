import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/app-store';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const patch = await req.json();
  const settings = await saveSettings(patch || {});
  return NextResponse.json({ settings });
}
