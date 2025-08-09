// AES-GCM encryption/decryption and IndexedDB storage via idb-keyval
// All comments in English per user rule

import { set as idbSet, get as idbGet } from "idb-keyval";

export type EncryptedPrivateKey = {
  version: number;
  saltB64: string;
  ivB64: string;
  ciphertextB64: string;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
function concatUint8Array(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length);
  res.set(a, 0);
  res.set(b, a.length);
  return res;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

function utf8ToArrayBuffer(str: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(str);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function toPlainUint8(bytes: Uint8Array): Uint8Array {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function bytesToB64(bytes: Uint8Array): string {
  if (typeof window === "undefined") throw new Error("b64 encoding requires browser");
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function b64ToBytes(base64: string): Uint8Array {
  if (typeof window === "undefined") throw new Error("b64 decoding requires browser");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    utf8ToArrayBuffer(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      // Use a fresh Uint8Array backed by ArrayBuffer (not SharedArrayBuffer)
      salt: (() => {
        const copy = new Uint8Array(salt.length);
        copy.set(salt);
        return copy;
      })(),
      iterations: 150000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

export async function encryptAndStorePrivateKey(
  storageKey: string,
  privateKey: Uint8Array,
  passphrase: string
): Promise<EncryptedPrivateKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(privateKey))
  );
  const payload: EncryptedPrivateKey = {
    version: 1,
    saltB64: bytesToB64(salt),
    ivB64: bytesToB64(iv),
    ciphertextB64: bytesToB64(ciphertext),
  };
  await idbSet(storageKey, payload);
  return payload;
}

export async function loadAndDecryptPrivateKey(
  storageKey: string,
  passphrase: string
): Promise<Uint8Array | null> {
  const payload = (await idbGet(storageKey)) as EncryptedPrivateKey | undefined;
  if (!payload) return null;
  const salt = b64ToBytes(payload.saltB64);
  const iv = b64ToBytes(payload.ivB64);
  const ciphertext = b64ToBytes(payload.ciphertextB64);
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const plaintext = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(ciphertext))
  );
  return plaintext;
}


