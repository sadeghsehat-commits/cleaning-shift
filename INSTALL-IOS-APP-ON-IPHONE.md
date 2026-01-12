# Install iOS App on Your iPhone

## Prerequisites

1. ✅ iPhone connected to your Mac via USB cable
2. ✅ iPhone unlocked
3. ✅ "Trust This Computer" prompt accepted on iPhone (if asked)
4. ✅ Xcode project builds successfully

---

## Step-by-Step Installation

### Step 1: Connect iPhone to Mac

1. **Connect your iPhone to your Mac** using a USB cable
2. **Unlock your iPhone**
3. **If iPhone asks "Trust This Computer?"** → Tap "Trust"
4. **Enter your iPhone passcode** if prompted

---

### Step 2: Select Your iPhone in Xcode

1. **In Xcode, look at the top toolbar**
2. **Click the device selector** (it currently shows "iPhone 14 Pro" or similar)
3. **Find your iPhone** in the dropdown list
   - It should show your iPhone name (e.g., "LUNAFELICE's iPhone")
   - If you don't see it, make sure iPhone is unlocked and USB cable is connected
4. **Click on your iPhone** to select it

---

### Step 3: Configure Signing (If Needed)

1. **Click "App" under TARGETS** (left sidebar)
2. **Go to "Signing & Capabilities" tab**
3. **Check "Automatically manage signing"** (should already be checked)
4. **Click "Team" dropdown**
5. **Select your Apple ID** (e.g., "sadegh.sehat@yahoo.com")
   - If you don't see your Apple ID:
     - Click "Add an Account..."
     - Enter your Apple ID email and password
     - Sign in and accept terms
     - Go back and select your Apple ID from Team dropdown

---

### Step 4: Build and Install

1. **Make sure your iPhone is still selected** (top toolbar)
2. **Click the Play button (▶️)** at the top left, or press `Cmd + R`
3. **Wait for build to complete** (2-5 minutes first time)
4. **Xcode will automatically:**
   - Build the app
   - Install it on your iPhone
   - Launch it on your iPhone

---

### Step 5: Trust Developer Certificate on iPhone

**IMPORTANT:** After first installation, you need to trust your developer certificate:

1. **On your iPhone**, go to **Settings**
2. **Go to General**
3. **Scroll down** to **"VPN & Device Management"** (or **"Device Management"** or **"Profiles & Device Management"**)
4. **Tap on your Apple ID** (e.g., "sadegh.sehat@yahoo.com")
5. **Tap "Trust [Your Apple ID]"**
6. **Tap "Trust"** again to confirm
7. **Go back to home screen**
8. **Open the app** (it should be installed there)

---

## Troubleshooting

### iPhone Not Appearing in Device List

**If you don't see your iPhone in Xcode:**

1. **Disconnect and reconnect USB cable**
2. **Unlock iPhone**
3. **Accept "Trust This Computer" if asked**
4. **In Xcode, go to Window > Devices and Simulators**
5. **Check if iPhone appears there**
6. **If still not showing:**
   - Try a different USB cable
   - Try a different USB port
   - Restart both Mac and iPhone

---

### Signing Error

**If you see a signing error:**

1. **Make sure you selected your Team** in Signing & Capabilities
2. **Bundle Identifier might need to be unique:**
   - Go to "Signing & Capabilities" tab
   - Change "Bundle Identifier" from `com.cleanshift.app` to something unique like:
     - `com.yourname.cleanshift.app`
     - Or `com.sadeghsehat.cleanshift.app`
3. **Try building again**

---

### "Untrusted Developer" Error on iPhone

**If app shows "Untrusted Developer" when you try to open it:**

1. **Go to Settings > General > VPN & Device Management**
2. **Tap on your developer certificate**
3. **Tap "Trust [Your Name]"**
4. **Tap "Trust" again**
5. **Try opening the app again**

---

### Build Fails

**If build fails:**

1. **Check the error message** in Xcode (bottom panel)
2. **Tell me what the error says** and I'll help fix it
3. **Common issues:**
   - Missing dependencies
   - Signing issues
   - Code errors

---

## After Installation

Once the app is installed:

1. ✅ **App icon appears** on your iPhone home screen
2. ✅ **You can open it** like any other app
3. ✅ **It should load** your web application
4. ⚠️ **Some Capacitor features might not work** (we'll add them back later)

---

## Update the App

To update the app after making changes:

1. **Make changes in Xcode or code**
2. **Click Play button (▶️)** again
3. **Xcode will rebuild and reinstall** automatically

---

## Summary

**Quick Steps:**
1. Connect iPhone via USB
2. Select iPhone in Xcode device dropdown
3. Configure signing (select Team)
4. Click Play button (▶️)
5. Trust certificate on iPhone (Settings > General > VPN & Device Management)
6. Open app on iPhone

**That's it! Your app should be installed on your iPhone!**

