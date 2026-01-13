# Web and Android Deployment Guide (No Xcode Needed)

Since Xcode is deleted, here are the deployment commands that work without it.

---

## Quick Fix for Git Commands (One-Time Setup)

Since Xcode is deleted, install only the Command Line Tools (takes 5-10 minutes):

```bash
xcode-select --install
```

**OR** use the temporary fix every time (no installation needed):

```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
```

---

## Web Browser Deployment (Vercel)

### Fastest Method - One Line:

```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" && cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && git add . && git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data" && git push origin main
```

### Step by Step:

**Step 1: Fix PATH (if needed)**
```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
```

**Step 2: Go to project**
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

**Step 3: Add and commit**
```bash
git add . && git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"
```

**Step 4: Push to GitHub**
```bash
git push origin main
```

✅ **Result:** Vercel automatically deploys in 1-3 minutes

---

## Android App Deployment (Local Build)

### Step 1: Build static files
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-for-mobile.sh
```

### Step 2: Sync with Capacitor
```bash
npx cap sync android
```

### Step 3: Open Android Studio
```bash
npx cap open android
```

### Step 4: Build APK in Android Studio
- Wait for Gradle sync
- Build > Build Bundle(s) / APK(s) > Build APK(s)
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Current Changes to Deploy

**File Changed:**
- `app/api/shifts/[id]/comments/route.ts`

**What Changed:**
- Comment notifications now use "TOP UP" title
- Added `url` field to FCM data
- Notifications will appear as push notifications on Android

---

## Quick Reference

### For Web (Vercel):
```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" && git add . && git commit -m "Your message" && git push origin main
```

### For Android:
```bash
./build-for-mobile.sh && npx cap sync android && npx cap open android
```

---

## Important Notes

1. ✅ **Xcode is NOT needed** for web or Android deployment
2. ✅ **Web deployment** uses Git + GitHub + Vercel (auto-deploy)
3. ✅ **Android deployment** uses local build with Android Studio
4. ⚠️ **PATH fix** is needed for git commands (temporary each time, or install command line tools once)

