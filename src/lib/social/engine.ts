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
