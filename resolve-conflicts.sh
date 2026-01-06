#!/bin/bash

# Script to resolve merge conflicts by accepting incoming changes
# (The incoming changes have the correct syntax with closing parentheses)

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# List of conflicted files
CONFLICTED_FILES=(
  "app/dashboard/apartments/[id]/edit/page.tsx"
  "app/dashboard/apartments/new/page.tsx"
  "app/dashboard/apartments/page.tsx"
  "app/dashboard/cleaning-calendar/page.tsx"
  "app/dashboard/history/page.tsx"
  "app/dashboard/layout.tsx"
  "app/dashboard/notifications/page.tsx"
  "app/dashboard/page.tsx"
  "app/dashboard/reports/operator-work-days/page.tsx"
  "app/dashboard/reports/page.tsx"
  "app/dashboard/schedule/page.tsx"
  "app/dashboard/shifts/new/page.tsx"
  "app/dashboard/shifts/page.tsx"
  "app/dashboard/unavailability-requests/page.tsx"
  "app/dashboard/unavailability/page.tsx"
  "app/dashboard/users/page.tsx"
  "app/login/page.tsx"
)

echo "🔧 Resolving merge conflicts..."
echo ""

for file in "${CONFLICTED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Resolving: $file"
    # Accept incoming changes (theirs) which have correct syntax
    git checkout --theirs "$file"
    git add "$file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ All conflicts resolved!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Continue rebase: git rebase --continue"
echo "  3. Push: git push origin main"

