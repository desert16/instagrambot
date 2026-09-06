import { AISettingsDto } from '@instagrambot/types';

export interface AIMessageHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface KnowledgeItem {
  title: string;
  content: string;
}

export interface AIConversationContext {
  conversationId: string;
  workspaceId: string;
  instagramAccountId: string;
  accountUsername: string;
  customerUsername?: string;
  customerName?: string;
  settings: AISettingsDto;
  recentMessages: AIMessageHistoryItem[];
  knowledgeBaseSnippets: KnowledgeItem[];
  isBusinessHours: boolean;
}

export interface AIResponseResult {
  text: string;
  confidence: number;
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  shouldHandoff: boolean;
  handoffReason?: string;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface AIProvider {
  name: string;
  generateResponse(context: AIConversationContext): Promise<AIResponseResult>;
}
