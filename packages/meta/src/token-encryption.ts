import * as crypto from 'crypto';
import { config } from '@instagrambot/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit

/**
 * Derives a valid 32-byte key from the configured encryption key
 */
function getEncryptionKey(): Buffer {
  const rawKey = config.INSTAGRAM_TOKEN_ENCRYPTION_KEY || 'default_key_needs_to_be_replaced_32bytes!';
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts sensitive token using AES-256-GCM.
 * Output format: base64(iv:authTag:ciphertext)
 */
export function encryptToken(plainToken: string): string {
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
export function decryptToken(encryptedData: string): string {
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
  } catch (error) {
    throw new Error(`Token decryption failed: ${(error as Error).message}`);
  }
}
