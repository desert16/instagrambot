export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}
export interface DebugTokenData {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    issued_at?: number;
    scopes: string[];
    user_id: string;
}
export declare class MetaOAuthService {
    /**
     * Generates the official Meta OAuth Authorization URL
     */
    static getAuthorizationUrl(state: string): string;
    /**
     * Exchanges authorization code for a short-lived access token
     */
    static exchangeCodeForToken(code: string): Promise<OAuthTokenResponse>;
    /**
     * Exchanges a short-lived access token for a long-lived access token (lasts ~60 days)
     */
    static getLongLivedToken(shortLivedToken: string): Promise<OAuthTokenResponse>;
    /**
     * Validates token and retrieves permission scopes & expiry
     */
    static debugToken(accessToken: string): Promise<DebugTokenData>;
}
