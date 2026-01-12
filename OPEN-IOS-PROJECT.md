# How to Open iOS Project in Xcode

## Correct Way to Open

For Capacitor iOS projects, open the **`.xcodeproj`** file directly (not `.xcworkspace`).

### Method 1: Using Terminal
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
open ios/App/App.xcodeproj
```

### Method 2: Using Xcode
1. Open **Xcode**
2. **File** > **Open**
3. Navigate to: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/ios/App/`
4. Select **`App.xcodeproj`** (the blue icon)
5. Click **"Open"**

### Method 3: Using Finder
1. Open **Finder**
2. Navigate to: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/ios/App/`
3. **Double-click** `App.xcodeproj` (the blue icon)
4. It will open in Xcode

---

## Important Notes

- ✅ **Open:** `App.xcodeproj` (this is correct for Capacitor)
- ❌ **Don't open:** `App.xcworkspace` (doesn't exist for this project)

Capacitor uses Swift Package Manager (SPM), not CocoaPods, so we use `.xcodeproj` directly.

---

## After Opening

Once Xcode opens:

1. **Wait for Xcode to finish loading** (1-2 minutes)
2. **Select your iPhone** from device dropdown
3. **Configure Signing** (add Apple ID)
4. **Build** (Play button ▶️)

