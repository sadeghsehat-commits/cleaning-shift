/**
 * Default Next.js config (used by Vercel).
 *
 * IMPORTANT:
 * - Do NOT enable `output: 'export'` here, otherwise Vercel deployments fail because
 *   API routes and dynamic rendering are incompatible with static export.
 * - Mobile/Capacitor builds should use `next.config.mobile-export.js` (see `build-*.sh` scripts).
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
