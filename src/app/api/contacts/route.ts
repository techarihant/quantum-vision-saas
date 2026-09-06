import { NextRequest, NextResponse } from 'next/server';
import { getContacts, createContact } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_acme';
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
    const orgId = body.organizationId || 'org_acme';

    if (!body.firstName || !body.whatsappNumber) {
      return NextResponse.json({ error: 'First Name and WhatsApp Number are required' }, { status: 400 });
    }

    const contact = createContact(orgId, {
      firstName: body.firstName,
      lastName: body.lastName || '',
      whatsappNumber: body.whatsappNumber.startsWith('+') ? body.whatsappNumber : `+${body.whatsappNumber}`,
      email: body.email || '',
      company: body.company || '',
      country: body.country || 'India',
      city: body.city || '',
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
