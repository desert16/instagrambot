import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { MetaApiErrorDetails } from './error-mapper.js';
export interface MetaRequestOptions extends AxiosRequestConfig {
    retries?: number;
    accessToken?: string;
}
export declare class MetaApiClient {
    private client;
    private baseUrl;
    private version;
    constructor();
    getBaseUrl(): string;
    getVersion(): string;
    /**
     * Constructs the full Graph API endpoint without hardcoding version in business logic
     */
    buildEndpoint(path: string): string;
    private handleRateLimit;
    request<T = any>(endpoint: string, options?: MetaRequestOptions): Promise<T>;
    get<T = any>(endpoint: string, params?: Record<string, any>, accessToken?: string): Promise<T>;
    post<T = any>(endpoint: string, data?: any, accessToken?: string): Promise<T>;
    delete<T = any>(endpoint: string, params?: Record<string, any>, accessToken?: string): Promise<T>;
    handleError(rawError: any): MetaApiErrorDetails;
    normalizeResponse<T = any>(response: AxiosResponse<T>): T;
}
export declare const metaApiClient: MetaApiClient;
