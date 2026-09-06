"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const token_encryption_js_1 = require("../src/token-encryption.js");
(0, vitest_1.describe)('TokenEncryptionService (AES-256-GCM)', () => {
    (0, vitest_1.it)('should encrypt and decrypt a sensitive token correctly', () => {
        const originalToken = 'EAABsbCS1...sensitive_instagram_page_access_token_xyz123';
        const encrypted = (0, token_encryption_js_1.encryptToken)(originalToken);
        (0, vitest_1.expect)(encrypted).not.toBe(originalToken);
        (0, vitest_1.expect)(typeof encrypted).toBe('string');
        (0, vitest_1.expect)(encrypted.length).toBeGreaterThan(32);
        const decrypted = (0, token_encryption_js_1.decryptToken)(encrypted);
        (0, vitest_1.expect)(decrypted).toBe(originalToken);
    });
    (0, vitest_1.it)('should throw error when encrypting empty token', () => {
        (0, vitest_1.expect)(() => (0, token_encryption_js_1.encryptToken)('')).toThrow('Cannot encrypt empty token');
    });
    (0, vitest_1.it)('should throw error when decrypting invalid or corrupted ciphertext', () => {
        (0, vitest_1.expect)(() => (0, token_encryption_js_1.decryptToken)('invalid_base64_string')).toThrow();
    });
});
