import { AIProvider, AIConversationContext, AIResponseResult } from './types.js';
export declare class AIEngine {
    private providers;
    constructor();
    registerProvider(provider: AIProvider): void;
    /**
     * Checks if user message matches any human handoff keywords
     */
    detectHandoffKeyword(text: string, keywords: string[]): boolean;
    /**
     * Generates smart AI response with fallback and guardrails
     */
    processConversation(context: AIConversationContext): Promise<AIResponseResult>;
}
export declare const aiEngine: AIEngine;
