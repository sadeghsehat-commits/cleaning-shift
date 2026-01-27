/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Use webpack instead of turbopack (better for static export)
  experimental: {
    turbo: undefined,
  },
};

module.exports = nextConfig;
