import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@instagrambot/config';
import { MetaErrorMapper, MetaApiErrorDetails } from './error-mapper.js';

export interface MetaRequestOptions extends AxiosRequestConfig {
  retries?: number;
  accessToken?: string;
}

export class MetaApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private version: string;

  constructor() {
    this.baseUrl = config.META_GRAPH_API_BASE_URL.replace(/\/+$/, '');
    this.version = config.META_GRAPH_API_VERSION;

    this.client = axios.create({
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InstagramBot-SaaS-Production/1.0',
      },
    });

    // Response interceptor for rate-limit tracking
    this.client.interceptors.response.use(
      (response) => {
        this.handleRateLimit(response);
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getVersion(): string {
    return this.version;
  }

  /**
   * Constructs the full Graph API endpoint without hardcoding version in business logic
   */
  public buildEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Check if path already starts with vXX.X
    if (/^v\d+\.\d+\//.test(cleanPath)) {
      return `${this.baseUrl}/${cleanPath}`;
    }
    return `${this.baseUrl}/${this.version}/${cleanPath}`;
  }

  private handleRateLimit(response: AxiosResponse): void {
    const appUsage = response.headers['x-app-usage'];
    const businessUsage = response.headers['x-business-use-case-usage'];

    if (appUsage) {
      try {
        const usage = JSON.parse(appUsage);
        if (usage.call_count > 80 || usage.total_time > 80 || usage.total_cputime > 80) {
          console.warn('⚠️ [MetaApiClient] High Meta App Usage detected:', usage);
        }
      } catch {
        // ignore parse error
      }
    }
  }

  public async request<T = any>(endpoint: string, options: MetaRequestOptions = {}): Promise<T> {
    const url = this.buildEndpoint(endpoint);
    const maxRetries = options.retries ?? 3;
    let attempt = 0;

    const requestConfig: AxiosRequestConfig = {
      ...options,
      url,
      params: {
        ...options.params,
        ...(options.accessToken ? { access_token: options.accessToken } : {}),
      },
    };

    while (attempt < maxRetries) {
      try {
        const response = await this.client.request<T>(requestConfig);
        return this.normalizeResponse(response);
      } catch (rawError: any) {
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

  public async get<T = any>(endpoint: string, params: Record<string, any> = {}, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      accessToken,
    });
  }

  public async post<T = any>(endpoint: string, data: any = {}, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      data,
      accessToken,
    });
  }

  public async delete<T = any>(endpoint: string, params: Record<string, any> = {}, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      params,
      accessToken,
    });
  }

  public handleError(rawError: any): MetaApiErrorDetails {
    return MetaErrorMapper.map(rawError);
  }

  public normalizeResponse<T = any>(response: AxiosResponse<T>): T {
    return response.data;
  }
}

export const metaApiClient = new MetaApiClient();
