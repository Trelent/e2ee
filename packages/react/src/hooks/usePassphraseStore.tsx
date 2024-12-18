import type { Passphrase, PassphraseStore } from "@trelent/e2ee-core";
import { useEffect, useMemo, useState } from "react";

class LocalStorageStore implements PassphraseStore {
  private readonly STORAGE_KEY = "e2ee-passphrase";
  private state: Passphrase | null = null;
  private setState: (value: Passphrase | null) => void;

  constructor(
    initialState: Passphrase | null,
    setState: (value: Passphrase | null) => void
  ) {
    this.state = initialState;
    this.setState = setState;
  }

  setPassphrase(passphrase: Passphrase): void {
    const serialized = {
      phrase: passphrase.phrase,
      bytes: Array.from(passphrase.bytes),
      salt: Array.from(passphrase.salt),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    this.setState(passphrase);
  }

  getPassphrase(): Promise<Passphrase> {
    if (!this.state) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        throw new Error("Passphrase not found in localStorage");
      }

      const parsed = JSON.parse(stored);
      const passphrase = {
        phrase: parsed.phrase,
        bytes: Buffer.from(parsed.bytes),
        salt: Buffer.from(parsed.salt),
      };
      this.setState(passphrase);
      return Promise.resolve(passphrase);
    }
    return Promise.resolve(this.state);
  }
}

class StatefulStore implements PassphraseStore {
  private state: Passphrase | null = null;
  private setState: (value: Passphrase | null) => void;

  constructor(
    initialState: Passphrase | null,
    setState: (value: Passphrase | null) => void
  ) {
    this.state = initialState;
    this.setState = setState;
  }

  setPassphrase(passphrase: Passphrase): void {
    this.setState(passphrase);
  }

  getPassphrase(): Promise<Passphrase> {
    if (!this.state) {
      throw new Error("Passphrase not set in memory");
    }
    return Promise.resolve(this.state);
  }
}

export function usePassphraseStore(
  storageMode: "localstorage" | "stateful" = "localstorage"
): PassphraseStore {
  const [state, setState] = useState<Passphrase | null>(null);

  // Initialize localStorage state
  useEffect(() => {
    if (storageMode === "localstorage") {
      const stored = localStorage.getItem("e2ee-passphrase");
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          phrase: parsed.phrase,
          bytes: Buffer.from(parsed.bytes),
          salt: Buffer.from(parsed.salt),
        });
      }
    }
  }, [storageMode]);

  return useMemo(() => {
    switch (storageMode) {
      case "localstorage":
        return new LocalStorageStore(state, setState);
      default:
        return new StatefulStore(state, setState);
    }
  }, [storageMode, state, setState]);
}
