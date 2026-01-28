/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No output: 'export' — Vercel runs as Node server with API routes.
  // Mobile build uses build-for-mobile.sh which swaps in next.config.mobile-export.js (static export).
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
