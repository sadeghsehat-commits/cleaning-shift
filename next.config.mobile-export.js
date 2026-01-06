/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Skip dynamic routes during build - they'll use client-side routing
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
