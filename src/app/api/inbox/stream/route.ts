import { NextRequest } from 'next/server';
import { getConversations, getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_acme';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let lastCount = -1;

      const interval = setInterval(() => {
        try {
          const db = getDB();
          const currentMsgCount = db.messages.length;

          if (currentMsgCount !== lastCount) {
            lastCount = currentMsgCount;
            const convs = getConversations(orgId);
            const data = JSON.stringify({
              type: 'SYNC_CONVERSATIONS',
              conversations: convs.slice(0, 30),
              timestamp: new Date().toISOString()
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (err) {
          clearInterval(interval);
          controller.close();
        }
      }, 1500);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
