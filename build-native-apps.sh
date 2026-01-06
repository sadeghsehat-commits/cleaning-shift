#!/bin/bash
# Build native iOS and Android apps

echo "🔨 Building for native apps..."

# Step 1: Move API routes temporarily
echo "📦 Preparing build..."
mkdir -p .temp-api-backup
if [ -d "app/api" ]; then
  mv app/api .temp-api-backup/
fi

# Step 2: Create simplified dynamic route handlers
# These will be handled client-side in the mobile app
echo "📝 Creating mobile-compatible routes..."

# Step 3: Use mobile config
cp next.config.js next.config.original.js
cp next.config.mobile-export.js next.config.js

# Step 4: Build
echo "🏗️  Building static export..."
npm run build 2>&1 | tee build-mobile.log

# Step 5: Check result
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo "✅ Build successful!"
  
  # Restore API routes
  if [ -d ".temp-api-backup/api" ]; then
    mv .temp-api-backup/api app/
  fi
  rm -rf .temp-api-backup
  
  # Restore config
  cp next.config.original.js next.config.js
  rm -f next.config.original.js build-mobile.log
  
  # Sync Capacitor
  echo "📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "✅ Ready to build native apps!"
  echo ""
  echo "🍎 iOS: npm run ios"
  echo "🤖 Android: npm run android"
else
  echo "❌ Build failed. Check build-mobile.log"
  
  # Restore everything
  if [ -d ".temp-api-backup/api" ]; then
    mv .temp-api-backup/api app/
  fi
  rm -rf .temp-api-backup
  cp next.config.original.js next.config.js 2>/dev/null || true
  rm -f next.config.original.js
  
  exit 1
fi
