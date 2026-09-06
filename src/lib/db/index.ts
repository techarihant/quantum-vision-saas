import fs from 'fs';
import path from 'path';
import { DatabaseState, generateSeedData } from './seed';
import {
  Contact,
  Campaign,
  Conversation,
  Message,
  InternalNote,
  Template,
  Segment,
  Tag,
  Automation,
  SuppressionRecord,
  ApiKey,
  CustomerWebhook,
  AuditLog,
  Organization,
  User,
  OrganizationMember,
  WhatsAppAccount,
  SocialAccount
} from '../types';

const TMP_DB_FILE = path.join('/tmp', 'saas_db.json');
const STATIC_DB_FILE = path.join(process.cwd(), 'data', 'saas_db.json');

let dbStateCache: DatabaseState | null = null;

export function getDB(): DatabaseState {
  if (dbStateCache) {
    return dbStateCache;
  }

  // 1. Try reading from /tmp/saas_db.json if updated in serverless lifecycle
  if (fs.existsSync(TMP_DB_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      dbStateCache = JSON.parse(raw);
      return dbStateCache!;
    } catch (e) {
      console.warn('Failed reading from /tmp/saas_db.json:', e);
    }
  }

  // 2. Try reading from static repo directory (data/saas_db.json)
  if (fs.existsSync(STATIC_DB_FILE)) {
    try {
      const raw = fs.readFileSync(STATIC_DB_FILE, 'utf-8');
      dbStateCache = JSON.parse(raw);
      return dbStateCache!;
    } catch (e) {
      console.warn('Failed reading static saas_db.json:', e);
    }
  }

  // 3. Fallback to initial seed data
  dbStateCache = generateSeedData();
  saveDB(dbStateCache);
  return dbStateCache;
}

export function purgeDatabase(): DatabaseState {
  dbStateCache = generateSeedData();
  saveDB(dbStateCache);
  return dbStateCache;
}

