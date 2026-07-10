import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
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
      {
        protocol: "https",
        hostname: "express.adobe.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "backend.techwell.co.in",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "backend.techwell.co.in",
        pathname: "**",
      }
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
