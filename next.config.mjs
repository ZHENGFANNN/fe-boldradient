import path from "path";
import { fileURLToPath } from "url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 构建ID
  generateBuildId: () => {
    return "official:" + new Date().getTime();
  },
  // react严格模式
  reactStrictMode: false,
  // 压缩模式
  compress: true,
  // 开启ETag
  generateEtags: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.join(__dirname, "app");
    config.resolve.alias["@@"] = __dirname;
    return config;
  }
};

export default nextConfig;
