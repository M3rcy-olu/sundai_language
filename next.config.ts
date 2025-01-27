import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/speech/ws/speech',
        destination: process.env.NEXT_PUBLIC_WS_HOST 
          ? `${process.env.NEXT_PUBLIC_WS_HOST}/api/speech/ws/speech`
          : 'http://localhost:8000/api/speech/ws/speech',
      },
    ];
  },
};

export default nextConfig;
