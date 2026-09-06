"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiEngine = exports.AIEngine = void 0;
const gemini_provider_js_1 = require("./providers/gemini.provider.js");
const openai_provider_js_1 = require("./providers/openai.provider.js");
class AIEngine {
    providers = new Map();
    constructor() {
        this.registerProvider(new gemini_provider_js_1.GeminiProvider());
        this.registerProvider(new openai_provider_js_1.OpenAIProvider());
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    /**
     * Checks if user message matches any human handoff keywords
     */
    detectHandoffKeyword(text, keywords) {
        if (!text || !keywords || keywords.length === 0)
            return false;
        const lower = text.toLowerCase();
        return keywords.some((kw) => lower.includes(kw.toLowerCase().trim()));
    }
    /**
     * Generates smart AI response with fallback and guardrails
     */
    async processConversation(context) {
        const { settings, recentMessages, isBusinessHours } = context;
        // 1. Check if AI is enabled for this Instagram account
        if (!settings.enabled) {
            return {
                text: '',
                confidence: 0,
                shouldHandoff: false,
                provider: 'none',
                model: 'none',
                latencyMs: 0,
            };
        }
        // 2. Check Business Hours rule if enabled
        if (settings.businessHoursOnly && !isBusinessHours) {
            return {
                text: 'Mesai saatlerimiz dışındayız. Mesajınız kaydedilmiştir, çalışma saatlerimizde size dönüş yapacağız.',
                confidence: 1.0,
                shouldHandoff: false,
                provider: 'system',
                model: 'business_hours_rule',
                latencyMs: 0,
            };
        }
        // 3. Check for Human Handoff triggers in the latest message
        const lastUserMessage = [...recentMessages].reverse().find((m) => m.role === 'user')?.content || '';
        if (settings.humanHandoffEnabled && this.detectHandoffKeyword(lastUserMessage, settings.handoffKeywords)) {
            return {
                text: settings.fallbackMessage || 'Talebinizi aldım, sizi hemen bir müşteri temsilcimize aktarıyorum.',
                confidence: 1.0,
                shouldHandoff: true,
                handoffReason: 'Müşteri insan temsilci talep etti.',
                provider: 'rule_engine',
                model: 'handoff_detector',
                latencyMs: 0,
            };
        }
        // 4. Select Primary Provider
        const primaryName = settings.provider || 'gemini';
        const primaryProvider = this.providers.get(primaryName) || this.providers.get('gemini');
        const fallbackProvider = this.providers.get('openai');
        try {
            const result = await primaryProvider.generateResponse(context);
            // Check Confidence Threshold
            if (result.confidence < (settings.confidenceThreshold ?? 0.7)) {
                return {
                    text: settings.fallbackMessage,
                    confidence: result.confidence,
                    shouldHandoff: true,
                    handoffReason: 'AI güven skoru eşiğin altında kaldı.',
                    provider: result.provider,
                    model: result.model,
                    latencyMs: result.latencyMs,
                };
            }
            return result;
        }
        catch (primaryErr) {
            console.warn(`[AIEngine] Primary provider ${primaryName} failed:`, primaryErr.message);
            // Attempt Fallback Provider if available
            if (fallbackProvider && primaryName !== 'openai') {
                try {
                    console.info('[AIEngine] Attempting fallback to OpenAI...');
                    return await fallbackProvider.generateResponse(context);
                }
                catch (fallbackErr) {
                    console.error('[AIEngine] Fallback provider also failed:', fallbackErr.message);
                }
            }
            // Return gracefully with fallback message
            return {
                text: settings.fallbackMessage || 'Kısa bir teknik aksaklık sebebiyle sizi müşteri temsilcimize aktarıyorum.',
                confidence: 0,
                shouldHandoff: true,
                handoffReason: `AI sağlayıcı hatası: ${primaryErr.message}`,
                provider: 'fallback_error',
                model: 'none',
                latencyMs: 0,
            };
        }
    }
}
exports.AIEngine = AIEngine;
exports.aiEngine = new AIEngine();
