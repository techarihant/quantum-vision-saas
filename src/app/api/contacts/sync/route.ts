import { NextRequest, NextResponse } from 'next/server';
import { upsertContactsBatch } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orgId = body.organizationId || 'org_dobcy';
    const contacts = Array.isArray(body.contacts) ? body.contacts : [];

    if (!contacts.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const updated = upsertContactsBatch(orgId, contacts);
    return NextResponse.json({ success: true, count: updated.length, contacts: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
