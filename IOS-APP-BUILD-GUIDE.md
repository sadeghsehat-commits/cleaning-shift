# iOS Application Build Guide - CleanShift

**Version:** 1.3.0  
**Date:** January 8, 2025

## Overview

This guide will help you build and deploy the iOS application for iPhone using Xcode.

## Prerequisites

1. **macOS** - Required (Xcode only runs on Mac)
2. **Xcode** - Latest version from Mac App Store
3. **Apple Developer Account** - Required for:
   - Signing the app
   - Push notifications (APNs)
   - App Store distribution
4. **iOS Device** - For testing (or use simulator)

## Step 1: Build Static Export

First, build the static export for mobile:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-for-mobile.sh
```

This will:
- Build the Next.js static export
- Generate files in the `out/` directory
- Temporarily move dynamic routes (needed for static build)

## Step 2: Sync with Capacitor

Sync the built files to iOS:

```bash
npx cap sync ios
```

This copies the web assets from `out/` to the iOS app.

## Step 3: Open in Xcode

Open the iOS project in Xcode:

```bash
npx cap open ios
```

Or manually:
- Open Xcode
- File > Open
- Navigate to `ios/App/App.xcworkspace` (NOT .xcodeproj)

⚠️ **Important:** Always open the `.xcworkspace` file, not `.xcodeproj`

## Step 4: Configure Project Settings

### 4.1. Signing & Capabilities

1. Select **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. **Bundle Identifier:** `com.cleanshift.app`
5. **Version:** 1.3.0
6. **Build:** 1

### 4.2. Enable Push Notifications

1. In **Signing & Capabilities** tab
2. Click **+ Capability**
3. Add **Push Notifications**
4. Add **Background Modes**
   - Check **Remote notifications**

### 4.3. Configure Info.plist

The following should already be configured in `Info.plist`:
- ✅ `UIBackgroundModes` with `remote-notification`
- ✅ `UIUserNotificationSettings` for alerts, badges, sounds

## Step 5: Configure Push Notifications (APNs)

### 5.1. Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** > **App IDs**
4. Find or create App ID: `com.cleanshift.app`
5. Enable **Push Notifications**
6. Create **APNs Certificate** or **APNs Key** (recommended)

### 5.2. Firebase Configuration

If using Firebase for push notifications (same as Android):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Cloud Messaging**
4. Upload **APNs Authentication Key**:
   - Download `.p8` key from Apple Developer Portal
   - Upload to Firebase Console
5. Or upload **APNs Certificate** (`.p12` file)

### 5.3. GoogleService-Info.plist

Download `GoogleService-Info.plist` from Firebase:
1. Firebase Console > Project Settings > iOS apps
2. Download `GoogleService-Info.plist`
3. Drag and drop into Xcode project (make sure to check "Copy items if needed")
4. It should appear in `ios/App/App/`

## Step 6: Select Device/Simulator

1. At the top of Xcode, next to the play button
2. Select:
   - **Any iOS Device** - For building archive
   - **iPhone 15 Pro** (or any simulator) - For testing

## Step 7: Build for Testing

### 7.1. Build and Run (Simulator)

1. Click the **Play** button (▶️) or press `Cmd + R`
2. Xcode will build and launch the app in the simulator
3. Test all features:
   - Login
   - Create shifts
   - Push notifications
   - Navigation

### 7.2. Build for Device

1. Connect iPhone via USB
2. Trust computer on iPhone
3. In Xcode, select your iPhone from device list
4. Click **Play** button
5. First time: Go to iPhone Settings > General > VPN & Device Management
   - Trust your developer certificate

## Step 8: Create Archive (for Distribution)

### 8.1. Archive the App

1. Select **Any iOS Device** from device menu
2. Product > Archive
3. Wait for archive to complete
4. Xcode Organizer window will open

### 8.2. Distribute the App

#### Option A: TestFlight (Recommended for Testing)

1. In Xcode Organizer
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Choose **Upload**
6. Follow the wizard
7. Go to [App Store Connect](https://appstoreconnect.apple.com/)
8. Wait for processing (10-30 minutes)
9. Add to TestFlight
10. Add testers and send invite

#### Option B: Ad Hoc Distribution (For Direct Installation)

1. In Xcode Organizer
2. Select your archive
3. Click **Distribute App**
4. Choose **Ad Hoc**
5. Select devices (up to 100)
6. Export
7. Share the `.ipa` file
8. Install via:
   - Apple Configurator 2
   - Xcode > Window > Devices and Simulators
   - Third-party tools (TestFlight, Diawi, etc.)

#### Option C: Enterprise Distribution (For Internal Use)

1. Requires Enterprise Apple Developer Account ($299/year)
2. Follow similar steps to Ad Hoc
3. Can distribute to unlimited devices

## Step 9: App Store Submission (Production)

1. Follow TestFlight steps (Option A)
2. In App Store Connect:
   - Complete app information
   - Add screenshots (required sizes):
     - 6.7" iPhone: 1290 x 2796
     - 6.5" iPhone: 1284 x 2778
     - 5.5" iPhone: 1242 x 2208
   - Write app description
   - Set pricing
   - Submit for review

## Troubleshooting

### Build Errors

**Error: "No signing certificate found"**
- Solution: Add your Apple Developer account in Xcode Preferences > Accounts
- Create/select a signing certificate

**Error: "Provisioning profile not found"**
- Solution: Xcode should auto-generate one, or create in Apple Developer Portal

**Error: "Module not found"**
- Solution: `cd ios/App && pod install` (if using CocoaPods)
- Or: Product > Clean Build Folder (Cmd + Shift + K)

### Push Notification Issues

**Notifications not working:**
1. Check APNs certificate/key is uploaded to Firebase
2. Verify `GoogleService-Info.plist` is in project
3. Check Info.plist has `UIBackgroundModes` with `remote-notification`
4. Verify AppDelegate.swift handles push notifications (already configured)
5. Test with Firebase Console > Cloud Messaging > Send test message

**Token not registering:**
1. Check console logs in Xcode
2. Verify backend API `/api/push/register` is working
3. Check CORS settings allow iOS app origin

### Sync Issues

**Changes not appearing in iOS app:**
```bash
# Rebuild static export
./build-for-mobile.sh

