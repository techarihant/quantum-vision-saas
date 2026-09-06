import { NextResponse } from 'next/server';
import { getSocialAccounts, saveSocialAccount, getDB, saveDB } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_dobcy';

    const accounts = getSocialAccounts(orgId);
    return NextResponse.json({ success: true, socialAccounts: accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organizationId = 'org_dobcy',
      instagramUsername = '',
      instagramAccountId = '',
      facebookPageName = '',
      facebookPageId = '',
      pageAccessToken = '',
      webhookVerifyToken = 'qv_social_verify_token_2026'
    } = body;

    const cleanInstaUser = instagramUsername.trim().replace(/^@/, '');

    const instaAccount = saveSocialAccount(organizationId, {
      platform: 'instagram',
      username: cleanInstaUser,
      accountId: instagramAccountId.trim(),
      accountName: cleanInstaUser ? `@${cleanInstaUser}` : 'Instagram Business',
      status: instagramAccountId ? 'CONNECTED' : 'DISCONNECTED'
    });

    const fbAccount = saveSocialAccount(organizationId, {
      platform: 'facebook',
      accountName: facebookPageName.trim() || 'Facebook Page',
      accountId: facebookPageId.trim(),
      username: facebookPageId.trim(),
      status: facebookPageId ? 'CONNECTED' : 'DISCONNECTED'
    });

    // Test live connection if token and ID are present
    let liveVerified = false;
    let liveDetails = null;
    let apiError = null;

    if (instagramAccountId && pageAccessToken) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username,name&access_token=${pageAccessToken}`
        );
        const data = await res.json();
        if (res.ok && data.id) {
          liveVerified = true;
          liveDetails = data;
        } else {
          apiError = data.error?.message || 'Failed to verify Instagram Graph API access token.';
        }
      } catch (err: any) {
        apiError = err.message || 'Network error verifying Meta API.';
      }
    }

    return NextResponse.json({
      success: true,
      socialAccounts: [instaAccount, fbAccount],
      liveVerified,
      liveDetails,
      apiError
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
