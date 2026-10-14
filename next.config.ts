import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Pin the workspace root. Without this, Turbopack walks up and finds a stray
  // package-lock.json in the home directory, which slows the build and warns.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default nextConfig;
