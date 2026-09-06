import { metaApiClient } from './meta-api-client.js';

export interface DiscoveredInstagramAccount {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramAccountId: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
}

export interface InstagramProfileDetails {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  followers_count?: number;
}

export class InstagramAccountService {
  /**
   * Discovers all Instagram Business/Creator accounts linked to Facebook pages
   * that the user has granted permissions for.
   */
  public static async discoverAccounts(userAccessToken: string): Promise<DiscoveredInstagramAccount[]> {
    const response = await metaApiClient.get<{
      data: Array<{
        id: string;
        name: string;
        access_token: string;
        instagram_business_account?: {
          id: string;
          username?: string;
          name?: string;
          profile_picture_url?: string;
        };
      }>;
    }>('me/accounts', {
      fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
      limit: 100,
    }, userAccessToken);

    const accounts: DiscoveredInstagramAccount[] = [];

    if (response?.data && Array.isArray(response.data)) {
      for (const page of response.data) {
        if (page.instagram_business_account?.id) {
          const ig = page.instagram_business_account;

          let username = ig.username || '';
          let name = ig.name || page.name;
          let profilePic = ig.profile_picture_url;

          // If details are missing, fetch them directly from the Instagram account endpoint
          if (!username) {
            try {
              const details = await this.getAccountDetails(ig.id, page.access_token);
              username = details.username;
              name = details.name || name;
              profilePic = details.profile_picture_url || profilePic;
            } catch (err) {
              console.warn(`[InstagramAccountService] Failed to fetch extra details for IG ${ig.id}:`, (err as Error).message);
            }
          }

          accounts.push({
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            instagramAccountId: ig.id,
            username: username || `ig_${ig.id}`,
            name,
            profilePictureUrl: profilePic,
          });
        }
      }
    }

    return accounts;
  }

  /**
   * Fetches Instagram profile details directly by Instagram ID
   */
  public static async getAccountDetails(instagramAccountId: string, accessToken: string): Promise<InstagramProfileDetails> {
    return metaApiClient.get<InstagramProfileDetails>(instagramAccountId, {
      fields: 'id,username,name,profile_picture_url,biography,followers_count',
    }, accessToken);
  }

  /**
   * Fetches customer/contact details via Instagram Scoped User ID (IGSID)
   */
  public static async getContactProfile(scopedUserId: string, accessToken: string): Promise<{
    id: string;
    username?: string;
    name?: string;
    profile_pic?: string;
  }> {
    try {
      return await metaApiClient.get(scopedUserId, {
        fields: 'id,username,name,profile_pic',
      }, accessToken);
    } catch {
      return { id: scopedUserId };
    }
  }
}
