import { InstagramCapabilities } from '@instagrambot/types';
export declare class InstagramCapabilityService {
    /**
     * Evaluates all capabilities for a linked Instagram account
     */
    static evaluateCapabilities(instagramAccountId: string, accessToken: string): Promise<InstagramCapabilities>;
}
