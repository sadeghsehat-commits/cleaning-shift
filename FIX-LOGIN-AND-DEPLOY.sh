#!/bin/bash
# Fix login issue by deploying current working code

set -e

cd /Users/luna/Downloads/Mahdiamooyee

echo "🔧 FIXING LOGIN ISSUE - DEPLOYING CURRENT CODE"
echo "=============================================="
echo ""

# Step 1: Verify we're at Jan 15 commit
echo "1️⃣ Checking current commit..."
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "   Current commit: $CURRENT_COMMIT"
git log --oneline -1
echo ""

# Step 2: Verify API routes exist
echo "2️⃣ Verifying API routes exist..."
if [ -f "app/api/auth/login/route.ts" ]; then
  echo "   ✅ Login API route exists"
else
  echo "   ❌ Login API route MISSING!"
  exit 1
fi

if [ -f "app/api/auth/register/route.ts" ]; then
  echo "   ✅ Register API route exists"
else
  echo "   ❌ Register API route MISSING!"
  exit 1
fi

if [ -f "app/api/auth/me/route.ts" ]; then
  echo "   ✅ Auth check API route exists"
else
  echo "   ❌ Auth check API route MISSING!"
  exit 1
fi
echo ""

# Step 3: Create deployment commit
echo "3️⃣ Creating deployment commit..."
git add -A
git commit --allow-empty -m "Fix login - deploy Jan 15 working version" || echo "   (No changes to commit)"
echo ""

# Step 4: Instructions
echo "✅ READY TO DEPLOY"
echo ""
echo "📤 Run this command to deploy:"
echo "   git push --force-with-lease origin main"
echo ""
echo "⏳ After pushing:"
echo "   1. Wait 2-3 minutes for Vercel to deploy"
echo "   2. Check: https://vercel.com/dashboard"
echo "   3. Test login at: https://cleaning-shift-manager.vercel.app"
echo ""
echo "🔍 If login still doesn't work, check browser console for errors"
echo ""
