import { NextRequest, NextResponse } from 'next/server';
import { processSocialToWhatsAppHandoff } from '@/lib/social/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_acme',
      leadId,
      whatsappNumber,
      firstName
    } = body;

    if (!leadId || !whatsappNumber) {
      return NextResponse.json({ error: 'leadId and whatsappNumber are required' }, { status: 400 });
    }

    const result = processSocialToWhatsAppHandoff(organizationId, leadId, whatsappNumber, firstName);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
