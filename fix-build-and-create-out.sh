#!/bin/bash
# Comprehensive build fix script

set -e

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "🔍 Step 1: Checking for issues..."

# Check for dynamic routes
echo "   Checking for dynamic routes..."
DYNAMIC_ROUTES=$(find app -type d -name "\[*\]" 2>/dev/null)
if [ -n "$DYNAMIC_ROUTES" ]; then
  echo "   ⚠️  Found dynamic routes:"
  echo "$DYNAMIC_ROUTES"
  echo "   Moving them temporarily..."
  mkdir -p .dynamic-backup
  find app -type d -name "\[*\]" -exec sh -c 'mv "$1" .dynamic-backup/$(basename "$1" | tr "[]" "__")' _ {} \;
  echo "   ✅ Dynamic routes moved"
else
  echo "   ✅ No dynamic routes found"
fi

# Check for API routes
echo "   Checking for API routes..."
if [ -d "app/api" ] && [ "$(ls -A app/api 2>/dev/null)" ]; then
  echo "   ⚠️  API routes found, moving temporarily..."
  mkdir -p .api-backup
  mv app/api .api-backup/ 2>/dev/null || true
  echo "   ✅ API routes moved"
else
  echo "   ✅ No API routes found (or already moved)"
fi

# Clean previous builds
echo ""
echo "🧹 Step 2: Cleaning previous builds..."
rm -rf .next out
echo "   ✅ Cleaned"

# Build
echo ""
echo "🏗️  Step 3: Building..."
npm run build 2>&1 | tee build-output.log

# Check result
echo ""
echo "🔍 Step 4: Checking build result..."
if [ -f "out/index.html" ]; then
  echo "   ✅ SUCCESS! out/index.html created!"
  ls -lh out/index.html
  echo ""
  echo "✅ Build successful! You can now:"
  echo "   1. npx cap sync android"
  echo "   2. Build APK in Android Studio"
else
  echo "   ❌ FAILED! out/index.html not created"
  echo ""
  echo "   === BUILD ERRORS ==="
  grep -i "error\|failed\|cannot\|missing" build-output.log | head -20
  echo ""
  echo "   === LAST 30 LINES OF BUILD OUTPUT ==="
  tail -30 build-output.log
fi

# Restore moved files
echo ""
echo "📦 Step 5: Restoring moved files..."
if [ -d ".dynamic-backup" ] && [ "$(ls -A .dynamic-backup 2>/dev/null)" ]; then
  echo "   Restoring dynamic routes..."
  for dir in .dynamic-backup/*; do
    if [ -d "$dir" ]; then
      ORIG_NAME=$(basename "$dir" | tr "__" "[]")
      find app -type d -name "$(echo $ORIG_NAME | sed 's/\[/\\[/g; s/\]/\\]/g')" -prune -o -type d -print | head -1 | xargs -I {} mv "$dir" "{}/$ORIG_NAME" 2>/dev/null || true
    fi
  done
  rm -rf .dynamic-backup
fi

if [ -d ".api-backup/api" ]; then
  echo "   Restoring API routes..."
  mv .api-backup/api app/ 2>/dev/null || true
  rm -rf .api-backup
fi

echo ""
echo "✅ Script complete!"

