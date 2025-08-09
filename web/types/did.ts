// Types for DID Documents and related structures
// All comments in English per user rule

export interface DidVerificationMethod {
  id: string;
  type: "Ed25519VerificationKey2020";
  controller: string;
  publicKeyMultibase: string;
}

export interface DidDocument {
  "@context": "https://www.w3.org/ns/did/v1" | (string | object)[];
  id: string;
  verificationMethod: DidVerificationMethod[];
  authentication?: string[];
  assertionMethod?: string[];
  created?: string;
  updated?: string;
}

export type RegisterDidRequestBody = {
  publicKeyMultibase: string;
};

export type RegisterDidResponseBody = {
  did: string;
  didDocument: DidDocument;
};


