#!/bin/bash
# Simplified build that excludes problematic dynamic routes

echo "🔨 Building for native apps (simplified approach)..."

# Create a build that excludes dynamic routes temporarily
mkdir -p .temp-pages-backup

# Backup dynamic pages
echo "📦 Backing up dynamic pages..."
for dir in app/dashboard/shifts/\[id\] app/dashboard/shifts/\[id\]/edit app/dashboard/apartments/\[id\]/edit; do
  if [ -d "$dir" ]; then
    mkdir -p ".temp-pages-backup/$(dirname $dir)"
    mv "$dir" ".temp-pages-backup/$dir" 2>/dev/null || true
  fi
done

# Backup API routes
if [ -d "app/api" ]; then
  mkdir -p .temp-api-backup
  mv app/api .temp-api-backup/ 2>/dev/null || true
fi

# Use mobile config
cp next.config.js next.config.original.js 2>/dev/null || true
cp next.config.mobile-export.js next.config.js

# Build
echo "🏗️  Building static export..."
npm run build 2>&1 | tee build-simple.log

# Check result
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo "✅ Build successful!"
  
  # Restore dynamic pages (they'll use client-side routing)
  if [ -d ".temp-pages-backup" ]; then
    echo "📦 Restoring dynamic pages..."
    cp -r .temp-pages-backup/* app/dashboard/ 2>/dev/null || true
    rm -rf .temp-pages-backup
  fi
  
  # Restore API routes
  if [ -d ".temp-api-backup/api" ]; then
    mv .temp-api-backup/api app/ 2>/dev/null || true
    rm -rf .temp-api-backup
  fi
  
  # Restore config
  cp next.config.original.js next.config.js 2>/dev/null || true
  rm -f next.config.original.js build-simple.log
  
  # Sync Capacitor
  echo "📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "✅ Ready to build native apps!"
  echo ""
  echo "🍎 iOS: npm run ios"
  echo "🤖 Android: npm run android"
  exit 0
else
  echo "❌ Build failed"
  
  # Restore everything
  if [ -d ".temp-pages-backup" ]; then
    cp -r .temp-pages-backup/* app/dashboard/ 2>/dev/null || true
    rm -rf .temp-pages-backup
  fi
  if [ -d ".temp-api-backup/api" ]; then
    mv .temp-api-backup/api app/ 2>/dev/null || true
    rm -rf .temp-api-backup
  fi
  cp next.config.original.js next.config.js 2>/dev/null || true
  rm -f next.config.original.js
  
  exit 1
fi
