import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccount, getDB, saveDB } from '@/lib/db';
import { verifyMetaWebhookToken } from '@/lib/whatsapp/cloud-api';
import { verifyMetaWebhookSignature } from '@/lib/security';
import { simulateIncomingCustomerMessage } from '@/lib/whatsapp/demo-provider';

// Webhook Verification (GET request from Meta)
export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const account = getWhatsAppAccount(orgId);
  const expectedToken = account?.webhookVerifyToken || process.env.META_WEBHOOK_VERIFY_TOKEN || 'qv_verify_token_dobcy_2026';

  // Security check: Match token against stored account token, env token, or standard fallback
  if (mode === 'subscribe' && challenge && (token === expectedToken || token === 'qv_verify_token_dobcy_2026')) {
    console.log(`[META WEBHOOK] Verified successfully for org: ${orgId}`);
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  console.warn(`[META WEBHOOK FAILED] Token mismatch. Expected: ${expectedToken}, Got: ${token}`);
  return new NextResponse('Verification failed', { status: 403 });
}

// Webhook Event Receiver (POST request from Meta)
export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');

    // Security check: Verify Meta SHA256 HMAC Signature if header present
    if (signatureHeader) {
      const isValidSig = verifyMetaWebhookSignature(rawBody, signatureHeader);
      if (!isValidSig) {
        console.warn(`[SECURITY WARNING] Invalid Meta webhook signature for org: ${orgId}`);
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Idempotency / Duplicate Webhook check
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: 'ignored_empty_payload' });
    }

    const db = getDB();

    // Handle Incoming Customer Messages
    if (value.messages && value.messages.length > 0) {
      for (const msg of value.messages) {
        const metaMsgId = msg.id;
        const fromNumber = `+${msg.from}`;
        const textContent = msg.text?.body || msg.caption || '[Media Message]';

        // Check if message ID already processed (Idempotency)
        const alreadyExists = db.messages.some((m) => m.whatsappMessageId === metaMsgId);
        if (alreadyExists) {
          continue;
        }

        // Find or create contact
        let contact = db.contacts.find((c) => c.organizationId === orgId && c.whatsappNumber.replace(/[^0-9]/g, '') === fromNumber.replace(/[^0-9]/g, ''));
        if (!contact) {
          contact = {
            id: `cnt_${Date.now()}`,
            organizationId: orgId,
            firstName: value.contacts?.[0]?.profile?.name || 'WhatsApp User',
            lastName: '',
            whatsappNumber: fromNumber,
            email: '',
            company: '',
            country: fromNumber.startsWith('+91') ? 'India' : 'International',
            city: '',
            source: 'WhatsApp Inbound',
            optInStatus: true,
            optInDate: new Date().toISOString(),
            optOutStatus: false,
            tags: ['Inbound Lead'],
            customFields: {},
            createdAt: new Date().toISOString()
          };
          db.contacts.unshift(contact);
        }

        // Dispatch incoming processing logic (creates message, updates conv, checks opt-out)
        simulateIncomingCustomerMessage(orgId, contact.id, textContent);
      }
    }

    // Handle Message Status Updates (Delivered / Read events)
    if (value.statuses && value.statuses.length > 0) {
      for (const statusObj of value.statuses) {
        const metaMsgId = statusObj.id;
        const newStatus = statusObj.status?.toUpperCase(); // DELIVERED, READ, FAILED

        const targetMsg = db.messages.find((m) => m.whatsappMessageId === metaMsgId);
        if (targetMsg) {
          if (newStatus === 'DELIVERED') {
            targetMsg.status = 'DELIVERED';
            targetMsg.deliveredAt = new Date(statusObj.timestamp * 1000).toISOString();
          } else if (newStatus === 'READ') {
            targetMsg.status = 'READ';
            targetMsg.readAt = new Date(statusObj.timestamp * 1000).toISOString();
          } else if (newStatus === 'FAILED') {
            targetMsg.status = 'FAILED';
            targetMsg.errorCode = statusObj.errors?.[0]?.code || 'META_FAILED';
            targetMsg.errorMessage = statusObj.errors?.[0]?.title || 'Message delivery failed';
          }
        }
      }
      saveDB(db);
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error('Meta Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
