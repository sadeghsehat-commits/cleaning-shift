# 🚀 Deployment Guide - Step by Step

This guide explains how to deploy new changes to **both Web (Vercel) and Android APK**.

---

## 📋 Before Every Deployment

### 1️⃣ **Update Android Version** (if needed)
If you made changes to the app, update the version:

**File:** `android/app/build.gradle`

```gradle
versionCode 3          // Must increment (3, 4, 5, ...)
versionName "1.1.1"    // User-visible version (1.1.1, 1.1.2, 1.2.0, ...)
```

**Rules:**
- `versionCode` → Always increment (required by Android)
- `versionName` → Bug fixes: `1.1.1` → `1.1.2`, Features: `1.1.1` → `1.2.0`, Major: `1.1.1` → `2.0.0`

---

## 🌐 Web Deployment (Vercel)

### Step 1: Check Changes
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
git status
```

### Step 2: Add All Changes
```bash
git add -A
```

### Step 3: Commit
```bash
git commit -m "Your description of changes"
```

**Examples:**
- `git commit -m "Restore shift details page with comments and photos"`
- `git commit -m "Fix logout issue"`
- `git commit -m "Update Android version to 1.1.1"`

### Step 4: Push to GitHub
```bash
git push origin main
```

### Step 5: Wait for Vercel
1. Go to: https://vercel.com/sadegh-sehats-projects/cleaning-shift-manager/deployments
2. Wait for deployment to complete (usually 2-5 minutes)
3. ✅ Green checkmark = Success
4. ❌ Red X = Error (check logs)

### Step 6: Test on Web
1. Open: https://cleaning-shift-manager.vercel.app
2. Test the new features
3. ✅ Everything works = Done!

---

## 📱 Android APK Deployment

### Step 1: Rebuild Web App (Required)
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-native-simple.sh
```

**Wait for:** `✅ Build complete!`

### Step 2: Open Android Studio
```bash
npx cap open android
```

**Wait for:** Android Studio to open and Gradle to sync (first time can take 5-10 minutes)

### Step 3: Build APK in Android Studio

1. **Select Build Variant:**
   - Look at bottom-left of Android Studio
   - Select: **`app`** (not `capacitor-android`)
   - Build Variant: **`debug`** (for testing) or **`release`** (for production)

2. **Build APK:**
   - Click: **`Build`** → **`Build Bundle(s) / APK(s)`** → **`Build APK(s)`**
   - Wait for build to complete (1-3 minutes)
   - Click: **`locate`** link in notification when done

3. **Find APK:**
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk` (or `release/app-release.apk`)

### Step 4: Install on Phone

**Method 1: USB (Recommended)**
```bash
# Connect phone via USB
# Enable USB Debugging on phone
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Method 2: Manual Transfer**
1. Copy `app-debug.apk` to phone (email, Google Drive, etc.)
2. Open file on phone
3. Allow "Install from unknown sources" if prompted
4. Install

### Step 5: Test on Android
1. Open app on phone
2. Test login
3. Test new features
4. ✅ Everything works = Done!

---

## 🔄 Complete Deployment Checklist

Use this checklist for every deployment:

- [ ] **1. Update Android version** (`build.gradle`)
- [ ] **2. Test changes locally** (if possible)
- [ ] **3. Commit changes** (`git add -A`, `git commit`)
- [ ] **4. Push to GitHub** (`git push origin main`)
- [ ] **5. Wait for Vercel deployment** (check dashboard)
- [ ] **6. Test on web** (open Vercel URL)
- [ ] **7. Rebuild for mobile** (`./build-native-simple.sh`)
- [ ] **8. Open Android Studio** (`npx cap open android`)
- [ ] **9. Build APK** (Build → Build Bundle(s) / APK(s))
- [ ] **10. Install on phone** (via USB or manual transfer)
- [ ] **11. Test on Android** (verify all features work)

---

## 🐛 Common Issues

### Issue: "Vercel deployment failed"
**Solution:**
1. Check Vercel logs for errors
2. Common causes:
   - TypeScript errors
   - Missing environment variables
   - API route errors
3. Fix errors, commit, push again

### Issue: "APK build failed in Android Studio"
**Solution:**
1. Check Gradle logs (bottom panel in Android Studio)
2. Common causes:
   - Missing dependencies
   - Version conflicts
   - Build cache issues
3. Try: `Build` → `Clean Project`, then rebuild

### Issue: "App shows old version on phone"
**Solution:**
1. Uninstall old app from phone
2. Rebuild APK with incremented `versionCode`
3. Install new APK

### Issue: "Shift details page shows 404"
**Solution:**
1. Ensure `/app/dashboard/shifts/[id]/page.tsx` exists
2. Ensure `/app/dashboard/shifts/[id]/edit/page.tsx` exists
3. Rebuild web app: `./build-native-simple.sh`
4. Redeploy to Vercel

---

## 📝 Quick Command Reference

```bash
# Web Deployment
git add -A
git commit -m "Description"
git push origin main

# Mobile Build
./build-native-simple.sh
npx cap open android

# Check Android version
cat android/app/build.gradle | grep version
```

---

## 🎯 Summary

**Web (Vercel):**
1. `git push origin main` → Auto-deploys ✅

**Android:**
1. Update version in `build.gradle`
2. `./build-native-simple.sh`
3. `npx cap open android`
4. Build → Build APK
5. Install on phone

**That's it!** 🚀

