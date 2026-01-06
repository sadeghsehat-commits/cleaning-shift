#!/bin/bash
echo "🔧 Fixing iOS dependencies..."

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Step 1: Make sure out/ directory exists
if [ ! -d "out" ]; then
  echo "📦 Building static export..."
  ./build-native-simple.sh
fi

# Step 2: Sync Capacitor
echo "📱 Syncing Capacitor..."
npx cap sync ios

# Step 3: Install CocoaPods dependencies
echo "📦 Installing iOS dependencies (CocoaPods)..."
cd ios/App

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
  echo "❌ CocoaPods not installed!"
  echo "   Installing CocoaPods..."
  sudo gem install cocoapods
fi

# Install pods
if [ -f "Podfile" ]; then
  echo "✅ Podfile found, installing dependencies..."
  pod install
  echo ""
  echo "✅ Dependencies installed!"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Close Xcode completely (Cmd+Q)"
  echo "   2. Open: ios/App/App.xcworkspace (NOT .xcodeproj!)"
  echo "   3. Try Product → Archive again"
else
  echo "❌ Podfile not found after sync"
  echo "   Trying to regenerate..."
  npx cap sync ios --force
  if [ -f "Podfile" ]; then
    pod install
  else
    echo "   Still no Podfile - manual intervention needed"
  fi
fi
