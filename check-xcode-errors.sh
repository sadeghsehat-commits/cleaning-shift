#!/bin/bash
echo "🔍 Checking for common Xcode build issues..."

echo ""
echo "1. Checking Capacitor iOS dependencies..."
if [ -d "ios/App" ]; then
  echo "   ✅ iOS project exists"
  if [ -f "ios/App/Podfile" ]; then
    echo "   ✅ Podfile exists"
    echo "   📝 You may need to run: cd ios/App && pod install"
  else
    echo "   ⚠️  Podfile not found - this might be the issue"
  fi
else
  echo "   ❌ iOS project not found"
fi

echo ""
echo "2. Checking Capacitor sync..."
if [ -d "out" ]; then
  echo "   ✅ out/ directory exists"
  if [ -f "out/index.html" ]; then
    echo "   ✅ index.html exists"
  else
    echo "   ❌ index.html missing - need to rebuild"
  fi
else
  echo "   ❌ out/ directory missing - need to run: ./build-native-simple.sh"
fi

echo ""
echo "3. Checking project configuration..."
if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
  echo "   ✅ Project file exists"
  if grep -q "Xcode 12.0" ios/App/App.xcodeproj/project.pbxproj; then
    echo "   ✅ Project format is Xcode 12.0 compatible"
  fi
fi

echo ""
echo "📋 Next steps to fix:"
echo "   1. Check Xcode error messages (bottom panel)"
echo "   2. Run: cd ios/App && pod install"
echo "   3. Make sure out/ directory exists (run ./build-native-simple.sh)"
