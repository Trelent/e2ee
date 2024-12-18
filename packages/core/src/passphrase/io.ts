import { BIP39_WORD_LIST } from "../crypto/bip39/words";

/**
 * Encodes bytes into a BIP39 mnemonic phrase
 */
export async function encode(bytes: Buffer): Promise<string> {
  const bitLen = bytes.length * 8;
  const sumBitLen = bitLen / 32;

  // Get SHA-256 hash for checksum
  const hash = new Buffer(await crypto.subtle.digest("SHA-256", bytes));

  // Convert bytes to binary string
  let digits = Array.from(bytes).reduce(
    (str, n) => str + n.toString(2).padStart(8, "0"),
    ""
  );

  // Add checksum bits
  const checksum = hash[0].toString(2).padStart(8, "0").slice(0, sumBitLen);
  digits += checksum;

  // Split into 11-bit chunks and convert to indices
  const indices = [];
  for (let bit = 0; bit < bitLen + sumBitLen; bit += 11) {
    const index = parseInt(digits.slice(bit, bit + 11).padStart(8, "0"), 2);
    indices.push(index);
  }

  // Convert indices to words
  const words = indices.map((i) => BIP39_WORD_LIST[i]);
  return words.join(" ");
}

/**
 * Decodes a BIP39 mnemonic phrase back into bytes
 */
export async function decode(passphrase: string): Promise<Buffer> {
  // Normalize the passphrase
  passphrase = passphrase.normalize("NFKD").trim().toLowerCase();

  // Convert words to indices
  const indices = passphrase.split(/\s+/).map((word) => {
    const index = BIP39_WORD_LIST.indexOf(word);
    if (index === -1) {
      throw new Error(`Invalid word in mnemonic: ${word}`);
    }
    return index;
  });

  // Convert indices to binary string
  const digits = indices.map((n) => n.toString(2).padStart(11, "0")).join("");

  // Calculate checksum length
  const sumBitLen = Math.floor(digits.length / 32);
  const bitLen = digits.length - sumBitLen;

  // Split into checksum and data
  const checksum = digits.slice(-sumBitLen);
  const bytesArr: number[] = [];

  // Convert data bits to bytes
  for (let bit = 0; bit < bitLen; bit += 8) {
    const bytestring = digits.slice(bit, bit + 8);
    const n = parseInt(bytestring, 2);
    if (n >= 0) {
      bytesArr.push(n);
    }
  }

  const bytes = Buffer.from(bytesArr);

  // Verify checksum
  const hash = new Buffer(await crypto.subtle.digest("SHA-256", bytes));
  const expected = hash[0].toString(2).padStart(8, "0").slice(0, sumBitLen);

  if (expected !== checksum) {
    throw new Error("Invalid checksum");
  }

  return bytes;
}

/**
 * Verifies if a passphrase has a valid checksum
 */
export async function checksum(passphrase: string): Promise<boolean> {
  try {
    await decode(passphrase);
    return true;
  } catch {
    return false;
  }
}
