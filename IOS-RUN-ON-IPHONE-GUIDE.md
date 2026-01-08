# Step-by-Step Guide: Run iOS App on Your iPhone

**Complete detailed guide to run CleanShift app on your iPhone**

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Mac computer** (required - iOS apps can only be built on Mac)
- [ ] **Xcode installed** (latest version from Mac App Store)
- [ ] **iPhone** (iOS 15.0 or later)
- [ ] **USB cable** to connect iPhone to Mac
- [ ] **Apple ID** (free account works for personal development)
- [ ] **Apple Developer Account** (optional for free - see Step 5)

---

## Step 1: Build Static Export

First, we need to build the web app as static files for the iOS app.

### 1.1. Open Terminal

1. Press `Cmd + Space` (Command + Spacebar)
2. Type "Terminal"
3. Press Enter

### 1.2. Navigate to Project Folder

In Terminal, type:
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```
Press Enter

### 1.3. Build Static Export

Run the build script:
```bash
./build-for-mobile.sh
```

**What happens:**
- Builds the Next.js app as static files
- Creates files in `out/` directory
- This may take 1-2 minutes

**Expected output:**
```
✅ SUCCESS! out/index.html created!
✅ Build successful!
```

---

## Step 2: Sync with Capacitor

Sync the built files to the iOS project:

```bash
npx cap sync ios
```

**Expected output:**
```
✔ Copying web assets from out to ios/App/App/public
✔ Creating capacitor.config.json
✔ Sync finished
```

---

## Step 3: Open Xcode

### Option A: Using Terminal (Easiest)
```bash
npx cap open ios
```

### Option B: Manual Method
1. Open **Finder**
2. Navigate to: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/ios/App/`
3. Double-click **App.xcworkspace** (NOT .xcodeproj)

⚠️ **IMPORTANT:** Always open `.xcworkspace`, never `.xcodeproj`

**What you'll see:**
- Xcode will open
- You'll see the project structure on the left
- The project name "App" at the top

---

## Step 4: Select Your iPhone

### 4.1. Connect iPhone to Mac

1. Use USB cable to connect iPhone to Mac
2. **On iPhone:** If prompted, tap "Trust This Computer"
3. **Enter iPhone passcode** if asked

### 4.2. Select Device in Xcode

At the top of Xcode, next to the play button (▶️), you'll see a device selector:

1. **Click the device dropdown** (currently shows "App" or "Any iOS Device")
2. **Look for your iPhone name** (e.g., "LUNAFELICE's iPhone")
3. **Select your iPhone**

If your iPhone doesn't appear:
- Make sure it's unlocked
- Make sure you tapped "Trust This Computer"
- Try unplugging and reconnecting the USB cable
- Check USB cable is working (try charging)

---

## Step 5: Configure Signing & Capabilities

This step allows Xcode to install the app on your iPhone.

### 5.1. Select App Target

1. In the left sidebar, click **"App"** (under the blue project icon)
2. Make sure **"App"** target is selected (should be highlighted)

### 5.2. Go to Signing & Capabilities Tab

1. At the top of the main window, click **"Signing & Capabilities"** tab
2. You'll see "Signing" section

### 5.3. Configure Team

**Option A: Free Apple ID (Personal Development)**
1. Check **"Automatically manage signing"** (should be checked)
2. Click **"Team"** dropdown
3. Click **"Add an Account..."**
4. Enter your **Apple ID** and **password**
5. Click **"Sign In"**
6. Accept terms if prompted
7. Go back and select your Apple ID from "Team" dropdown

**Option B: Apple Developer Account ($99/year)**
1. If you have a paid developer account
2. Select it from "Team" dropdown

**What you'll see:**
- ✅ Team: "Your Name (Personal Team)" or your developer team
- ✅ Bundle Identifier: `com.cleanshift.app`
- ✅ Signing Certificate: "Apple Development"
- ✅ Provisioning Profile: Auto-generated

### 5.4. Add Push Notifications Capability (Optional)

If you want push notifications:

1. Click **"+ Capability"** button (top left, under tabs)
2. Search for **"Push Notifications"**
3. Double-click to add
4. Click **"+ Capability"** again
5. Search for **"Background Modes"**
6. Double-click to add
7. Check **"Remote notifications"** checkbox

---

## Step 6: Build and Run on iPhone

### 6.1. Build the App

1. **Make sure your iPhone is selected** in the device dropdown
2. Click the **Play button (▶️)** at the top left
   - Or press `Cmd + R` (Command + R)

**What happens:**
- Xcode will build the app (this takes 1-3 minutes the first time)
- You'll see progress in the top center of Xcode
- Status messages will appear: "Building...", "Copying...", "Installing..."

