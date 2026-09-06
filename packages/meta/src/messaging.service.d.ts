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
export declare class InstagramMessagingService {
    /**
     * Sends a standard text or media message via the official Instagram Send API
     */
    static sendMessage(options: SendMessageOptions): Promise<SendMessageResponse>;
    /**
     * Sets typing indicators (typing_on, typing_off, mark_seen)
     */
    static sendAction(pageOrAccountId: string, recipientId: string, action: 'typing_on' | 'typing_off' | 'mark_seen', accessToken: string): Promise<{
        success: boolean;
    }>;
}
