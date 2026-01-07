#!/bin/bash
# Build script that moves API routes before building for mobile

set -e

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "🔨 Building for mobile (static export)..."

# Step 1: Move API routes temporarily
echo "📦 Moving API routes..."
if [ -d "app/api" ]; then
  mkdir -p .api-backup
  mv app/api .api-backup/
  echo "   ✅ API routes moved to .api-backup/"
else
  echo "   ℹ️  API routes already moved"
fi

# Step 2: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out
echo "   ✅ Cleaned"

# Step 3: Build
echo "🏗️  Building static export..."
npm run build

# Step 4: Check result
echo ""
echo "🔍 Checking build result..."
if [ -f "out/index.html" ]; then
  echo "   ✅ SUCCESS! out/index.html created!"
  ls -lh out/index.html
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "📱 Next steps:"
  echo "   1. npx cap sync android"
  echo "   2. Build APK in Android Studio"
  echo ""
  echo "⚠️  Note: API routes are in .api-backup/ - restore them if needed for development"
else
  echo "   ❌ FAILED! out/index.html not created"
  echo ""
  echo "   === BUILD ERRORS ==="
  echo "   Check the build output above for errors"
fi

# Step 5: Restore API routes (optional - comment out if you want to keep them moved)
echo ""
echo "📦 Restoring API routes..."
if [ -d ".api-backup/api" ]; then
  mv .api-backup/api app/
  rm -rf .api-backup
  echo "   ✅ API routes restored"
else
  echo "   ℹ️  No API routes to restore"
fi

echo ""
echo "✅ Script complete!"

