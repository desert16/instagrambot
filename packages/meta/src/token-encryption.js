"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptToken = encryptToken;
exports.decryptToken = decryptToken;
const crypto = __importStar(require("crypto"));
const config_1 = require("@instagrambot/config");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit
/**
 * Derives a valid 32-byte key from the configured encryption key
 */
function getEncryptionKey() {
    const rawKey = config_1.config.INSTAGRAM_TOKEN_ENCRYPTION_KEY || 'default_key_needs_to_be_replaced_32bytes!';
    return crypto.createHash('sha256').update(rawKey).digest();
}
/**
 * Encrypts sensitive token using AES-256-GCM.
 * Output format: base64(iv:authTag:ciphertext)
 */
function encryptToken(plainToken) {
    if (!plainToken) {
        throw new Error('Cannot encrypt empty token');
    }
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    let encrypted = cipher.update(plainToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const combined = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    return Buffer.from(combined, 'utf8').toString('base64');
}
/**
 * Decrypts AES-256-GCM encrypted token.
 */
function decryptToken(encryptedData) {
    if (!encryptedData) {
        throw new Error('Cannot decrypt empty string');
    }
    try {
        const rawCombined = Buffer.from(encryptedData, 'base64').toString('utf8');
        const [ivHex, authTagHex, cipherHex] = rawCombined.split(':');
        if (!ivHex || !authTagHex || !cipherHex) {
            throw new Error('Invalid encrypted token format');
        }
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        throw new Error(`Token decryption failed: ${error.message}`);
    }
}
