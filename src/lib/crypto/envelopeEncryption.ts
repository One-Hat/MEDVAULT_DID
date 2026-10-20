/**
 * Client-Side Web Crypto Envelope Encryption Module
 * Standard: AES-256-GCM with 96-bit (12-byte) random IV and SHA-256 Integrity Digest
 * Guarantees zero plaintext exposure to remote servers or decentralized storage nodes.
 */

// Helper to convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface EncryptionResult {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  keyJwk: JsonWebKey;
  sha256Hash: string; // Hex digest
  ipfsCID: string; // Deterministic simulated CIDv1
}

/**
 * Generate a new AES-GCM 256-bit symmetric key in volatile client memory
 */
export async function generateAESKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is only available in modern secure contexts');
  }
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // Extractable for local storage in patient's indexedDB/session
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary file buffer with AES-256-GCM
 */
export async function encryptDocument(
  fileBuffer: ArrayBuffer,
  key?: CryptoKey
): Promise<EncryptionResult> {
  const cryptoKey = key || (await generateAESKey());

  // 12-byte IV for AES-GCM is standard and optimal for security
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Compute SHA-256 of raw data for tamper verification
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Encrypt
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    cryptoKey,
    fileBuffer
  );

  const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);
  const ivBase64 = arrayBufferToBase64(iv.buffer);
  const keyJwk = await window.crypto.subtle.exportKey('jwk', cryptoKey);

  // Compute mock IPFS CIDv1 from ciphertext hash
  const cipherHash = await window.crypto.subtle.digest('SHA-256', ciphertextBuffer);
  const cipherHex = Array.from(new Uint8Array(cipherHash))
    .slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const ipfsCID = `bafybeih${cipherHex}medvault7x`;

  return {
    ciphertext: ciphertextBase64,
    iv: ivBase64,
    keyJwk,
    sha256Hash,
    ipfsCID,
  };
}

/**
 * Decrypt document using AES-256-GCM with key and IV
 */
export async function decryptDocument(
  ciphertextBase64: string,
  ivBase64: string,
  keyJwk: JsonWebKey
): Promise<ArrayBuffer> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is only available in modern secure contexts');
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'jwk',
    keyJwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['decrypt']
  );

  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
      tagLength: 128,
    },
    cryptoKey,
    ciphertextBuffer
  );

  return decryptedBuffer;
}
