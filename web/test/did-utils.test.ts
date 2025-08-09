// Basic unit tests for DID fingerprint utils
// All comments in English per user rule

import { describe, it, expect } from "vitest";
import { computeFingerprintFromPublicKey, didFromFingerprint, keyIdFromDid } from "@/lib/did/ssikorea";

describe("ssikorea DID utils", () => {
  it("computes fingerprint from a 32-byte public key", () => {
    const pk = new Uint8Array(32);
    pk[0] = 1; // make it non-zero
    const fp = computeFingerprintFromPublicKey(pk);
    expect(fp.startsWith("z")).toBe(true);
  });

  it("builds DID and key id", () => {
    const fp = "zfakefingerprint";
    const did = didFromFingerprint(fp);
    expect(did).toBe(`did:ssikorea:${fp}`);
    expect(keyIdFromDid(did)).toBe(`${did}#key-1`);
  });
});


