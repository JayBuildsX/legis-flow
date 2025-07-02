import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Limit CPU usage to prevent resource exhaustion
    cpus: 1,
  },
  // Optimize webpack for Windows resource constraints
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (dev) {
      // Reduce webpack parallelism in development
      config.parallelism = 1;
    }
    return config;
  },
};

export default nextConfig;
