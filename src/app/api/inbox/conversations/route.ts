import { NextRequest, NextResponse } from 'next/server';
import { getDB, getConversations, saveDB, logAudit } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const filter = (searchParams.get('filter') as any) || 'ALL';
  const search = searchParams.get('search') || undefined;
  const currentUserId = searchParams.get('currentUserId') || 'usr_arihant';

  const conversations = getConversations(orgId, { filter, search, currentUserId });
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_dobcy', conversationId, action, assignedUserId, assignedUserName, status } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const db = getDB();
    const conv = db.conversations.find((c) => c.organizationId === organizationId && c.id === conversationId);

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (action === 'assign') {
      conv.assignedUserId = assignedUserId;
      conv.assignedUserName = assignedUserName;
      logAudit(
        organizationId,
        'usr_rahul',
        'Rahul Sharma',
        'Assigned Conversation',
        `Conversation: ${conv.contactName}`,
        `Assigned to ${assignedUserName}`
      );
    } else if (action === 'update_status') {
      conv.status = status;
      logAudit(
        organizationId,
        'usr_rahul',
        'Rahul Sharma',
        'Updated Conversation Status',
        `Conversation: ${conv.contactName}`,
        `Set status to ${status}`
      );
    } else if (action === 'mark_read') {
      conv.unreadCount = 0;
    }

    saveDB(db);
    return NextResponse.json(conv);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
