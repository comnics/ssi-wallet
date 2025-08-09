// Key generation and multibase helpers for Ed25519
// All comments in English per user rule

import * as ed25519 from "@noble/ed25519";
import { base58btc } from "multiformats/bases/base58";

// Multicodec prefix for ed25519-pub using varint-encoded 0xED 0x01
// For Ed25519 public keys, the multicodec code is 0xED, and varint encoding yields [0xED, 0x01]
const ED25519_PUB_PREFIX = new Uint8Array([0xed, 0x01]);

export type GeneratedKeyPair = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  publicKeyMultibase: string;
};

export async function generateEd25519KeyPair(): Promise<GeneratedKeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  const publicKeyMultibase = toPublicKeyMultibase(publicKey);
  return { publicKey, privateKey, publicKeyMultibase };
}

export function toPublicKeyMultibase(publicKey: Uint8Array): string {
  const prefixed = new Uint8Array(ED25519_PUB_PREFIX.length + publicKey.length);
  prefixed.set(ED25519_PUB_PREFIX, 0);
  prefixed.set(publicKey, ED25519_PUB_PREFIX.length);
  const multibase = "z" + base58btc.encode(prefixed);
  return multibase;
}

export function fromPublicKeyMultibase(multibaseString: string): {
  codecPrefix: Uint8Array;
  publicKey: Uint8Array;
} {
  if (!multibaseString || multibaseString[0] !== "z") {
    throw new Error("Invalid multibase: must start with 'z'");
  }
  const decoded = base58btc.decode(multibaseString.slice(1));
  if (decoded.length < 2) {
    throw new Error("Invalid multicodec buffer");
  }
  const prefix = decoded.slice(0, 2);
  const publicKey = decoded.slice(2);
  return { codecPrefix: prefix, publicKey };
}

export function isEd25519PubPrefix(prefix: Uint8Array): boolean {
  return prefix.length === 2 && prefix[0] === 0xed && prefix[1] === 0x01;
}


