"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramWebhookService = void 0;
const crypto = __importStar(require("crypto"));
const config_1 = require("@instagrambot/config");
const meta_api_client_js_1 = require("./meta-api-client.js");
class InstagramWebhookService {
    /**
     * Verifies the initial GET subscription challenge sent by Meta Webhook system
     */
    static verifyWebhookChallenge(mode, verifyToken, challenge) {
        const expectedToken = config_1.config.META_WEBHOOK_VERIFY_TOKEN;
        if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
            return { isValid: true, challenge };
        }
        return { isValid: false };
    }
    /**
     * Verifies the cryptographical HMAC-SHA256 signature (X-Hub-Signature-256)
     * sent in the header of each incoming Meta Webhook event.
     */
    static validateWebhookSignature(rawBody, signatureHeader) {
        if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
            return false;
        }
        const appSecret = config_1.config.META_APP_SECRET;
        if (!appSecret) {
            console.error('❌ [InstagramWebhookService] META_APP_SECRET is not configured');
            return false;
        }
        const receivedSignature = signatureHeader.substring(7); // strip 'sha256='
        const hmac = crypto.createHmac('sha256', appSecret);
        const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
        const expectedSignature = hmac.update(bodyBuffer).digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(receivedSignature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
        }
        catch {
            return false;
        }
    }
    /**
     * Automatically subscribes the Facebook page / Instagram account to webhook events (messages, postbacks)
     */
    static async subscribePageToApp(pageId, pageAccessToken) {
        try {
            const response = await meta_api_client_js_1.metaApiClient.post(`${pageId}/subscribed_apps`, {
                subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_reads', 'message_deliveries'],
            }, pageAccessToken);
            return { success: response.success === true };
        }
        catch (error) {
            console.warn(`[InstagramWebhookService] Failed to subscribe page ${pageId} to webhooks:`, error.message);
            return { success: false };
        }
    }
}
exports.InstagramWebhookService = InstagramWebhookService;
