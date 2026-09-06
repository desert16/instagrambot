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
export declare class InstagramAccountService {
    /**
     * Discovers all Instagram Business/Creator accounts linked to Facebook pages
     * that the user has granted permissions for.
     */
    static discoverAccounts(userAccessToken: string): Promise<DiscoveredInstagramAccount[]>;
    /**
     * Fetches Instagram profile details directly by Instagram ID
     */
    static getAccountDetails(instagramAccountId: string, accessToken: string): Promise<InstagramProfileDetails>;
    /**
     * Fetches customer/contact details via Instagram Scoped User ID (IGSID)
     */
    static getContactProfile(scopedUserId: string, accessToken: string): Promise<{
        id: string;
        username?: string;
        name?: string;
        profile_pic?: string;
    }>;
}
