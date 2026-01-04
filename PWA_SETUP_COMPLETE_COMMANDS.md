# PWA Setup - Complete Commands Guide

This is a step-by-step guide with **complete commands** you can copy and paste directly.

---

## Prerequisites

Make sure you have:
- Node.js installed
- Android Studio (for Android)
- Xcode (for iOS)
- Your Next.js app running or deployed

---

## PART 1: Start Your Web App (Choose One Option)

### Option A: Run Locally (For Testing)

Open Terminal/Command Prompt and run:

```bash
# Navigate to your project folder
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

**You should see:**
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

**Keep this terminal window open!** The server must stay running.

---

### Option B: Deploy to Vercel (For Production)

```bash
# Navigate to your project folder
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# If you haven't installed Vercel CLI, install it first:
npm install -g vercel

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

**You will get a URL like:** `https://your-app-name.vercel.app`
**Copy this URL - you'll need it!**

---

## PART 2: Find Your Computer's IP Address (For Physical Devices)

### On macOS (Your System):

Open Terminal and run this **complete command**:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

**Example output:**
```
192.168.1.105
```

**Copy this IP address** - you'll use it like: `http://192.168.1.105:3000`

### Alternative (Simpler) on macOS:

```bash
ipconfig getifaddr en0
```

**If that doesn't work, try:**
```bash
ipconfig getifaddr en1
```

### On Windows:

Open Command Prompt and run:

```bash
ipconfig
```

**Look for:** "IPv4 Address" under "Wireless LAN adapter Wi-Fi" or "Ethernet adapter"
**Example:** `192.168.1.105`

### On Linux:

```bash
hostname -I | awk '{print $1}'
```

---

## PART 3: Configure Android App

### Step 1: Open the Config File

**In Android Studio:**
1. Open the `Android-App` folder as a project
2. Navigate to: `app/src/main/java/com/cleaningmanager/app/Config.kt`
3. Double-click to open the file

### Step 2: Update the URL

**Replace the entire content** of `Config.kt` with one of these options:

**For Android Emulator (testing on computer):**
```kotlin
package com.cleaningmanager.app

object Config {
    const val PWA_URL = "http://10.0.2.2:3000"
}
```

**For Physical Android Device (testing on real phone):**
```kotlin
package com.cleaningmanager.app

object Config {
    // Replace 192.168.1.105 with YOUR IP address from Part 2
    const val PWA_URL = "http://192.168.1.105:3000"
}
```

**For Production (deployed app):**
```kotlin
package com.cleaningmanager.app

object Config {
    // Replace with YOUR Vercel URL from Part 1, Option B
    const val PWA_URL = "https://your-app-name.vercel.app"
}
```

### Step 3: Build the Android App

**In Android Studio:**

1. Click **File** → **Sync Project with Gradle Files** (wait for it to finish)
2. Click **Build** → **Make Project** (or press `Ctrl+F9` / `Cmd+F9`)
3. Wait for build to complete (check bottom status bar)

### Step 4: Run the Android App

**Option A: Run on Emulator**
1. Click **Run** → **Run 'app'** (or press `Shift+F10`)
2. Select an emulator (create one if needed)
3. Wait for app to install and launch

**Option B: Run on Physical Device**
1. Enable **Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"
2. Connect phone via USB
3. Click **Run** → **Run 'app'**
4. Select your device from the list

### Step 5: Launch the PWA in Android App

**EASIEST WAY: Launch PWA directly when app starts**

Open `Android-App/app/src/main/java/com/cleaningmanager/app/MainActivity.kt`

**Replace the entire file with this:**

```kotlin
package com.cleaningmanager.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Launch PWA directly when app starts
        PWAHelper.launchPWA(this)
        finish() // Close this activity after launching PWA
    }
}
```

**That's it!** Now when you run the app, it will open the PWA immediately.

---

**ALTERNATIVE: Keep your existing app and add a button to open PWA**

If you want to keep your existing MainActivity and just add a button to open PWA, you need to add a button in one of your screens. For example, in your Profile screen or Dashboard, add:

```kotlin
import androidx.compose.ui.platform.LocalContext
import com.cleaningmanager.app.PWAHelper

// Inside your Composable function:
val context = LocalContext.current

Button(onClick = { PWAHelper.launchPWA(context) }) {
    Text("Open Web App")
}
```

But the easiest way is Option 1 above - just launch PWA directly!

---

## PART 4: Configure iOS App

### Step 1: Open the Project in Xcode

1. Open **Xcode**
2. Click **File** → **Open**
3. Navigate to: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/iOS-App`
4. Open the project (look for `.xcodeproj` file)

### Step 2: Open the Config File

In Xcode's file navigator (left sidebar):
1. Expand `CleaningShiftManager`
2. Expand `Utilities`
3. Click on `Config.swift`

### Step 3: Update the URL

**Replace the entire content** of `Config.swift` with one of these:

**For iOS Simulator (testing on computer):**
```swift
import Foundation

