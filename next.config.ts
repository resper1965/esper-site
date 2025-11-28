import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(nextConfig);
