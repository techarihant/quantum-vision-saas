import { NextRequest, NextResponse } from 'next/server';
import { getDB, getLiveMetaAccessToken, getWebhookLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';

  const db = getDB();
  const accessToken = getLiveMetaAccessToken(orgId);

  let metaTokenValid = false;
  let metaProfile: any = null;
  let metaError: string | null = null;

  if (accessToken) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (res.ok && data.id) {
        metaTokenValid = true;
        metaProfile = data;
      } else {
        metaError = data.error?.message || 'Invalid OAuth token';
      }
    } catch (e: any) {
      metaError = e.message;
    }
  } else {
    metaError = 'No live Meta Access Token configured in Settings or Environment.';
  }

  const triggers = db.commentTriggers.filter((t) => t.organizationId === orgId);
  const leads = db.socialLeads.filter((l) => l.organizationId === orgId);
  const logs = getWebhookLogs(orgId);

  return NextResponse.json({
    webhookStatus: 'ACTIVE',
    webhookUrl: 'https://quantum-vision-saas.vercel.app/api/webhooks/social',
    verifyToken: 'qv_verify_token_dobcy_2026',
    metaTokenValid,
    metaProfile,
    metaError,
    activeTriggersCount: triggers.length,
    capturedLeadsCount: leads.length,
    triggers: triggers.map((t) => ({
      id: t.id,
      name: t.name,
      keywords: t.keywords,
      requireFollow: t.requireFollow,
      fileUrl: t.fileUrl,
      fileType: t.fileType
    }))
  });
}
