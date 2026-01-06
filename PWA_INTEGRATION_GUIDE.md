# PWA Integration Guide for Android & iOS

This guide explains how to use the Progressive Web App (PWA) in your native Android and iOS applications using WebView.

## Overview

The PWA has been integrated into both Android and iOS apps using WebView components:
- **Android**: `PWAActivity` using `WebView`
- **iOS**: `PWAWebView` using `WKWebView`

This allows you to load the full web application inside your native apps, providing a seamless experience while leveraging the web app's features.

---

## Android Integration

### Files Created

1. **`PWAActivity.kt`** - Main activity that loads the PWA in a WebView
2. **`Config.kt`** - Configuration file for PWA URL
3. **`activity_pwa.xml`** - Layout file for the WebView activity

### Setup Instructions

#### 1. Configure PWA URL

Edit `Android-App/app/src/main/java/com/cleaningmanager/app/Config.kt`:

```kotlin
object Config {
    // For Production (Vercel deployment)
    const val PWA_URL = "https://your-app.vercel.app"
    
    // For Development (Android Emulator)
    // const val PWA_URL = "http://10.0.2.2:3000"
    
    // For Development (Physical Device - replace with your local IP)
    // const val PWA_URL = "http://192.168.1.100:3000"
}
```

**Important Notes:**
- **Android Emulator**: Use `http://10.0.2.2:3000` to access `localhost:3000` on your development machine
- **Physical Device**: Use your computer's local IP address (e.g., `http://192.168.1.100:3000`)
- **Production**: Use your deployed Vercel URL or custom domain

#### 2. Launch PWA Activity

You can launch the PWA activity from anywhere in your app:

**From MainActivity or any Activity:**
```kotlin
val intent = Intent(this, PWAActivity::class.java)
startActivity(intent)
```

**From Jetpack Compose:**
```kotlin
val context = LocalContext.current
Button(onClick = {
    val intent = Intent(context, PWAActivity::class.java)
    context.startActivity(intent)
}) {
    Text("Open PWA")
}
```

#### 3. Build and Run

1. Sync Gradle files
2. Build the app: `./gradlew build`
3. Run on device or emulator

### Features

- ✅ Full PWA functionality
- ✅ JavaScript enabled
- ✅ Local storage support
- ✅ Back button navigation
- ✅ Progress indicator
- ✅ Error handling
- ✅ Cookie support (for authentication)

---

## iOS Integration

### Files Created

1. **`PWAWebView.swift`** - SwiftUI view that loads the PWA in a WKWebView
2. **`Config.swift`** - Configuration file for PWA URL

### Setup Instructions

#### 1. Configure PWA URL

Edit `iOS-App/CleaningShiftManager/Utilities/Config.swift`:

```swift
struct Config {
    // For Production (Vercel deployment)
    static let pwaURL = "https://your-app.vercel.app"
    
    // For Development (iOS Simulator)
    // static let pwaURL = "http://localhost:3000"
    
    // For Development (Physical Device - replace with your local IP)
    // static let pwaURL = "http://192.168.1.100:3000"
}
```

**Important Notes:**
- **iOS Simulator**: Use `http://localhost:3000` to access your local development server
- **Physical Device**: Use your computer's local IP address (e.g., `http://192.168.1.100:3000`)
- **Production**: Use your deployed Vercel URL or custom domain

#### 2. Update Info.plist for Local Development

If testing with HTTP (not HTTPS), add to `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

**⚠️ Warning**: Only use `NSAllowsArbitraryLoads` for development. Remove it for production builds.

#### 3. Launch PWA View

You can launch the PWA view from anywhere in your SwiftUI app:

**From any SwiftUI View:**
```swift
@State private var showPWA = false

