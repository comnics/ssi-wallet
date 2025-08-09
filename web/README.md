SSI DID Wallet (ssikorea) – Next.js 14 App Router + TypeScript

Features
- Client-side DID generation with Ed25519
- Server-side VDR using LevelDB under `./data/vdr`
- W3C DID Core v1.0 compatible document with `Ed25519VerificationKey2020`
- API: POST `/api/did/register`, GET `/api/did/[did]`

Local Development
- npm install
- npm run dev

Notes
- Private keys never leave the browser. They are encrypted with AES-GCM (PBKDF2-derived key) and stored in IndexedDB.
- Only `wallet.did` is stored in localStorage.
