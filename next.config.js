// Disable PWA plugin for static export (Capacitor handles this)
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: true, // Disabled for Capacitor builds
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Required for Capacitor - generates static files in 'out' directory
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable Turbopack to use webpack (for compatibility)
  experimental: {
    turbo: undefined,
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
