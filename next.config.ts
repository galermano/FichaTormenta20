import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow user-provided external image URLs for character portraits
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ignore ESLint errors during production builds (lint separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
