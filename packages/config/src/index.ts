import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root if available
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/instagrambot?schema=public'),
  
  REDIS_URL: z.string().default('redis://localhost:6379/0'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  
  JWT_SECRET: z.string().min(16).default('default_development_secret_32_characters_minimum'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string().min(16).default('default_development_refresh_secret_32_chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('default_development_cookie_secret_32_chars'),
  
  INSTAGRAM_TOKEN_ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  
  // Meta Configuration
  META_APP_ID: z.string().default('placeholder_meta_app_id'),
  META_APP_SECRET: z.string().default('placeholder_meta_app_secret'),
  META_GRAPH_API_VERSION: z.string().default('v21.0'),
  META_GRAPH_API_BASE_URL: z.string().default('https://graph.facebook.com'),
  META_OAUTH_REDIRECT_URI: z.string().default('http://localhost:4000/api/integrations/instagram/callback'),
  META_WEBHOOK_VERIFY_TOKEN: z.string().default('default_verify_token'),
  META_WEBHOOK_SECRET: z.string().default('placeholder_meta_app_secret'),
  META_INSTAGRAM_SCOPES: z.string().default('instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata'),
  
  // AI Configuration
  AI_DEFAULT_PROVIDER: z.enum(['gemini', 'openai', 'gemini_live']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_LIVE_WS_ENDPOINT: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  // Rate Limiting
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_LIMIT: z.coerce.number().default(100),
  WEBHOOK_RATE_LIMIT_LIMIT: z.coerce.number().default(300),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.warn('⚠️ Environment validation warnings:', parsed.error.format());
      // Fallback with defaults
      cachedConfig = envSchema.parse({});
    } else {
      cachedConfig = parsed.data;
    }
  }
  return cachedConfig;
}

export const config = getConfig();
