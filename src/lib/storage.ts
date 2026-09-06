import { Contact, Campaign, Template } from './types';

const CONTACTS_KEY = (orgId: string) => `qv_contacts_${orgId}`;
const CAMPAIGNS_KEY = (orgId: string) => `qv_campaigns_${orgId}`;
const TEMPLATES_KEY = (orgId: string) => `qv_templates_${orgId}`;

// ------------------- CONTACTS LOCAL PERSISTENCE -------------------
export function getLocalContacts(orgId: string): Contact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONTACTS_KEY(orgId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local contacts', e);
    return [];
  }
}

export function saveLocalContacts(orgId: string, contacts: Contact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_KEY(orgId), JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save local contacts', e);
  }
}

export function upsertLocalContact(orgId: string, contact: Contact): Contact[] {
  const current = getLocalContacts(orgId);
  const idx = current.findIndex((c) => c.id === contact.id || c.whatsappNumber === contact.whatsappNumber);
  let updated: Contact[];
  if (idx !== -1) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...contact };
  } else {
    updated = [contact, ...current];
  }
  saveLocalContacts(orgId, updated);
  return updated;
}

// ------------------- CAMPAIGNS LOCAL PERSISTENCE -------------------
export function getLocalCampaigns(orgId: string): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY(orgId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local campaigns', e);
    return [];
  }
}

export function saveLocalCampaigns(orgId: string, campaigns: Campaign[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAMPAIGNS_KEY(orgId), JSON.stringify(campaigns));
  } catch (e) {
    console.error('Failed to save local campaigns', e);
  }
}

export function upsertLocalCampaign(orgId: string, campaign: Campaign): Campaign[] {
  const current = getLocalCampaigns(orgId);
  const idx = current.findIndex((c) => c.id === campaign.id);
  let updated: Campaign[];
  if (idx !== -1) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...campaign };
  } else {
    updated = [campaign, ...current];
  }
  saveLocalCampaigns(orgId, updated);
  return updated;
}

// ------------------- TEMPLATES LOCAL PERSISTENCE -------------------
export function getLocalTemplates(orgId: string): Template[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY(orgId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local templates', e);
    return [];
  }
}

export function saveLocalTemplates(orgId: string, templates: Template[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATES_KEY(orgId), JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save local templates', e);
  }
}

export function mergeTemplates(serverTemplates: Template[], localTemplates: Template[]): Template[] {
  const map = new Map<string, Template>();
  
  for (const t of localTemplates) {
    map.set(t.id || t.name, t);
  }
  
  for (const t of serverTemplates) {
    map.set(t.id || t.name, t);
  }
  
  return Array.from(map.values());
}

// ------------------- SYNC MERGE UTILITIES -------------------
export function mergeContacts(serverContacts: Contact[], localContacts: Contact[]): Contact[] {
  const map = new Map<string, Contact>();
  
  // First load local contacts
  for (const c of localContacts) {
    map.set(c.id || c.whatsappNumber, c);
  }
  
  // Overlay server contacts (or vice versa)
  for (const c of serverContacts) {
    map.set(c.id || c.whatsappNumber, c);
  }
  
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export function mergeCampaigns(serverCampaigns: Campaign[], localCampaigns: Campaign[]): Campaign[] {
  const map = new Map<string, Campaign>();
  
  for (const c of localCampaigns) {
    map.set(c.id, c);
  }
  
  for (const c of serverCampaigns) {
    map.set(c.id, c);
  }
  
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

