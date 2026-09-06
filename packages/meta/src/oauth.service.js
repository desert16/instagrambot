"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOAuthService = void 0;
const config_1 = require("@instagrambot/config");
const meta_api_client_js_1 = require("./meta-api-client.js");
class MetaOAuthService {
    /**
     * Generates the official Meta OAuth Authorization URL
     */
    static getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: config_1.config.META_APP_ID,
            redirect_uri: config_1.config.META_OAUTH_REDIRECT_URI,
            scope: config_1.config.META_INSTAGRAM_SCOPES,
            response_type: 'code',
            state,
        });
        return `https://www.facebook.com/${config_1.config.META_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
    }
    /**
     * Exchanges authorization code for a short-lived access token
     */
    static async exchangeCodeForToken(code) {
        return meta_api_client_js_1.metaApiClient.get('oauth/access_token', {
            client_id: config_1.config.META_APP_ID,
            client_secret: config_1.config.META_APP_SECRET,
            redirect_uri: config_1.config.META_OAUTH_REDIRECT_URI,
            code,
        });
    }
    /**
     * Exchanges a short-lived access token for a long-lived access token (lasts ~60 days)
     */
    static async getLongLivedToken(shortLivedToken) {
        return meta_api_client_js_1.metaApiClient.get('oauth/access_token', {
            grant_type: 'fb_exchange_token',
            client_id: config_1.config.META_APP_ID,
            client_secret: config_1.config.META_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        });
    }
    /**
     * Validates token and retrieves permission scopes & expiry
     */
    static async debugToken(accessToken) {
        const appAccessToken = `${config_1.config.META_APP_ID}|${config_1.config.META_APP_SECRET}`;
        const response = await meta_api_client_js_1.metaApiClient.get('debug_token', {
            input_token: accessToken,
            access_token: appAccessToken,
        });
        return response.data;
    }
}
exports.MetaOAuthService = MetaOAuthService;
