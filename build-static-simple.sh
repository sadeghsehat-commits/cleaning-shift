#!/bin/bash
# Simple build script that handles dynamic routes for static export

set -e

echo "🔨 Building for mobile (static export)..."

# Step 1: Temporarily rename dynamic route folders
echo "📦 Handling dynamic routes..."

# Create backup directory
mkdir -p .dynamic-routes-backup

# Move dynamic route folders temporarily
if [ -d "app/dashboard/apartments/[id]" ]; then
  mv app/dashboard/apartments/\[id\] .dynamic-routes-backup/apartments-id
  echo "   ✓ Moved app/dashboard/apartments/[id]"
fi

# Create placeholder pages for dynamic routes (optional, but helps)
# These will be handled by client-side routing

# Step 2: Build
echo "🏗️  Building static export..."
npm run build

# Step 3: Check if build succeeded
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo ""
  echo "✅ Build successful! out/index.html created."
  echo ""
  
  # Restore dynamic routes
  if [ -d ".dynamic-routes-backup/apartments-id" ]; then
    mv .dynamic-routes-backup/apartments-id app/dashboard/apartments/\[id\]
    echo "✅ Restored dynamic routes"
  fi
  rm -rf .dynamic-routes-backup
  
  echo ""
  echo "📱 Next: npx cap sync android"
  exit 0
else
  echo ""
  echo "❌ Build failed! out/index.html not found."
  echo ""
  
  # Restore dynamic routes even on failure
  if [ -d ".dynamic-routes-backup/apartments-id" ]; then
    mv .dynamic-routes-backup/apartments-id app/dashboard/apartments/\[id\]
  fi
  rm -rf .dynamic-routes-backup
  
  exit 1
fi

