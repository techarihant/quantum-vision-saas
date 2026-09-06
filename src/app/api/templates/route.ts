import { NextResponse } from 'next/server';
import { getTemplates, createTemplate, getWhatsAppAccount, saveTemplates } from '@/lib/db';
import { Template } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_dobcy';

    let templates = getTemplates(orgId);
    const account = getWhatsAppAccount(orgId);

    // If Meta WBA ID & Access Token configured, fetch live templates directly from Meta Graph API
    if (account?.wbaId && account?.accessToken) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/${account.wbaId}/message_templates?limit=100`,
          {
            headers: {
              Authorization: `Bearer ${account.accessToken}`
            }
          }
        );

        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (Array.isArray(metaData.data)) {
            const liveTemplates: Template[] = metaData.data.map((m: any) => {
              const bodyComp = m.components?.find((c: any) => c.type === 'BODY');
              const headerComp = m.components?.find((c: any) => c.type === 'HEADER');
              const footerComp = m.components?.find((c: any) => c.type === 'FOOTER');

              const bodyText = bodyComp?.text || '';
              const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
              const variables: string[] = Array.from(new Set(matches.map((v: string) => v.replace(/[\{\}]/g, ''))));

              return {
                id: m.id || `tpl_meta_${m.name}`,
                organizationId: orgId,
                name: m.name,
                category: m.category || 'MARKETING',
                language: m.language || 'en_US',
                status: (m.status || 'APPROVED').toUpperCase(),
                headerText: headerComp?.text,
                bodyText: bodyText,
                footerText: footerComp?.text,
                variables,
                updatedAt: new Date().toISOString()
              };
            });

            if (liveTemplates.length > 0) {
              saveTemplates(orgId, liveTemplates);
              templates = liveTemplates;
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync templates from Meta Graph API:', err);
      }
    }

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organizationId = 'org_dobcy',
      name,
      category = 'MARKETING',
      language = 'en_US',
      headerText,
      bodyText,
      footerText
    } = body;

    if (!name || !bodyText) {
      return NextResponse.json(
        { success: false, error: 'Template name and body text are required.' },
        { status: 400 }
      );
    }

    const formattedName = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const variables: string[] = Array.from(new Set(matches.map((v: string) => v.replace(/[\{\}]/g, ''))));

    const account = getWhatsAppAccount(organizationId);
    let metaSubmitted = false;
    let metaError: string | null = null;
    let initialStatus: 'APPROVED' | 'PENDING' | 'REJECTED' = 'APPROVED';

    // Submit to Meta Graph API if credentials exist
    if (account?.wbaId && account?.accessToken) {
      try {
        const components: any[] = [];
        if (headerText) {
          components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
        }
        components.push({ type: 'BODY', text: bodyText });
        if (footerText) {
          components.push({ type: 'FOOTER', text: footerText });
        }

        const metaPayload = {
          name: formattedName,
          category,
          allow_category_change: true,
          language,
          components
        };

        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/${account.wbaId}/message_templates`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${account.accessToken}`
            },
            body: JSON.stringify(metaPayload)
          }
        );

        const metaResult = await metaRes.json();

        if (metaRes.ok && metaResult.id) {
          metaSubmitted = true;
          initialStatus = (metaResult.status || 'PENDING').toUpperCase() as any;
        } else {
          metaError = metaResult.error?.message || 'Meta API returned an error.';
        }
      } catch (err: any) {
        metaError = err.message || 'Network error submitting to Meta API.';
      }
    } else {
      metaError = 'Meta WBA ID and Access Token are not configured in Settings.';
    }

    const created = createTemplate(organizationId, {
      name: formattedName,
      category,
      language,
      status: initialStatus,
      headerText,
      bodyText,
      footerText,
      variables
    });

    return NextResponse.json({
      success: true,
      template: created,
      submittedToMeta: metaSubmitted,
      metaError
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
