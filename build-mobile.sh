#!/bin/bash
# Build script for mobile apps - excludes API routes

echo "🔨 Building web app for mobile (static export)..."

# Create a temporary next.config that enables static export
cat > next.config.temp.js << 'CONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Skip API routes - they will be on remote server
  // API routes cannot be exported statically
};

module.exports = nextConfig;
CONFIG

# Backup original config
cp next.config.js next.config.backup.js 2>/dev/null || true

# Use temp config for build
cp next.config.temp.js next.config.js

# Temporarily move API routes to exclude them from build
echo "📦 Temporarily moving API routes..."
mkdir -p .api-backup
cp -r app/api .api-backup/ 2>/dev/null || true
rm -rf app/api

# Build
echo "🏗️  Building static export..."
npm run build

# Restore API routes
echo "📦 Restoring API routes..."
cp -r .api-backup/api app/ 2>/dev/null || true
rm -rf .api-backup

# Restore original config
cp next.config.backup.js next.config.js 2>/dev/null || true
rm -f next.config.temp.js next.config.backup.js

# Check if out directory was created
if [ -d "out" ]; then
  echo "✅ Build successful! out/ directory created."
  
  # Sync with Capacitor
  echo "📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "✅ Mobile build complete!"
  echo ""
  echo "📱 Next steps:"
  echo "   iOS:    npm run ios"
  echo "   Android: npm run android"
else
  echo "❌ Build failed! out/ directory not found."
  exit 1
fi
