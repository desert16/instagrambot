import { config } from '@instagrambot/config';

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
  data: Buffer; // PCM 16-bit 16kHz
  mimeType: 'audio/pcm;rate=16000' | 'audio/mp4' | 'audio/ogg';
}

export class GeminiLiveSessionManager {
  private apiKey: string;
  private endpoint: string;

  constructor(customConfig?: GeminiLiveConfig) {
    this.apiKey = customConfig?.apiKey || config.GEMINI_API_KEY || '';
    this.endpoint =
      config.GEMINI_LIVE_WS_ENDPOINT ||
      'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
  }

  /**
   * Generates the authenticated WebSocket URL for Gemini Multimodal Live API
   */
  public getWebSocketUrl(): string {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required for Gemini Live session');
    }
    return `${this.endpoint}?key=${this.apiKey}`;
  }

  /**
   * Builds the initial setup message sent immediately after WebSocket connection
   */
  public buildSetupPayload(model = 'gemini-2.0-flash-exp', systemInstruction?: string) {
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
  public formatAudioInput(audioBuffer: Buffer, mimeType = 'audio/pcm;rate=16000') {
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
  public formatTextInput(text: string) {
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

export const geminiLiveManager = new GeminiLiveSessionManager();
