import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Unsplash regular/full image CDN
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Unsplash plus CDN (used by some image variants)
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
