import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
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
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
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
  async redirects() {
    return [
      { source: '/terms', destination: '/help/terms', permanent: true },
      { source: '/privacy', destination: '/help/privacy', permanent: true },
      { source: '/cookies', destination: '/help/cookies', permanent: true },
      { source: '/gdpr', destination: '/help/gdpr', permanent: true },
      { source: '/ai-policy', destination: '/help/ai-policy', permanent: true },
      { source: '/data-processing', destination: '/help/data-processing', permanent: true },
      { source: '/placement-policy', destination: '/help/placement-policy', permanent: true },
      { source: '/refund-policy', destination: '/help/refund-policy', permanent: true },
      { source: '/student-agreement', destination: '/help/student-agreement', permanent: true },
      { source: '/college-agreement', destination: '/help/college-agreement', permanent: true },
      { source: '/consultancy-agreement', destination: '/help/consultancy-agreement', permanent: true },
      { source: '/campus-hiring-agreement', destination: '/help/campus-hiring-agreement', permanent: true },
      { source: '/campus-to-career', destination: '/help/campus-to-career', permanent: true },
      { source: '/career-guide', destination: '/help/career-guide', permanent: true },
    ];
  },
};

export default nextConfig;
