#!/bin/bash
# Build script that shows all errors

set -e

cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

echo "🧹 Cleaning..."
rm -rf .next out

echo "🔨 Building..."
npm run build 2>&1 | tee build-output.log

echo ""
echo "=== BUILD COMPLETE ==="
echo ""

if [ -f "out/index.html" ]; then
  echo "✅ SUCCESS: out/index.html exists!"
  ls -lh out/index.html
else
  echo "❌ FAILED: out/index.html does not exist"
  echo ""
  echo "=== ERRORS FROM BUILD ==="
  grep -i "error\|failed\|cannot" build-output.log | head -30
  echo ""
  echo "=== FULL BUILD OUTPUT ==="
  tail -50 build-output.log
fi

