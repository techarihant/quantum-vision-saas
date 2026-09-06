import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccount, updateWhatsAppAccount, logAudit } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const account = getWhatsAppAccount(orgId);
  return NextResponse.json(account || {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_dobcy', ...updates } = body;

    const account = updateWhatsAppAccount(organizationId, updates);

    logAudit(
      organizationId,
      'usr_arihant',
      'Arihant',
      'Updated Meta WhatsApp API Credentials',
      'WhatsApp API Settings',
      `Provider mode set to ${account.providerMode}. WBAID: ${account.wbaId}`
    );

    return NextResponse.json(account);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
