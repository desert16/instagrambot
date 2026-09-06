import { metaApiClient } from './meta-api-client.js';

export interface SendMessageOptions {
  recipientId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  accessToken: string;
  pageOrAccountId: string;
}

export interface SendMessageResponse {
  recipient_id: string;
  message_id: string;
}

export class InstagramMessagingService {
  /**
   * Sends a standard text or media message via the official Instagram Send API
   */
  public static async sendMessage(options: SendMessageOptions): Promise<SendMessageResponse> {
    const { recipientId, text, mediaUrl, mediaType, accessToken, pageOrAccountId } = options;

    if (!text && !mediaUrl) {
      throw new Error('Message must have either text content or a mediaUrl');
    }

    const payload: Record<string, any> = {
      recipient: {
        id: recipientId,
      },
    };

    if (mediaUrl) {
      payload.message = {
        attachment: {
          type: mediaType || 'image',
          payload: {
            url: mediaUrl,
            is_reusable: true,
          },
        },
      };
      if (text) {
        // Meta supports text alongside media in some contexts or as separate caption
        payload.message.text = text;
      }
    } else {
      payload.message = {
        text,
      };
    }

    // Endpoint is /{page-id}/messages or /{instagram-scoped-id}/messages
    const endpoint = `${pageOrAccountId}/messages`;
    return metaApiClient.post<SendMessageResponse>(endpoint, payload, accessToken);
  }

  /**
   * Sets typing indicators (typing_on, typing_off, mark_seen)
   */
  public static async sendAction(
    pageOrAccountId: string,
    recipientId: string,
    action: 'typing_on' | 'typing_off' | 'mark_seen',
    accessToken: string
  ): Promise<{ success: boolean }> {
    try {
      const endpoint = `${pageOrAccountId}/messages`;
      await metaApiClient.post(
        endpoint,
        {
          recipient: { id: recipientId },
          sender_action: action,
        },
        accessToken
      );
      return { success: true };
    } catch {
      // Typing indicators failing shouldn't block main message pipeline
      return { success: false };
    }
  }
}
