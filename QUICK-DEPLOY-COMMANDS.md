# Quick Deployment Commands

## Fastest Way to Deploy (Copy & Paste)

### Option 1: One-Line Command (Fastest)
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && git add . && git commit -m "Fix comment notifications to use TOP UP title" && git push origin main
```

### Option 2: Use the Script
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./QUICK-DEPLOY.sh
```

### Option 3: Step by Step (If you need to check first)
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
git status                    # Check what changed
git add .                     # Add all changes
git commit -m "Your message"  # Commit
git push origin main          # Push (triggers Vercel)
```

---

## If Xcode Error Blocks Git

If you see this error:
```
xcrun: error: active developer path ("/Applications/Xcode.app/Contents/Developer") does not exist
```

### Quick Fix (Temporary)
```bash
# Temporarily disable Xcode tools check
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
git add . && git commit -m "Fix comment notifications" && git push origin main
```

### Permanent Fix (Recommended)
```bash
# Install Xcode Command Line Tools (takes 5-10 minutes)
xcode-select --install
```

Or if you have Xcode installed:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

---

## Deployment Status

After pushing:
1. ✅ **GitHub** - Changes are pushed (instant)
2. ⏳ **Vercel** - Auto-deploys in 1-3 minutes
3. 🔗 **Check status**: https://vercel.com/dashboard

---

## Current Changes to Deploy

**File Changed:**
- `app/api/shifts/[id]/comments/route.ts`

**What Changed:**
- Comment notifications now use "TOP UP" title
- Added `url` field to FCM data
- Notifications will appear as push notifications

---

## Test After Deployment

1. Wait 1-3 minutes for Vercel deployment
2. Open web app: https://cleaning-shift-manager.vercel.app
3. Add a comment to a shift
4. Check if notification appears with "TOP UP" title
5. Verify push notification appears on mobile

