import { NextRequest, NextResponse } from 'next/server';
import { upsertCampaignsBatch } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orgId = body.organizationId || 'org_dobcy';
    const campaigns = Array.isArray(body.campaigns) ? body.campaigns : [];

    if (!campaigns.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const updated = upsertCampaignsBatch(orgId, campaigns);
    return NextResponse.json({ success: true, count: updated.length, campaigns: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
