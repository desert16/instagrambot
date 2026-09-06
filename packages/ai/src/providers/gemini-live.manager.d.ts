/**
 * ==============================================================================
 * GEMINI LIVE API (v2 Multimodal Voice & Realtime Streaming Session Manager)
 * ==============================================================================
 * Designed to connect to Google's Gemini Multimodal Live API via WebSocket
 * Supports bidirectional real-time audio/text streaming for Instagram Voice DMs
 * and interactive real-time AI capabilities.
 */
export interface GeminiLiveConfig {
    apiKey?: string;
    model?: string;
    systemInstruction?: string;
    voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
    sampleRate?: number;
}
export interface AudioChunk {
    data: Buffer;
    mimeType: 'audio/pcm;rate=16000' | 'audio/mp4' | 'audio/ogg';
}
export declare class GeminiLiveSessionManager {
    private apiKey;
    private endpoint;
    constructor(customConfig?: GeminiLiveConfig);
    /**
     * Generates the authenticated WebSocket URL for Gemini Multimodal Live API
     */
    getWebSocketUrl(): string;
    /**
     * Builds the initial setup message sent immediately after WebSocket connection
     */
    buildSetupPayload(model?: string, systemInstruction?: string): {
        setup: {
            model: string;
            generationConfig: {
                responseModalities: string[];
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: string;
                        };
                    };
                };
            };
            systemInstruction: {
                parts: {
                    text: string;
                }[];
            } | undefined;
        };
    };
    /**
     * Formats real-time audio chunk for streaming over Gemini Live WebSocket
     */
    formatAudioInput(audioBuffer: Buffer, mimeType?: string): {
        realtimeInput: {
            mediaChunks: {
                mimeType: string;
                data: string;
            }[];
        };
    };
    /**
     * Formats real-time text input turn for Gemini Live WebSocket
     */
    formatTextInput(text: string): {
        clientContent: {
            turns: {
                role: string;
                parts: {
                    text: string;
                }[];
            }[];
            turnComplete: boolean;
        };
    };
}
export declare const geminiLiveManager: GeminiLiveSessionManager;
