/**
 * Encrypts sensitive token using AES-256-GCM.
 * Output format: base64(iv:authTag:ciphertext)
 */
export declare function encryptToken(plainToken: string): string;
/**
 * Decrypts AES-256-GCM encrypted token.
 */
export declare function decryptToken(encryptedData: string): string;
