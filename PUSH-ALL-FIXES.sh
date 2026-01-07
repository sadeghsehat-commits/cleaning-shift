#!/bin/bash
# Push all mobile app fixes to GitHub

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "📦 Staging all changes..."
git add -A

echo ""
echo "📋 Checking what's changed..."
git status --short

echo ""
echo "📝 Committing all mobile app fixes..."
git commit -m "Fix mobile app: notification badge clearing, horizontal scroll, shift details navigation, version 1.1.0"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Changes pushed to GitHub"
echo ""
echo "📊 Summary of fixes:"
echo "  ✅ Auto-clear notification badge when viewed/tapped"
echo "  ✅ Fixed horizontal scrolling (overflow-x: hidden)"
echo "  ✅ Fixed shift details navigation (use details page)"
echo "  ✅ Hidden notification permission buttons in mobile app"
echo "  ✅ Updated app version to 1.1.0 (versionCode 2)"
echo ""
echo "🔗 Check deployment:"
echo "  GitHub: https://github.com/sadeghsehat-commits/cleaning-shift"
echo "  Vercel: https://vercel.com/sadegh-sehats-projects/cleaning-shift-manager/deployments"

