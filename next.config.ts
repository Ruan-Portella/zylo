import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      }
    ],
  },
  experimental: {
    typedRoutes: true,
  }
};

export default nextConfig;
