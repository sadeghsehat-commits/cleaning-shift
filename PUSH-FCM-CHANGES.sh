#!/bin/bash
# Push FCM notification changes to GitHub

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "📦 Staging all changes..."
git add -A

echo ""
echo "📝 Committing..."
git commit -m "Implement FCM push notifications + fix shift details page for mobile"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check:"
echo "   GitHub: https://github.com/sadeghsehat-commits/cleaning-shift"
echo "   Vercel: https://vercel.com/sadegh-sehats-projects/cleaning-shift-manager/deployments"

