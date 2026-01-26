#!/bin/bash
# Complete setup script for new MacBook M4
# This ensures everything is properly configured

set -e

echo "🖥️  SETTING UP NEW MACBOOK M4 FOR DEVELOPMENT"
echo "=============================================="
echo ""

# Step 1: Check Homebrew
echo "1️⃣ Checking Homebrew..."
if ! command -v brew &> /dev/null; then
  echo "   ⚠️  Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo "   ✅ Homebrew already installed"
  brew --version
fi
echo ""

# Step 2: Ensure nvm is in shell profile
echo "2️⃣ Configuring nvm in shell profile..."
NVM_SETUP='
# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
'

if ! grep -q "NVM_DIR" ~/.zshrc 2>/dev/null; then
  echo "$NVM_SETUP" >> ~/.zshrc
  echo "   ✅ Added nvm to ~/.zshrc"
else
  echo "   ✅ nvm already in ~/.zshrc"
fi
echo ""

# Step 3: Fix .npmrc (remove prefix that conflicts with nvm)
echo "3️⃣ Fixing .npmrc file..."
if [ -f ~/.npmrc ]; then
  if grep -q "^prefix=" ~/.npmrc; then
    # Backup original
    cp ~/.npmrc ~/.npmrc.backup.$(date +%Y%m%d)
    # Remove problematic lines
    grep -v "^prefix=" ~/.npmrc | grep -v "^globalconfig=" > ~/.npmrc.tmp && mv ~/.npmrc.tmp ~/.npmrc
    echo "   ✅ Removed 'prefix' from ~/.npmrc (backed up to ~/.npmrc.backup.*)"
  else
    echo "   ✅ .npmrc is already correct (no prefix setting)"
  fi
else
  echo "   ℹ️  No .npmrc file found (this is OK)"
fi
echo ""

# Step 4: Source nvm and verify Node.js
echo "4️⃣ Verifying Node.js setup..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "   ✅ Node.js: $NODE_VERSION"
else
  echo "   ❌ Node.js not found! Installing..."
  nvm install 20.20.0
  nvm use 20.20.0
  nvm alias default 20.20.0
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "   ✅ npm: $NPM_VERSION"
else
  echo "   ❌ npm not found!"
  exit 1
fi
echo ""

# Step 5: Verify Git
echo "5️⃣ Verifying Git..."
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  echo "   ✅ Git: $GIT_VERSION"
else
  echo "   ⚠️  Git not found. Installing via Homebrew..."
  brew install git
fi
echo ""

# Step 6: Test npm in project directory
echo "6️⃣ Testing npm in project directory..."
cd /Users/luna/Downloads/Mahdiamooyee

# Source nvm again (in case script is run in new shell)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default --silent 2>/dev/null || nvm use 20.20.0 --silent 2>/dev/null || true

if npm --version &> /dev/null; then
  echo "   ✅ npm works in project directory"
else
  echo "   ❌ npm not working in project directory"
  echo "   Try running: source ~/.zshrc"
  exit 1
fi
echo ""

# Step 7: Verify project dependencies
echo "7️⃣ Checking project dependencies..."
if [ -d "node_modules" ]; then
  echo "   ✅ node_modules exists"
else
  echo "   ⚠️  node_modules not found. Run: npm install"
fi
echo ""

echo "✅ SETUP COMPLETE!"
echo ""
echo "📋 Summary:"
echo "   - Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "   - npm: $(npm --version 2>/dev/null || echo 'Not found')"
echo "   - Git: $(git --version 2>/dev/null || echo 'Not found')"
echo "   - nvm: Configured in ~/.zshrc"
echo "   - .npmrc: Fixed (removed prefix if present)"
echo ""
echo "🔄 Next steps:"
echo "   1. Close and reopen Terminal (or run: source ~/.zshrc)"
echo "   2. Test: cd /Users/luna/Downloads/Mahdiamooyee && npm --version"
echo "   3. If npm works, you're ready to build!"
echo ""
