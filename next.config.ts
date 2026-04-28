import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
};

export default nextConfig;
