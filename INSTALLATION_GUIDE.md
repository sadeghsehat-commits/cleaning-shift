# Complete Installation Guide - iOS & Android 📱

This guide will help you set up both iOS and Android native applications for your Cleaning Shift Manager.

## Prerequisites

### For iOS:
- **Mac computer** (required for Xcode)
- **Xcode 15.0+** (free from Mac App Store)
- **iOS 16.0+** device or Simulator
- **Apple Developer Account** (free for testing, $99/year for App Store)

### For Android:
- **Android Studio** (free, works on Mac/Windows/Linux)
- **Android SDK** (installed with Android Studio)
- **Android device** or Emulator
- **Google Play Developer Account** ($25 one-time fee for App Store)

---

## 📱 iOS App Installation

### Step 1: Install Xcode

1. Open **App Store** on your Mac
2. Search for **"Xcode"**
3. Click **"Get"** or **"Install"** (it's free but large ~15GB)
4. Wait for installation to complete

### Step 2: Create New Xcode Project

1. **Open Xcode**
2. **File** → **New** → **Project**
3. Select **iOS** → **App**
4. Fill in:
   - **Product Name**: `CleaningShiftManager`
   - **Team**: Select your Apple ID (or "None" for now)
   - **Organization Identifier**: `com.yourname` (e.g., `com.cleaningmanager`)
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: None
5. Click **Next**
6. Choose a location and click **Create**

### Step 3: Add iOS App Files

1. **Delete** the default files Xcode created:
   - Delete `ContentView.swift`

2. **Add the iOS app files:**
   - In Finder, navigate to: `iOS-App/CleaningShiftManager/`
   - **Drag and drop** all folders into your Xcode project:
     - `App/`
     - `Models/`
     - `Services/`
     - `Views/`
     - `Utilities/`
   - Make sure **"Copy items if needed"** is checked
   - Select your app target
   - Click **Finish**

3. **Add Info.plist:**
   - Copy `iOS-App/Info.plist` to your project
   - Or manually add network security settings

### Step 4: Update API URL

1. Open `Services/APIService.swift` in Xcode
2. Find this line:
   ```swift
   static let baseURL = "https://your-app.vercel.app"
   ```
3. Replace with your actual backend URL:
   ```swift
   static let baseURL = "https://your-actual-url.vercel.app"
   ```

### Step 5: Build and Run

1. **Select a device:**
   - Click the device selector at the top
   - Choose **iPhone Simulator** (any model)
   - Or connect your iPhone and select it

2. **Run the app:**
   - Press **⌘R** or click the **Play** button
   - Xcode will build and launch the app

### Step 6: Test on Real iPhone

1. **Connect iPhone** via USB
2. **Trust the computer** on your iPhone
3. In Xcode, select your iPhone from device list
4. You may need to:
   - Go to **Xcode** → **Settings** → **Accounts**
   - Add your Apple ID
   - Select your team
5. Press **⌘R** to build and run
6. On iPhone: **Settings** → **General** → **VPN & Device Management**
7. Trust the developer certificate

---

## 🤖 Android App Installation

### Step 1: Install Android Studio

1. Go to **https://developer.android.com/studio**
2. Download **Android Studio** for your OS
3. Install it (follow the setup wizard)
4. Open Android Studio

### Step 2: Create New Android Project

1. **Open Android Studio**
2. **File** → **New** → **New Project**
3. Select **Empty Activity**
4. Click **Next**
5. Fill in:
   - **Name**: `CleaningShiftManager`
   - **Package name**: `com.cleaningmanager.app`
   - **Save location**: Choose a folder
   - **Language**: **Kotlin**
   - **Minimum SDK**: **API 24** (Android 7.0)
6. Click **Finish**
7. Wait for Gradle sync to complete

### Step 3: Add Android App Files

1. **Replace/Copy files:**
   - Copy all files from `Android-App/app/src/main/java/com/cleaningmanager/app/` to your project's `app/src/main/java/com/cleaningmanager/app/` folder
   - Replace `MainActivity.kt` with the one from the Android-App folder
   - Copy `build.gradle.kts` content to your `app/build.gradle.kts`
   - Update `AndroidManifest.xml` with the provided content

2. **Update package name** (if different):
   - Make sure package names match in all files
   - Or use "Replace in Files" to update package name

### Step 4: Update Dependencies

1. Open `app/build.gradle.kts`
2. Make sure all dependencies are included (they should be from the provided file)
3. Click **"Sync Now"** if prompted

### Step 5: Update API URL

1. Open `data/api/ApiService.kt`
2. Find this line:
   ```kotlin
   const val BASE_URL = "https://your-app.vercel.app"
   ```
3. Replace with your actual backend URL:
   ```kotlin
   const val BASE_URL = "https://your-actual-url.vercel.app"
   ```

### Step 6: Build and Run

1. **Select a device:**
   - Click the device selector at the top
   - Choose **Create Virtual Device** (for emulator)
   - Or connect your Android phone via USB
   - Enable **USB Debugging** on your phone

2. **Run the app:**
   - Click the **Green Play** button
   - Or press **Shift+F10**
   - Android Studio will build and install the app

---

## 🔧 Configuration for Both Apps

### Update API Base URL

**iOS:** `iOS-App/CleaningShiftManager/Services/APIService.swift`
```swift
static let baseURL = "https://your-actual-url.vercel.app"
```

**Android:** `Android-App/app/src/main/java/com/cleaningmanager/app/data/api/ApiService.kt`
```kotlin
const val BASE_URL = "https://your-actual-url.vercel.app"
```

### For Local Testing (Development)

If testing with local server:

**iOS:**
```swift
static let baseURL = "http://192.168.1.3:3000"
```

**Android:**
```kotlin
const val BASE_URL = "http://192.168.1.3:3000"
```

**Important for Android:** Make sure `AndroidManifest.xml` has:
```xml
android:usesCleartextTraffic="true"
```
(This is already included in the provided manifest)

---

## ✅ Testing Checklist

### iOS Testing:
- [ ] App builds without errors
- [ ] Login works
- [ ] Can view shifts
- [ ] Can view notifications
- [ ] Calendar displays correctly
- [ ] Works on real iPhone

### Android Testing:
- [ ] App builds without errors
- [ ] Login works
- [ ] Can view shifts
- [ ] Can view notifications
- [ ] Calendar displays correctly
- [ ] Works on real Android device

---

## 🚀 Publishing to App Stores

### iOS App Store

1. **Prepare:**
   - Add app icon (1024x1024 PNG)
   - Add screenshots
   - Write app description

2. **Archive:**
   - In Xcode: **Product** → **Archive**
   - Wait for archive to complete

3. **Upload:**
   - Click **"Distribute App"**
   - Choose **App Store Connect**
   - Follow the wizard

4. **App Store Connect:**
   - Go to **https://appstoreconnect.apple.com**
   - Create new app
   - Submit for review

### Google Play Store

1. **Prepare:**
   - Add app icon (512x512 PNG)
   - Add screenshots
   - Write app description

2. **Build Release:**
   - **Build** → **Generate Signed Bundle / APK**
   - Create keystore
   - Build release APK or AAB

3. **Google Play Console:**
   - Go to **https://play.google.com/console**
   - Create new app
   - Upload APK/AAB
   - Submit for review

---

## 📁 Project Structure

### iOS App:
```
iOS-App/
└── CleaningShiftManager/
    ├── App/
    ├── Models/
    ├── Services/
    ├── Views/
    └── Utilities/
```

### Android App:
```
Android-App/
└── app/
    └── src/
        └── main/
            ├── java/com/cleaningmanager/app/
            │   ├── data/
            │   ├── ui/
            │   └── MainActivity.kt
            └── res/
```

---

## 🐛 Troubleshooting

### iOS Issues:

**Build Errors:**
- Clean build: **Product** → **Clean Build Folder** (⇧⌘K)
- Check iOS deployment target (should be 16.0+)
- Verify all files are added to target

**Can't Connect to API:**
- Check `baseURL` in `APIService.swift`
- Verify backend is accessible
- Check network permissions

### Android Issues:

**Build Errors:**
- **File** → **Invalidate Caches** → **Invalidate and Restart**
- Check Gradle sync completed
- Verify all dependencies downloaded

**Can't Connect to API:**
- Check `BASE_URL` in `ApiService.kt`
- Verify `AndroidManifest.xml` has internet permission
- For HTTP (not HTTPS), ensure `usesCleartextTraffic="true"`

**Gradle Sync Failed:**
- Check internet connection
- **File** → **Sync Project with Gradle Files**
- Try **Build** → **Clean Project**

---

## 📝 Quick Reference

### iOS:
- **Build**: ⌘R
- **Stop**: ⌘.
- **Clean**: ⇧⌘K
- **API URL**: `Services/APIService.swift`

### Android:
- **Build**: Shift+F10
- **Stop**: Ctrl+F2
- **Clean**: Build → Clean Project
- **API URL**: `data/api/ApiService.kt`

---

## 🎯 Next Steps

After basic setup works:

1. **Add Features:**
   - Create/edit shifts
   - Push notifications
   - Offline support

2. **Customize:**
   - App icons
   - Colors and themes
   - UI improvements

3. **Test:**
   - On multiple devices
   - Different screen sizes
   - Network conditions

4. **Publish:**
   - Prepare for App Store
   - Create screenshots
   - Write descriptions

---

## 📚 Additional Resources

- **iOS Development**: https://developer.apple.com/documentation/
- **Android Development**: https://developer.android.com/docs
- **SwiftUI**: https://developer.apple.com/xcode/swiftui/
- **Jetpack Compose**: https://developer.android.com/jetpack/compose

---

## 💡 Tips

1. **Start with iOS or Android first** - Don't try both at once
2. **Test API connection first** - Make sure backend works
3. **Use Simulator/Emulator** - Faster for initial testing
4. **Test on real devices** - Before publishing
5. **Keep API URL updated** - When switching between dev/prod

Good luck! 🚀


