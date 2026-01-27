#!/bin/bash
# Rollback to Jan 16 or Jan 15 and rebuild for Android.
# Usage: ./rollback-and-rebuild.sh [jan16|jan15]

set -e
cd "$(dirname "$0")"

JAN16_COMMIT="c2d071c"   # Fix auto-login – likely live on Jan 16
JAN15_COMMIT="42564a4"   # Fix notifications API – earlier Jan 15

case "${1:-jan16}" in
  jan16) COMMIT=$JAN16_COMMIT ; LABEL="Jan 16" ;;
  jan15) COMMIT=$JAN15_COMMIT ; LABEL="Jan 15" ;;
  *)     echo "Usage: $0 jan16|jan15" ; exit 1 ;;
esac

echo "Rolling back to $LABEL (commit $COMMIT)..."
git fetch origin 2>/dev/null || true
git checkout "$COMMIT"

# Fix build-for-mobile.sh if it uses a hardcoded path (e.g. /Users/LUNAFELICE/...)
if [ -f "./build-for-mobile.sh" ] && grep -q 'cd /Users/LUNAFELICE' ./build-for-mobile.sh 2>/dev/null; then
  echo "Patching build-for-mobile.sh to use script directory..."
  REPL='SCRIPT_DIR=\"$( cd \"$( dirname \"\${BASH_SOURCE[0]}\" )\" \&\& pwd )\" ; cd \"\$SCRIPT_DIR\"'
  if sed --version 2>&1 | grep -q GNU; then
    sed -i "s|^cd /Users/LUNAFELICE/Desktop/Mahdiamooyee\$|$REPL|" ./build-for-mobile.sh
  else
    sed -i '' "s|^cd /Users/LUNAFELICE/Desktop/Mahdiamooyee\$|$REPL|" ./build-for-mobile.sh
  fi
  echo "   Patched."
fi

echo "Installing deps..."
npm install

if [ -f "./build-for-mobile.sh" ]; then
  echo "Building for mobile (static export to out/)..."
  bash ./build-for-mobile.sh
else
  echo "Building (standard Next.js)..."
  npm run build
fi

echo "Syncing to Android..."
npx cap sync android

echo "Done. Next: open Android Studio → android/ → Build → Build APK(s)."
echo "Optionally: git checkout -b rollback-${1:-jan16} && git push origin rollback-${1:-jan16}"
