import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  // Disable webpack cache for Cloudflare Pages (25 MiB file size limit)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable cache in production
      config.cache = false;
    }
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ["**/*"], // 忽略所有文件变化
      };
    }
    return config;
  },
};

export default nextConfig;
