#!/bin/bash
# Fix nvm warning before running build

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🔧 Fixing nvm npmrc warning..."
nvm use --delete-prefix v20.20.0 --silent
echo "✅ Fixed! Now you can run: bash build-for-mobile.sh"
