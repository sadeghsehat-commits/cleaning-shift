# 🔥 Setup Firebase Cloud Messaging (FCM) for Android Push Notifications

## Why You Need This

Currently, notifications only appear **inside the app** when it's open. 
With FCM, notifications will appear on the **home screen** even when the app is closed.

---

## Step 1: Create Firebase Project

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Click **"Add project"** or select your existing project
3. Project name: `CleanShift` (or any name you want)
4. Click **Continue** → **Continue** → **Create project**

---

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the **Android icon** (⚙️ Settings icon → Project settings)
2. Click **"Add app"** → Select **Android**
3. Fill in:
   - **Android package name**: `com.cleanshift.app` (MUST match your app)
   - **App nickname**: CleanShift (optional)
   - **Debug signing certificate SHA-1**: (optional, skip for now)
4. Click **"Register app"**

---

## Step 3: Download google-services.json

1. Firebase will show you a `google-services.json` file
2. Click **"Download google-services.json"**
3. **IMPORTANT**: Move this file to:
   ```
   /Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/google-services.json
   ```
4. Click **"Next"** → **"Next"** → **"Continue to console"**

---

## Step 4: Update Android Configuration

### 4.1 Update `android/build.gradle` (Project-level)

Open: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/build.gradle`

Add this line in the `dependencies` block:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

Full example:
```gradle
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.0.0'
        classpath 'com.google.gms:google-services:4.4.0'  // ← ADD THIS
    }
}
```

### 4.2 Update `android/app/build.gradle` (App-level)

Open: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/build.gradle`

Add this line **at the very bottom** of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## Step 5: Sync Capacitor

Run in Terminal:
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
npx cap sync android
```

---

## Step 6: Rebuild APK

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Rebuild web app
./build-native-simple.sh

# Open Android Studio
npx cap open android
```

In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Wait for build to complete

---

## Step 7: Install New APK

1. **Uninstall** old CleanShift app from your phone
2. **Install** new APK: `android/app/build/outputs/apk/debug/app-debug.apk`
3. **Open** the app

---

## Step 8: Test Notifications

### From Dashboard:
1. Login as **owner** or **admin**
2. Create a **new shift** and assign it to an operator
3. The operator should receive a notification on their **home screen**

### Test While App is Closed:
1. Close the CleanShift app completely
2. Create a new shift from web browser
3. Check if notification appears on phone's home screen

---

## What Changed?

| Before | After |
|--------|-------|
| Notifications only appear **inside the app** | Notifications appear on **home screen** |
| Only works when **app is open** | Works even when **app is closed** |
| Uses Web Notifications API (browser) | Uses FCM (native Android) |
| Polling every 15 seconds | Real-time push from server |

---

## Troubleshooting

### "google-services.json not found"
- Make sure the file is in: `android/app/google-services.json`
- NOT in: `android/google-services.json`

### Build error: "Could not find google-services"
- Check that you added the classpath in `android/build.gradle`
- Run: `npx cap sync android`

### Notifications still don't show on home screen
- Make sure you **uninstalled the old app** before installing the new one
- Check that FCM token is being registered (check app logs)
- Verify that `google-services.json` package name matches: `com.cleanshift.app`

---

## Next Steps

After setting up FCM, you'll also need to update the **backend** to send FCM notifications instead of Web Push.

This will be done in the next step.

