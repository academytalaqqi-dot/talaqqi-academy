import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Disable source maps for smaller bundle
  productionBrowserSourceMaps: false,
  // Aggressive optimization for Cloudflare Pages 25 MiB limit
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.cache = false;
      // Split chunks more aggressively
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
