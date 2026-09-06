import { NextRequest, NextResponse } from 'next/server';
import { getContacts, createContact } from '@/lib/db';
import { sanitizePhoneNumber, sanitizeInput } from '@/lib/security';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const search = searchParams.get('search') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const optInOnly = searchParams.get('optInOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const result = getContacts(orgId, { search, tag, optInOnly, limit, offset });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orgId = body.organizationId || 'org_dobcy';

    if (!body.firstName || !body.whatsappNumber) {
      return NextResponse.json({ error: 'First Name and WhatsApp Number are required' }, { status: 400 });
    }

    const formattedPhone = sanitizePhoneNumber(body.whatsappNumber);

    const contact = createContact(orgId, {
      firstName: sanitizeInput(body.firstName),
      lastName: sanitizeInput(body.lastName || ''),
      whatsappNumber: formattedPhone,
      email: body.email ? sanitizeInput(body.email) : '',
      company: body.company ? sanitizeInput(body.company) : '',
      country: body.country ? sanitizeInput(body.country) : 'India',
      city: body.city ? sanitizeInput(body.city) : '',
      source: body.source || 'Manual Creation',
      optInStatus: body.optInStatus !== undefined ? body.optInStatus : true,
      optInDate: new Date().toISOString(),
      optOutStatus: false,
      tags: body.tags || ['Lead'],
      customFields: body.customFields || {}
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
