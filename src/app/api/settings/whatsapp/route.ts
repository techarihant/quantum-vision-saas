import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccount, updateWhatsAppAccount, logAudit } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_acme';
  const account = getWhatsAppAccount(orgId);
  return NextResponse.json(account || {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_acme', ...updates } = body;

    const account = updateWhatsAppAccount(organizationId, updates);

    logAudit(
      organizationId,
      'usr_rahul',
      'Rahul Sharma',
      'Updated WhatsApp Settings',
      'WhatsApp API Settings',
      `Provider mode set to ${account.providerMode}. Display Name: ${account.displayName}`
    );

    return NextResponse.json(account);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
