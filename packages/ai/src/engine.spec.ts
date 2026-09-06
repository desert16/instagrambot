import { describe, it, expect } from 'vitest';
import { aiEngine } from '../src/engine.js';
import { AIConversationContext } from '../src/types.js';

describe('AIEngine', () => {
  it('should detect human handoff keywords accurately', () => {
    const keywords = ['yetkili', 'insan', 'temsilci', 'canlı destek'];

    expect(aiEngine.detectHandoffKeyword('Bir yetkili ile görüşebilir miyim?', keywords)).toBe(true);
    expect(aiEngine.detectHandoffKeyword('Lütfen insan bir temsilci bağlayın', keywords)).toBe(true);
    expect(aiEngine.detectHandoffKeyword('Keten takımın fiyatı nedir?', keywords)).toBe(false);
  });

  it('should trigger handoff when customer uses handoff keywords', async () => {
    const mockContext: AIConversationContext = {
      conversationId: 'conv_123',
      workspaceId: 'ws_123',
      instagramAccountId: 'ig_123',
      accountUsername: 'test_butik',
      settings: {
        enabled: true,
        provider: 'gemini' as any,
        model: 'gemini-1.5-flash',
        systemPrompt: 'Sen asistansın.',
        temperature: 0.7,
        maxTokens: 500,
        language: 'tr',
        fallbackMessage: 'Yetkili temsilcimize aktarıyorum.',
        confidenceThreshold: 0.7,
        handoffKeywords: ['yetkili', 'insan'],
        businessHoursOnly: false,
        autoReplyDelay: 3,
        humanHandoffEnabled: true,
      },
      recentMessages: [
        { role: 'user', content: 'Lütfen bana bir yetkili bağlar mısınız?' },
      ],
      knowledgeBaseSnippets: [],
      isBusinessHours: true,
    };

    const result = await aiEngine.processConversation(mockContext);

    expect(result.shouldHandoff).toBe(true);
    expect(result.text).toBe('Yetkili temsilcimize aktarıyorum.');
  });
});
