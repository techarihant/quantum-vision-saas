import { NextRequest, NextResponse } from 'next/server';
import { getDB, createContact, logAudit, saveDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId = 'org_acme', rows, columnMapping } = body;

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid rows payload' }, { status: 400 });
    }

    const db = getDB();
    const existingContacts = db.contacts.filter((c) => c.organizationId === organizationId);
    const existingNumbers = new Set(existingContacts.map((c) => c.whatsappNumber.replace(/[^0-9]/g, '')));
    const suppressedNumbers = new Set(
      db.suppressions.filter((s) => s.organizationId === organizationId).map((s) => s.whatsappNumber.replace(/[^0-9]/g, ''))
    );

    let totalRows = rows.length;
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;
    let importedCount = 0;

    const importedItems = [];

    for (const row of rows) {
      const rawName = row[columnMapping.firstName || 'First Name'] || row['Name'] || row['name'] || '';
      const rawPhone = String(row[columnMapping.whatsappNumber || 'WhatsApp Number'] || row['Phone'] || row['Mobile'] || '');
      const rawEmail = row[columnMapping.email || 'Email'] || '';
      const rawCompany = row[columnMapping.company || 'Company'] || '';
      const rawCity = row[columnMapping.city || 'City'] || '';

      const cleanedPhone = rawPhone.replace(/[^0-9+]/g, '');

      // Validation
      if (!cleanedPhone || cleanedPhone.replace(/[^0-9]/g, '').length < 8) {
        invalidCount++;
        continue;
      }

      const digits = cleanedPhone.replace(/[^0-9]/g, '');

      if (suppressedNumbers.has(digits)) {
        skippedCount++;
        continue;
      }

      if (existingNumbers.has(digits)) {
        duplicateCount++;
        continue;
      }

      validCount++;
      existingNumbers.add(digits);

      const formattedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone}`;
      const firstName = rawName.split(' ')[0] || 'Subscriber';
      const lastName = rawName.split(' ').slice(1).join(' ') || '';

      const contact = createContact(organizationId, {
        firstName,
        lastName,
        whatsappNumber: formattedPhone,
        email: rawEmail,
        company: rawCompany,
        country: formattedPhone.startsWith('+91') ? 'India' : 'United States',
        city: rawCity,
        source: 'CSV Import',
        optInStatus: true,
        optInDate: new Date().toISOString(),
        optOutStatus: false,
        tags: ['Imported Lead'],
        customFields: {}
      });

      importedItems.push(contact);
      importedCount++;
    }

    logAudit(
      organizationId,
      'usr_amit',
      'Amit Kumar',
      'Bulk Contacts Import',
      `Contacts List (${importedCount} imported)`,
      `Processed ${totalRows} rows. Valid: ${validCount}, Imported: ${importedCount}, Skipped/Opted-Out: ${skippedCount}, Duplicates: ${duplicateCount}, Invalid: ${invalidCount}.`
    );

    return NextResponse.json({
      summary: {
        totalRows,
        validCount,
        invalidCount,
        duplicateCount,
        skippedCount,
        importedCount
      },
      contacts: importedItems.slice(0, 10)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
