import { NextRequest, NextResponse } from 'next/server';
import { processFollowUnlockEvent } from '@/lib/social/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      username = 'rahul123',
      triggerId
    } = body;

    const result = processFollowUnlockEvent({
      organizationId,
      username,
      triggerId
    });

    return NextResponse.json(result);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
