# @trelent/e2ee-core

E2EE Core is a TypeScript library for end-to-end encryption using a key derived from a passphrase. This is the core package used to power `@trelent/e2ee-react`. As such, this package exposes a generic `E2EEService` (End-to-End Encryption Service) class, which can be used to generate and manage passphrases, encrypt and decrypt typed and untyped data, and more. It also exposes various supporting types and interfaces.

Lastly, we include a `subtle` sub-package, which exposes the underlying cryptographic operations used by the `E2EEService` to provide greater flexibility if required.

## Installation

```bash
bun add @trelent/e2ee-core
```

## Usage

```ts
import { E2EService } from "@trelent/e2ee-core";
```
