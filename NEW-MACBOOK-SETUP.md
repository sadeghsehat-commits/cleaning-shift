# 🖥️ New MacBook M4 Setup Guide

## ✅ What You Already Have:
- ✅ Node.js v20.20.0 (via nvm)
- ✅ npm 10.8.2
- ✅ Git 2.50.1
- ✅ nvm installed

## 🔧 What Needs to Be Fixed:

### **1. Add nvm to your shell profile (IMPORTANT!)**

Run this in Terminal:

```bash
# Add nvm to .zshrc
cat >> ~/.zshrc << 'EOF'

# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

# Reload shell
source ~/.zshrc
```

### **2. Fix .npmrc file (removes nvm warning)**

Run this in Terminal:

```bash
# Backup and fix .npmrc
if [ -f ~/.npmrc ]; then
  cp ~/.npmrc ~/.npmrc.backup
  grep -v "^prefix=" ~/.npmrc | grep -v "^globalconfig=" > ~/.npmrc.tmp && mv ~/.npmrc.tmp ~/.npmrc
  echo "✅ Fixed .npmrc (backup saved to ~/.npmrc.backup)"
else
  echo "✅ No .npmrc file (this is OK)"
fi
```

### **3. Verify everything works**

Run this in Terminal:

```bash
cd /Users/luna/Downloads/Mahdiamooyee

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Test
node --version
npm --version
nvm --version

# If all show versions, you're good!
```

### **4. Test the build**

```bash
cd /Users/luna/Downloads/Mahdiamooyee

# Source nvm (if not already in .zshrc)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.20.0

# Test build
bash build-for-mobile.sh
```

---

## 🎯 Quick Fix Commands (Copy & Paste):

```bash
# 1. Add nvm to .zshrc
echo '' >> ~/.zshrc
echo '# NVM Configuration' >> ~/.zshrc
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc

# 2. Fix .npmrc
if [ -f ~/.npmrc ] && grep -q "^prefix=" ~/.npmrc; then
  cp ~/.npmrc ~/.npmrc.backup
  grep -v "^prefix=" ~/.npmrc | grep -v "^globalconfig=" > ~/.npmrc.tmp && mv ~/.npmrc.tmp ~/.npmrc
  echo "✅ Fixed .npmrc"
fi

# 3. Reload shell
source ~/.zshrc

# 4. Test
cd /Users/luna/Downloads/Mahdiamooyee
node --version
npm --version
```

---

## ⚠️ Important Notes:

1. **After adding nvm to .zshrc**: Close and reopen Terminal, or run `source ~/.zshrc`
2. **The nvm warning is harmless**: It doesn't stop builds, but fixing .npmrc removes it
3. **Vercel deployment**: The React Error #310 fix is in the code, but Vercel might be serving cached JavaScript. Clear your browser cache after deployment completes.

---

## 🚀 After Setup:

Once everything is configured:
1. Close and reopen Terminal
2. Run: `cd /Users/luna/Downloads/Mahdiamooyee && npm --version`
3. If npm works, you're ready!
