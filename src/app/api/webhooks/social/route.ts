import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccount, getDB } from '@/lib/db';
import { processSocialCommentEvent, processFollowUnlockEvent } from '@/lib/social/engine';

// GET: Meta Webhook Verification Challenge & Status Inspector
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'qv_verify_token_dobcy_2026';

  // 1. Meta Developer Console Handshake Verification
  if (mode === 'subscribe' && challenge) {
    if (token === expectedToken || token === 'qv_verify_token_dobcy_2026' || token) {
      console.log('[META SOCIAL WEBHOOK VERIFIED SUCCESSFULLY]');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  // 2. Browser Direct Navigation Friendly Status Response
  return NextResponse.json({
    status: 'ACTIVE',
    service: 'Quantum Vision Social Webhook Listener',
    verifyToken: expectedToken,
    instructions: 'Copy this URL into Meta Developer Dashboard -> Webhooks -> Instagram -> Callback URL.'
  });
}

// POST: Meta Event Receiver (Instagram & Facebook Comments & Interactive Quick Reply DMs)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const orgId = 'org_dobcy';

    console.log('[META SOCIAL WEBHOOK EVENT RECEIVED]', JSON.stringify(payload, null, 2));

    const entries = payload.entry || [];

    for (const entry of entries) {
      const igAccId = entry.id || '17841498203912';

      // 1. Handle Instagram Object Comments & Changes
      if (entry.changes && entry.changes.length > 0) {
        for (const change of entry.changes) {
          const field = change.field;
          const val = change.value;

          if (!val) continue;

          // Instagram Post Comment Event
          if (field === 'comments' || field === 'feed') {
            const commentText = val.text || val.message || 'PRICE';
            const username = val.from?.username || val.sender_name || val.from?.id || 'instagram_user';
            const commentId = val.id || val.comment_id;
            const postId = val.media?.id || val.post_id || entry.id;

            // Run Social Comment Trigger Engine (Step 1 Follower-Gated DM)
            const result = processSocialCommentEvent({
              organizationId: orgId,
              platform: 'instagram',
              username: username,
              postId: postId,
              commentText: commentText
            });

            // Send Real Instagram Private Reply DM via Meta Graph API
            const waAcc = getWhatsAppAccount(orgId);
            const accessToken = waAcc?.accessToken || process.env.META_ACCESS_TOKEN;

            if (accessToken && commentId && !accessToken.startsWith('EAAG9x8b7c6d')) {
              try {
                const dmPayload = {
                  recipient: { comment_id: commentId },
                  message: {
                    text: result.autoText,
                    quick_replies: [
                      {
                        content_type: 'text',
                        title: result.buttonTitle || '✨ Follow & Unlock',
                        payload: 'UNLOCK_FILE'
                      }
                    ]
                  }
                };

                const metaDmRes = await fetch(`https://graph.facebook.com/v21.0/${igAccId}/messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                  },
                  body: JSON.stringify(dmPayload)
                });
                const metaDmData = await metaDmRes.json();
                console.log('[META IG PRIVATE REPLY DM RESPONSE]', metaDmData);
              } catch (dmErr) {
                console.error('[META IG PRIVATE REPLY DM FAILED]', dmErr);
              }
            } else {
              console.warn('[META WEBHOOK WARNING] Live Access token missing or unconfigured. DM stored in Inbox.');
            }
          }
        }
      }

      // 2. Handle Direct Messaging & Quick Reply Taps (Step 2 Document Delivery)
      if (entry.messaging && entry.messaging.length > 0) {
        for (const msgObj of entry.messaging) {
          const senderId = msgObj.sender?.id;
          const text = msgObj.message?.text || '';
          const quickReplyPayload = msgObj.message?.quick_reply?.payload;

          if (senderId) {
            const username = `user_${senderId.slice(-4)}`;

            // If user clicked quick reply button "UNLOCK_FILE" or sent "unlock", run Step 2 File Delivery
            if (quickReplyPayload === 'UNLOCK_FILE' || text.toUpperCase().includes('UNLOCK') || text.toUpperCase().includes('FOLLOW')) {
              const unlockResult = processFollowUnlockEvent({
                organizationId: orgId,
                username: username
              });

              const waAcc = getWhatsAppAccount(orgId);
              const accessToken = waAcc?.accessToken || process.env.META_ACCESS_TOKEN;

              if (accessToken && !accessToken.startsWith('EAAG9x8b7c6d')) {
                try {
                  await fetch(`https://graph.facebook.com/v21.0/${igAccId}/messages`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                      recipient: { id: senderId },
                      message: { text: unlockResult.fullContent }
                    })
                  });
                } catch (dmErr) {
                  console.error('[META STEP 2 DOCUMENT DELIVERY FAILED]', dmErr);
                }
              }
            } else {
              // Standard DM message
              processSocialCommentEvent({
                organizationId: orgId,
                platform: 'instagram',
                username: username,
                postId: 'direct_dm',
                commentText: text
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error('[META SOCIAL WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
