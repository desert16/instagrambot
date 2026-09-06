"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramMessagingService = void 0;
const meta_api_client_js_1 = require("./meta-api-client.js");
class InstagramMessagingService {
    /**
     * Sends a standard text or media message via the official Instagram Send API
     */
    static async sendMessage(options) {
        const { recipientId, text, mediaUrl, mediaType, accessToken, pageOrAccountId } = options;
        if (!text && !mediaUrl) {
            throw new Error('Message must have either text content or a mediaUrl');
        }
        const payload = {
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
        }
        else {
            payload.message = {
                text,
            };
        }
        // Endpoint is /{page-id}/messages or /{instagram-scoped-id}/messages
        const endpoint = `${pageOrAccountId}/messages`;
        return meta_api_client_js_1.metaApiClient.post(endpoint, payload, accessToken);
    }
    /**
     * Sets typing indicators (typing_on, typing_off, mark_seen)
     */
    static async sendAction(pageOrAccountId, recipientId, action, accessToken) {
        try {
            const endpoint = `${pageOrAccountId}/messages`;
            await meta_api_client_js_1.metaApiClient.post(endpoint, {
                recipient: { id: recipientId },
                sender_action: action,
            }, accessToken);
            return { success: true };
        }
        catch {
            // Typing indicators failing shouldn't block main message pipeline
            return { success: false };
        }
    }
}
exports.InstagramMessagingService = InstagramMessagingService;
