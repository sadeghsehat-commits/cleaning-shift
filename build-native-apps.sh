#!/bin/bash
# Build native iOS and Android apps - Fixed version

set -e  # Exit on error

echo "🔨 Building for native apps..."

# Step 1: Move API routes temporarily
echo "📦 Preparing build..."
mkdir -p .temp-api-backup
if [ -d "app/api" ]; then
  echo "  Moving API routes..."
  mv app/api .temp-api-backup/
fi

# Step 2: Use mobile config
echo "📝 Using mobile export config..."
cp next.config.js next.config.original.js 2>/dev/null || true
cp next.config.mobile-export.js next.config.js

# Step 3: Build
echo "🏗️  Building static export..."
if npm run build 2>&1 | tee build-mobile.log; then
  echo "✅ Build command completed"
else
  echo "❌ Build command failed"
  BUILD_FAILED=1
fi

# Step 4: Check result
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo "✅ Build successful! out/ directory created."
  
  # Restore API routes
  if [ -d ".temp-api-backup/api" ]; then
    echo "📦 Restoring API routes..."
    mv .temp-api-backup/api app/
  fi
  rm -rf .temp-api-backup
  
  # Restore config
  cp next.config.original.js next.config.js 2>/dev/null || true
  rm -f next.config.original.js build-mobile.log
  
  # Sync Capacitor
  echo "📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "✅ Ready to build native apps!"
  echo ""
  echo "🍎 iOS: npm run ios (then Product → Archive in Xcode)"
  echo "🤖 Android: npm run android (then Build → Generate Signed APK)"
  echo ""
  exit 0
else
  echo "❌ Build failed. out/ directory not found."
  echo ""
  echo "Checking build log..."
  if [ -f "build-mobile.log" ]; then
    echo "Last 20 lines of build log:"
    tail -20 build-mobile.log
  fi
  
  # Restore everything
  if [ -d ".temp-api-backup/api" ]; then
    echo "📦 Restoring API routes..."
    mv .temp-api-backup/api app/
  fi
  rm -rf .temp-api-backup
  cp next.config.original.js next.config.js 2>/dev/null || true
  rm -f next.config.original.js
  
  exit 1
fi
