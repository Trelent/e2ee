import { defaultConfig } from "../crypto/config";
import type { CryptoConfig } from "../crypto/types";
import type { Passphrase } from "./types";

/**
 * Derives an encryption key from a passphrase and salt
 */
async function deriveKey(
  passphrase: Passphrase,
  config: CryptoConfig = defaultConfig
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const phraseBytes = encoder.encode(passphrase.phrase);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    phraseBytes,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: passphrase.salt,
      iterations: config.keyDerivation.iterations,
      hash: config.keyDerivation.hash,
    },
    keyMaterial,
    {
      name: config.encryption.algorithm,
      length: config.encryption.keyLength,
    },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

export { deriveKey };
