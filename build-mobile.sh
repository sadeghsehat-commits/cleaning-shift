#!/bin/bash
# Build script for mobile apps - creates static export for Capacitor

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
  // Dynamic pages will use client-side routing
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
if [ -d "app/api" ]; then
  cp -r app/api .api-backup/ 2>/dev/null || true
  rm -rf app/api
fi

# Build
echo "🏗️  Building static export..."
npm run build 2>&1 | tee build.log

# Check if build was successful
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo "✅ Build successful! out/ directory created."
  
  # Restore API routes
  echo "📦 Restoring API routes..."
  if [ -d ".api-backup/api" ]; then
    cp -r .api-backup/api app/ 2>/dev/null || true
  fi
  rm -rf .api-backup
  
  # Restore original config
  cp next.config.backup.js next.config.js 2>/dev/null || true
  rm -f next.config.temp.js next.config.backup.js build.log
  
  # Sync with Capacitor
  echo "📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "✅ Mobile build complete!"
  echo ""
  echo "📱 Next steps:"
  echo "   iOS:    npm run ios (then Product → Archive in Xcode)"
  echo "   Android: npm run android (then Build → Generate Signed APK)"
  echo ""
  echo "📖 See BUILD-MOBILE-APPS.md for detailed instructions"
else
  echo "❌ Build failed! Check build.log for errors."
  echo ""
  echo "Common issues:"
  echo "  - Dynamic pages need generateStaticParams (but can't be in 'use client' files)"
  echo "  - API routes cannot be exported statically"
  echo ""
  echo "Restoring files..."
  
  # Restore API routes
  if [ -d ".api-backup/api" ]; then
    cp -r .api-backup/api app/ 2>/dev/null || true
  fi
  rm -rf .api-backup
  
  # Restore original config
  cp next.config.backup.js next.config.js 2>/dev/null || true
  rm -f next.config.temp.js next.config.backup.js
  
  exit 1
fi
