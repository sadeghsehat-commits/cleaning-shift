#!/bin/bash
# Script to push logout and notification fixes to GitHub

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging all changes..."
git add -A

echo ""
echo "📝 Committing changes..."
git commit -m "Fix logout hard redirect + auto-request Android notification permission"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check GitHub and Vercel for the new deployment."

