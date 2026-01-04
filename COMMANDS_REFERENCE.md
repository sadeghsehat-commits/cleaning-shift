# Commands Reference - Copy and Paste These Exact Commands

Just copy and paste these commands one by one. No thinking required!

---

## 📋 COMMAND LIST

### 1. Start Web Server (Do this first!)

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

```bash
npm run dev
```

**Wait for:** `✓ Ready` and `○ Local: http://localhost:3000`

---

### 2. Find Your IP Address (Only needed for physical devices)

**On macOS:**
```bash
ipconfig getifaddr en0
```

**If that doesn't work, try:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Copy the number you get** (like: `192.168.1.105`)

---

### 3. Deploy to Vercel (Only for production)

```bash
npm install -g vercel
```

```bash
vercel login
```

```bash
vercel --prod
```

**Copy the URL you get** (like: `https://your-app-abc123.vercel.app`)

---

## 📝 CODE TO COPY

### Android: Config.kt

**For Emulator:**
```kotlin
package com.cleaningmanager.app

object Config {
    const val PWA_URL = "http://10.0.2.2:3000"
}
```

**For Physical Device (replace YOUR_IP with your IP from step 2):**
```kotlin
package com.cleaningmanager.app

object Config {
    const val PWA_URL = "http://YOUR_IP:3000"
}
```

**For Production (replace with your Vercel URL):**
```kotlin
package com.cleaningmanager.app

object Config {
    const val PWA_URL = "https://your-app-abc123.vercel.app"
}
```

---

### Android: MainActivity.kt

**Copy this entire file:**
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

---

### iOS: Config.swift

**For Simulator:**
```swift
import Foundation

struct Config {
    static let pwaURL = "http://localhost:3000"
}
```

**For Physical Device (replace YOUR_IP with your IP from step 2):**
```swift
import Foundation

struct Config {
    static let pwaURL = "http://YOUR_IP:3000"
}
```

**For Production (replace with your Vercel URL):**
```swift
import Foundation

struct Config {
    static let pwaURL = "https://your-app-abc123.vercel.app"
}
```

---

## 🎯 Quick Decision Tree

**Are you testing on your computer (emulator/simulator)?**
- ✅ Android: Use `http://10.0.2.2:3000`
- ✅ iOS: Use `http://localhost:3000`

**Are you testing on a real phone?**
- ✅ Find your IP: `ipconfig getifaddr en0`
- ✅ Use: `http://YOUR_IP:3000` (replace YOUR_IP)

**Are you deploying for production?**
- ✅ Deploy: `vercel --prod`
- ✅ Use: `https://your-vercel-url.vercel.app`

---

## ✅ Checklist

Run these commands in order:

- [ ] `cd /Users/LUNAFELICE/Desktop/Mahdiamooyee`
- [ ] `npm run dev` (keep running!)
- [ ] Update Android `Config.kt` with correct URL
- [ ] Update Android `MainActivity.kt` with code above
- [ ] Update iOS `Config.swift` with correct URL
- [ ] Build and run Android app
- [ ] Build and run iOS app

---

**That's it!** All the commands you need are above. Just copy and paste! 🎉


