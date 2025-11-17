import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Here we use the @cloudflare/next-on-pages next plugin
if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

const nextConfig: NextConfig = {
  // Keep output: "standalone" for proper Cloudflare Workers support
  output: "standalone",
  reactStrictMode: false,
  // Disable source maps for smaller bundle
  productionBrowserSourceMaps: false,
  // Optimization for Cloudflare Workers
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: true,
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              filename: "chunks/vendor.js",
              test: /node_modules/,
              priority: 10,
              reuseExistingChunk: true,
              name: "vendor",
            },
          },
        },
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
