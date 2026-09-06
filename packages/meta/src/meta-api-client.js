"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaApiClient = exports.MetaApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@instagrambot/config");
const error_mapper_js_1 = require("./error-mapper.js");
class MetaApiClient {
    client;
    baseUrl;
    version;
    constructor() {
        this.baseUrl = config_1.config.META_GRAPH_API_BASE_URL.replace(/\/+$/, '');
        this.version = config_1.config.META_GRAPH_API_VERSION;
        this.client = axios_1.default.create({
            timeout: 20000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'InstagramBot-SaaS-Production/1.0',
            },
        });
        // Response interceptor for rate-limit tracking
        this.client.interceptors.response.use((response) => {
            this.handleRateLimit(response);
            return response;
        }, (error) => {
            return Promise.reject(error);
        });
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getVersion() {
        return this.version;
    }
    /**
     * Constructs the full Graph API endpoint without hardcoding version in business logic
     */
    buildEndpoint(path) {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Check if path already starts with vXX.X
        if (/^v\d+\.\d+\//.test(cleanPath)) {
            return `${this.baseUrl}/${cleanPath}`;
        }
        return `${this.baseUrl}/${this.version}/${cleanPath}`;
    }
    handleRateLimit(response) {
        const appUsage = response.headers['x-app-usage'];
        const businessUsage = response.headers['x-business-use-case-usage'];
        if (appUsage) {
            try {
                const usage = JSON.parse(appUsage);
                if (usage.call_count > 80 || usage.total_time > 80 || usage.total_cputime > 80) {
                    console.warn('⚠️ [MetaApiClient] High Meta App Usage detected:', usage);
                }
            }
            catch {
                // ignore parse error
            }
        }
    }
    async request(endpoint, options = {}) {
        const url = this.buildEndpoint(endpoint);
        const maxRetries = options.retries ?? 3;
        let attempt = 0;
        const requestConfig = {
            ...options,
            url,
            params: {
                ...options.params,
                ...(options.accessToken ? { access_token: options.accessToken } : {}),
            },
        };
        while (attempt < maxRetries) {
            try {
                const response = await this.client.request(requestConfig);
                return this.normalizeResponse(response);
            }
            catch (rawError) {
                attempt++;
                const mappedError = this.handleError(rawError);
                if (mappedError.isRetryable && attempt < maxRetries) {
                    const delayMs = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10000);
                    console.warn(`[MetaApiClient] Retryable error (${mappedError.code}). Attempt ${attempt}/${maxRetries}. Retrying in ${delayMs}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                    continue;
                }
                throw mappedError;
            }
        }
        throw new Error('Meta API request failed after maximum retries');
    }
    async get(endpoint, params = {}, accessToken) {
        return this.request(endpoint, {
            method: 'GET',
            params,
            accessToken,
        });
    }
    async post(endpoint, data = {}, accessToken) {
        return this.request(endpoint, {
            method: 'POST',
            data,
            accessToken,
        });
    }
    async delete(endpoint, params = {}, accessToken) {
        return this.request(endpoint, {
            method: 'DELETE',
            params,
            accessToken,
        });
    }
    handleError(rawError) {
        return error_mapper_js_1.MetaErrorMapper.map(rawError);
    }
    normalizeResponse(response) {
        return response.data;
    }
}
exports.MetaApiClient = MetaApiClient;
exports.metaApiClient = new MetaApiClient();
