# 📱 Build Mobile Apps - Complete Guide

## Overview

This app uses **Capacitor** to create native iOS (.ipa) and Android (.apk) installable files from your web app.

---

## 🚀 Quick Start

### Step 1: Build for Mobile
```bash
./build-mobile.sh
```

Or manually:
```bash
# Build static export (excludes API routes)
npm run build

# Sync with Capacitor
npx cap sync
```

### Step 2: Build iOS App (.ipa)

```bash
npm run ios
```

**In Xcode:**
1. Wait for project to open
2. Select your **Team** in Signing & Capabilities
3. Connect your iPhone or select simulator
4. Click **Play** (▶️) to build and run
5. For .ipa file: **Product → Archive → Distribute App**

### Step 3: Build Android App (.apk)

```bash
npm run android
```

**In Android Studio:**
1. Wait for Gradle sync to complete
2. **Build → Generate Signed Bundle / APK**
3. Choose **APK** (not AAB)
4. Select or create keystore
5. Build variant: **release**
6. APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📋 Detailed Steps

### Prerequisites Check

✅ **Xcode installed** (for iOS)
✅ **Android Studio installed** (for Android)
✅ **Node.js and npm** installed
✅ **Capacitor** installed (already done)

---

## 🍎 iOS Build Process

### 1. Build Web App
```bash
npm run build
```

### 2. Sync with Capacitor
```bash
npx cap sync
```

### 3. Open in Xcode
```bash
npm run ios
```

### 4. Configure Signing

In Xcode:
- Select project **CleanShift** in left sidebar
- Select target **App** under TARGETS
- Go to **Signing & Capabilities** tab
- ✅ Check "Automatically manage signing"
- Select your **Team** (Apple Developer account)

**Note:** You need an Apple Developer account ($99/year) to:
- Install on real devices
- Create .ipa files for distribution

### 5. Build for Device

**Option A: Direct Install (Testing)**
1. Connect iPhone via USB
2. Select your device from dropdown
3. Click **Play** button (▶️)
4. App installs directly on your iPhone

**Option B: Create .ipa File (Distribution)**
1. Select **"Any iOS Device (arm64)"** from device dropdown
2. **Product → Archive**
3. Wait for archive to complete
4. In Organizer window: **Distribute App**
5. Choose distribution method:
   - **Ad Hoc**: For testing (up to 100 devices)
   - **App Store Connect**: For App Store
   - **Enterprise**: For enterprise
6. Follow wizard to export .ipa

### 6. Install .ipa on iPhone

**Method 1: Xcode**
- Window → Devices and Simulators
- Select device → Click "+" → Choose .ipa

**Method 2: Finder (macOS)**
- Connect iPhone
- Open Finder → Select iPhone
- Drag and drop .ipa file

**Method 3: 3uTools or similar**
- Use third-party tool to install .ipa

---

## 🤖 Android Build Process

### 1. Build Web App
```bash
npm run build
```

### 2. Sync with Capacitor
```bash
npx cap sync
```

### 3. Open in Android Studio
```bash
npm run android
```

### 4. Create Keystore (First Time Only)

1. **Build → Generate Signed Bundle / APK**
2. Click **"Create new..."**
3. Fill in:
   - **Key store path**: Choose location (e.g., `cleanshift-keystore.jks`)
   - **Password**: Create strong password (SAVE IT!)
   - **Key alias**: `cleanshift-key`
   - **Key password**: Same or different
   - **Validity**: 25 years
   - **Certificate info**: Your details
4. Click **OK**

**⚠️ IMPORTANT:** Save the keystore file and password! You'll need it for updates.

### 5. Generate APK

**Debug APK (Testing):**
```bash
cd android
./gradlew assembleDebug
```
Location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (Distribution):**
1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Choose your keystore
4. Enter passwords
5. Build variant: **release**
6. Click **Finish**

Location: `android/app/build/outputs/apk/release/app-release.apk`

### 6. Install APK on Android Phone

**Method 1: Direct Transfer**
- Transfer .apk to phone (USB, email, cloud)
- Open file on phone
- Allow "Install from Unknown Sources"
- Tap "Install"

**Method 2: ADB (Android Debug Bridge)**
```bash
adb install app-release.apk
```

**Method 3: Android Studio**
- Connect phone via USB
- Enable USB Debugging
- Click **Run** (▶️) in Android Studio

---

## 🔧 Configuration

### API Endpoint for Mobile Apps

The mobile app needs to know where your API server is. Update this in your code:

**File:** `lib/api-config.ts` (already created)

Set your production URL:
```typescript
return process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
```

Or set environment variable:
```bash
export NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

---

## 📦 File Locations

### iOS:
- **Project**: `ios/App/App.xcodeproj`
- **.ipa file**: After archiving, location depends on export method

### Android:
- **Project**: `android/`
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## ⚠️ Important Notes

### iOS:
- **Apple Developer Account** required ($99/year) for:
  - Installing on real devices
  - Creating .ipa files
  - App Store submission
- Free Apple ID works for simulator only
- .ipa files can only be installed on registered devices (Ad Hoc)

### Android:
- **No account needed** for APK creation
- Can install APK on any Android device
- Google Play Store requires developer account ($25 one-time)

---

## 🐛 Troubleshooting

### Build Fails: "out directory not found"
```bash
# Make sure build completed
npm run build

# Check if out/ exists
ls -la out/

# Sync again
npx cap sync
```

### iOS: "No signing certificate"
- Add Apple Developer account in Xcode → Preferences → Accounts
- Enable "Automatically manage signing"

### Android: Gradle sync fails
- Check internet connection
- Try: File → Invalidate Caches / Restart
- Check Android SDK is installed

### API calls fail in mobile app
- Make sure `NEXT_PUBLIC_API_URL` is set to your production server
- Check that API server is accessible from mobile device
- Verify CORS settings on API server

---

## 🎯 Next Steps After Building

1. **Test thoroughly** on real devices
2. **iOS**: Submit to App Store or distribute via TestFlight
3. **Android**: Submit to Google Play Store or distribute APK directly

---

## 📞 Support

If you encounter issues:
1. Check build logs for errors
2. Verify all prerequisites are installed
3. Make sure API server is running and accessible
4. Check Capacitor documentation: https://capacitorjs.com/docs

---

**Last Updated**: Based on Capacitor 8.0 with Next.js 16 static export

