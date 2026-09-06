"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const config_1 = require("@instagrambot/config");
class OpenAIProvider {
    name = 'openai';
    async generateResponse(context) {
        const startTime = Date.now();
        const apiKey = config_1.config.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }
        const modelName = context.settings.model || config_1.config.OPENAI_MODEL || 'gpt-4o-mini';
        let knowledgeSection = '';
        if (context.knowledgeBaseSnippets.length > 0) {
            knowledgeSection = `\n\n[BİLGİ BANKASI]:\n` +
                context.knowledgeBaseSnippets
                    .map((kb, i) => `--- ${kb.title} ---\n${kb.content}`)
                    .join('\n\n');
        }
        const systemPrompt = `${context.settings.systemPrompt}
${knowledgeSection}
Instagram: @${context.accountUsername}
Müşteri: ${context.customerName || context.customerUsername || 'Müşteri'}
Kurallar: Kibar, kurumsal, Türkçe ve net ol. Gizli bilgi talep etme.`;
        const messages = [
            { role: 'system', content: systemPrompt },
        ];
        for (const msg of context.recentMessages) {
            messages.push({
                role: msg.role,
                content: msg.content,
            });
        }
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages,
                temperature: context.settings.temperature ?? 0.7,
                max_tokens: context.settings.maxTokens ?? 500,
            }),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API error (${response.status}): ${err}`);
        }
        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content?.trim() || context.settings.fallbackMessage;
        const latencyMs = Date.now() - startTime;
        return {
            text: generatedText,
            confidence: 0.9,
            tokensUsed: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0,
            },
            shouldHandoff: false,
            provider: this.name,
            model: modelName,
            latencyMs,
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
