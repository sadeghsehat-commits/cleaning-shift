# 🔔 Fix: Notifications on Home Screen (Android)

## Current Problem
✅ Notifications work inside the app
❌ Notifications **don't show on phone home screen**
❌ Notifications **don't work when app is closed**

---

## Solution: Use Firebase Cloud Messaging (FCM)

---

## 🚀 Quick Steps

### Step 1: Setup Firebase (5 min)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create project**: Click "Add project" → Name: `CleanShift` → Create
3. **Add Android app**:
   - Click ⚙️ Settings → Project settings → Android icon
   - Package name: `com.cleanshift.app` (⚠️ MUST BE EXACT)
   - Click "Register app"
4. **Download file**:
   - Click "Download google-services.json"
   - Save to: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/google-services.json`
   - ⚠️ Must be in `android/app/` folder

---

### Step 2: Rebuild App (3 min)

Open Terminal and run:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Install push notifications plugin
npm install @capacitor/push-notifications

# Sync with Android
npx cap sync android

# Rebuild web bundle
./build-native-simple.sh

# Open Android Studio
npx cap open android
```

In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Wait 1-2 minutes

---

### Step 3: Install New APK (1 min)

1. **Uninstall** old CleanShift app from phone
2. **Install** new APK: `android/app/build/outputs/apk/debug/app-debug.apk`
3. **Open** app and login

---

## ✅ Test It

### Test 1: App in Background
1. Press **Home button** (don't close app)
2. From laptop, create a new shift
3. ✅ Notification should appear on **home screen**

### Test 2: App Completely Closed
1. **Close app** (swipe away from recent apps)
2. Create a new shift from laptop
3. ✅ Notification should appear on **home screen**

---

## What's Included?

I've already created all the code you need:

✅ `components/CapacitorPushNotifications.tsx` - Native push handler
✅ `app/api/push/register/route.ts` - API to save FCM tokens
✅ `models/PushToken.ts` - Database model for tokens
✅ `app/dashboard/layout.tsx` - Added native push component
✅ Android is already configured for FCM

**You just need to:**
1. Download `google-services.json` from Firebase
2. Put it in `android/app/` folder
3. Rebuild the app

---

## Quick Checklist

- [ ] Created Firebase project
- [ ] Added Android app (package: `com.cleanshift.app`)
- [ ] Downloaded `google-services.json`
- [ ] Put file in `android/app/google-services.json`
- [ ] Ran `npm install @capacitor/push-notifications`
- [ ] Ran `npx cap sync android`
- [ ] Ran `./build-native-simple.sh`
- [ ] Built APK in Android Studio
- [ ] Uninstalled old app
- [ ] Installed new app
- [ ] Tested notifications with app closed

---

## Troubleshooting

**Q: "google-services.json not found"**
A: Make sure it's in `android/app/google-services.json`, not `android/google-services.json`

**Q: Notifications still don't show on home screen**
A: 
1. Check `google-services.json` is in correct location
2. Verify package name in Firebase is exactly: `com.cleanshift.app`
3. Make sure you **uninstalled old app** before installing new one
4. Check phone's notification settings for CleanShift are enabled

**Q: Build fails**
A: Run `npx cap sync android` and try again

---

## Summary

The code is ready. You just need to:

1. Get `google-services.json` from Firebase
2. Put it in `android/app/` folder  
3. Rebuild APK
4. Install

That's it! 🎉

