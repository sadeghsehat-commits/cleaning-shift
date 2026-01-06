# 📱 Mobile App Build Guide - iOS (.ipa) & Android (.apk)

This guide explains how to build installable app files (.ipa for iOS and .apk for Android) using Capacitor.

## 📋 Prerequisites

✅ **Installed:**
- Xcode (for iOS)
- Android Studio (for Android)
- Node.js and npm
- Capacitor (already installed in this project)

---

## 🍎 Building iOS App (.ipa file)

### Step 1: Build the Web App
```bash
npm run build
```

### Step 2: Sync with Capacitor
```bash
npx cap sync
```

### Step 3: Open in Xcode
```bash
npx cap open ios
```

### Step 4: Configure in Xcode

1. **Select the Project** (CleanShift) in the left sidebar
2. **Select the Target** (CleanShift) under TARGETS
3. **Go to "Signing & Capabilities" tab:**
   - Check "Automatically manage signing"
   - Select your **Team** (Apple Developer account)
   - Xcode will automatically create a provisioning profile

4. **Set Bundle Identifier:**
   - Make sure it's `com.cleanshift.app` (or change it to your unique identifier)

### Step 5: Build for Device/Simulator

**For Testing on Your iPhone:**
1. Connect your iPhone via USB
2. Select your device from the device dropdown (top bar)
3. Click **Play** button (▶️) or press `Cmd + R`
4. The app will install on your iPhone

**For Creating .ipa File (Distribution):**

1. **Select "Any iOS Device (arm64)"** from device dropdown
2. Go to **Product → Archive**
3. Wait for the archive to complete
4. The **Organizer** window will open
5. Select your archive and click **"Distribute App"**
6. Choose distribution method:
   - **Ad Hoc**: For testing on specific devices (up to 100 devices)
   - **App Store Connect**: For App Store submission
   - **Enterprise**: For enterprise distribution
   - **Development**: For development testing
7. Follow the wizard to export the .ipa file

### Step 6: Install .ipa on iPhone

**Method 1: Using Xcode**
- Connect iPhone via USB
- In Xcode: Window → Devices and Simulators
- Select your device → Click "+" → Select the .ipa file

**Method 2: Using Finder (macOS Catalina+)**
- Connect iPhone via USB
- Open Finder → Select your iPhone
- Drag and drop the .ipa file

**Method 3: Using 3uTools or other tools**
- Install 3uTools on your Mac
- Connect iPhone
- Use "Install" feature to install .ipa

---

## 🤖 Building Android App (.apk file)

### Step 1: Build the Web App
```bash
npm run build
```

### Step 2: Sync with Capacitor
```bash
npx cap sync
```

### Step 3: Open in Android Studio
```bash
npx cap open android
```

### Step 4: Configure in Android Studio

1. **Wait for Gradle Sync** to complete (first time may take a few minutes)
2. **Set up Signing:**
   - Go to **Build → Generate Signed Bundle / APK**
   - If you don't have a keystore, create one:
     - Click **"Create new..."**
     - Fill in the form:
       - Key store path: Choose a location and name (e.g., `cleanshift-keystore.jks`)
       - Password: Create a strong password (save it!)
       - Key alias: `cleanshift-key`
       - Key password: Same or different password
       - Validity: 25 years (recommended)
       - Certificate information: Fill in your details
     - Click **OK**

### Step 5: Generate APK

**For Testing (Debug APK):**
1. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click **"locate"** in the notification
4. The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

**For Distribution (Release APK):**
1. Go to **Build → Generate Signed Bundle / APK**
2. Select **APK** (not Android App Bundle)
3. Select your keystore file
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**
7. The APK will be in: `android/app/release/app-release.apk`

### Step 6: Install APK on Android Phone

**Method 1: Direct Transfer**
- Transfer the .apk file to your Android phone (USB, email, cloud storage)
- Open the file on your phone
- Allow "Install from Unknown Sources" if prompted
- Tap "Install"

**Method 2: Using ADB (Android Debug Bridge)**
```bash
adb install app-release.apk
```

**Method 3: Using Android Studio**
- Connect phone via USB
- Enable USB Debugging on phone
- In Android Studio, click **Run** button (▶️)
- Select your device
- App will install automatically

---

## 🔧 Quick Commands Reference

```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync

# Open iOS project in Xcode
npm run ios
# or
npx cap open ios

# Open Android project in Android Studio
npm run android
# or
npx cap open android

# Build and sync in one command
npm run build:mobile
```

---

## 📦 File Locations

### iOS:
- **Project**: `ios/App/`
- **.ipa file**: After archiving, in Xcode Organizer or exported location

### Android:
- **Project**: `android/app/`
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## ⚠️ Important Notes

### iOS:
- You need an **Apple Developer account** ($99/year) to:
  - Install on real devices (not simulator)
  - Create .ipa files for distribution
- For testing, you can use **free Apple ID** but with limitations
- .ipa files can only be installed on devices registered in your developer account (for Ad Hoc distribution)

### Android:
- **No account needed** for creating APK files
- You can install APK directly on any Android device
- For Google Play Store, you need a developer account ($25 one-time fee)

---

## 🎨 Customizing App Icon and Splash Screen

### Update Icons:
1. Replace icons in `public/icons/` folder
2. Run `npx cap sync` to update native projects

### Update Splash Screen:
- Edit `capacitor.config.ts` to customize splash screen
- Or manually update in:
  - iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`
  - Android: `android/app/src/main/res/` (various mipmap folders)

---

## 🐛 Troubleshooting

### iOS Build Issues:
- **"No signing certificate"**: Add your Apple Developer account in Xcode → Preferences → Accounts
- **"Provisioning profile not found"**: Enable "Automatically manage signing"
- **Build fails**: Clean build folder (Product → Clean Build Folder)

### Android Build Issues:
- **Gradle sync fails**: Check internet connection, Gradle downloads dependencies
- **"SDK not found"**: Install Android SDK in Android Studio → SDK Manager
- **Build fails**: Try "Invalidate Caches / Restart" in Android Studio

---

## 📱 Testing the Apps

### iOS:
- Use iOS Simulator (included with Xcode)
- Or install on real device via USB

### Android:
- Use Android Emulator (included with Android Studio)
- Or install on real device via USB or APK file

---

## 🚀 Next Steps After Building

1. **Test thoroughly** on real devices
2. **For iOS**: Submit to App Store (if desired) or distribute via TestFlight
3. **For Android**: Submit to Google Play Store (if desired) or distribute APK directly

---

**Last Updated**: Based on Capacitor configuration with Next.js static export