# Resync
npx cap sync ios

# Clean build in Xcode
Product > Clean Build Folder (Cmd + Shift + K)
```

## Version Management

### Update Version Number

**Method 1: Xcode**
1. Select App target
2. General tab
3. Update **Version** (1.3.0)
4. Update **Build** (1, 2, 3, etc.)

**Method 2: project.pbxproj**
```bash
# Find and replace
MARKETING_VERSION = 1.3.0;  # Version shown to users
CURRENT_PROJECT_VERSION = 1;  # Build number
```

## Important Files

- `ios/App/App/Info.plist` - App configuration
- `ios/App/App/AppDelegate.swift` - Push notification handling
- `ios/App/App/GoogleService-Info.plist` - Firebase config (add manually)
- `ios/App/App.xcworkspace` - Open this in Xcode (NOT .xcodeproj)

## Current Configuration

- **App ID:** com.cleanshift.app
- **Version:** 1.3.0
- **Build:** 1
- **Bundle Identifier:** com.cleanshift.app
- **Capabilities:**
  - Push Notifications ✅
  - Background Modes (Remote notifications) ✅

## Next Steps After First Build

1. **Test thoroughly** on a real device
2. **Test push notifications** via Firebase Console
3. **Test all features:**
   - Login/logout
   - Create/edit shifts
   - View notifications
   - Navigation
4. **Distribute via TestFlight** for beta testing
5. **Submit to App Store** when ready

## Support

For issues:
1. Check Xcode console logs
2. Check Firebase Console for push notification errors
3. Check backend API logs on Vercel
4. Review Capacitor documentation: https://capacitorjs.com/docs

---

**Last Updated:** January 8, 2025  
**iOS Version:** 1.3.0  
**Status:** ✅ Ready to build

