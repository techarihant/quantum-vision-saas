import { NextRequest, NextResponse } from 'next/server';
import { simulateIncomingCustomerMessage } from '@/lib/whatsapp/demo-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_dobcy', contactId, whatsappNumber, senderName, content } = body;

    const target = whatsappNumber || contactId;
    if (!target || !content) {
      return NextResponse.json({ error: 'whatsappNumber/contactId and message content are required' }, { status: 400 });
    }

    const message = simulateIncomingCustomerMessage(organizationId, target, content, senderName);

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
