export interface Passphrase {
  phrase: string;
  bytes: Uint8Array;
  salt: Uint8Array;
}
