/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // false: avoids redirecting /api/auth/login -> /api/auth/login/ which breaks
  // CORS preflight ( "Redirect is not allowed for a preflight request" )
  trailingSlash: false,
};

module.exports = nextConfig;
