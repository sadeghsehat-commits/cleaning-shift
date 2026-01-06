# 🚀 Quick Build Commands for iOS & Android Apps

## Step-by-Step Instructions

### 1. Build the Web App (Static Export)
```bash
npm run build
```
This creates the `out/` directory with all static files.

### 2. Sync with Capacitor
```bash
npx cap sync
```
This copies the web files to iOS and Android projects.

### 3. Build iOS App (.ipa)

**Option A: Using Xcode (Recommended)**
```bash
npm run ios
# or
npx cap open ios
```

Then in Xcode:
1. Select your device or "Any iOS Device"
2. Product → Archive
3. Distribute App → Choose method (Ad Hoc, App Store, etc.)
4. Export .ipa file

**Option B: Command Line (if you have certificates set up)**
```bash
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive -archivePath build/App.xcarchive
```

### 4. Build Android App (.apk)

**Option A: Using Android Studio (Recommended)**
```bash
npm run android
# or
npx cap open android
```

Then in Android Studio:
1. Build → Generate Signed Bundle / APK
2. Choose APK
3. Select keystore (or create new)
4. Build variant: release
5. Generate APK

**Option B: Command Line**
```bash
cd android
./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 File Locations After Building

### iOS:
- **.ipa file**: After archiving in Xcode, location depends on export method
- **Project**: `ios/App/App.xcodeproj`

### Android:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## ⚡ Quick All-in-One Commands

```bash
# Build everything
npm run build && npx cap sync

# Then open in IDEs
npm run ios      # Opens Xcode
npm run android  # Opens Android Studio
```

---

## 🔧 Troubleshooting

**Build fails with "out directory not found":**
- Make sure `npm run build` completed successfully
- Check that `out/` directory exists
- Run `npx cap sync` again

**Xcode build fails:**
- Make sure you have a valid Apple Developer account
- Check Signing & Capabilities in Xcode
- Clean build folder: Product → Clean Build Folder

**Android build fails:**
- Make sure Android SDK is installed
- Check Gradle sync completed
- Try: File → Invalidate Caches / Restart

---

For detailed instructions, see **MOBILE-APP-BUILD-GUIDE.md**


