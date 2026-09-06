import { config } from '@instagrambot/config';
import { metaApiClient } from './meta-api-client.js';

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

export class MetaOAuthService {
  /**
   * Generates the official Meta OAuth Authorization URL
   */
  public static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.META_APP_ID,
      redirect_uri: config.META_OAUTH_REDIRECT_URI,
      scope: config.META_INSTAGRAM_SCOPES,
      response_type: 'code',
      state,
    });

    return `https://www.facebook.com/${config.META_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for a short-lived access token
   */
  public static async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    return metaApiClient.get<OAuthTokenResponse>('oauth/access_token', {
      client_id: config.META_APP_ID,
      client_secret: config.META_APP_SECRET,
      redirect_uri: config.META_OAUTH_REDIRECT_URI,
      code,
    });
  }

  /**
   * Exchanges a short-lived access token for a long-lived access token (lasts ~60 days)
   */
  public static async getLongLivedToken(shortLivedToken: string): Promise<OAuthTokenResponse> {
    return metaApiClient.get<OAuthTokenResponse>('oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: config.META_APP_ID,
      client_secret: config.META_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    });
  }

  /**
   * Validates token and retrieves permission scopes & expiry
   */
  public static async debugToken(accessToken: string): Promise<DebugTokenData> {
    const appAccessToken = `${config.META_APP_ID}|${config.META_APP_SECRET}`;
    const response = await metaApiClient.get<{ data: DebugTokenData }>('debug_token', {
      input_token: accessToken,
      access_token: appAccessToken,
    });

    return response.data;
  }
}
