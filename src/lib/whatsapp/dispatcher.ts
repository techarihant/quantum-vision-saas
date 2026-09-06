import { getWhatsAppAccount, addMessage, logAudit } from '../db';
import { sendMetaCloudApiMessage } from './cloud-api';
import { simulateOutboundMessageLifecycle } from './demo-provider';
import { Message, MessageType } from '../types';

export interface DispatchParams {
  organizationId: string;
  conversationId: string;
  contactId: string;
  contactName: string;
  whatsappNumber: string;
  campaignId?: string;
  campaignName?: string;
  templateId?: string;
  messageType: MessageType;
  content: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

export async function dispatchWhatsAppMessage(params: DispatchParams): Promise<Message> {
  const account = getWhatsAppAccount(params.organizationId);

  // Check if contact is suppressed
  // Create Message record in database initialized with QUEUED status
  const msg = addMessage(params.organizationId, {
    conversationId: params.conversationId,
    contactId: params.contactId,
    contactName: params.contactName,
    whatsappNumber: params.whatsappNumber,
    campaignId: params.campaignId,
    campaignName: params.campaignName,
    templateId: params.templateId,
    direction: 'OUTBOUND',
    messageType: params.messageType,
    content: params.content,
    status: 'QUEUED',
    sentAt: new Date().toISOString()
  });

  if (account && account.providerMode === 'official' && account.accessToken && account.phoneNumberId) {
    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.whatsappNumber.replace(/[^0-9]/g, '')
      };

      if (params.messageType === 'TEMPLATE' && params.templateName) {
        payload.type = 'template';
        payload.template = {
          name: params.templateName,
          language: { code: params.templateLanguage || 'en_US' },
          components: params.templateComponents || []
        };
      } else {
        payload.type = 'text';
        payload.text = { body: params.content };
      }

      const response = await sendMetaCloudApiMessage(account.phoneNumberId, account.accessToken, payload);
      logAudit(
        params.organizationId,
        'system',
        'Meta Cloud API',
        'Outbound Message Dispatched',
        `To: ${params.whatsappNumber}`,
        `Meta Message ID: ${response.messages?.[0]?.id || 'unknown'}`
      );
    } catch (err: any) {
      console.error('Official Meta Cloud API Dispatch error:', err);
      // In case of error, update message status to FAILED
      msg.status = 'FAILED';
      msg.errorCode = 'API_DISPATCH_ERROR';
      msg.errorMessage = err.message || 'Meta Cloud API call failed';
    }
  } else {
    // Demo Mode Simulation
    simulateOutboundMessageLifecycle(params.organizationId, msg.id);
  }

  return msg;
}
