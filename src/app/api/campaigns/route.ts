import { NextRequest, NextResponse } from 'next/server';
import { getDB, getCampaigns, createCampaign, logAudit, getContacts, saveDB } from '@/lib/db';
import { dispatchWhatsAppMessage } from '@/lib/whatsapp/dispatcher';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org_dobcy';
  const campaigns = getCampaigns(orgId);
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId = 'org_dobcy',
      name,
      description = '',
      targetAudienceType,
      targetAudienceId,
      targetAudienceName,
      templateId,
      templateName,
      variableMapping,
      scheduledAt
    } = body;

    if (!name || !templateId) {
      return NextResponse.json({ error: 'Campaign name and approved template are required' }, { status: 400 });
    }

    const db = getDB();
    const template = db.templates.find((t) => t.id === templateId && t.organizationId === organizationId);
    if (!template || template.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Selected template is not approved' }, { status: 400 });
    }

    // Determine audience contacts
    let audienceContacts = db.contacts.filter(
      (c) => c.organizationId === organizationId && c.optInStatus && !c.optOutStatus
    );

    if (targetAudienceType === 'TAG' && targetAudienceId) {
      const tag = db.tags.find((t) => t.id === targetAudienceId);
      if (tag) {
        audienceContacts = audienceContacts.filter((c) => c.tags.includes(tag.name));
      }
    } else if (targetAudienceType === 'SEGMENT' && targetAudienceId) {
      const seg = db.segments.find((s) => s.id === targetAudienceId);
      if (seg) {
        // filter by segment conditions
        audienceContacts = audienceContacts.filter((c) => {
          return seg.conditions.every((cond) => {
            if (cond.field === 'country') return c.country.toLowerCase() === cond.value.toLowerCase();
            if (cond.field === 'city') return c.city.toLowerCase() === cond.value.toLowerCase();
            if (cond.field === 'tag') return c.tags.includes(cond.value);
            return true;
          });
        });
      }
    }

    const status = scheduledAt ? 'SCHEDULED' : 'SENDING';

    const campaign = createCampaign(organizationId, {
      name,
      description,
      status,
      targetAudienceType,
      targetAudienceId,
      targetAudienceName: targetAudienceName || 'Target Audience',
      templateId,
      templateName,
      variableMapping: variableMapping || {},
      totalRecipients: audienceContacts.length,
      scheduledAt,
      sentAt: scheduledAt ? undefined : new Date().toISOString()
    });

    logAudit(
      organizationId,
      'usr_rahul',
      'Rahul Sharma',
      'Created Marketing Campaign',
      `Campaign: ${name}`,
      `Audience: ${audienceContacts.length} recipients. Status: ${status}`
    );

    // If Send Now, execute background worker queue dispatch
    if (!scheduledAt) {
      setTimeout(async () => {
        let sent = 0;
        let failed = 0;

        for (const contact of audienceContacts) {
          try {
            // Build personalized content
            let content = template.bodyText;
            Object.entries(variableMapping || {}).forEach(([varKey, fieldKey]) => {
              const fk = String(fieldKey);
              let val = '';
              if (fk === 'firstName') val = contact.firstName;
              else if (fk === 'company') val = contact.company;
              else if (fk === 'city') val = contact.city;
              else val = (contact.customFields[fk] as string) || '';

              content = content.replace(new RegExp(`\\{\\{${varKey}\\}\\}`, 'g'), val || 'there');
            });

            // Find or create conversation
            let conv = db.conversations.find((c) => c.organizationId === organizationId && c.contactId === contact.id);
            const convId = conv ? conv.id : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

            await dispatchWhatsAppMessage({
              organizationId,
              conversationId: convId,
              contactId: contact.id,
              contactName: `${contact.firstName} ${contact.lastName}`,
              whatsappNumber: contact.whatsappNumber,
              campaignId: campaign.id,
              campaignName: campaign.name,
              templateId: template.id,
              messageType: 'TEMPLATE',
              content: content,
              templateName: template.name
            });

            sent++;
          } catch (e) {
            failed++;
          }
        }

        const currentDb = getDB();
        const cmp = currentDb.campaigns.find((c) => c.id === campaign.id);
        if (cmp) {
          cmp.status = 'COMPLETED';
          cmp.sentCount = sent;
          cmp.failedCount = failed;
          saveDB(currentDb);
        }
      }, 500);
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
