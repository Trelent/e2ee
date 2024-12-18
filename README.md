# @trelent/e2ee

This monorepo contains packages for end-to-end encryption in TypeScript applications:

## @trelent/e2ee-core

The core package provides a Typescript library for various client-side encryption utilities.

- `E2EEService` class for managing encryption/decryption operations
- Passphrase generation and management
- TypeScript types and interfaces
- Low-level cryptographic operations in the `subtle` subpackage

## @trelent/e2ee-react 

React bindings and hooks for using e2ee-core:

- `TrelentE2EEProvider` component for managing encryption context
- `useE2EE()` hook to access encryption operations
- `usePassphraseStore()` hook for passphrase persistence
- Support for both localStorage and in-memory storage
- TypeScript support

### Features

- Generate secure passphrases
- Encrypt/decrypt typed and raw data
- Persist passphrases in localStorage or memory
- React context for sharing encryption state
- Full TypeScript support