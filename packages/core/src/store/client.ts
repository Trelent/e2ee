import type { Passphrase } from "../passphrase/types";

export interface PassphraseStore {
  setPassphrase: (passphrase: Passphrase) => void;
  getPassphrase: () => Passphrase;
}
