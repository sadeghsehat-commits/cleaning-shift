#!/bin/bash
# Check what's installed on your MacBook M4 for this project.
# Run: ./check-setup-macbook.sh

set -e
cd "$(dirname "$0")"

echo "🖥️  MACBOOK M4 SETUP CHECK"
echo "=========================="
echo ""

# --- 1. Node.js & npm ---
echo "1️⃣  Node.js & npm"
if command -v node &>/dev/null; then
  echo "   ✅ Node.js: $(node --version)"
else
  echo "   ❌ Node.js: NOT FOUND (install via nvm or https://nodejs.org)"
fi
if command -v npm &>/dev/null; then
  echo "   ✅ npm: $(npm --version)"
else
  echo "   ❌ npm: NOT FOUND"
fi
echo ""

# --- 2. nvm (optional but useful) ---
echo "2️⃣  nvm (Node Version Manager)"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "   ✅ nvm: installed (~/.nvm)"
else
  echo "   ⚠️  nvm: not found (optional; install: https://github.com/nvm-sh/nvm)"
fi
echo ""

# --- 3. Git ---
echo "3️⃣  Git"
if command -v git &>/dev/null; then
  echo "   ✅ Git: $(git --version)"
else
  echo "   ❌ Git: NOT FOUND (install Xcode Command Line Tools: xcode-select --install)"
fi
echo ""

# --- 4. Java (needed for Android builds) ---
echo "4️⃣  Java (for Android)"
if command -v java &>/dev/null; then
  JAVAV="$(java -version 2>&1 | head -1)"
  if echo "$JAVAV" | grep -qi "version"; then
    echo "   ✅ Java: $JAVAV"
  else
    echo "   ❌ Java: installed but not working ($JAVAV)"
    echo "      Android Studio bundles Java; or: brew install openjdk@17"
  fi
else
  echo "   ❌ Java: NOT FOUND (Android Studio installs one; or: brew install openjdk@17)"
fi
echo ""

# --- 5. Android Studio / SDK ---
echo "5️⃣  Android Studio & SDK"
if [ -n "$ANDROID_HOME" ]; then
  echo "   ✅ ANDROID_HOME: $ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ]; then
  echo "   ✅ ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
else
  DEFAULT_SDK="$HOME/Library/Android/sdk"
  if [ -d "$DEFAULT_SDK" ]; then
    echo "   ⚠️  Android SDK at $DEFAULT_SDK but ANDROID_HOME not set"
    echo "      Add to ~/.zshrc: export ANDROID_HOME=\"$DEFAULT_SDK\""
    echo "      And: export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/tools\""
  else
    echo "   ❌ Android Studio/SDK: NOT FOUND"
    echo "      Install: https://developer.android.com/studio"
  fi
fi
if command -v adb &>/dev/null; then
  echo "   ✅ adb: $(adb --version 2>&1 | head -1)"
else
  echo "   ⚠️  adb: not in PATH (add Android SDK platform-tools to PATH)"
fi
echo ""

# --- 6. Capacitor (project npm packages) ---
echo "6️⃣  Capacitor (in this project)"
if [ -d "node_modules/@capacitor/core" ]; then
  echo "   ✅ @capacitor/core: installed"
else
  echo "   ❌ @capacitor/core: NOT FOUND — run: npm install"
fi
if [ -d "node_modules/@capacitor/cli" ]; then
  echo "   ✅ @capacitor/cli: installed"
else
  echo "   ❌ @capacitor/cli: NOT FOUND — run: npm install"
fi
if [ -d "node_modules/@capacitor/android" ]; then
  echo "   ✅ @capacitor/android: installed"
else
  echo "   ❌ @capacitor/android: NOT FOUND — run: npm install"
fi
CAP_VERSION=""
if [ -x "node_modules/.bin/cap" ]; then
  CAP_VERSION="$(./node_modules/.bin/cap --version 2>&1 || true)"
fi
if [ -z "$CAP_VERSION" ] && command -v npx &>/dev/null; then
  CAP_VERSION="$(npx cap --version 2>&1 || true)"
fi
if [ -n "$CAP_VERSION" ] && echo "$CAP_VERSION" | grep -qE '^[0-9]+\.[0-9]+'; then
  echo "   ✅ npx cap: $CAP_VERSION"
else
  echo "   ⚠️  npx cap: $(echo "$CAP_VERSION" | head -1 || echo 'not runnable')"
  echo "      Tip: Capacitor 8 needs Node >=22. Use nvm: nvm install 22 && nvm use 22"
fi
echo ""

# --- 7. Homebrew (optional) ---
echo "7️⃣  Homebrew"
if command -v brew &>/dev/null; then
  echo "   ✅ Homebrew: $(brew --version 2>&1 | head -1)"
else
  echo "   ⚠️  Homebrew: not found (optional; install: https://brew.sh)"
fi
echo ""

# --- 8. Xcode / iOS (optional) ---
echo "8️⃣  Xcode (for iOS builds only)"
XB="$(xcodebuild -version 2>&1 | head -1)"
if echo "$XB" | grep -qi "Xcode [0-9]"; then
  echo "   ✅ Xcode: $XB"
elif [ -d /Applications/Xcode.app ]; then
  echo "   ⚠️  Xcode installed but not active (run: sudo xcode-select -s /Applications/Xcode.app)"
else
  echo "   ⚠️  Xcode: not installed (only needed for iOS; OK if you only build Android)"
fi
echo ""

# --- 9. Project-specific ---
echo "9️⃣  Project"
if [ -d "android" ]; then
  echo "   ✅ android/ folder: present"
else
  echo "   ❌ android/ folder: missing — run: npx cap add android"
fi
if [ -f "out/index.html" ]; then
  echo "   ✅ out/index.html: present (web build done)"
else
  echo "   ⚠️  out/index.html: missing — run build-for-mobile.sh or npm run build"
fi
echo ""

echo "=========================="
echo "📋 SUMMARY"
echo "   • Capacitor is NOT a separate app. It's npm packages in this project."
echo "   • Run 'npm install' in this folder to install Capacitor + deps."
echo "   • For Android APKs: need Node, npm, Android Studio, ANDROID_HOME."
echo ""
echo "🔧 WHAT TO DO ON NEW MACBOOK"
echo "-----------------------------"
echo "1. Set Android SDK (if you use Android Studio):"
echo '   echo "" >> ~/.zshrc'
echo '   echo "# Android SDK" >> ~/.zshrc'
echo '   echo "export ANDROID_HOME=$HOME/Library/Android/sdk" >> ~/.zshrc'
echo '   echo "export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools" >> ~/.zshrc'
echo "   Then run: source ~/.zshrc"
echo ""
echo "2. Install Java (if missing): Android Studio installs one, or:"
echo "   brew install openjdk@17   # (requires Homebrew)"
echo ""
echo "3. Install Homebrew (optional): /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo ""
echo "4. In this project: npm install  then  ./build-for-mobile.sh  then  npx cap sync android"
echo ""