export function saveDB(state: DatabaseState) {
  dbStateCache = state;

  // Try writing to /tmp (writable in Vercel Serverless Function environment)
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to /tmp/saas_db.json:', err);
  }

  // Also try writing to local dev data directory
  try {
    const dataDir = path.dirname(STATIC_DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(STATIC_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    // Expected on read-only environments like Vercel production
  }
}

// ----------------------------------------------------
// MULTI-TENANT QUERY & MUTATION HELPERS
// ----------------------------------------------------

export function getOrganization(orgId: string): Organization | undefined {
  const db = getDB();
  return db.organizations.find((o) => o.id === orgId);
}

export function updateOrganization(orgId: string, updates: Partial<Organization>): Organization | undefined {
  const db = getDB();
  const index = db.organizations.findIndex((o) => o.id === orgId);
  if (index !== -1) {
    db.organizations[index] = { ...db.organizations[index], ...updates };
    saveDB(db);
    return db.organizations[index];
  }
  return undefined;
}

export function getWhatsAppAccount(orgId: string): WhatsAppAccount | undefined {
  const db = getDB();
  return db.whatsappAccounts.find((w) => w.organizationId === orgId);
}

export function updateWhatsAppAccount(orgId: string, updates: Partial<WhatsAppAccount>): WhatsAppAccount {
  const db = getDB();
  let account = db.whatsappAccounts.find((w) => w.organizationId === orgId);
  if (!account) {
    account = {
      id: `wa_${Date.now()}`,
      organizationId: orgId,
      providerMode: 'demo',
      metaAppId: '',
      metaAppSecret: '',
      wbaId: '',
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: `qv_verify_token_dobcy_2026`,
      webhookUrl: `https://quantum-vision-saas.vercel.app/api/webhooks/whatsapp/${orgId}`,
      phoneNumber: '+91 98765 00000',
      displayName: 'WhatsApp Business',
      qualityRating: 'GREEN',
      messagingLimit: '10,000 / day',
      accountStatus: 'CONNECTED',
      apiHealth: 'HEALTHY'
    };
    db.whatsappAccounts.push(account);
  }
  Object.assign(account, updates);
  saveDB(db);
  return account;
}

// Contact Operations
export function getContacts(
  orgId: string,
  options?: {
    search?: string;
    tag?: string;
    optInOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): { contacts: Contact[]; total: number } {
  const db = getDB();
  let list = db.contacts.filter((c) => c.organizationId === orgId);

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.whatsappNumber.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
  }

  if (options?.tag) {
    list = list.filter((c) => c.tags.includes(options.tag!));
  }

  if (options?.optInOnly) {
    list = list.filter((c) => c.optInStatus && !c.optOutStatus);
  }

  const total = list.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  const paginated = list.slice(offset, offset + limit);

  return { contacts: paginated, total };
}

export function getContactById(orgId: string, id: string): Contact | undefined {
  const db = getDB();
  return db.contacts.find((c) => c.organizationId === orgId && c.id === id);
}

export function createContact(orgId: string, contactData: Omit<Contact, 'id' | 'organizationId' | 'createdAt'>): Contact {
  const db = getDB();
  const newContact: Contact = {
    ...contactData,
    id: `cnt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    organizationId: orgId,
    createdAt: new Date().toISOString()
  };
  db.contacts.unshift(newContact);
  saveDB(db);
  return newContact;
}

export function updateContact(orgId: string, id: string, updates: Partial<Contact>): Contact | undefined {
  const db = getDB();
  const contact = db.contacts.find((c) => c.organizationId === orgId && c.id === id);
  if (contact) {
    Object.assign(contact, updates);
    saveDB(db);
    return contact;
  }
  return undefined;
}

export function deleteContact(orgId: string, id: string): boolean {
  const db = getDB();
  const initialLen = db.contacts.length;
  db.contacts = db.contacts.filter((c) => !(c.organizationId === orgId && c.id === id));
  if (db.contacts.length !== initialLen) {
    saveDB(db);
    return true;
  }
  return false;
}

// Conversation & Messaging Operations
export function getConversations(
  orgId: string,
  options?: {
    filter?: 'ALL' | 'UNREAD' | 'ASSIGNED_TO_ME' | 'UNASSIGNED' | 'OPEN' | 'RESOLVED';
    currentUserId?: string;
    search?: string;
  }
): Conversation[] {
  const db = getDB();
  let list = db.conversations.filter((c) => c.organizationId === orgId);

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.whatsappNumber.includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }

  if (options?.filter) {
    switch (options.filter) {
      case 'UNREAD':
        list = list.filter((c) => c.unreadCount > 0);
        break;
      case 'ASSIGNED_TO_ME':
        if (options.currentUserId) {
          list = list.filter((c) => c.assignedUserId === options.currentUserId);
        }
        break;
      case 'UNASSIGNED':
        list = list.filter((c) => !c.assignedUserId);
        break;
      case 'OPEN':
        list = list.filter((c) => c.status === 'OPEN');
        break;
      case 'RESOLVED':
        list = list.filter((c) => c.status === 'RESOLVED');
        break;
    }
  }

  // Sort by last message timestamp descending
  return list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getMessagesByConversation(orgId: string, conversationId: string): Message[] {
  const db = getDB();
  return db.messages
    .filter((m) => m.organizationId === orgId && m.conversationId === conversationId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export function addMessage(orgId: string, messageData: Omit<Message, 'id' | 'organizationId' | 'whatsappMessageId'>): Message {
  const db = getDB();
  const now = new Date().toISOString();
  const newMessage: Message = {
    ...messageData,
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    organizationId: orgId,
    whatsappMessageId: `wamid.${Math.random().toString(36).substring(2).toUpperCase()}`,
    sentAt: now,
    deliveredAt: messageData.direction === 'OUTBOUND' ? now : undefined,
    readAt: messageData.direction === 'OUTBOUND' ? now : undefined
  };

  db.messages.push(newMessage);

  // Update or create corresponding conversation
  let conv = db.conversations.find((c) => c.organizationId === orgId && c.id === messageData.conversationId);
  if (!conv) {
    conv = {
      id: messageData.conversationId,
      organizationId: orgId,
      contactId: messageData.contactId,
      contactName: messageData.contactName,
      whatsappNumber: messageData.whatsappNumber,
      status: 'OPEN',
      unreadCount: messageData.direction === 'INBOUND' ? 1 : 0,
      lastMessage: messageData.content,
      lastMessageDirection: messageData.direction,
      lastMessageAt: now,
      tags: [],
      createdAt: now
    };
    db.conversations.unshift(conv);
  } else {
    conv.lastMessage = messageData.content;
    conv.lastMessageDirection = messageData.direction;
    conv.lastMessageAt = now;
    if (messageData.direction === 'INBOUND') {
      conv.unreadCount += 1;
    }
  }

  saveDB(db);
  return newMessage;
}

export function getInternalNotes(orgId: string, conversationId: string): InternalNote[] {
  const db = getDB();
  return db.notes
    .filter((n) => n.organizationId === orgId && n.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addInternalNote(orgId: string, noteData: Omit<InternalNote, 'id' | 'organizationId' | 'createdAt'>): InternalNote {
  const db = getDB();
  const newNote: InternalNote = {
    ...noteData,
    id: `note_${Date.now()}`,
    organizationId: orgId,
    createdAt: new Date().toISOString()
  };
  db.notes.push(newNote);
  saveDB(db);
  return newNote;
}

// Campaign Operations
export function getCampaigns(orgId: string): Campaign[] {
  const db = getDB();
  return db.campaigns
    .filter((c) => c.organizationId === orgId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createCampaign(orgId: string, campaignData: Omit<Campaign, 'id' | 'organizationId' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'readCount' | 'replyCount' | 'failedCount' | 'optOutCount'>): Campaign {
  const db = getDB();
  const newCampaign: Campaign = {
    ...campaignData,
    id: `cmp_${Date.now()}`,
    organizationId: orgId,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    replyCount: 0,
    failedCount: 0,
    optOutCount: 0,
    createdAt: new Date().toISOString()
  };
  db.campaigns.unshift(newCampaign);
  saveDB(db);
  return newCampaign;
}

// Templates
export function getTemplates(orgId: string): Template[] {
  const db = getDB();
  return db.templates.filter((t) => t.organizationId === orgId);
}

export function createTemplate(orgId: string, templateData: Omit<Template, 'id' | 'organizationId' | 'updatedAt'>): Template {
  const db = getDB();
  const newTpl: Template = {
    id: `tpl_${Date.now()}`,
    organizationId: orgId,
    ...templateData,
    updatedAt: new Date().toISOString()
  };
  db.templates.unshift(newTpl);
  saveDB(db);
  return newTpl;
}

export function saveTemplates(orgId: string, templates: Template[]): void {
  const db = getDB();
  const otherOrgs = db.templates.filter((t) => t.organizationId !== orgId);
  db.templates = [...templates, ...otherOrgs];
  saveDB(db);
}


// Social Accounts
export function getSocialAccounts(orgId: string): SocialAccount[] {
  const db = getDB();
  return db.socialAccounts.filter((sa) => sa.organizationId === orgId);
}

export function saveSocialAccount(orgId: string, accountData: Partial<SocialAccount> & { platform: 'instagram' | 'facebook' }): SocialAccount {
  const db = getDB();
  let existing = db.socialAccounts.find((sa) => sa.organizationId === orgId && sa.platform === accountData.platform);
  if (existing) {
    Object.assign(existing, accountData);
  } else {
    existing = {
      id: `soc_${accountData.platform}_${Date.now()}`,
      organizationId: orgId,
      platform: accountData.platform,
      accountId: accountData.accountId || '',
      accountName: accountData.accountName || '',
      username: accountData.username || '',
      status: 'CONNECTED',
      connectedAt: new Date().toISOString()
    };
    db.socialAccounts.push(existing);
  }
  saveDB(db);
  return existing;
}

// Audit Log Helper
export function logAudit(orgId: string, userId: string, userName: string, action: string, entity: string, details: string) {
  const db = getDB();
  const entry: AuditLog = {
    id: `log_${Date.now()}`,
    organizationId: orgId,
    userId,
    userName,
    action,
    entity,
    details,
    createdAt: new Date().toISOString()
  };
  db.auditLogs.unshift(entry);
  saveDB(db);
}

