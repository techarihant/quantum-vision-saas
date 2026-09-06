import { NextRequest, NextResponse } from 'next/server';
import { getInternalNotes, addInternalNote } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_acme';
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId parameter is required' }, { status: 400 });
  }

  const notes = getInternalNotes(orgId, conversationId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_acme', conversationId, userId = 'usr_rahul', userName = 'Rahul Sharma', note } = body;

    if (!conversationId || !note) {
      return NextResponse.json({ error: 'conversationId and note content are required' }, { status: 400 });
    }

    const internalNote = addInternalNote(organizationId, {
      conversationId,
      userId,
      userName,
      note
    });

    return NextResponse.json(internalNote, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
