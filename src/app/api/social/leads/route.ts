import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const db = getDB();
  const leads = db.socialLeads.filter((l) => l.organizationId === orgId);
  return NextResponse.json(leads);
}
