# Fix Xcode Error Blocking Git

## The Problem

Git commands are failing because they're trying to use Xcode tools that don't exist (Xcode was deleted).

## Solution: Install Command Line Tools Only

You need to install **ONLY** the command line tools (not full Xcode).

---

## Step 1: Install Command Line Tools

Run this command in Terminal:

```bash
xcode-select --install
```

**What happens:**
1. A dialog will appear asking to install
2. Click **"Install"**
3. Wait 5-10 minutes (it downloads ~1GB)
4. Installation completes automatically

**This installs ONLY the tools needed for git (NOT full Xcode)**

---

## Step 2: After Installation Completes

Then run deployment commands:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
git add .
git commit -m "Fix notification titles and click navigation for Android and PWA"
git push origin main
```

---

## Alternative: If Installation Fails

If `xcode-select --install` doesn't work, try:

```bash
sudo xcode-select --reset
xcode-select --install
```

---

## What `export PATH` Does

The command `export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`:
- Sets the PATH environment variable
- Doesn't return any output (this is normal)
- Only works for the current Terminal session
- Tries to bypass Xcode tools, but git still needs them

**The real fix is installing command line tools.**

---

## Summary

1. **Run:** `xcode-select --install`
2. **Wait:** 5-10 minutes for installation
3. **Then:** Run git commands (they will work)

This is a one-time installation. After this, git will work without Xcode errors.

