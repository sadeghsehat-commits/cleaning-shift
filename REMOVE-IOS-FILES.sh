#!/bin/bash

# Script to remove iOS/Xcode related files
# Run this script to clean up iOS files before getting a new Mac

echo "🧹 Cleaning up iOS/Xcode related files..."
echo ""

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Remove ios directory (can be regenerated later with 'npx cap add ios')
if [ -d "ios" ]; then
    echo "📁 Removing ios/ directory..."
    rm -rf ios
    echo "✅ Removed ios/ directory"
else
    echo "ℹ️  ios/ directory not found (already removed?)"
fi

# Remove iOS-related markdown documentation files
echo ""
echo "📄 Removing iOS-related documentation files..."

IOS_FILES=(
    "FINAL-IOS-BUILD-STEPS.md"
    "IOS-APP-BUILD-GUIDE.md"
    "IOS-RUN-ON-IPHONE-GUIDE.md"
    "FIX-IOS-SPM-ERROR.md"
    "FIX-IOS-SPM-ERROR-DETAILED.md"
    "FIX-XCODE-COMPATIBILITY.md"
    "FIX-XCODE-FORMAT-ERROR.md"
    "OPEN-IOS-PROJECT.md"
    "FIX-CAPAPP-SPM-IN-XCODE.md"
    "IOS-FRESH-START.md"
    "FIX-CAPAPP-SPM-FINAL.md"
    "FIX-CAPAPP-SPM-ABSOLUTE-PATH.md"
    "TRY-BUILD-WITHOUT-CAPAPP.md"
    "FIX-XCODE-CACHE-ISSUE.md"
    "IOS-FRESH-REGENERATED.md"
    "CAPAPP-SPM-EXPLANATION.md"
    "FINAL-FIX-CAPAPP-SPM.md"
    "FIX-PACKAGE-REFERENCE.md"
    "IOS-PROJECT-REVIEW.md"
    "FORCE-PACKAGE-RESOLUTION.md"
    "FINAL-FIX-CAPAPP-SPM.md"
    "STEP-BY-STEP-PACKAGE-RESOLUTION.md"
    "QUICK-START-PACKAGE-RESOLUTION.md"
    "SOLUTION-GRAYED-MENU.md"
    "FIX-GRAYED-OUT-PACKAGES.md"
    "NEXT-STEPS-AFTER-READY.md"
    "FIXED-CODE-SIGNING-CONFLICT.md"
    "FIX-MISSING-DEVICE-SUPPORT.md"
    "USE-IOS-SIMULATOR.md"
    "MAC-HARDWARE-LIMITATION.md"
    "DEBUG-BLACK-SCREEN.md"
    "BLACK-SCREEN-SOLUTION.md"
    "REMOVED-CAPAPP-TEMPORARILY.md"
    "FIXED-CAPACITOR-IMPORT.md"
    "FIX-GRAYED-SAVE-AND-PACKAGES.md"
    "VIRTUAL-MAC-OS-OPTIONS.md"
    "WHY-SIMULATOR-BLACK-SCREEN.md"
    "GUIDA-COMPLETA-IPA-STEP-BY-STEP.md"
)

REMOVED_COUNT=0
for file in "${IOS_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  ✅ Removed: $file"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
done

echo ""
echo "📊 Summary:"
echo "  - Removed ios/ directory (if existed)"
echo "  - Removed $REMOVED_COUNT iOS-related documentation files"
echo ""
echo "✅ iOS cleanup complete!"
echo ""
echo "ℹ️  Note: iOS platform can be re-added later with:"
echo "   npx cap add ios"
echo ""
echo "ℹ️  capacitor.config.ts is kept (needed for Android)"
echo "ℹ️  package.json iOS dependencies are kept (won't cause issues)"

