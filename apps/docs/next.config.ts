import type { NextConfig } from "next";

const config: NextConfig = {
  // @syvna/ui ships its TypeScript source.
  transpilePackages: ["@syvna/ui"],
};

export default config;
