#!/bin/bash
# Trigger a new Vercel deployment by pushing an empty commit to main.
# Run: bash trigger-vercel-deploy.sh

set -e
cd "$(dirname "$0")"

echo "📤 Triggering Vercel deployment..."
echo ""

# Ensure we're on main (fix detached HEAD)
if ! git branch --show-current | grep -q '^main$'; then
  echo "   Switching to main (you were on $(git branch --show-current 2>/dev/null || echo 'detached HEAD'))..."
  git checkout main
fi

# Create empty commit and push
git commit --allow-empty -m "Trigger Vercel deployment $(date +%Y-%m-%d-%H%M)"
echo "   Pushing to origin main..."
git push origin main

echo ""
echo "✅ Done. Check https://vercel.com/dashboard for the new deployment."
echo "   Wait 1–2 minutes, then hard-refresh the site (or use Incognito)."
