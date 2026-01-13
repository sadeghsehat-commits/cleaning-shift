# Deployment Steps - Web and Android

## Current Changes to Deploy

**File Changed:**
- `app/api/shifts/[id]/comments/route.ts`

**What Changed:**
- Comment notifications now use "TOP UP" title (matching shift assignments)
- Added `url` field to FCM notification data
- Notifications will appear as push notifications on Android

---

## Web Deployment (Vercel)

### Step 1: Fix Xcode Error (Temporary)
```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
```

### Step 2: Go to Project
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### Step 3: Add Changes
```bash
git add .
```

### Step 4: Commit Changes
```bash
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"
```

### Step 5: Push to GitHub
```bash
git push origin main
```

✅ **Result:** Vercel automatically deploys in 1-3 minutes

---

## OR: All in One Line (Faster)

```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" && cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && git add . && git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data" && git push origin main
```

---

## Android Deployment (After Web is Deployed)

### Step 1: Go to Project
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### Step 2: Build Static Files
```bash
./build-for-mobile.sh
```

### Step 3: Sync with Capacitor
```bash
npx cap sync android
```

### Step 4: Open Android Studio
```bash
npx cap open android
```

### Step 5: Build APK in Android Studio
- Wait for Gradle sync to finish
- Click: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Quick Reference

### Web Only:
```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" && cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && git add . && git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data" && git push origin main
```

### Android Only:
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && ./build-for-mobile.sh && npx cap sync android && npx cap open android
```

---

## Check Deployment Status

**Web (Vercel):**
- Dashboard: https://vercel.com/dashboard
- App URL: https://cleaning-shift-manager.vercel.app

**Android:**
- Build APK in Android Studio
- Install APK on phone
- Test notifications

---

## What Happens After Deployment

### Web:
1. ✅ Changes pushed to GitHub
2. ✅ Vercel detects push
3. ✅ Vercel builds and deploys (1-3 minutes)
4. ✅ Changes live on web browser

### Android:
1. ✅ Static files built
2. ✅ Capacitor syncs with Android
3. ✅ Android Studio opens
4. ✅ Build APK
5. ✅ Install on phone
6. ✅ Test notifications

---

## Testing After Deployment

1. **Web:**
   - Open: https://cleaning-shift-manager.vercel.app
   - Add a comment to a shift
   - Check if notification appears with "TOP UP" title

2. **Android:**
   - Install new APK
   - Add a comment to a shift
   - Check if push notification appears
   - Verify notification has "TOP UP" title

