import { describe, expect, it } from "bun:test";
import { defaultConfig } from "../crypto/config";
import { E2EEService } from "../index";
import { MockPassphraseStore } from "../store/tests/_mock";

describe("E2E Service", () => {
  const store = new MockPassphraseStore();
  const service = new E2EEService(store, defaultConfig);

  it("should encrypt and decrypt primitive values", async () => {
    const testString = "Hello, World!";
    const encrypted = await service.encrypt(testString);
    const decrypted = await service.decrypt<string>(encrypted);
    expect(decrypted).toBe(testString);

    const testNumber = 42;
    const encryptedNum = await service.encrypt(testNumber);
    const decryptedNum = await service.decrypt<number>(encryptedNum);
    expect(decryptedNum).toBe(testNumber);

    const testBoolean = true;
    const encryptedBool = await service.encrypt(testBoolean);
    const decryptedBool = await service.decrypt<boolean>(encryptedBool);
    expect(decryptedBool).toBe(testBoolean);
  });

  it("should encrypt and decrypt complex objects", async () => {
    const testObject = {
      name: "Test User",
      age: 25,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: ["dark mode", "notifications"],
      },
    };

    const encrypted = await service.encrypt(testObject);
    const decrypted = await service.decrypt<typeof testObject>(encrypted);

    expect(decrypted).toEqual(testObject);
  });

  it("should encrypt and decrypt raw buffers", async () => {
    const testBuffer = Buffer.from("Raw data test");
    const encrypted = await service.encryptRaw(testBuffer);
    const decrypted = await service.decryptRaw(encrypted);

    expect(decrypted).toEqual(testBuffer);
  });

  it("should use the same passphrase for multiple operations", async () => {
    const data1 = "First encryption";
    const data2 = "Second encryption";

    const encrypted1 = await service.encrypt(data1);
    const encrypted2 = await service.encrypt(data2);

    const decrypted1 = await service.decrypt<string>(encrypted1);
    const decrypted2 = await service.decrypt<string>(encrypted2);

    expect(decrypted1).toBe(data1);
    expect(decrypted2).toBe(data2);
  });
});
