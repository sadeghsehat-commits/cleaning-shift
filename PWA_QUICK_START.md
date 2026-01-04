# PWA Quick Start Guide

Get your PWA running in Android and iOS apps in 5 minutes!

> **💡 For the simplest instructions, see `PWA_SIMPLE_STEPS.md`**  
> **📖 For complete detailed commands, see `PWA_SETUP_COMPLETE_COMMANDS.md`**

## Step 1: Deploy Your PWA (or use local dev server)

### Option A: Use Local Development Server
```bash
cd Mahdiamooyee
npm run dev
# Server runs on http://localhost:3000
```

### Option B: Deploy to Vercel
```bash
vercel --prod
# Get your deployment URL (e.g., https://your-app.vercel.app)
```

## Step 2: Configure Android App

1. Open `Android-App/app/src/main/java/com/cleaningmanager/app/Config.kt`

2. Update the URL:
   ```kotlin
   object Config {
       // For local dev (Android Emulator)
       const val PWA_URL = "http://10.0.2.2:3000"
       
       // OR for local dev (Physical Device - replace with your IP)
       // const val PWA_URL = "http://192.168.1.100:3000"
       
       // OR for production
       // const val PWA_URL = "https://your-app.vercel.app"
   }
   ```

3. Launch PWA from your app:
   ```kotlin
   // From any Activity
   PWAHelper.launchPWA(this)
   
   // Or from Compose
   val context = LocalContext.current
   Button(onClick = { PWAHelper.launchPWA(context) }) {
       Text("Open PWA")
   }
   ```

## Step 3: Configure iOS App

1. Open `iOS-App/CleaningShiftManager/Utilities/Config.swift`

2. Update the URL:
   ```swift
   struct Config {
       // For local dev (iOS Simulator)
       static let pwaURL = "http://localhost:3000"
       
       // OR for local dev (Physical Device - replace with your IP)
       // static let pwaURL = "http://192.168.1.100:3000"
       
       // OR for production
       // static let pwaURL = "https://your-app.vercel.app"
   }
   ```

3. Launch PWA from your app:
   ```swift
   // From any SwiftUI view
   NavigationLink("Open Web App") {
       PWAView()
   }
   
   // Or as a sheet
   @State private var showPWA = false
   Button("Open PWA") {
       showPWA = true
   }
   .sheet(isPresented: $showPWA) {
       PWAView()
   }
   ```

## Step 4: Find Your Local IP (for physical devices)

### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows:
```bash
ipconfig
```

Look for IP starting with `192.168.x.x` or `10.x.x.x`

## Step 5: Test!

1. **Android**: Build and run the app, then launch PWAActivity
2. **iOS**: Build and run in Xcode, then navigate to PWA view

## That's It! 🎉

Your PWA is now running inside your native apps!

## Troubleshooting

**Blank page?**
- Check the URL in Config files
- Ensure dev server is running (if using local)
- Check network permissions in manifest/Info.plist

**Can't connect?**
- For Android Emulator: Use `10.0.2.2:3000`
- For iOS Simulator: Use `localhost:3000`
- For physical devices: Use your computer's local IP

**Need more help?**
- See `PWA_INTEGRATION_GUIDE.md` for detailed documentation

