import { expect, test } from "bun:test";
import { generateSecurePassphrase } from "~/passphrase/generate";
import type { Passphrase } from "~/passphrase/types";
import { defaultConfig } from "../config";
import { decrypt, encrypt } from "../index";

// Individual function tests
test("encrypt creates buffer with correct structure", async () => {
  const [phrase, bytes, salt] = await generateSecurePassphrase();
  const passphrase: Passphrase = { phrase, bytes, salt };
  const data = Buffer.from("test data");

  const encrypted = await encrypt(data, passphrase);

  // Check that encrypted data has correct length
  // (salt + iv + data lengths)
  expect(encrypted.length).toBeGreaterThan(
    defaultConfig.SALT_SIZE + defaultConfig.IV_SIZE
  );
});

test("decrypt returns original data", async () => {
  const [phrase, bytes, salt] = await generateSecurePassphrase();
  const passphrase: Passphrase = { phrase, bytes, salt };
  const originalData = Buffer.from("test data");

  const encrypted = await encrypt(originalData, passphrase);
  const decrypted = await decrypt(encrypted, passphrase);

  expect(decrypted).toEqual(originalData);
});

test("decrypt fails with wrong passphrase", async () => {
  const [phrase1, bytes1, salt1] = await generateSecurePassphrase();
  const [phrase2, bytes2, salt2] = await generateSecurePassphrase();
  const passphrase1: Passphrase = {
    phrase: phrase1,
    bytes: bytes1,
    salt: salt1,
  };
  const passphrase2: Passphrase = {
    phrase: phrase2,
    bytes: bytes2,
    salt: salt2,
  };

  const data = Buffer.from("test data");
  const encrypted = await encrypt(data, passphrase1);

  await expect(decrypt(encrypted, passphrase2)).rejects.toThrow();
});

// E2E encryption flow tests
test("Can encrypt and decrypt various data types", async () => {
  const [phrase, bytes, salt] = await generateSecurePassphrase();
  const passphrase: Passphrase = { phrase, bytes, salt };

  const testCases = [
    Buffer.from("Simple string"),
    Buffer.from(
      JSON.stringify({ complex: "object", with: { nested: "values" } })
    ),
    Buffer.from("🌟 Unicode string with emojis 🚀"),
    Buffer.from("A".repeat(100000)), // Large data
  ];

  for (const testData of testCases) {
    const encrypted = await encrypt(testData, passphrase);
    const decrypted = await decrypt(encrypted, passphrase);
    expect(decrypted).toEqual(testData);
  }
});

test("Encryption is deterministic with same IV", async () => {
  const [phrase, bytes, salt] = await generateSecurePassphrase();
  const passphrase: Passphrase = { phrase, bytes, salt };
  const data = Buffer.from("test data");

  // Mock crypto.getRandomValues to return same values
  const originalGetRandomValues = crypto.getRandomValues;
  const mockGetRandomValues = <T extends ArrayBufferView | null>(
    array: T
  ): T => {
    if (!array) return array;

    const target = new Uint8Array(array.buffer);
    const filler = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    // Only copy as many bytes as the target array can hold
    target.set(filler.subarray(0, target.byteLength));
    return array;
  };
  crypto.getRandomValues = mockGetRandomValues;

  const encrypted1 = await encrypt(data, passphrase);
  const encrypted2 = await encrypt(data, passphrase);

  // Restore original function
  crypto.getRandomValues = originalGetRandomValues;

  expect(encrypted1).toEqual(encrypted2);
});

test("Different passphrases produce different encrypted results", async () => {
  const [phrase1, bytes1, salt1] = await generateSecurePassphrase();
  const [phrase2, bytes2, salt2] = await generateSecurePassphrase();
  const passphrase1: Passphrase = {
    phrase: phrase1,
    bytes: bytes1,
    salt: salt1,
  };
  const passphrase2: Passphrase = {
    phrase: phrase2,
    bytes: bytes2,
    salt: salt2,
  };

  const data = Buffer.from("test data");

  const encrypted1 = await encrypt(data, passphrase1);
  const encrypted2 = await encrypt(data, passphrase2);

  expect(encrypted1).not.toEqual(encrypted2);
});
