import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, logAudit } from '@/lib/db';
import { LeadMagnet } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const db = getDB();
  const magnets = db.leadMagnets.filter((m) => m.organizationId === orgId);
  return NextResponse.json(magnets);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      name,
      type = 'PDF',
      triggerKeyword = 'GUIDE',
      autoMessage,
      mediaUrl
    } = body;

    if (!name || !autoMessage) {
      return NextResponse.json({ error: 'Name and automated message content are required' }, { status: 400 });
    }

    const db = getDB();
    const magnet: LeadMagnet = {
      id: `mag_${Date.now()}`,
      organizationId,
      name,
      type,
      triggerKeyword,
      autoMessage,
      mediaUrl,
      downloadCount: 0,
      createdAt: new Date().toISOString()
    };

    db.leadMagnets.unshift(magnet);
    saveDB(db);

    logAudit(
      organizationId,
      'usr_rahul',
      'Rahul Sharma',
      'Created Lead Magnet',
      `Lead Magnet: ${name}`,
      `Keyword: ${triggerKeyword}`
    );

    return NextResponse.json(magnet, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
