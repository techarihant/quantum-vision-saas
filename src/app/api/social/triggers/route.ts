import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, logAudit } from '@/lib/db';
import { CommentTrigger } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_acme';
  const db = getDB();
  const triggers = db.commentTriggers.filter((t) => t.organizationId === orgId);
  return NextResponse.json(triggers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_acme',
      name,
      platform = 'instagram',
      postId,
      postTitle,
      matchType = 'KEYWORD',
      keywords = [],
      autoDmText,
      leadMagnetId
    } = body;

    if (!name || !autoDmText) {
      return NextResponse.json({ error: 'Name and automated DM text are required' }, { status: 400 });
    }

    const db = getDB();
    const trigger: CommentTrigger = {
      id: `trig_${Date.now()}`,
      organizationId,
      name,
      platform,
      postId,
      postTitle: postTitle || 'Instagram Post',
      matchType,
      keywords: keywords.length > 0 ? keywords : ['PRICE', 'GUIDE', 'INFO'],
      autoDmText,
      leadMagnetId,
      isEnabled: true,
      totalTriggers: 0,
      leadsCaptured: 0,
      createdAt: new Date().toISOString()
    };

    db.commentTriggers.unshift(trigger);
    saveDB(db);

    logAudit(
      organizationId,
      'usr_rahul',
      'Rahul Sharma',
      'Created Comment Trigger',
      `Trigger: ${name}`,
      `Keywords: ${trigger.keywords.join(', ')}`
    );

    return NextResponse.json(trigger, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
