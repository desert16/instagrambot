"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.envSchema = void 0;
exports.getConfig = getConfig;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from root if available
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config();
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    WEB_PORT: zod_1.z.coerce.number().default(3000),
    API_BASE_URL: zod_1.z.string().url().default('http://localhost:4000'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    DATABASE_URL: zod_1.z.string().default('postgresql://postgres:postgres@localhost:5432/instagrambot?schema=public'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379/0'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(16).default('default_development_secret_32_characters_minimum'),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16).default('default_development_refresh_secret_32_chars'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    COOKIE_SECRET: zod_1.z.string().min(16).default('default_development_cookie_secret_32_chars'),
    INSTAGRAM_TOKEN_ENCRYPTION_KEY: zod_1.z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
    // Meta Configuration
    META_APP_ID: zod_1.z.string().default('placeholder_meta_app_id'),
    META_APP_SECRET: zod_1.z.string().default('placeholder_meta_app_secret'),
    META_GRAPH_API_VERSION: zod_1.z.string().default('v21.0'),
    META_GRAPH_API_BASE_URL: zod_1.z.string().default('https://graph.facebook.com'),
    META_OAUTH_REDIRECT_URI: zod_1.z.string().default('http://localhost:4000/api/integrations/instagram/callback'),
    META_WEBHOOK_VERIFY_TOKEN: zod_1.z.string().default('default_verify_token'),
    META_WEBHOOK_SECRET: zod_1.z.string().default('placeholder_meta_app_secret'),
    META_INSTAGRAM_SCOPES: zod_1.z.string().default('instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata'),
    // AI Configuration
    AI_DEFAULT_PROVIDER: zod_1.z.enum(['gemini', 'openai', 'gemini_live']).default('gemini'),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    GEMINI_MODEL: zod_1.z.string().default('gemini-1.5-flash'),
    GEMINI_LIVE_WS_ENDPOINT: zod_1.z.string().optional(),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    // Rate Limiting
    RATE_LIMIT_TTL: zod_1.z.coerce.number().default(60),
    RATE_LIMIT_LIMIT: zod_1.z.coerce.number().default(100),
    WEBHOOK_RATE_LIMIT_LIMIT: zod_1.z.coerce.number().default(300),
});
let cachedConfig = null;
function getConfig() {
    if (!cachedConfig) {
        const parsed = exports.envSchema.safeParse(process.env);
        if (!parsed.success) {
            console.warn('⚠️ Environment validation warnings:', parsed.error.format());
            // Fallback with defaults
            cachedConfig = exports.envSchema.parse({});
        }
        else {
            cachedConfig = parsed.data;
        }
    }
    return cachedConfig;
}
exports.config = getConfig();
