/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No output: 'export' — Vercel runs as Node server with API routes.
  // Mobile build uses build-for-mobile.sh which swaps in next.config.mobile-export.js (static export).
  images: {
    unoptimized: true,
  },
  // CRITICAL for Android login: must be false so /api/* is NOT redirected.
  // Redirect on OPTIONS preflight → "Redirect is not allowed for a preflight request" (CORS).
  trailingSlash: false,
  // Extra safeguard: skip any trailing slash redirects (avoids CORS preflight break).
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
