import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Setup dev platform untuk local development
if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

const nextConfig: NextConfig = {
  // Remove 'standalone' - let Cloudflare handle it
  reactStrictMode: false,
  // Disable source maps untuk smaller bundle
  productionBrowserSourceMaps: false,
  // Optimization untuk Cloudflare Pages
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    if (dev) {
      config.watchOptions = {
        ignored: ["**/*"],
      };
    }
    return config;
  },
};

export default nextConfig;