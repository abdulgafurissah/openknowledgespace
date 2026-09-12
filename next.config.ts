import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image Optimization ─────────────────────────────────────────────────────
  images: {
    // Allow Google Drive thumbnail URLs and other remote image sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.gumlet.io",
      },
      {
        protocol: "https",
        hostname: "*.gumlet.com",
      },
    ],
    // Use modern image formats for better performance
    formats: ["image/avif", "image/webp"],
  },

  // ─── Security Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ─── API Body Size Limit ─────────────────────────────────────────────────────
  // Allow large file uploads (up to 100MB) via the Drive upload API route
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  // ─── Build Output ────────────────────────────────────────────────────────────
  // Compress output for better performance
  compress: true,

  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // ─── TypeScript ───────────────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
