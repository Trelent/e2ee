import type { Passphrase } from "~/passphrase/types";
import type { PassphraseStore } from "~/store/client";

export class MockPassphraseStore implements PassphraseStore {
  private passphrase: Passphrase | null = null;

  setPassphrase(passphrase: Passphrase): void {
    this.passphrase = passphrase;
  }

  getPassphrase(): Passphrase {
    if (!this.passphrase) {
      throw new Error("Passphrase not set");
    }

    return this.passphrase;
  }
}
