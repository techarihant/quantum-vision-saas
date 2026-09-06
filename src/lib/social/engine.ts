import { getDB, saveDB, createContact, logAudit } from '../db';
import { SocialLead, SocialMessage, CommentTrigger } from '../types';

export interface CommentEventParams {
  organizationId: string;
  platform: 'instagram' | 'facebook';
  username: string;
  postId?: string;
  commentText: string;
}

export function processSocialCommentEvent(params: CommentEventParams) {
  const db = getDB();
  const orgId = params.organizationId;
  const normalizedComment = params.commentText.trim().toUpperCase();

  // Find matching Comment Trigger
  const triggers = db.commentTriggers.filter((t) => t.organizationId === orgId && t.isEnabled);
  let matchedTrigger: CommentTrigger | undefined;

  for (const trig of triggers) {
    if (trig.matchType === 'ANY') {
      matchedTrigger = trig;
      break;
    }
    const hasKeyword = trig.keywords.some((kw) => normalizedComment.includes(kw.toUpperCase()));
    if (hasKeyword) {
      matchedTrigger = trig;
      break;
    }
  }

  const keyword = matchedTrigger ? matchedTrigger.keywords[0] || 'COMMENT' : 'COMMENT';

  // Safeguard check: Trigger only once per user per post
  let lead = db.socialLeads.find((l) => l.organizationId === orgId && l.username === params.username);

  const now = new Date().toISOString();

  if (!lead) {
    lead = {
      id: `slead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      organizationId: orgId,
      socialAccountId: 'soc_insta_acme',
      socialPostId: params.postId || 'post_reel_diwali',
      username: params.username,
      name: `@${params.username}`,
      platform: params.platform,
      source: `${params.platform === 'instagram' ? 'Instagram' : 'Facebook'} Comment`,
      keyword: keyword,
      status: 'NEW',
      leadScore: 15, // +5 for comment, +10 for initial DM engagement
      createdAt: now,
      lastActivityAt: now
    };
    db.socialLeads.unshift(lead);
  } else {
    lead.leadScore += 5; // +5 score for additional comments
    lead.lastActivityAt = now;
  }

  if (matchedTrigger) {
    matchedTrigger.totalTriggers += 1;
    matchedTrigger.leadsCaptured += 1;
  }

  // Create Outbound Instagram DM
  const autoText = matchedTrigger
    ? matchedTrigger.autoDmText
    : `Thanks for commenting on our post! 👋 Reply with your WhatsApp phone number to get instant discount codes & offers.`;

  const dmMsg: SocialMessage = {
    id: `smsg_${Date.now()}`,
    organizationId: orgId,
    socialLeadId: lead.id,
    direction: 'OUTBOUND',
    platformMessageId: `mid_${Math.random().toString(36).substring(2)}`,
    messageType: 'TEXT',
    content: autoText,
    status: 'DELIVERED',
    createdAt: now
  };

  db.socialMessages.push(dmMsg);

  // Sync to Shared Inbox Conversations & Messages for instant Inbox visibility
  const convId = `conv_social_${lead.id}`;
  let conv = db.conversations.find((c) => c.organizationId === orgId && (c.id === convId || c.contactName === `@${params.username}`));

  if (!conv) {
    conv = {
      id: convId,
      organizationId: orgId,
      contactId: `cnt_social_${params.username}`,
      contactName: `@${params.username}`,
      whatsappNumber: `@${params.username}`,
      channel: (params.platform === 'facebook' ? 'facebook' : 'instagram') as any,
      status: 'OPEN',
      unreadCount: 1,
      lastMessage: autoText,
      lastMessageDirection: 'OUTBOUND',
      lastMessageAt: now,
      tags: ['Instagram Lead', keyword],
      createdAt: now
    };
    db.conversations.unshift(conv);
  } else {
    conv.lastMessage = autoText;
    conv.lastMessageDirection = 'OUTBOUND';
    conv.lastMessageAt = now;
    conv.unreadCount += 1;
  }

  // Create message entries in db.messages for thread display in Shared Inbox
  const inboundCommentMsg = {
    id: `msg_in_${Date.now()}`,
    organizationId: orgId,
    conversationId: conv.id,
    contactId: conv.contactId,
    contactName: conv.contactName,
    whatsappNumber: conv.whatsappNumber,
    direction: 'INBOUND',
    platformMessageId: `mid_in_${Math.random().toString(36).substring(2)}`,
    messageType: 'TEXT',
    content: `Commented: "${params.commentText}" on Post`,
    status: 'READ',
    sentAt: new Date(Date.now() - 2000).toISOString(),
    deliveredAt: new Date(Date.now() - 2000).toISOString(),
    createdAt: new Date(Date.now() - 2000).toISOString()
  };

  const outboundDmMsg = {
    id: `msg_out_${Date.now()}`,
    organizationId: orgId,
    conversationId: conv.id,
    contactId: conv.contactId,
    contactName: conv.contactName,
    whatsappNumber: conv.whatsappNumber,
    direction: 'OUTBOUND',
    platformMessageId: `mid_out_${Math.random().toString(36).substring(2)}`,
    messageType: 'TEXT',
    content: autoText,
    status: 'DELIVERED',
    sentAt: now,
    deliveredAt: now,
    createdAt: now
  };

  db.messages.push(inboundCommentMsg as any);
  db.messages.push(outboundDmMsg as any);

  saveDB(db);

  logAudit(
    orgId,
    'sys_social_bot',
    'ManyChat Social Engine',
    'Triggered Comment DM',
    `User: @${params.username}`,
    `Commented: "${params.commentText}". Matched Keyword: ${keyword}. DM dispatched.`
  );

  return { lead, message: dmMsg, matchedTrigger };
}

// Social to WhatsApp Handoff
export function processSocialToWhatsAppHandoff(
  orgId: string,
  leadId: string,
  whatsappNumber: string,
  firstName?: string
) {
  const db = getDB();
  const lead = db.socialLeads.find((l) => l.organizationId === orgId && l.id === leadId);
  if (!lead) return null;

  // Clean phone number
  const formattedPhone = whatsappNumber.startsWith('+') ? whatsappNumber : `+${whatsappNumber}`;

  // Check if contact already exists in CRM
  let contact = db.contacts.find(
    (c) => c.organizationId === orgId && c.whatsappNumber.replace(/[^0-9]/g, '') === formattedPhone.replace(/[^0-9]/g, '')
  );

  const now = new Date().toISOString();

  if (!contact) {
    contact = createContact(orgId, {
      firstName: firstName || lead.username,
      lastName: '',
      whatsappNumber: formattedPhone,
      email: '',
      company: '',
      country: formattedPhone.startsWith('+91') ? 'India' : 'International',
      city: '',
      source: `${lead.platform === 'instagram' ? 'Instagram' : 'Facebook'} DM Handoff`,
      optInStatus: true,
      optInDate: now,
      optOutStatus: false,
      tags: ['Instagram Lead', 'Hot Lead'],
      customFields: { social_username: lead.username, lead_score: lead.leadScore + 20 }
    });
  }

  // Update lead status & score
  lead.contactId = contact.id;
  lead.status = 'QUALIFIED';
  lead.leadScore += 25; // +25 for WhatsApp phone number collection
  lead.lastActivityAt = now;

  // Create WhatsApp conversation if not exists
  let conv = db.conversations.find((c) => c.organizationId === orgId && c.contactId === contact.id);
  if (!conv) {
    conv = {
      id: `conv_${Date.now()}`,
      organizationId: orgId,
      contactId: contact.id,
      contactName: `${contact.firstName} (@${lead.username})`,
      whatsappNumber: contact.whatsappNumber,
      channel: 'whatsapp',
      status: 'OPEN',
      unreadCount: 0,
      lastMessage: 'Opted in via Instagram Comment DM Handoff.',
      lastMessageDirection: 'INBOUND',
      lastMessageAt: now,
      tags: ['Instagram Lead'],
      createdAt: now
    };
    db.conversations.unshift(conv);
  }

  saveDB(db);

  logAudit(
    orgId,
    'sys_social_bot',
    'Social -> WhatsApp Handoff',
    'WhatsApp Contact Created',
    `Contact: ${contact.firstName} (${contact.whatsappNumber})`,
    `Successfully handed off Instagram lead @${lead.username} to WhatsApp CRM follow-up workflow.`
  );

  return { contact, conv, lead };
}
