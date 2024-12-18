import type { Passphrase, PassphraseStore } from "@trelent/e2ee-core";
import { E2EEService, subtle } from "@trelent/e2ee-core";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// We’ll unify both passphrase & encryption logic in one context:
interface TrelentE2EEContextValue {
  generatePassphrase: () => Promise<Passphrase>;
  getPassphrase: () => Passphrase;
  encrypt: <T>(data: T) => Promise<string>;
  decrypt: <T>(encrypted: string) => Promise<T>;
  encryptRaw: (data: Uint8Array) => Promise<string>;
  decryptRaw: (encrypted: string) => Promise<Uint8Array>;
  isGenerating: boolean;
  error: Error | null;
}

const TrelentE2EEContext = createContext<TrelentE2EEContextValue | null>(null);

interface TrelentE2EEProviderProps {
  children: ReactNode;
  store: PassphraseStore; // The user must pass in a storage client
  bitLength?: number; // For passphrase generation
  saltSize?: number;
}

export function TrelentE2EEProvider({
  children,
  store,
  bitLength = 128,
  saltSize = 16,
}: TrelentE2EEProviderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 1) Generate a passphrase, store it if none found.
  const generatePassphrase = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const [phrase, bytes, salt] = await subtle.generateSecurePassphrase(
        bitLength,
        saltSize
      );
      const passphrase = { phrase, bytes, salt };
      store.setPassphrase(passphrase);
      return passphrase;
    } catch (err: unknown) {
      const e =
        err instanceof Error ? err : new Error("Failed to generate passphrase");
      setError(e);
      throw e;
    } finally {
      setIsGenerating(false);
    }
  }, [store, bitLength, saltSize]);

  // 2) Retrieve the passphrase from the store
  const getPassphrase = useCallback(() => {
    try {
      return store.getPassphrase();
    } catch (err: unknown) {
      const e =
        err instanceof Error
          ? err
          : new Error("Failed to get stored passphrase");
      setError(e);
      throw e;
    }
  }, [store]);

  // 3) Create E2EE Service using that passphrase
  const service = useMemo(() => {
    return new E2EEService({
      getPassphrase,
      setPassphrase: () => {
        throw new Error("Setting passphrase directly is not supported here");
      },
    });
  }, [getPassphrase]);

  // 4) Our encryption/decryption methods
  const encrypt = useCallback(
    async <T,>(data: T) => {
      const encrypted = await service.encrypt(data);
      return encrypted.toString("base64");
    },
    [service]
  );

  const decrypt = useCallback(
    async <T,>(encrypted: string) => {
      const buffer = Buffer.from(encrypted, "base64");
      return service.decrypt<T>(buffer);
    },
    [service]
  );

  const encryptRaw = useCallback(
    async (data: Uint8Array) => {
      const encrypted = await service.encryptRaw(Buffer.from(data));
      return encrypted.toString("base64");
    },
    [service]
  );

  const decryptRaw = useCallback(
    async (encrypted: string) => {
      const buffer = Buffer.from(encrypted, "base64");
      const decrypted = await service.decryptRaw(buffer);
      return new Uint8Array(decrypted);
    },
    [service]
  );

  // 5) Expose everything in context
  const contextValue: TrelentE2EEContextValue = {
    generatePassphrase,
    getPassphrase,
    encrypt,
    decrypt,
    encryptRaw,
    decryptRaw,
    isGenerating,
    error,
  };

  return (
    <TrelentE2EEContext.Provider value={contextValue}>
      {children}
    </TrelentE2EEContext.Provider>
  );
}

// Optional convenience hook
export function useE2EE() {
  const ctx = useContext(TrelentE2EEContext);
  if (!ctx) {
    throw new Error("useE2EE must be used inside a TrelentE2EEProvider");
  }
  return ctx;
}
