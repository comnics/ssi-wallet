# SSI Wallet Monorepo

This repository contains a Next.js 14 App Router project under `web/` implementing an SSI DID Wallet for the custom method `ssikorea`.

Quick Start
- cd web
- npm install
- npm run dev

Data Storage
- LevelDB at `./data/vdr` (created at runtime by the server)

Security
- Private keys never leave the browser; only the DID is persisted in localStorage.
