import type { CryptoConfig } from "./types";

/**
 * Default crypto configuration
 */
export const defaultConfig: CryptoConfig = {
  SALT_SIZE: 16,
  IV_SIZE: 12,
  keyDerivation: {
    iterations: 100000,
    hash: "SHA-256",
  },
  encryption: {
    algorithm: "AES-GCM",
    keyLength: 256,
  },
};
