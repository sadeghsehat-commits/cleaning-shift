# 📱 PWA Installation Guide - iOS & Android

This guide explains how to install the Cleaning Shift Management app as a Progressive Web App (PWA) on your iOS and Android devices.

## 📋 Prerequisites

1. **The app must be deployed and accessible via HTTPS**
   - The app is currently deployed on Vercel (or your hosting provider)
   - PWA requires HTTPS to work (except for localhost)

2. **Access the app URL on your mobile device**
   - Make sure you can open the website in your mobile browser

---

## 📱 iOS Installation (iPhone/iPad)

### Step 1: Open Safari Browser
- **Important**: Use Safari browser (not Chrome or other browsers)
- iOS only supports PWA installation through Safari

### Step 2: Navigate to the App
1. Open Safari on your iPhone/iPad
2. Go to your app URL (e.g., `https://your-app.vercel.app`)
3. Wait for the page to load completely

### Step 3: Add to Home Screen
1. Tap the **Share button** (square with arrow pointing up) at the bottom of Safari
2. Scroll down in the share menu
3. Tap **"Add to Home Screen"** (you might need to scroll to find it)
4. You can customize the name (default: "CleanShift")
5. Tap **"Add"** in the top right corner

### Step 4: Launch the App
- The app icon will appear on your home screen
- Tap the icon to launch the app in standalone mode (without browser UI)
- The app will open fullscreen like a native app

### iOS Features:
- ✅ Works offline (after first load)
- ✅ Fullscreen mode (no Safari UI)
- ✅ App icon on home screen
- ✅ Push notifications (if configured)
- ✅ Standalone experience

---

## 🤖 Android Installation

### Step 1: Open Chrome Browser
- Use **Chrome browser** (recommended) or other Chromium-based browsers
- Firefox and other browsers also support PWA installation

### Step 2: Navigate to the App
1. Open Chrome on your Android device
2. Go to your app URL (e.g., `https://your-app.vercel.app`)
3. Wait for the page to load completely

### Step 3: Install the App
**Option A: Via Install Banner (Automatic)**
- Chrome may show an **"Install" banner** at the bottom of the screen
- Tap **"Install"** or **"Add to Home Screen"**
- Follow the prompts

**Option B: Via Menu (Manual)**
1. Tap the **three-dot menu** (⋮) in the top right corner
2. Look for **"Install app"** or **"Add to Home screen"** option
3. Tap it
4. Review the app information
5. Tap **"Install"**

### Step 4: Launch the App
- The app icon will appear on your home screen and in the app drawer
- Tap the icon to launch the app
- The app opens in its own window (like a native app)

### Android Features:
- ✅ Works offline (service worker cached)
- ✅ Fullscreen mode
- ✅ App icon in launcher
- ✅ Push notifications (if configured)
- ✅ Install prompt
- ✅ Background sync

---

## 🔧 Troubleshooting

### iOS Issues:

**"Add to Home Screen" option not showing?**
- Make sure you're using Safari (not Chrome)
- Refresh the page
- Make sure the site is served over HTTPS
- Clear Safari cache and try again

**App opens in Safari instead of standalone?**
- Delete the icon and re-add it
- Make sure the manifest.json is properly configured

**App icon looks wrong?**
- The app uses `/icons/icon-192x192.png` for the icon
- Make sure the icon file exists in the public folder

### Android Issues:

**Install option not available?**
- Make sure you're using Chrome or a Chromium browser
- The site must be served over HTTPS
- Clear browser cache and try again
- Check if "Add to Home screen" is in the menu (three dots)

**App doesn't work offline?**
- The service worker needs to be registered first
- Visit the app in the browser first, then install
- Check browser settings for site permissions

**App opens in browser instead of standalone?**
- Uninstall and reinstall the app
- Make sure the manifest.json is valid

---

## 🎨 Customizing the App Icon

The app currently uses placeholder icons. To customize:

1. **Create your app icon** (512x512 pixels recommended)
2. **Generate all sizes** using:
   - Online tool: https://realfavicongenerator.net/
   - Or: https://www.pwabuilder.com/imageGenerator
3. **Replace icons** in `public/icons/`:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png (most important)
   - icon-384x384.png
   - icon-512x512.png
4. **Redeploy** the app

---

## 📝 App Information

- **App Name**: Cleaning Shift Management
- **Short Name**: CleanShift
- **Theme Color**: #6366f1 (Indigo)
- **Display Mode**: Standalone (fullscreen)
- **Orientation**: Portrait (primary)

---

## 🔐 Security Notes

- The app requires HTTPS (except for localhost development)
- All data is stored securely
- Authentication uses JWT tokens
- Service worker caches resources for offline use

---

## 📞 Support

If you encounter issues:
1. Check that the app is deployed and accessible
2. Verify HTTPS is enabled
3. Clear browser cache
4. Try in an incognito/private window
5. Check browser console for errors (if possible)

---

**Last Updated**: Based on current Next.js PWA configuration with next-pwa

