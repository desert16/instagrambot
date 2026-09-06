/**
 * ==============================================================================
 * @instagrambot/types — Shared Domain Types & Contracts
 * ==============================================================================
 */

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

export enum InstagramAccountStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  WEBHOOK_ERROR = 'WEBHOOK_ERROR',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

export interface InstagramCapabilities {
  accountConnected: boolean;
  tokenValid: boolean;
  permissionsValid: boolean;
  messagingReady: boolean;
  webhookReady: boolean;
  aiReady: boolean;
  lastCheckedAt?: string;
  issues: string[];
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  SPAM = 'SPAM',
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum MessageSender {
  CUSTOMER = 'CUSTOMER',
  AI = 'AI',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export enum MessageMediaType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
}

export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  GEMINI_LIVE = 'gemini_live',
}

export interface AISettingsDto {
  enabled: boolean;
  provider: AIProviderType;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  language: string;
  fallbackMessage: string;
  confidenceThreshold: number;
  handoffKeywords: string[];
  businessHoursOnly: boolean;
  autoReplyDelay: number;
  humanHandoffEnabled: boolean;
}

export enum AutomationTriggerType {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  FIRST_MESSAGE = 'FIRST_MESSAGE',
  KEYWORD = 'KEYWORD',
  CONVERSATION_OPENED = 'CONVERSATION_OPENED',
  TAG_ADDED = 'TAG_ADDED',
  BUSINESS_HOURS = 'BUSINESS_HOURS',
  TIME_DELAY = 'TIME_DELAY',
}

export enum AutomationConditionOperator {
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  EQUALS = 'equals',
  REGEX = 'regex',
  TAG_EXISTS = 'tag_exists',
  BUSINESS_HOURS = 'business_hours',
  CONVERSATION_STATUS = 'conversation_status',
  AI_ENABLED = 'ai_enabled',
}

export enum AutomationActionType {
  SEND_MESSAGE = 'SEND_MESSAGE',
  SEND_AI_RESPONSE = 'SEND_AI_RESPONSE',
  ADD_TAG = 'ADD_TAG',
  REMOVE_TAG = 'REMOVE_TAG',
  ASSIGN_AGENT = 'ASSIGN_AGENT',
  ASSIGN_TEAM = 'ASSIGN_TEAM',
  MARK_RESOLVED = 'MARK_RESOLVED',
  ENABLE_AI = 'ENABLE_AI',
  DISABLE_AI = 'DISABLE_AI',
  WAIT = 'WAIT',
  WEBHOOK = 'WEBHOOK',
  CREATE_NOTE = 'CREATE_NOTE',
}

export interface AutomationCondition {
  field: string;
  operator: AutomationConditionOperator;
  value: string | boolean | number;
}

export interface AutomationAction {
  type: AutomationActionType;
  payload: Record<string, unknown>;
}

export interface AutomationRuleDto {
  id: string;
  name: string;
  trigger: AutomationTriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  priority: number;
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text?: string;
      attachments?: Array<{
        type: string;
        payload: { url: string };
      }>;
      is_echo?: boolean;
    };
    read?: {
      mid: string;
      watermark: number;
    };
    delivery?: {
      mids: string[];
      watermark: number;
    };
  }>;
  changes?: Array<{
    field: string;
    value: Record<string, unknown>;
  }>;
}

export interface MetaWebhookPayload {
  object: 'instagram' | 'page';
  entry: MetaWebhookEntry[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

export enum WebSocketEventType {
  MESSAGE_CREATED = 'message.created',
  MESSAGE_UPDATED = 'message.updated',
  CONVERSATION_UPDATED = 'conversation.updated',
  CONVERSATION_UNREAD_CHANGE = 'conversation.unread_change',
  TYPING_INDICATOR = 'agent.typing',
  AI_STATUS_CHANGE = 'ai.status_change',
  NOTIFICATION = 'notification.new',
}

export interface RealtimeMessagePayload {
  workspaceId: string;
  conversationId: string;
  messageId: string;
  direction: MessageDirection;
  senderType: MessageSender;
  text: string;
  mediaUrl?: string;
  createdAt: string;
}
