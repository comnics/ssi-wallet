import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "level",
    "classic-level",
    "classic-leveldown",
    "node-gyp-build",
  ],
};

export default nextConfig;
