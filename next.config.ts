import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack root configuration to fix workspace detection warning
  // This tells Turbopack to use this directory as the workspace root
  // instead of detecting it from lockfiles up the directory tree
} as NextConfig & {
  turbopack?: {
    root?: string;
  };
};

// Explicitly set turbopack root for Next.js 16
(nextConfig as any).turbopack = {
  root: process.cwd(),
};

export default nextConfig;