struct Config {
    static let pwaURL = "http://localhost:3000"
}
```

**For Physical iPhone (testing on real phone):**
```swift
import Foundation

struct Config {
    // Replace 192.168.1.105 with YOUR IP address from Part 2
    static let pwaURL = "http://192.168.1.105:3000"
}
```

**For Production (deployed app):**
```swift
import Foundation

struct Config {
    // Replace with YOUR Vercel URL from Part 1, Option B
    static let pwaURL = "https://your-app-name.vercel.app"
}
```

### Step 4: Update Info.plist (For HTTP in Development)

**Only needed if using HTTP (not HTTPS) for local development:**

1. In Xcode, click on `Info.plist` in the file navigator
2. Right-click → **Open As** → **Source Code**
3. Find the `<key>NSAppTransportSecurity</key>` section
4. Make sure it looks like this (for development):

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**⚠️ IMPORTANT:** Remove `NSAllowsArbitraryLoads` for production builds!

### Step 5: Build and Run iOS App

1. Select a **Simulator** or **Your iPhone** from the device selector (top toolbar)
2. Click the **Play** button (▶️) or press `Cmd+R`
3. Wait for the app to build and launch

### Step 6: Launch the PWA in iOS App

The PWA view is already integrated into the Dashboard. To access it:

1. Run the app
2. Log in (or use the app)
3. Go to **Profile** tab (bottom navigation)
4. Tap **"Open Web App"** in the Web App section

**Or, to launch it directly on app start:**

Open `CleaningShiftManagerApp.swift` and replace the content with:

```swift
import SwiftUI

@main
struct CleaningShiftManagerApp: App {
    var body: some Scene {
        WindowGroup {
            PWAView()  // Launch PWA directly
        }
    }
}
```

---

## PART 5: Testing Checklist

### Android Testing:

- [ ] Web server is running (if using local dev)
- [ ] Config.kt has correct URL
- [ ] App builds without errors
- [ ] App launches on device/emulator
- [ ] PWA Activity opens
- [ ] Web page loads correctly
- [ ] Can log in to the web app
- [ ] Navigation works (back button)

### iOS Testing:

- [ ] Web server is running (if using local dev)
- [ ] Config.swift has correct URL
- [ ] Info.plist allows HTTP (if using local dev)
- [ ] App builds without errors in Xcode
- [ ] App launches on simulator/device
- [ ] PWA view opens
- [ ] Web page loads correctly
- [ ] Can log in to the web app
- [ ] Navigation works (swipe back)

---

## Troubleshooting

### Problem: "Cannot connect to server"

**Solution:**
1. Check if your web server is running (Part 1)
2. Verify the URL in Config file matches your server
3. For Android Emulator: Use `10.0.2.2:3000`
4. For iOS Simulator: Use `localhost:3000`
5. For physical devices: Use your computer's IP address

### Problem: "Blank white page"

**Solution:**
1. Check browser console (if possible) for errors
2. Verify the URL is correct
3. Make sure your web app is accessible in a regular browser first
4. Check network permissions in AndroidManifest.xml / Info.plist

### Problem: "Build failed"

**Android:**
1. File → Sync Project with Gradle Files
2. Build → Clean Project
3. Build → Rebuild Project

**iOS:**
1. Product → Clean Build Folder (`Cmd+Shift+K`)
2. Close Xcode
3. Delete `DerivedData` folder
4. Reopen Xcode and rebuild

### Problem: "Authentication not working"

**Solution:**
1. Cookies should work automatically
2. Make sure you're using the same URL in both web browser and app
3. Clear app data and try again

---

## Quick Reference: All URLs by Scenario

| Scenario | Android URL | iOS URL |
|----------|-------------|---------|
| Emulator/Simulator | `http://10.0.2.2:3000` | `http://localhost:3000` |
| Physical Device (Local) | `http://YOUR_IP:3000` | `http://YOUR_IP:3000` |
| Production | `https://your-app.vercel.app` | `https://your-app.vercel.app` |

**Replace:**
- `YOUR_IP` = Your computer's IP from Part 2
- `your-app.vercel.app` = Your Vercel deployment URL

---

## Summary: What You Need to Do

1. ✅ Start web server (Part 1)
2. ✅ Find your IP address (Part 2)
3. ✅ Update `Config.kt` for Android (Part 3)
4. ✅ Update `Config.swift` for iOS (Part 4)
5. ✅ Build and run apps
6. ✅ Test!

**That's it!** Your PWA should now work in both Android and iOS apps.

