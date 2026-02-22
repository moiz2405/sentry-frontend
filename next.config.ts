import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy /api/backend/:path* → http://localhost:8002/:path*
        // Browser never makes a cross-origin request — no CORS needed.
        source: "/api/backend/:path*",
        destination: `${BACKEND}/:path*`,
      },
    ];
  },
};

export default nextConfig;
