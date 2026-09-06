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

  const contacts: Contact[] = [
    {
      id: 'cnt_101',
      organizationId: primaryOrgId,
      firstName: 'Arihant',
      lastName: 'Jain',
      whatsappNumber: '+919876543210',
      email: 'arihant@example.com',
      company: 'TechVentures Inc.',
      country: 'India',
      city: 'Bangalore',
      source: 'Instagram Comment',
      optInStatus: true,
      optInDate: '2026-08-10T10:00:00Z',
      optOutStatus: false,
      tags: ['Lead', 'VIP', 'Instagram Lead'],
      customFields: { order_id: 'ORD-9921', lead_score: 85 },
      createdAt: '2026-08-10T10:00:00Z'
    }
  ];

  const campaigns: Campaign[] = [];
  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      organizationId: primaryOrgId,
      contactId: 'cnt_101',
      contactName: 'Arihant Jain (@arihant_jain)',
      whatsappNumber: '+919876543210',
      channel: 'instagram',
      assignedUserId: 'usr_rahul',
      assignedUserName: 'Rahul Sharma',
      status: 'OPEN',
      unreadCount: 1,
      lastMessage: 'Thanks for sending the free guide PDF!',
      lastMessageDirection: 'INBOUND',
      lastMessageAt: '2026-09-06T16:30:00Z',
      tags: ['Instagram Lead', 'Hot Lead'],
      createdAt: '2026-09-06T09:30:00Z'
    }
  ];

  const messages: Message[] = [];
  const notes: InternalNote[] = [];
  const automations: Automation[] = [];
  const suppressions: SuppressionRecord[] = [];
  const apiKeys: ApiKey[] = [];
  const webhooks: CustomerWebhook[] = [];
  const auditLogs: AuditLog[] = [];
  const usageRecords: UsageRecord[] = [];

  // Social Seed Data
  const socialAccounts: SocialAccount[] = [
    {
      id: 'soc_insta_acme',
      organizationId: primaryOrgId,
      platform: 'instagram',
      accountId: '1784140129384756',
      accountName: 'Acme Official Instagram',
      username: 'acme_official',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      status: 'CONNECTED',
      connectedAt: '2026-02-01T10:00:00Z'
    },
    {
      id: 'soc_fb_acme',
      organizationId: primaryOrgId,
      platform: 'facebook',
      accountId: '109283746591024',
      accountName: 'Acme Global Facebook Page',
      username: 'acmeglobalpage',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      status: 'CONNECTED',
      connectedAt: '2026-02-05T11:00:00Z'
    }
  ];

  const socialPosts: SocialPost[] = [
    {
      id: 'post_reel_diwali',
      organizationId: primaryOrgId,
      socialAccountId: 'soc_insta_acme',
      platformPostId: 'reel_1092837461',
      platform: 'instagram',
      postType: 'reel',
      caption: '🪔 Comment "PRICE" or "GUIDE" below to claim your exclusive festive coupon! 🎁',
      mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=80',
      permalink: 'https://instagram.com/p/C_diwali_reel',
      commentCount: 342,
      publishedAt: '2026-09-06T08:00:00Z'
    },
    {
      id: 'post_spring_launch',
      organizationId: primaryOrgId,
      socialAccountId: 'soc_insta_acme',
      platformPostId: 'post_2092837462',
      platform: 'instagram',
      postType: 'post',
      caption: 'Discover our new 2026 autumn line! Comment "INFO" to get the full catalog in DM.',
      mediaUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
      permalink: 'https://instagram.com/p/C_spring_launch',
      commentCount: 184,
      publishedAt: '2026-09-04T12:00:00Z'
    }
  ];

  const socialComments: SocialComment[] = [
    {
      id: 'cmt_1',
      organizationId: primaryOrgId,
      socialPostId: 'post_reel_diwali',
      platformCommentId: '17928374659',
      username: 'rahul123',
      commentText: 'PRICE',
      createdAt: '2026-09-06T16:30:00Z'
    },
    {
      id: 'cmt_2',
      organizationId: primaryOrgId,
      socialPostId: 'post_reel_diwali',
      platformCommentId: '17928374660',
      username: 'neha456',
      commentText: 'GUIDE',
      createdAt: '2026-09-06T16:25:00Z'
    }
  ];

  const socialLeads: SocialLead[] = [
    {
      id: 'slead_101',
      organizationId: primaryOrgId,
      socialAccountId: 'soc_insta_acme',
      socialPostId: 'post_reel_diwali',
      socialCommentId: 'cmt_1',
      contactId: 'cnt_101',
      username: 'rahul123',
      name: 'Rahul Sharma',
      platform: 'instagram',
      source: 'Instagram Reel: Festive Offer',
      keyword: 'PRICE',
      status: 'QUALIFIED',
      leadScore: 65,
      createdAt: '2026-09-06T16:30:00Z',
      lastActivityAt: '2026-09-06T16:35:00Z'
    },
    {
      id: 'slead_102',
      organizationId: primaryOrgId,
      socialAccountId: 'soc_insta_acme',
      socialPostId: 'post_reel_diwali',
      socialCommentId: 'cmt_2',
      username: 'neha456',
      name: 'Neha Singh',
      platform: 'instagram',
      source: 'Instagram Reel: Festive Offer',
      keyword: 'GUIDE',
      status: 'ENGAGED',
      leadScore: 35,
      createdAt: '2026-09-06T16:25:00Z',
      lastActivityAt: '2026-09-06T16:28:00Z'
    }
  ];

  const socialMessages: SocialMessage[] = [
    {
      id: 'smsg_1',
      organizationId: primaryOrgId,
      socialLeadId: 'slead_101',
      direction: 'OUTBOUND',
      platformMessageId: 'mid_1001',
      messageType: 'TEXT',
      content: 'Thanks for commenting PRICE! 👋 I will send you our exclusive catalog. What is your WhatsApp number to get 30% OFF?',
      status: 'READ',
      createdAt: '2026-09-06T16:31:00Z'
    },
    {
      id: 'smsg_2',
      organizationId: primaryOrgId,
      socialLeadId: 'slead_101',
      direction: 'INBOUND',
      platformMessageId: 'mid_1002',
      messageType: 'TEXT',
      content: 'Sure! My WhatsApp number is +919876543210',
      status: 'READ',
      createdAt: '2026-09-06T16:33:00Z'
    }
  ];

  const leadMagnets: LeadMagnet[] = [
    {
      id: 'mag_marketing_guide',
      organizationId: primaryOrgId,
      name: 'Free E-Commerce Growth Guide PDF',
      type: 'PDF',
      triggerKeyword: 'GUIDE',
      autoMessage: '🎉 Thanks for requesting our E-Commerce Growth Guide! Download your free PDF below:',
      mediaUrl: 'https://acme.com/downloads/ecommerce-guide-2026.pdf',
      downloadCount: 127,
      createdAt: '2026-08-15T10:00:00Z'
    },
    {
      id: 'mag_diwali_coupon',
      organizationId: primaryOrgId,
      name: 'Diwali Festive 30% OFF Coupon',
      type: 'DISCOUNT',
      triggerKeyword: 'PRICE',
      autoMessage: '🎁 Here is your 30% discount code: DIWALI30. Use it at checkout on acme.com!',
      downloadCount: 342,
      createdAt: '2026-09-01T12:00:00Z'
    }
  ];

  const commentTriggers: CommentTrigger[] = [
    {
      id: 'trig_price',
      organizationId: primaryOrgId,
      name: 'Instagram Price Comment Auto-DM',
      platform: 'instagram',
      postId: 'post_reel_diwali',
      postTitle: 'Diwali Festive Offer Reel',
      matchType: 'KEYWORD',
      keywords: ['PRICE', 'COST', 'RATE', 'DETAILS'],
      autoDmText: 'Hey! Thanks for commenting. Follow our page and reply with your WhatsApp number to get instant discount codes!',
      leadMagnetId: 'mag_diwali_coupon',
      isEnabled: true,
      totalTriggers: 342,
      leadsCaptured: 218,
      createdAt: '2026-09-05T10:00:00Z'
    },
    {
      id: 'trig_guide',
      organizationId: primaryOrgId,
      name: 'Free PDF Guide Comment Trigger',
      platform: 'instagram',
      postId: 'post_reel_diwali',
      postTitle: 'Diwali Festive Offer Reel',
      matchType: 'KEYWORD',
      keywords: ['GUIDE', 'FREE', 'PDF'],
      autoDmText: 'Hey! Here is your free E-Commerce growth guide! 🚀',
      leadMagnetId: 'mag_marketing_guide',
      isEnabled: true,
      totalTriggers: 184,
      leadsCaptured: 142,
      createdAt: '2026-09-05T11:00:00Z'
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
