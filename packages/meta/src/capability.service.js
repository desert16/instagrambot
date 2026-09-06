"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramCapabilityService = void 0;
const oauth_service_js_1 = require("./oauth.service.js");
const meta_api_client_js_1 = require("./meta-api-client.js");
class InstagramCapabilityService {
    /**
     * Evaluates all capabilities for a linked Instagram account
     */
    static async evaluateCapabilities(instagramAccountId, accessToken) {
        const issues = [];
        let tokenValid = false;
        let permissionsValid = false;
        let messagingReady = false;
        let webhookReady = false;
        // 1. Validate Token & Scopes
        try {
            const debugInfo = await oauth_service_js_1.MetaOAuthService.debugToken(accessToken);
            if (debugInfo.is_valid) {
                tokenValid = true;
                const requiredScopes = ['instagram_basic', 'instagram_manage_messages'];
                const missingScopes = requiredScopes.filter((scope) => !debugInfo.scopes.includes(scope));
                if (missingScopes.length === 0) {
                    permissionsValid = true;
                }
                else {
                    issues.push(`Eksik izinler: ${missingScopes.join(', ')}`);
                }
            }
            else {
                issues.push('Instagram erişim tokenı geçersiz veya süresi dolmuş.');
            }
        }
        catch (err) {
            issues.push(`Token kontrolü başarısız: ${err.message}`);
        }
        // 2. Test Account Info & Messaging Readiness
        if (tokenValid) {
            try {
                const accountDetails = await meta_api_client_js_1.metaApiClient.get(instagramAccountId, {
                    fields: 'id,username',
                }, accessToken);
                if (accountDetails?.id) {
                    messagingReady = permissionsValid;
                }
            }
            catch (err) {
                issues.push(`Hesap erişim testi başarısız: ${err.message}`);
            }
        }
        // 3. Webhook capability
        webhookReady = messagingReady;
        return {
            accountConnected: tokenValid,
            tokenValid,
            permissionsValid,
            messagingReady,
            webhookReady,
            aiReady: messagingReady,
            lastCheckedAt: new Date().toISOString(),
            issues,
        };
    }
}
exports.InstagramCapabilityService = InstagramCapabilityService;
