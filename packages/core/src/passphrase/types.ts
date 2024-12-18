export interface Passphrase {
  phrase: string;
  bytes: Buffer;
  salt: Buffer;
}
