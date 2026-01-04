# PWA Setup - Simple Step-by-Step Instructions

This is the **simplest possible guide** with clear steps.

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Start Your Web App

Open Terminal and run:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
npm run dev
```

**Wait until you see:**
```
✓ Ready
○ Local: http://localhost:3000
```

**Keep this terminal open!**

---

### Step 2: Configure Android

1. Open Android Studio
2. Open the `Android-App` folder
3. Open this file: `app/src/main/java/com/cleaningmanager/app/Config.kt`
4. Change the URL to:

```kotlin
const val PWA_URL = "http://10.0.2.2:3000"
```

5. Open this file: `app/src/main/java/com/cleaningmanager/app/MainActivity.kt`
6. Replace everything with:

```kotlin
package com.cleaningmanager.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        PWAHelper.launchPWA(this)
        finish()
    }
}
```

7. Click **Run** ▶️ button in Android Studio
8. Select an emulator or your phone
9. **Done!** The PWA will open automatically

---

### Step 3: Configure iOS

1. Open Xcode
2. Open the `iOS-App` folder
3. Open this file: `CleaningShiftManager/Utilities/Config.swift`
4. Change the URL to:

```swift
static let pwaURL = "http://localhost:3000"
```

5. Click **Run** ▶️ button in Xcode
6. Select a simulator or your iPhone
7. **Done!** The app will open

---

## 📱 For Physical Devices (Real Phones)

### Android Phone:

Instead of `http://10.0.2.2:3000`, use your computer's IP address:

1. Find your IP:
   ```bash
   ipconfig getifaddr en0
   ```
   (Example output: `192.168.1.105`)

2. In `Config.kt`, change to:
   ```kotlin
   const val PWA_URL = "http://192.168.1.105:3000"
   ```
   (Replace `192.168.1.105` with YOUR IP)

3. Make sure your phone and computer are on the **same WiFi network**

### iPhone:

Instead of `http://localhost:3000`, use your computer's IP address:

1. Find your IP (same command as above)
2. In `Config.swift`, change to:
   ```swift
   static let pwaURL = "http://192.168.1.105:3000"
   ```
   (Replace `192.168.1.105` with YOUR IP)

3. Make sure your phone and computer are on the **same WiFi network**

---

## 🚀 For Production (Deployed App)

### Deploy to Vercel:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
npm install -g vercel
vercel login
vercel --prod
```

**Copy the URL you get** (like: `https://your-app.vercel.app`)

### Update Android Config.kt:

```kotlin
const val PWA_URL = "https://your-app.vercel.app"
```

### Update iOS Config.swift:

```swift
static let pwaURL = "https://your-app.vercel.app"
```

---

## ❓ Troubleshooting

**Problem: Blank page or can't connect**

- ✅ Make sure `npm run dev` is still running
- ✅ Check the URL in Config files matches your setup
- ✅ For Android Emulator: Use `10.0.2.2:3000`
- ✅ For iOS Simulator: Use `localhost:3000`
- ✅ For physical devices: Use your computer's IP address

**Problem: Build errors**

- ✅ In Android Studio: Click **File → Sync Project with Gradle Files**
- ✅ In Xcode: Click **Product → Clean Build Folder** (Cmd+Shift+K)

---

## ✅ Checklist

- [ ] Web server running (`npm run dev`)
- [ ] Android Config.kt updated with correct URL
- [ ] Android MainActivity.kt updated to launch PWA
- [ ] iOS Config.swift updated with correct URL
- [ ] Apps build without errors
- [ ] Apps run and PWA loads

---

**That's all you need!** 🎉

For more detailed instructions, see `PWA_SETUP_COMPLETE_COMMANDS.md`


