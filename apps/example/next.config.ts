import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@trelent/e2ee-react"],
};

export default nextConfig;
