import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccount } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_dobcy', phoneNumberId, accessToken } = body;

    const account = getWhatsAppAccount(organizationId);
    const targetPhoneId = phoneNumberId || account?.phoneNumberId;
    const targetToken = accessToken || account?.accessToken;

    if (!targetPhoneId || !targetToken) {
      return NextResponse.json({
        success: false,
        error: 'Phone Number ID and System User Access Token are required to test Meta Cloud API connection.'
      }, { status: 400 });
    }

    // Call Meta Graph API Cloud Endpoint for Phone Number Details
    const metaUrl = `https://graph.facebook.com/v21.0/${targetPhoneId}?fields=display_phone_number,verified_name,quality_rating,status,code_verification_status&access_token=${encodeURIComponent(targetToken)}`;

    const res = await fetch(metaUrl, { method: 'GET' });
    const json = await res.json();

    if (!res.ok || json.error) {
      const metaErr = json.error || {};
      return NextResponse.json({
        success: false,
        error: `Meta API Connection Error (Code ${metaErr.code || res.status}): ${metaErr.message || 'Verification failed'}`,
        details: metaErr
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      displayPhoneNumber: json.display_phone_number,
      verifiedName: json.verified_name,
      qualityRating: json.quality_rating || 'GREEN',
      status: json.status || 'CONNECTED',
      codeVerificationStatus: json.code_verification_status || 'VERIFIED'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Connection check failed: ${err.message}`
    }, { status: 500 });
  }
}
