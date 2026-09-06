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
const vitest_1 = require("vitest");
const crypto = __importStar(require("crypto"));
const webhook_service_js_1 = require("../src/webhook.service.js");
const config_1 = require("@instagrambot/config");
(0, vitest_1.describe)('InstagramWebhookService (HMAC-SHA256 Signature)', () => {
    (0, vitest_1.it)('should validate a legitimately signed webhook payload', () => {
        const rawPayload = JSON.stringify({
            object: 'instagram',
            entry: [{ id: '17841400000000001', time: Date.now() }],
        });
        const appSecret = config_1.config.META_APP_SECRET;
        const hmac = crypto.createHmac('sha256', appSecret);
        const validSignature = `sha256=${hmac.update(rawPayload).digest('hex')}`;
        const isValid = webhook_service_js_1.InstagramWebhookService.validateWebhookSignature(rawPayload, validSignature);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should reject tampered payload or incorrect signature', () => {
        const rawPayload = '{"object":"instagram"}';
        const fakeSignature = 'sha256=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        const isValid = webhook_service_js_1.InstagramWebhookService.validateWebhookSignature(rawPayload, fakeSignature);
        (0, vitest_1.expect)(isValid).toBe(false);
    });
    (0, vitest_1.it)('should reject missing or malformed signature header', () => {
        const rawPayload = '{"object":"instagram"}';
        (0, vitest_1.expect)(webhook_service_js_1.InstagramWebhookService.validateWebhookSignature(rawPayload, undefined)).toBe(false);
        (0, vitest_1.expect)(webhook_service_js_1.InstagramWebhookService.validateWebhookSignature(rawPayload, 'invalid_header')).toBe(false);
    });
});
