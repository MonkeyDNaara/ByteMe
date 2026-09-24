import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder recipe images are hosted on Unsplash. When user-provided
    // images land later, allowlist the bucket/CDN host we control instead.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Server-side resizing (via `sharp`) processes every unique image/size
    // combination in-process on first request -- fine on a beefy machine,
    // but it was spiking past our Render free-tier instance's 512MB limit
    // and crashing the whole app. Unsplash's own URLs are already
    // reasonably sized, so we serve them as-is instead of re-encoding them
    // ourselves.
    unoptimized: true,
  },
};

export default nextConfig;
