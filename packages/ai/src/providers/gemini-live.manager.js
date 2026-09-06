"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiLiveManager = exports.GeminiLiveSessionManager = void 0;
const config_1 = require("@instagrambot/config");
class GeminiLiveSessionManager {
    apiKey;
    endpoint;
    constructor(customConfig) {
        this.apiKey = customConfig?.apiKey || config_1.config.GEMINI_API_KEY || '';
        this.endpoint =
            config_1.config.GEMINI_LIVE_WS_ENDPOINT ||
                'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
    }
    /**
     * Generates the authenticated WebSocket URL for Gemini Multimodal Live API
     */
    getWebSocketUrl() {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is required for Gemini Live session');
        }
        return `${this.endpoint}?key=${this.apiKey}`;
    }
    /**
     * Builds the initial setup message sent immediately after WebSocket connection
     */
    buildSetupPayload(model = 'gemini-2.0-flash-exp', systemInstruction) {
        return {
            setup: {
                model: `models/${model}`,
                generationConfig: {
                    responseModalities: ['TEXT', 'AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Aoede', // Natural voice
                            },
                        },
                    },
                },
                systemInstruction: systemInstruction
                    ? {
                        parts: [{ text: systemInstruction }],
                    }
                    : undefined,
            },
        };
    }
    /**
     * Formats real-time audio chunk for streaming over Gemini Live WebSocket
     */
    formatAudioInput(audioBuffer, mimeType = 'audio/pcm;rate=16000') {
        return {
            realtimeInput: {
                mediaChunks: [
                    {
                        mimeType,
                        data: audioBuffer.toString('base64'),
                    },
                ],
            },
        };
    }
    /**
     * Formats real-time text input turn for Gemini Live WebSocket
     */
    formatTextInput(text) {
        return {
            clientContent: {
                turns: [
                    {
                        role: 'user',
                        parts: [{ text }],
                    },
                ],
                turnComplete: true,
            },
        };
    }
}
exports.GeminiLiveSessionManager = GeminiLiveSessionManager;
exports.geminiLiveManager = new GeminiLiveSessionManager();
