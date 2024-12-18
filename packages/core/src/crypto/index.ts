import { deriveKey } from "../passphrase/derive";
import type { Passphrase } from "../passphrase/types";
import { defaultConfig } from "./config";
import type { CryptoConfig, EncryptedData } from "./types";

/**
 * Parses the combined data back into its components
 */
function parseEncryptedData(
  combined: Buffer,
  config: CryptoConfig = defaultConfig
): EncryptedData {
  const salt = combined.subarray(0, config.SALT_SIZE);
  const iv = combined.subarray(
    config.SALT_SIZE,
    config.SALT_SIZE + config.IV_SIZE
  );
  const ciphertext = combined.subarray(config.SALT_SIZE + config.IV_SIZE);

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
  const salt = crypto.getRandomValues(Buffer.alloc(config.SALT_SIZE));
  const iv = crypto.getRandomValues(Buffer.alloc(config.IV_SIZE));

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
  const encryptedArray = Buffer.from(encryptedBuffer);
  const combined = Buffer.alloc(
    config.SALT_SIZE + config.IV_SIZE + encryptedArray.length
  );

  // Format: [salt][iv][encrypted data]
  combined.set(salt, 0); // First N bytes: salt
  combined.set(iv, config.SALT_SIZE); // Next M bytes: IV
  combined.set(encryptedArray, config.SALT_SIZE + config.IV_SIZE); // Rest: encrypted data

  return combined;
}

/**
 * Decrypts data that includes salt and IV
 */
async function decrypt(
  data: Buffer,
  passphrase: Passphrase,
  config: CryptoConfig = defaultConfig
): Promise<Buffer> {
  // Extract IV and encrypted data
  const { iv, ciphertext } = parseEncryptedData(data, config);

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
