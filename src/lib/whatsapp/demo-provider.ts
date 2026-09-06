import { getDB, saveDB, addMessage, logAudit, createContact } from '../db';
import { Message, MessageStatus, Contact } from '../types';

export function simulateOutboundMessageLifecycle(orgId: string, messageId: string) {
  const db = getDB();
  const msg = db.messages.find((m) => m.organizationId === orgId && m.id === messageId);
  if (!msg) return;

  // Lifecycle progression: QUEUED -> SENT -> DELIVERED -> READ
  setTimeout(() => {
    const currentDb = getDB();
    const target = currentDb.messages.find((m) => m.id === messageId);
    if (target && target.status === 'QUEUED') {
      target.status = 'SENT';
      target.sentAt = new Date().toISOString();
      saveDB(currentDb);
    }
  }, 400);

  setTimeout(() => {
    const currentDb = getDB();
    const target = currentDb.messages.find((m) => m.id === messageId);
    if (target && target.status === 'SENT') {
      target.status = 'DELIVERED';
      target.deliveredAt = new Date().toISOString();
      
      // Update campaign stats if applicable
      if (target.campaignId) {
        const cmp = currentDb.campaigns.find((c) => c.id === target.campaignId);
        if (cmp) cmp.deliveredCount += 1;
      }
      saveDB(currentDb);
    }
  }, 1000);

  setTimeout(() => {
    const currentDb = getDB();
    const target = currentDb.messages.find((m) => m.id === messageId);
    if (target && target.status === 'DELIVERED') {
      target.status = 'READ';
      target.readAt = new Date().toISOString();
      
      // Update campaign stats if applicable
      if (target.campaignId) {
        const cmp = currentDb.campaigns.find((c) => c.id === target.campaignId);
        if (cmp) cmp.readCount += 1;
      }
      saveDB(currentDb);
    }
  }, 2200);
}

export function simulateIncomingCustomerMessage(
  orgId: string,
  contactIdOrPhone: string,
  content: string,
  senderName?: string
) {
  const db = getDB();
  let contact: Contact | undefined = db.contacts.find(
    (c) =>
      c.organizationId === orgId &&
      (c.id === contactIdOrPhone || c.whatsappNumber.replace(/[^0-9]/g, '') === contactIdOrPhone.replace(/[^0-9]/g, ''))
  );

  if (!contact) {
    const cleanDigits = contactIdOrPhone.replace(/[^0-9]/g, '');
    const formattedPhone = contactIdOrPhone.startsWith('+') ? contactIdOrPhone : `+${cleanDigits || '919876543210'}`;
    contact = createContact(orgId, {
      firstName: senderName || 'WhatsApp Customer',
      lastName: '',
      whatsappNumber: formattedPhone,
      email: '',
      company: '',
      country: formattedPhone.startsWith('+91') ? 'India' : 'International',
      city: '',
      source: 'WhatsApp Inbound',
      optInStatus: true,
      optInDate: new Date().toISOString(),
      optOutStatus: false,
      tags: ['Inbound Lead'],
      customFields: {}
    });
  }

  const activeContact = contact;

  // Check for opt-out keywords
  const normalized = content.trim().toUpperCase();
  const isOptOut = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'NO'].includes(normalized);

  if (isOptOut) {
    activeContact.optOutStatus = true;
    activeContact.optOutDate = new Date().toISOString();
    
    // Add to suppression records if not exists
    const exists = db.suppressions.some((s) => s.organizationId === orgId && s.whatsappNumber === activeContact.whatsappNumber);
    if (!exists) {
      db.suppressions.push({
        id: `sup_${Date.now()}`,
        organizationId: orgId,
        whatsappNumber: activeContact.whatsappNumber,
        reason: `Opted out via message: ${content}`,
        keyword: normalized,
        optedOutAt: new Date().toISOString()
      });
    }

    logAudit(
      orgId,
      'sys_webhook',
      'Meta Webhook Engine',
      'Opt-Out Registered',
      `Contact: ${activeContact.firstName} ${activeContact.lastName}`,
      `Received opt-out keyword '${normalized}'. Marketing messages suspended.`
    );
  }

  // Find conversation
  let conv = db.conversations.find((c) => c.organizationId === orgId && c.contactId === activeContact.id);
  const convId = conv ? conv.id : `conv_${Date.now()}`;

  const incomingMsg = addMessage(orgId, {
    conversationId: convId,
    contactId: activeContact.id,
    contactName: `${activeContact.firstName} ${activeContact.lastName}`.trim(),
    whatsappNumber: activeContact.whatsappNumber,
    direction: 'INBOUND',
    messageType: 'TEXT',
    content: content,
    status: 'DELIVERED',
    sentAt: new Date().toISOString()
  });

  activeContact.lastMessageAt = new Date().toISOString();

  // If conversation was resolved, reopen it!
  conv = db.conversations.find((c) => c.id === convId);
  if (conv) {
    if (conv.status === 'RESOLVED') {
      conv.status = 'OPEN';
    }
  }

  saveDB(db);
  return incomingMsg;
}
