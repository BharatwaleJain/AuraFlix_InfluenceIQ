import type { NextConfig } from "next";

// next.config.js
module.exports = {
  env: {
    SERPAPI_KEY: process.env.SERPAPI_KEY,
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
