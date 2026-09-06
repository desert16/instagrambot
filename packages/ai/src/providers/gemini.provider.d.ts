import { AIProvider, AIConversationContext, AIResponseResult } from '../types.js';
export declare class GeminiProvider implements AIProvider {
    readonly name = "gemini";
    generateResponse(context: AIConversationContext): Promise<AIResponseResult>;
}
