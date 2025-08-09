// DID utilities for method `ssikorea`
// All comments in English per user rule

import { DidDocument } from "@/types/did";
import { base58btc } from "multiformats/bases/base58";

// Multicodec ed25519-pub varint prefix [0xED, 0x01]
const ED25519_PUB_PREFIX = new Uint8Array([0xed, 0x01]);

export function computeFingerprintFromPublicKey(publicKey: Uint8Array): string {
  const prefixed = new Uint8Array(ED25519_PUB_PREFIX.length + publicKey.length);
  prefixed.set(ED25519_PUB_PREFIX, 0);
  prefixed.set(publicKey, ED25519_PUB_PREFIX.length);
  const fingerprint = "z" + base58btc.encode(prefixed);
  return fingerprint;
}

export function didFromFingerprint(fingerprint: string): string {
  return `did:ssikorea:${fingerprint}`;
}

export function keyIdFromDid(did: string): string {
  return `${did}#key-1`;
}

export function draftDidDocument(publicKeyMultibase: string): DidDocument {
  return {
    "@context": "https://www.w3.org/ns/did/v1",
    id: "did:ssikorea:pending",
    verificationMethod: [
      {
        id: "#key-1",
        type: "Ed25519VerificationKey2020",
        controller: "did:ssikorea:pending",
        publicKeyMultibase,
      },
    ],
    authentication: ["#key-1"],
    assertionMethod: ["#key-1"],
  };
}

export function finalizeDidDocument(
  did: string,
  doc: DidDocument,
  timestamps?: { created?: string; updated?: string }
): DidDocument {
  const { created, updated } = timestamps || {};
  const finalized: DidDocument = {
    ...doc,
    id: did,
    verificationMethod: doc.verificationMethod.map((vm) => ({
      ...vm,
      id: vm.id.startsWith("#") ? `${vm.id}` : vm.id,
      controller: did,
    })),
  };
  if (created) finalized.created = created;
  if (updated) finalized.updated = updated;
  return finalized;
}


