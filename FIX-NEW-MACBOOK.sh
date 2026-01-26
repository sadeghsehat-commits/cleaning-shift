#!/bin/bash
# Simple fix for new MacBook - run this in Terminal

echo "🔧 FIXING NEW MACBOOK SETUP"
echo "============================"
echo ""

# Step 1: Add nvm to .zshrc if not present
echo "1️⃣ Adding nvm to ~/.zshrc..."
if ! grep -q "NVM_DIR" ~/.zshrc 2>/dev/null; then
  echo '' >> ~/.zshrc
  echo '# NVM Configuration' >> ~/.zshrc
  echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
  echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
  echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
  echo "   ✅ Added nvm to ~/.zshrc"
else
  echo "   ✅ nvm already in ~/.zshrc"
fi
echo ""

# Step 2: Fix .npmrc
echo "2️⃣ Fixing .npmrc..."
if [ -f ~/.npmrc ]; then
  if grep -q "^prefix=" ~/.npmrc 2>/dev/null || grep -q "^globalconfig=" ~/.npmrc 2>/dev/null; then
    # Backup
    cp ~/.npmrc ~/.npmrc.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    # Remove problematic lines
    grep -v "^prefix=" ~/.npmrc 2>/dev/null | grep -v "^globalconfig=" > ~/.npmrc.tmp 2>/dev/null && mv ~/.npmrc.tmp ~/.npmrc 2>/dev/null || true
    echo "   ✅ Removed prefix/globalconfig from ~/.npmrc"
  else
    echo "   ✅ .npmrc is OK (no prefix setting)"
  fi
else
  echo "   ℹ️  No .npmrc file (this is OK)"
fi
echo ""

# Step 3: Verify
echo "3️⃣ Verifying setup..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null || true

if command -v node &> /dev/null; then
  echo "   ✅ Node.js: $(node --version)"
else
  echo "   ❌ Node.js not found!"
fi

if command -v npm &> /dev/null; then
  echo "   ✅ npm: $(npm --version)"
else
  echo "   ❌ npm not found!"
fi
echo ""

echo "✅ DONE!"
echo ""
echo "🔄 IMPORTANT: Close and reopen Terminal, or run: source ~/.zshrc"
echo "   Then test: cd /Users/luna/Downloads/Mahdiamooyee && npm --version"
echo ""
