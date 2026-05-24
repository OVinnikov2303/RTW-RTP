import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Product images — manufacturer CDNs
      { protocol: "https", hostname: "www.apple.com" },
      { protocol: "https", hostname: "i.dell.com" },
      { protocol: "https", hostname: "dlcdnwebimgs.asus.com" },
      { protocol: "https", hostname: "assets.corsair.com" },
      { protocol: "https", hostname: "images.nvidia.com" },
      { protocol: "https", hostname: "images.samsung.com" },
      { protocol: "https", hostname: "resource.logitechg.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "media.us.lg.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
}

export default nextConfig
