import { expect, test } from "bun:test";
import { generateSecurePassphrase } from "../generate";
import { checksum, decode } from "../io";

// Test bit lengths that are valid for BIP39
const TEST_BIT_LENGTH = 128; // Will generate 12 words
const TEST_SALT_LENGTH = 16;

test("passphrase has correct form", async () => {
  const [phrase, bytes, salt] = await generateSecurePassphrase(
    TEST_BIT_LENGTH,
    TEST_SALT_LENGTH
  );

  // Verify checksum is valid
  const isValid = await checksum(phrase);
  expect(isValid).toBe(true);

  // Bytes should have correct length
  expect(bytes.length).toBe(TEST_BIT_LENGTH / 8);

  // Decode phrase and verify it matches original bytes
  const decoded = await decode(phrase);
  expect(decoded).toEqual(bytes);

  // Salt should have correct length
  expect(salt.length).toBe(TEST_SALT_LENGTH);
});
