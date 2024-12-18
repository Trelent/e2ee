export interface EncryptedData {
  salt: Buffer;
  iv: Buffer;
  ciphertext: Buffer;
}

export interface DecryptedData {
  salt: Buffer;
  iv: Buffer;
  plaintext: Buffer;
}

export interface CryptoConfig {
  /**
   * Size of the salt in bytes used for key derivation
   */
  SALT_SIZE: number;

  /**
   * Size of the initialization vector in bytes used for AES-GCM encryption
   */
  IV_SIZE: number;

  /**
   * Configuration for PBKDF2 key derivation
   */
  keyDerivation: {
    /**
     * Hash algorithm used in PBKDF2
     */
    hash: "SHA-256" | "SHA-384" | "SHA-512";

    /**
     * Number of iterations for PBKDF2
     */
    iterations: number;
  };

  /**
   * Configuration for AES or RSA encryption
   */
  encryption: {
    /**
     * Key length in bits for AES-GCM
     */
    keyLength: number;
    /**
     * Algorithm name for Web Crypto API
     */
    algorithm: "AES-CBC" | "AES-CTR" | "AES-GCM" | "AES-KW";
  };
}
