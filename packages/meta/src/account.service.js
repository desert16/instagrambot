"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramAccountService = void 0;
const meta_api_client_js_1 = require("./meta-api-client.js");
class InstagramAccountService {
    /**
     * Discovers all Instagram Business/Creator accounts linked to Facebook pages
     * that the user has granted permissions for.
     */
    static async discoverAccounts(userAccessToken) {
        const response = await meta_api_client_js_1.metaApiClient.get('me/accounts', {
            fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
            limit: 100,
        }, userAccessToken);
        const accounts = [];
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
                        }
                        catch (err) {
                            console.warn(`[InstagramAccountService] Failed to fetch extra details for IG ${ig.id}:`, err.message);
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
    static async getAccountDetails(instagramAccountId, accessToken) {
        return meta_api_client_js_1.metaApiClient.get(instagramAccountId, {
            fields: 'id,username,name,profile_picture_url,biography,followers_count',
        }, accessToken);
    }
    /**
     * Fetches customer/contact details via Instagram Scoped User ID (IGSID)
     */
    static async getContactProfile(scopedUserId, accessToken) {
        try {
            return await meta_api_client_js_1.metaApiClient.get(scopedUserId, {
                fields: 'id,username,name,profile_pic',
            }, accessToken);
        }
        catch {
            return { id: scopedUserId };
        }
    }
}
exports.InstagramAccountService = InstagramAccountService;
