import { NextRequest, NextResponse } from 'next/server';
import { getMessagesByConversation, getContactById, getDB, saveDB } from '@/lib/db';
import { dispatchWhatsAppMessage } from '@/lib/whatsapp/dispatcher';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId parameter is required' }, { status: 400 });
  }

  const messages = getMessagesByConversation(orgId, conversationId);

  // Clear unread count when messages are viewed
  const db = getDB();
  const conv = db.conversations.find((c) => c.organizationId === orgId && c.id === conversationId);
  if (conv && conv.unreadCount > 0) {
    conv.unreadCount = 0;
    saveDB(db);
  }

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      conversationId,
      contactId,
      content,
      messageType = 'TEXT',
      templateId
    } = body;

    if (!conversationId || !contactId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contact = getContactById(organizationId, contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const message = await dispatchWhatsAppMessage({
      organizationId,
      conversationId,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      whatsappNumber: contact.whatsappNumber,
      templateId,
      messageType,
      content
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
