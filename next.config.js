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
  // Note: output: 'export' is set only for mobile builds via build-mobile.sh
  // For regular web builds, this should be commented out
  // output: 'export', // Uncomment only when building for mobile
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
