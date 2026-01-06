/**
 * Mobile build configuration for Capacitor
 * This config excludes API routes and creates a static export
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Skip API routes - they will be on remote server
  distDir: 'out',
  trailingSlash: true,
};

module.exports = nextConfig;

