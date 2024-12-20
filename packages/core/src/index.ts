import SuperJSON from "superjson";
import { decrypt, encrypt, type CryptoConfig } from "./crypto";
import { generateSecurePassphrase } from "./passphrase/generate";
import type { Passphrase } from "./passphrase/types";
import type { PassphraseStore } from "./store/client";

export class E2EEService {
  private PassphraseStore: PassphraseStore;
  private cryptoConfig?: CryptoConfig;

  constructor(
    PassphraseStore: PassphraseStore,
    cryptoConfig?: CryptoConfig,
    passphrase?: Passphrase
  ) {
    this.PassphraseStore = PassphraseStore;

    if (cryptoConfig) {
      this.cryptoConfig = cryptoConfig;
    }

    if (passphrase) {
      this.PassphraseStore.setPassphrase(passphrase);
    } else {
      generateSecurePassphrase().then(([phrase, bytes, salt]) => {
        const passphrase: Passphrase = {
          phrase,
          bytes,
          salt,
        };
        this.PassphraseStore.setPassphrase(passphrase);
      });
    }
  }

  encryptRaw = async (data: Buffer): Promise<Buffer> => {
    const passphrase = await this.PassphraseStore.getPassphrase();

    const encrypted = encrypt(data, passphrase, this.cryptoConfig);
    this.PassphraseStore.setPassphrase(passphrase);
    return encrypted;
  };

  decryptRaw = async (data: Buffer): Promise<Buffer> => {
    const passphrase = await this.PassphraseStore.getPassphrase();
    const decrypted = decrypt(data, passphrase, this.cryptoConfig);
    return decrypted;
  };

  encrypt = <T>(data: T): Promise<Buffer> => {
    // Serialize the typed data into a buffer
    const jsonStr = SuperJSON.stringify(data);
    const dataBuffer = Buffer.from(jsonStr);

    // Encrypt using raw encrypt
    return this.encryptRaw(dataBuffer);
  };

  decrypt = <T>(ciphertext: Buffer): Promise<T> => {
    return this.decryptRaw(ciphertext)
      .then((data) => data.toString())
      .then((jsonStr) => SuperJSON.parse<T>(jsonStr))
      .catch((error) => {
        throw error;
      });
  };
}

export type { CryptoConfig } from "./crypto/types";
export type { Passphrase } from "./passphrase/types";
export type { PassphraseStore } from "./store/client";
export * as subtle from "./subtle";

