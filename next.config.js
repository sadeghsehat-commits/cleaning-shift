/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No output: 'export' — Vercel runs as Node server with API routes.
  // Mobile build uses build-for-mobile.sh which swaps in next.config.mobile-export.js (static export).
  images: {
    unoptimized: true,
  },
  // Must be false so /api/* (e.g. /api/auth/login) is not redirected.
  // Redirect on OPTIONS preflight → "Redirect is not allowed for a preflight request" (Android CORS).
  trailingSlash: false,
};

module.exports = nextConfig;
