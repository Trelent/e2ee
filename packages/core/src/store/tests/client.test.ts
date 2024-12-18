import { expect, test } from "bun:test";
import { MockPassphraseStore } from "./_mock";

test("Can set and get passphrase from store", () => {
  const store = new MockPassphraseStore();
  const passphrase = {
    phrase: "test-passphrase",
    salt: new Uint8Array([1, 2, 3, 4]),
  };

  store.setPassphrase(passphrase);
  const retrieved = store.getPassphrase();

  expect(retrieved.phrase).toBe(passphrase.phrase);
  expect(retrieved.salt).toEqual(passphrase.salt);
});

test("Getting passphrase before setting throws error", () => {
  const store = new MockPassphraseStore();
  expect(() => store.getPassphrase()).toThrow("Passphrase not set");
});

test("Can update passphrase", () => {
  const store = new MockPassphraseStore();
  const passphrase1 = {
    phrase: "test-passphrase-1",
    salt: new Uint8Array([1, 2, 3, 4]),
  };
  const passphrase2 = {
    phrase: "test-passphrase-2",
    salt: new Uint8Array([5, 6, 7, 8]),
  };

  store.setPassphrase(passphrase1);
  store.setPassphrase(passphrase2);

  const retrieved = store.getPassphrase();
  expect(retrieved.phrase).toBe(passphrase2.phrase);
  expect(retrieved.salt).toEqual(passphrase2.salt);
});