Button("Open PWA") {
    showPWA = true
}
.sheet(isPresented: $showPWA) {
    PWAView()
}
```

**Or as a full-screen view:**
```swift
NavigationLink("Open PWA") {
    PWAView()
}
```

**Or replace the main app content:**
```swift
// In CleaningShiftManagerApp.swift
var body: some Scene {
    WindowGroup {
        PWAView()  // Replace with PWA view
    }
}
```

#### 4. Build and Run

1. Open the project in Xcode
2. Select your target device/simulator
3. Build and run (⌘R)

### Features

- ✅ Full PWA functionality
- ✅ JavaScript enabled
- ✅ Local storage support
- ✅ Swipe back navigation
- ✅ Loading indicator
- ✅ Error handling
- ✅ Cookie support (for authentication)

---

## Testing the Integration

### Prerequisites

1. **Deploy your PWA** to Vercel or have it running locally
2. **Update the Config files** with the correct URL
3. **Build and run** the native apps

### Testing Steps

#### Android

1. **Development Testing:**
   ```bash
   # Start your Next.js dev server
   npm run dev
   
   # Update Config.kt with your local IP or use 10.0.2.2 for emulator
   # Build and run the Android app
   ```

2. **Production Testing:**
   ```bash
   # Deploy to Vercel
   vercel --prod
   
   # Update Config.kt with your Vercel URL
   # Build and run the Android app
   ```

#### iOS

1. **Development Testing:**
   ```bash
   # Start your Next.js dev server
   npm run dev
   
   # Update Config.swift with localhost or your local IP
   # Build and run the iOS app in Xcode
   ```

2. **Production Testing:**
   ```bash
   # Deploy to Vercel
   vercel --prod
   
   # Update Config.swift with your Vercel URL
   # Build and run the iOS app in Xcode
   ```

---

## Finding Your Local IP Address

### macOS/Linux
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows
```bash
ipconfig
```

Look for your local network IP (usually starts with `192.168.x.x` or `10.x.x.x`).

---

## Troubleshooting

### Android Issues

**Problem**: WebView shows blank page
- **Solution**: Check that `PWA_URL` in `Config.kt` is correct
- **Solution**: Ensure your dev server is running and accessible
- **Solution**: Check AndroidManifest.xml has INTERNET permission

**Problem**: Cookies not working
- **Solution**: Ensure `domStorageEnabled = true` in WebView settings
- **Solution**: Check that cookies are being set with proper domain

**Problem**: Mixed content errors
- **Solution**: The code already allows mixed content for development
- **Solution**: For production, ensure you're using HTTPS

### iOS Issues

**Problem**: WebView shows blank page
- **Solution**: Check that `pwaURL` in `Config.swift` is correct
- **Solution**: Ensure your dev server is running and accessible
- **Solution**: Check Info.plist has proper network permissions

**Problem**: HTTP not loading
- **Solution**: Add `NSAppTransportSecurity` to Info.plist (development only)
- **Solution**: Use HTTPS in production

**Problem**: Cookies not working
- **Solution**: WKWebView handles cookies automatically
- **Solution**: Ensure your server sets cookies with proper attributes

---

## Production Deployment

### Before Deploying

1. **Update Config files** with production URLs
2. **Remove development settings** (like `NSAllowsArbitraryLoads` in iOS)
3. **Test thoroughly** on both platforms
4. **Ensure HTTPS** is used everywhere

### Android Production Checklist

- [ ] Update `Config.kt` with production URL
- [ ] Remove any debug logging
- [ ] Test on physical devices
- [ ] Verify authentication works
- [ ] Test offline functionality (if applicable)

### iOS Production Checklist

- [ ] Update `Config.swift` with production URL
- [ ] Remove `NSAllowsArbitraryLoads` from Info.plist
- [ ] Test on physical devices
- [ ] Verify authentication works
- [ ] Test offline functionality (if applicable)

---

## Architecture

### How It Works

1. **Native App** launches WebView component
2. **WebView** loads the PWA URL (configured in Config files)
3. **PWA** runs inside WebView with full functionality
4. **Authentication** works via cookies (JWT tokens)
5. **Navigation** handled by WebView or native back buttons

### Benefits

- ✅ Single codebase for web app
- ✅ Easy updates (just deploy web app)
- ✅ Full PWA features (service workers, offline, etc.)
- ✅ Native app shell for distribution
- ✅ Can mix native and web features

---

## Next Steps

1. **Configure URLs** in both Config files
2. **Test locally** with development servers
3. **Deploy PWA** to production
4. **Update Config files** with production URLs
5. **Build and distribute** native apps

---

## Support

For issues or questions:
- Check the main README.md
- Review API_REFERENCE.md
- Check DEVELOPER_HANDOFF.md

---

## Example Integration

### Android - Add PWA Button to MainActivity

```kotlin
// In MainActivity.kt or any Compose screen
Button(onClick = {
    val intent = Intent(context, PWAActivity::class.java)
    context.startActivity(intent)
}) {
    Text("Open Web App")
}
```

### iOS - Add PWA Button to Dashboard

```swift
// In any SwiftUI view
@State private var showPWA = false

Button("Open Web App") {
    showPWA = true
}
.sheet(isPresented: $showPWA) {
    PWAView()
}
```

---

**Ready to integrate!** Follow the setup instructions above and you'll have the PWA running in your native apps in no time.



