import { defaultConfig } from "~/crypto/config";
import type { CryptoConfig, EncryptedData } from "~/crypto/types";
import { deriveKey } from "~/passphrase/derive";
import type { Passphrase } from "~/passphrase/types";

/**
 * Parses the combined data back into its components
 */
function parseEncryptedData(
  combined: Uint8Array,
  config: CryptoConfig = defaultConfig
): EncryptedData {
  const salt = combined.slice(0, config.SALT_SIZE);
  const iv = combined.slice(
    config.SALT_SIZE,
    config.SALT_SIZE + config.IV_SIZE
  );
  const ciphertext = combined.slice(config.SALT_SIZE + config.IV_SIZE);

  return { salt, iv, ciphertext };
}

/**
 * Encrypts data and combines salt + IV + encrypted data into a single string
 */
async function encrypt(
  data: Buffer,
  passphrase: Passphrase,
  config: CryptoConfig = defaultConfig
): Promise<Buffer> {
  // Generate salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(config.SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(config.IV_SIZE));

  // Derive key from passphrase and salt
  const key = await deriveKey(passphrase, config);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: config.encryption.algorithm,
      iv,
    },
    key,
    data
  );

  // Combine everything into a single uint8 array
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(
    config.SALT_SIZE + config.IV_SIZE + encryptedArray.length
  );

  // Format: [salt][iv][encrypted data]
  combined.set(salt, 0); // First N bytes: salt
  combined.set(iv, config.SALT_SIZE); // Next M bytes: IV
  combined.set(encryptedArray, config.SALT_SIZE + config.IV_SIZE); // Rest: encrypted data

  return Buffer.from(combined);
}

/**
 * Decrypts data that includes salt and IV
 */
async function decrypt(
  data: Buffer,
  passphrase: Passphrase,
  config: CryptoConfig = defaultConfig
): Promise<Buffer> {
  // Extract salt, IV, and encrypted data
  const { salt, iv, ciphertext } = parseEncryptedData(data, config);

  // Derive the key using the extracted salt
  const key = await deriveKey(passphrase);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: config.encryption.algorithm,
      iv,
    },
    key,
    ciphertext
  );

  return Buffer.from(decryptedBuffer);
}

export * from "./types";
export { decrypt, encrypt };
