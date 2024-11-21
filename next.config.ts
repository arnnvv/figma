import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liveblocks.io",
        port: "",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  serverExternalPackages: ["@node-rs/argon2"],
  experimental: {
    ppr: true,
  },
};

export default nextConfig;
