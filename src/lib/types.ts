export type UserRole = 'owner' | 'admin' | 'marketer' | 'agent' | 'viewer' | string;

export type PermissionKey =
  | 'manage_organization'
  | 'manage_team'
  | 'manage_billing'
  | 'manage_api_keys'
  | 'send_campaigns'
  | 'create_templates'
  | 'manage_automations'
  | 'manage_social_leads'
  | 'access_inbox'
  | 'reply_messages'
  | 'view_contacts'
  | 'export_contacts'
  | 'delete_data';

export interface CustomRole {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystemRole: boolean;
  userCount?: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'Free' | 'Starter' | 'Growth' | 'Enterprise';
  messageLimit: number;
  contactsLimit: number;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  role: UserRole;
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface WhatsAppAccount {
  id: string;
  organizationId: string;
  providerMode: 'official' | 'demo';
  metaAppId: string;
  metaAppSecret: string;
  wbaId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  webhookUrl: string;
  phoneNumber: string;
  displayName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  messagingLimit: string;
  accountStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastWebhookAt?: string;
  apiHealth: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
}

export interface Contact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  email: string;
  company: string;
  country: string;
  city: string;
  source: string;
  optInStatus: boolean;
  optInDate: string;
  optOutStatus: boolean;
  optOutDate?: string;
  tags: string[];
  customFields: Record<string, string | number>;
  createdAt: string;
  lastMessageAt?: string;
  lastCampaignId?: string;
  lastCampaignName?: string;
}

export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  count: number;
}

export interface SegmentCondition {
  field: 'country' | 'city' | 'tag' | 'email' | 'whatsappNumber' | 'optInStatus' | 'createdAfter';
  operator: 'equals' | 'not_equals' | 'contains' | 'is_true' | 'is_false';
  value: string;
}

export interface Segment {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  matchType: 'AND' | 'OR';
  conditions: SegmentCondition[];
  contactCount: number;
  updatedAt: string;
}

export interface Template {
  id: string;
  organizationId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  variables: string[]; // e.g. ["1", "2"]
  updatedAt: string;
}

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | 'FAILED';

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  targetAudienceType: 'ALL' | 'SEGMENT' | 'TAG';
  targetAudienceId?: string;
  targetAudienceName: string;
  templateId: string;
  templateName: string;
  variableMapping: Record<string, string>;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  replyCount: number;
  failedCount: number;
  optOutCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type MessageType = 'TEXT' | 'TEMPLATE' | 'IMAGE' | 'DOCUMENT';

export interface Message {
  id: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  contactName: string;
  whatsappNumber: string;
  campaignId?: string;
  campaignName?: string;
  templateId?: string;
  whatsappMessageId: string;
  direction: MessageDirection;
  messageType: MessageType;
  content: string;
  status: MessageStatus;
  errorCode?: string;
  errorMessage?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  whatsappNumber: string;
  channel?: 'whatsapp' | 'instagram' | 'facebook';
  assignedUserId?: string;
  assignedUserName?: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  unreadCount: number;
  lastMessage: string;
  lastMessageDirection: MessageDirection;
  lastMessageAt: string;
  tags: string[];
  createdAt: string;
}

export interface InternalNote {
  id: string;
  organizationId: string;
  conversationId: string;
  userId: string;
  userName: string;
  note: string;
  createdAt: string;
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  subtitle?: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Automation {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  triggerType: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  totalRuns: number;
  lastRunAt?: string;
  createdAt: string;
}

export interface SuppressionRecord {
  id: string;
  organizationId: string;
  whatsappNumber: string;
  reason: string;
  keyword: string;
  optedOutAt: string;
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface CustomerWebhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
}

export interface UsageRecord {
  organizationId: string;
  month: string;
  messagesSent: number;
  messagesLimit: number;
  contactsCount: number;
  contactsLimit: number;
  campaignsCount: number;
  automationRuns: number;
}

// ----------------------------------------------------
// MANYCHAT-STYLE SOCIAL AUTOMATION & LEAD MAGNET TYPES
// ----------------------------------------------------

export type SocialPlatform = 'instagram' | 'facebook';

export interface SocialAccount {
  id: string;
  organizationId: string;
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  username: string;
  avatar?: string;
  accessToken?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'REAUTH_NEEDED' | 'ERROR';
  connectedAt: string;
}

export interface SocialPost {
  id: string;
  organizationId: string;
  socialAccountId: string;
  platformPostId: string;
  platform: SocialPlatform;
  postType: 'post' | 'reel';
  caption: string;
  mediaUrl: string;
  permalink: string;
  commentCount: number;
  publishedAt: string;
}

export interface SocialComment {
  id: string;
  organizationId: string;
  socialPostId: string;
  platformCommentId: string;
  username: string;
  commentText: string;
  createdAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'ENGAGED' | 'QUALIFIED' | 'CONVERTED' | 'UNQUALIFIED' | 'OPTED_OUT';

export interface SocialLead {
  id: string;
  organizationId: string;
  socialAccountId: string;
  socialPostId?: string;
  socialCommentId?: string;
  contactId?: string; // Linked WhatsApp CRM Contact when handoff occurs!
  username: string;
  name: string;
  profileName?: string; // Alias for UI display
  phone?: string; // WhatsApp phone number collected via DM
  commentText?: string; // Original post comment
  platform: SocialPlatform;
  source: string; // e.g. "Instagram Reel: Summer Offer"
  keyword: string; // e.g. "PRICE"
  triggerKeyword?: string; // Alias for UI display
  status: LeadStatus;
  leadScore: number;
  createdAt: string;
  lastActivityAt: string;
}

export interface SocialMessage {
  id: string;
  organizationId: string;
  socialLeadId: string;
  direction: MessageDirection;
  platformMessageId: string;
  messageType: 'TEXT' | 'MEDIA' | 'QUICK_REPLY';
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
}

export interface LeadMagnet {
  id: string;
  organizationId: string;
  name: string;
  title?: string;
  type: 'PDF' | 'DISCOUNT' | 'DEMO' | 'CATALOG';
  category?: string;
  triggerKeyword: string;
  autoMessage: string;
  deliveryMessage?: string;
  mediaUrl?: string;
  fileUrl?: string;
  downloadCount: number;
  downloadsCount?: number;
  leadsConverted?: number;
  createdAt: string;
}

export interface CommentTrigger {
  id: string;
  organizationId: string;
  name: string;
  platform: SocialPlatform;
  postId?: string; // Specific post or all posts
  postTitle?: string;
  matchType: 'ANY' | 'KEYWORD';
  keywords: string[];
  autoDmText: string;
  leadMagnetId?: string;
  requireFollow?: boolean;
  followMessage?: string;
  followButtonText?: string;
  fileUrl?: string;
  fileType?: 'PDF' | 'PHOTO' | 'DOC' | 'LINK';
  deliveryMessage?: string;
  isEnabled: boolean;
  totalTriggers: number;
  leadsCaptured: number;
  createdAt: string;
}

