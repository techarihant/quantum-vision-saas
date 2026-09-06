import { NextRequest, NextResponse } from 'next/server';
import { processSocialCommentEvent } from '@/lib/social/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      platform = 'instagram',
      username = 'rahul123',
      postId = 'post_reel_diwali',
      commentText = 'PRICE'
    } = body;

    const result = processSocialCommentEvent({
      organizationId,
      platform,
      username,
      postId,
      commentText
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
