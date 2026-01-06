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
  // Skip API routes during export (they will be on the server)
  exportPathMap: async function (defaultPathMap) {
    // Remove all API routes from export
    const paths = { ...defaultPathMap };
    Object.keys(paths).forEach((path) => {
      if (path.startsWith('/api/')) {
        delete paths[path];
      }
    });
    return paths;
  },
  // Disable Turbopack to use webpack (for compatibility)
  experimental: {
    turbo: undefined,
  },
};

module.exports = nextConfig;
