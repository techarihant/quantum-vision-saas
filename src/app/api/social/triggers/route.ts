import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, logAudit } from '@/lib/db';
import { CommentTrigger } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const db = getDB();
  const triggers = db.commentTriggers.filter((t) => t.organizationId === orgId);
  return NextResponse.json(triggers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      name,
      platform = 'instagram',
      postId,
      postTitle,
      matchType = 'KEYWORD',
      keywords = [],
      autoDmText,
      leadMagnetId,
      requireFollow = true,
      followMessage,
      followButtonText = '✨ Follow & Unlock PDF',
      fileUrl = 'https://quantum-vision-saas.vercel.app/docs/mastjaipur_catalog.pdf',
      fileType = 'PDF',
      deliveryMessage
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Trigger name is required' }, { status: 400 });
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
      keywords: keywords.length > 0 ? keywords : ['PRICE', 'GUIDE', 'INFO', 'DEMO'],
      autoDmText: autoDmText || 'Thanks for commenting! Reply with your WhatsApp number for instant offers.',
      leadMagnetId,
      requireFollow,
      followMessage: followMessage || `👋 Hey! We noticed you are not following us yet on Instagram. Tap '✨ Follow @mastjaipur & Unlock' below to get your ${fileType || 'PDF / Photo Catalog'}!`,
      followButtonText,
      fileUrl,
      fileType,
      deliveryMessage: deliveryMessage || `🎉 Thank you for following us! Here is your requested ${fileType || 'PDF Catalog'} link:`,
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
