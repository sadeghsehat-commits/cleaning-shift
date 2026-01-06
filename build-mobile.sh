#!/bin/bash
# Build script for mobile apps

echo "🔨 Building web app for mobile..."

# Create a temporary next.config that excludes API routes
cat > next.config.temp.js << 'CONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
CONFIG

# Backup original config
cp next.config.js next.config.backup.js

# Use temp config for build
cp next.config.temp.js next.config.js

# Build
npm run build

# Restore original config
cp next.config.backup.js next.config.js
rm next.config.temp.js next.config.backup.js

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync

echo "✅ Build complete! Run 'npm run ios' or 'npm run android' to open in IDEs"
