#!/bin/bash
# Build script that moves API routes before building for mobile

set -e

# Source shell profiles so npm/nvm work when run from anywhere
[ -f ~/.zprofile ] && source ~/.zprofile
[ -f ~/.zshrc ] && source ~/.zshrc
[ -f ~/.bash_profile ] && source ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh" 2>/dev/null || true
  nvm use --delete-prefix 2>/dev/null || true
  nvm use default --silent 2>/dev/null || nvm use node --silent 2>/dev/null || true
fi

# Use script directory so it works from any path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🔨 Building for mobile (static export)..."

# Step 1: Move API routes and dynamic routes temporarily
echo "📦 Moving API routes and dynamic routes..."
rm -rf .build-backup
mkdir -p .build-backup

if [ -d "app/api" ]; then
  mv app/api .build-backup/
  echo "   ✅ API routes moved"
fi

# Move dynamic routes that can't be statically exported
if [ -d "app/dashboard/shifts/[id]" ]; then
  mv "app/dashboard/shifts/[id]" .build-backup/
  echo "   ✅ Dynamic shift route moved (using static /details instead)"
fi

if [ -d "app/dashboard/shifts/[id]/edit" ]; then
  mv "app/dashboard/shifts/[id]/edit" .build-backup/ 2>/dev/null || true
fi

# Step 2: Switch to mobile export config
echo "⚙️  Switching to mobile export config..."
cp next.config.js next.config.backup.js 2>/dev/null || true
cp next.config.mobile-export.js next.config.js
echo "   ✅ Config switched"

# Step 3: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out
echo "   ✅ Cleaned"

# Step 4: Build
echo "🏗️  Building static export..."
npx next build --webpack

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
  echo "   iOS:    npx cap sync ios    && npx cap open ios"
  echo "   Android: npx cap sync android && npx cap open android"
  echo ""
  echo "   (API routes are restored automatically at end of script)"
else
  echo "   ❌ FAILED! out/index.html not created"
  echo ""
  echo "   === BUILD ERRORS ==="
  echo "   Check the build output above for errors"
fi

# Step 5: Restore config
echo ""
echo "⚙️  Restoring original config..."
if [ -f "next.config.backup.js" ]; then
  cp next.config.backup.js next.config.js
  rm -f next.config.backup.js
  echo "   ✅ Config restored"
else
  echo "   ℹ️  No backup config to restore"
fi

# Step 6: Restore moved files
echo ""
echo "📦 Restoring moved files..."
if [ -d ".build-backup" ]; then
  if [ -d ".build-backup/api" ]; then
    mv .build-backup/api app/
    echo "   ✅ API routes restored"
  fi
  if [ -d ".build-backup/[id]" ]; then
    mv ".build-backup/[id]" "app/dashboard/shifts/"
    echo "   ✅ Dynamic shift route restored"
  fi
  rm -rf .build-backup
  echo "   ✅ All files restored"
else
  echo "   ℹ️  No files to restore"
fi

echo ""
echo "✅ Script complete!"

