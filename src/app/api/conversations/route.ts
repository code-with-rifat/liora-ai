import { NextRequest, NextResponse } from 'next/server';
import { listConversations, upsertUserConversation } from '@/lib/app-store';
import { getSessionUser } from '@/lib/session';
import { Conversation } from '@/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ conversations: [] });
  const conversations = await listConversations(user.id);
  return NextResponse.json({ conversations });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const conversation = (await req.json()) as Conversation;
  if (!conversation?.id) {
    return NextResponse.json({ error: 'Conversation is required' }, { status: 400 });
  }
  await upsertUserConversation(user.id, conversation);
  return NextResponse.json({ ok: true });
}
