import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true,
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {},

  // ── SEO & Security HTTP Headers ──────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all public pages
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          // Prevent MIME-sniffing
          { key: "X-Content-Type-Options",   value: "nosniff" },
          // Control referrer info sent to other sites
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          // Prevent clickjacking
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          // Force HTTPS (1 year)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Restrict powerful browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(), payment=(self)",
          },
          // CSP — allow our own assets + Razorpay + Google Fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.razorpay.com wss: ws: http://localhost:5000",
              "frame-src https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      }
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "12*.*.*.*",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.*.*",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.ftcdn.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.imimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "nietm.in",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "**",
      },
    ],
  },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);
