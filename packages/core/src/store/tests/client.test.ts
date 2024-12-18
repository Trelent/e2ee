import { expect, test } from "bun:test";
import { MockPassphraseStore } from "./_mock";

test("Can set and get passphrase from store", async () => {
  const store = new MockPassphraseStore();
  const passphrase = {
    phrase: "test-passphrase",
    bytes: new Buffer([1, 2, 3, 4]),
    salt: new Buffer([1, 2, 3, 4]),
  };

  store.setPassphrase(passphrase);
  const retrieved = await store.getPassphrase();

  expect(retrieved.phrase).toBe(passphrase.phrase);
  expect(retrieved.bytes).toEqual(passphrase.bytes);
  expect(retrieved.salt).toEqual(passphrase.salt);
});

test("Getting passphrase before setting throws error", async () => {
  const store = new MockPassphraseStore();
  expect(store.getPassphrase()).rejects.toThrow("Passphrase not set");
});

test("Can update passphrase", async () => {
  const store = new MockPassphraseStore();
  const passphrase1 = {
    phrase: "test-passphrase-1",
    bytes: new Buffer([1, 2, 3, 4]),
    salt: new Buffer([1, 2, 3, 4]),
  };
  const passphrase2 = {
    phrase: "test-passphrase-2",
    bytes: new Buffer([5, 6, 7, 8]),
    salt: new Buffer([5, 6, 7, 8]),
  };

  store.setPassphrase(passphrase1);
  store.setPassphrase(passphrase2);

  const retrieved = await store.getPassphrase();
  expect(retrieved.phrase).toBe(passphrase2.phrase);
  expect(retrieved.salt).toEqual(passphrase2.salt);
});
