export declare class InstagramWebhookService {
    /**
     * Verifies the initial GET subscription challenge sent by Meta Webhook system
     */
    static verifyWebhookChallenge(mode: string | undefined, verifyToken: string | undefined, challenge: string | undefined): {
        isValid: boolean;
        challenge?: string;
    };
    /**
     * Verifies the cryptographical HMAC-SHA256 signature (X-Hub-Signature-256)
     * sent in the header of each incoming Meta Webhook event.
     */
    static validateWebhookSignature(rawBody: Buffer | string, signatureHeader: string | undefined): boolean;
    /**
     * Automatically subscribes the Facebook page / Instagram account to webhook events (messages, postbacks)
     */
    static subscribePageToApp(pageId: string, pageAccessToken: string): Promise<{
        success: boolean;
    }>;
}
