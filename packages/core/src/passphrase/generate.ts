import { encode } from "./io";

// Default salt size of 16 bytes
const PASSPHRASE_SALT_SIZE = 16;
const PASSPHRASE_BIT_LENGTH = 128;

/**
 * Generates a secure BIP39 mnemonic passphrase using the Web Crypto API.
 *
 * @param bitLen The desired bit length (128, 160, 192, 224, or 256) - defaults to 128
 * @param saltSize The size of the salt in bytes (minimum 16) - defaults to 16
 *
 * @returns A Promise that resolves to a secure random passphrase in encoded and raw form, along with the salt to be used for key derivation.
 */
export async function generateSecurePassphrase(
  bitLen: number = PASSPHRASE_BIT_LENGTH,
  saltSize: number = PASSPHRASE_SALT_SIZE
): Promise<[string, Buffer, Buffer]> {
  // Generate random bytes based on bit length
  const byteLen = bitLen / 8;
  const bytes = crypto.getRandomValues(new Buffer(byteLen));

  // Generate salt
  const salt = crypto.getRandomValues(new Buffer(saltSize));

  // Encode bytes to passphrase using BIP39
  const passphrase = await encode(bytes);

  return [passphrase, bytes, salt];
}
