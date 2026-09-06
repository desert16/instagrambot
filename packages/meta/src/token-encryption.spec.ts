import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from '../src/token-encryption.js';

describe('TokenEncryptionService (AES-256-GCM)', () => {
  it('should encrypt and decrypt a sensitive token correctly', () => {
    const originalToken = 'EAABsbCS1...sensitive_instagram_page_access_token_xyz123';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(32);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('should throw error when encrypting empty token', () => {
    expect(() => encryptToken('')).toThrow('Cannot encrypt empty token');
  });

  it('should throw error when decrypting invalid or corrupted ciphertext', () => {
    expect(() => decryptToken('invalid_base64_string')).toThrow();
  });
});
