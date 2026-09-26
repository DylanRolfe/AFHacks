import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.BIDNORTH_BUILD_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  devIndicators: false,
};
export default config;
