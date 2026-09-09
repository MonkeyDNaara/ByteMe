import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder recipe images are hosted on Unsplash. When user-provided
    // images land later, allowlist the bucket/CDN host we control instead.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
