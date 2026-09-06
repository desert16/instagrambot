import { AIProvider, AIConversationContext, AIResponseResult } from '../types.js';
export declare class OpenAIProvider implements AIProvider {
    readonly name = "openai";
    generateResponse(context: AIConversationContext): Promise<AIResponseResult>;
}
