#!/bin/bash
# Fix Xcode project format for older Xcode versions

echo "🔧 Fixing Xcode project format for compatibility..."

PROJECT_FILE="ios/App/App.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
  echo "❌ Project file not found: $PROJECT_FILE"
  exit 1
fi

# Backup original
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

# Change compatibility version to Xcode 12.0 (compatible with older Xcode)
sed -i '' 's/compatibilityVersion = "Xcode [0-9.]*"/compatibilityVersion = "Xcode 12.0"/g' "$PROJECT_FILE"

# Change object version to 54 (Xcode 12 format)
sed -i '' 's/objectVersion = [0-9]*/objectVersion = 54/g' "$PROJECT_FILE"

# Also check for any Xcode 15+ specific settings and downgrade
sed -i '' 's/LastSwiftUpdateCheck = [0-9]*/LastSwiftUpdateCheck = 1200/g' "$PROJECT_FILE" 2>/dev/null || true
sed -i '' 's/LastUpgradeCheck = [0-9]*/LastUpgradeCheck = 1200/g' "$PROJECT_FILE" 2>/dev/null || true

echo "✅ Project format updated to Xcode 12.0 compatibility"
echo ""
echo "📝 Changes made:"
echo "   - compatibilityVersion: Xcode 12.0"
echo "   - objectVersion: 54"
echo ""
echo "🔄 Try opening the project again:"
echo "   npm run ios"