### 6.2. Trust Developer Certificate (First Time Only)

On your **iPhone**, you'll see:

1. **Alert message:** "Untrusted Developer"
2. Go to: **Settings** > **General** > **VPN & Device Management** (or **Profiles & Device Management**)
3. Find your **Apple ID/Developer account** (e.g., "Apple Development: your@email.com")
4. Tap on it
5. Tap **"Trust [Your Apple ID]"**
6. Tap **"Trust"** in the confirmation dialog

### 6.3. App Should Launch

After trusting:
- The app will automatically launch on your iPhone
- You should see the CleanShift app open
- First launch may take a few seconds

---

## Step 7: Test the App

### 7.1. Basic Testing

1. **Login** - Try logging in with your credentials
2. **Navigation** - Test navigating between pages
3. **Features** - Test creating shifts, viewing notifications, etc.

### 7.2. Check Console Logs (If Issues)

In Xcode, at the bottom:
1. Open **Console** (View > Debug Area > Activate Console, or `Cmd + Shift + Y`)
2. You'll see real-time logs from your iPhone
3. Look for errors (red text) or warnings (yellow text)

---

## Step 8: Rebuild After Code Changes

Whenever you make changes to the web app code:

### 8.1. Rebuild Static Export
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-for-mobile.sh
```

### 8.2. Sync to iOS
```bash
npx cap sync ios
```

### 8.3. Rebuild in Xcode
- Click **Play button (▶️)** again in Xcode
- Or press `Cmd + R`

**Note:** Sometimes you need to:
- **Stop the app** first (stop button ⏹️ in Xcode)
- Then build again

---

## Troubleshooting

### ❌ Problem: "No signing certificate found"

**Solution:**
1. Go to Xcode > Preferences (or Settings) > Accounts
2. Add your Apple ID if not already added
3. Select your Apple ID > Click "Download Manual Profiles"
4. Go back to Signing & Capabilities
5. Select your team again

### ❌ Problem: iPhone not appearing in device list

**Solutions:**
- Unlock iPhone
- Disconnect and reconnect USB cable
- Trust computer on iPhone again
- Try a different USB port/cable
- Restart Xcode

### ❌ Problem: "Failed to register bundle identifier"

**Solution:**
- The bundle ID `com.cleanshift.app` might be taken
- Change it in Signing & Capabilities:
  - Click on Bundle Identifier
  - Change to something unique like: `com.yourname.cleanshift`
  - Update everywhere (Xcode will ask)

### ❌ Problem: App crashes immediately

**Check:**
1. Xcode console for error messages
2. Make sure you opened `.xcworkspace`, not `.xcodeproj`
3. Try: Product > Clean Build Folder (`Cmd + Shift + K`)
4. Rebuild again

### ❌ Problem: "Provisioning profile doesn't match"

**Solution:**
1. In Signing & Capabilities
2. Uncheck "Automatically manage signing"
3. Check it again
4. Xcode will regenerate the profile

### ❌ Problem: Build takes too long

**Solutions:**
- First build is always slow (1-5 minutes)
- Subsequent builds are faster (30 seconds - 1 minute)
- Close other apps to free up memory
- Make sure you have enough disk space

---

## Quick Reference Commands

Save these commands for quick access:

```bash
# Navigate to project
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Build static export
./build-for-mobile.sh

# Sync to iOS
npx cap sync ios

# Open Xcode
npx cap open ios

# Or open manually:
open ios/App/App.xcworkspace
```

---

## Step-by-Step Summary

1. ✅ **Connect iPhone** to Mac via USB
2. ✅ **Trust computer** on iPhone
3. ✅ **Build static export**: `./build-for-mobile.sh`
4. ✅ **Sync to iOS**: `npx cap sync ios`
5. ✅ **Open Xcode**: `npx cap open ios`
6. ✅ **Select iPhone** from device dropdown
7. ✅ **Configure signing** (add Apple ID/Team)
8. ✅ **Click Play button** (▶️) to build and run
9. ✅ **Trust developer** on iPhone (first time only)
10. ✅ **App launches** on iPhone!

---

## After First Success

Once the app is running on your iPhone:

- **You can disconnect the USB cable** - app stays on iPhone
- **Rebuild when code changes** - follow Step 8
- **App stays installed** until you delete it manually
- **To update:** Just rebuild and run again in Xcode

---

## Next Steps

- Test all features thoroughly
- Configure push notifications (see IOS-APP-BUILD-GUIDE.md)
- Build for TestFlight (beta testing)
- Submit to App Store (production)

---

**Need Help?**
- Check Xcode console for error messages
- Review troubleshooting section above
- Check IOS-APP-BUILD-GUIDE.md for more details

**Last Updated:** January 8, 2025

