import type { Passphrase } from "../../passphrase/types";
import type { PassphraseStore } from "../client";

export class MockPassphraseStore implements PassphraseStore {
  private passphrase: Passphrase | null = null;

  setPassphrase(passphrase: Passphrase): void {
    this.passphrase = passphrase;
  }

  getPassphrase(): Promise<Passphrase> {
    if (!this.passphrase) {
      return Promise.reject(new Error("Passphrase not set"));
    }

    return Promise.resolve(this.passphrase);
  }
}
