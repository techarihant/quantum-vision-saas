import { NextRequest, NextResponse } from 'next/server';
import { getWebhookLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const logs = getWebhookLogs(orgId);
  return NextResponse.json(logs);
}
