import {
  Organization,
  User,
  OrganizationMember,
  WhatsAppAccount,
  Contact,
  Tag,
  Segment,
  Template,
  Campaign,
  Conversation,
  Message,
  InternalNote,
  Automation,
  SuppressionRecord,
  ApiKey,
  CustomerWebhook,
  AuditLog,
  UsageRecord,
  SocialAccount,
  SocialPost,
  SocialComment,
  SocialLead,
  SocialMessage,
  LeadMagnet,
  CommentTrigger
} from '../types';

export interface DatabaseState {
  organizations: Organization[];
  users: User[];
  members: OrganizationMember[];
  whatsappAccounts: WhatsAppAccount[];
  contacts: Contact[];
  tags: Tag[];
  segments: Segment[];
  templates: Template[];
  campaigns: Campaign[];
  conversations: Conversation[];
  messages: Message[];
  notes: InternalNote[];
  automations: Automation[];
  suppressions: SuppressionRecord[];
  apiKeys: ApiKey[];
  webhooks: CustomerWebhook[];
  auditLogs: AuditLog[];
  usageRecords: UsageRecord[];
  // Social Automation State
  socialAccounts: SocialAccount[];
  socialPosts: SocialPost[];
  socialComments: SocialComment[];
  socialLeads: SocialLead[];
  socialMessages: SocialMessage[];
  leadMagnets: LeadMagnet[];
  commentTriggers: CommentTrigger[];
}

export function generateSeedData(): DatabaseState {
  const primaryOrgId = 'org_dobcy';
  const secondaryOrgId = 'org_quantumvision';

  const organizations: Organization[] = [
    {
      id: primaryOrgId,
      name: 'Dobcy',
      slug: 'dobcy',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      plan: 'Enterprise',
      messageLimit: 500000,
      contactsLimit: 100000,
      createdAt: '2025-01-10T08:00:00Z'
    },
    {
      id: secondaryOrgId,
      name: 'Quantum Vision Labs',
      slug: 'quantum-vision-labs',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      plan: 'Enterprise',
      messageLimit: 1000000,
      contactsLimit: 500000,
      createdAt: '2025-02-01T10:00:00Z'
    }
  ];

  const users: User[] = [
    {
      id: 'usr_arihant',
      name: 'Arihant',
      email: 'arihant@quantumvision.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      createdAt: '2025-01-10T08:00:00Z'
    },
    {
      id: 'usr_priya',
      name: 'Priya Patel',
      email: 'priya@quantumvision.in',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      createdAt: '2025-01-12T09:30:00Z'
    },
    {
      id: 'usr_neha',
      name: 'Neha Singh',
      email: 'neha@quantumvision.in',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'agent',
      createdAt: '2025-01-20T14:15:00Z'
    }
  ];

  const members: OrganizationMember[] = [
    {
      id: 'mem_1',
      organizationId: primaryOrgId,
      userId: 'usr_arihant',
      userEmail: 'arihant@quantumvision.in',
      userName: 'Arihant',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      status: 'active',
      joinedAt: '2025-01-10T08:00:00Z'
    }
  ];

  const whatsappAccounts: WhatsAppAccount[] = [
    {
      id: 'wa_dobcy_official',
      organizationId: primaryOrgId,
      providerMode: 'official',
      metaAppId: '',
      metaAppSecret: '',
      wbaId: '',
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: 'qv_verify_token_dobcy_2026',
      webhookUrl: 'https://quantum-vision-saas.vercel.app/api/webhooks/whatsapp/org_dobcy',
      phoneNumber: '+91 98765 00000',
      displayName: 'Dobcy WhatsApp Business',
      qualityRating: 'GREEN',
      messagingLimit: '100,000 / day',
      accountStatus: 'CONNECTED',
      lastWebhookAt: '2026-09-06T16:45:00Z',
      apiHealth: 'HEALTHY'
    }
  ];

  const tags: Tag[] = [
    { id: 'tag_lead', organizationId: primaryOrgId, name: 'Lead', color: 'blue', count: 4250 },
    { id: 'tag_customer', organizationId: primaryOrgId, name: 'Customer', color: 'emerald', count: 6800 },
    { id: 'tag_vip', organizationId: primaryOrgId, name: 'VIP', color: 'amber', count: 1200 },
    { id: 'tag_insta_lead', organizationId: primaryOrgId, name: 'Instagram Lead', color: 'rose', count: 850 }
  ];

  const segments: Segment[] = [];
  const templates: Template[] = [];

  const contacts: Contact[] = [];
  const campaigns: Campaign[] = [];
  const conversations: Conversation[] = [];
  const messages: Message[] = [];
  const notes: InternalNote[] = [];
  const automations: Automation[] = [];
  const suppressions: SuppressionRecord[] = [];
  const apiKeys: ApiKey[] = [];
  const webhooks: CustomerWebhook[] = [];
  const auditLogs: AuditLog[] = [];
  const usageRecords: UsageRecord[] = [];

  // Social Seed Data
  const socialAccounts: SocialAccount[] = [];
  const socialPosts: SocialPost[] = [];
  const socialComments: SocialComment[] = [];
  const socialLeads: SocialLead[] = [];
  const socialMessages: SocialMessage[] = [];
  const leadMagnets: LeadMagnet[] = [];
  const commentTriggers: CommentTrigger[] = [
    {
      id: 'trig_price',
      organizationId: primaryOrgId,
      name: 'Instagram Price Comment Auto-DM',
      platform: 'instagram',
      matchType: 'KEYWORD',
      keywords: ['PRICE', 'COST', 'RATE', 'DETAILS'],
      autoDmText: 'Hey! Thanks for commenting. Reply with your WhatsApp number to get instant details & offers!',
      isEnabled: true,
      totalTriggers: 0,
      leadsCaptured: 0,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    organizations,
    users,
    members,
    whatsappAccounts,
    contacts,
    tags,
    segments,
    templates,
    campaigns,
    conversations,
    messages,
    notes,
    automations,
    suppressions,
    apiKeys,
    webhooks,
    auditLogs,
    usageRecords,
    socialAccounts,
    socialPosts,
    socialComments,
    socialLeads,
    socialMessages,
    leadMagnets,
    commentTriggers
  };
}
