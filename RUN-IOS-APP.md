# How to Run the iOS App

## Prerequisites

- **Mac** with **Xcode** installed (from Mac App Store)
- **Node.js** and **npm** (e.g. via nvm)
- Project dependencies installed: `npm install`

---

## Step 1: Build the app for mobile (static export → `out/`) — **required first**

The iOS app loads from the `out/` folder. **You must run this before `npx cap sync ios`.**  
If you skip it, you’ll get: *"Could not find the web assets directory: ./out"*.

```bash
cd /Users/luna/Downloads/Mahdiamooyee
bash build-for-mobile.sh
```

This script temporarily uses `output: 'export'`, builds the app, and creates `out/`.  
**Check:** `out/index.html` should exist. If the build fails, fix any errors shown.

---

## Step 2: Add the iOS platform (first time only)

If you don’t have an `ios/` folder yet:

```bash
npx cap add ios
```

---

## Step 3: Sync web build to iOS

```bash
npx cap sync ios
```

This copies the `out/` build into the iOS project.

---

## Step 4: Open Xcode and run

```bash
npx cap open ios
```

Or:

```bash
npm run ios
```

Xcode will open. Then:

1. **Simulator:** In the top bar, choose an **iPhone simulator** (e.g. iPhone 15) and click **Run (▶)** or press **Cmd + R**.
2. **Real iPhone:** Connect your iPhone via USB, select it as the run target, then click **Run**.  
   - You may need **Signing & Capabilities** → **Team** → your Apple ID.  
   - On first install: **Settings → General → VPN & Device Management** → trust your developer certificate.

---

## Quick reference (after first-time setup)

```bash
cd /Users/luna/Downloads/Mahdiamooyee
bash build-for-mobile.sh    # rebuild static export
npx cap sync ios            # copy to iOS
npm run ios                 # open Xcode, then Run
```

---

## Troubleshooting

- **"Could not find the web assets directory: ./out":** Run `bash build-for-mobile.sh` first. That creates `out/`. Then run `npx cap sync ios` again.
- **`out/index.html` missing:** The mobile build failed. Run `bash build-for-mobile.sh` and fix any build errors.
- **`ios` folder missing:** Run `npx cap add ios`.
- **Xcode won’t build:** Open the project in Xcode, check **Signing & Capabilities**, and resolve any errors shown.
- **Simulator not listed:** In Xcode, **Xcode → Settings → Platforms** and install an iOS simulator.
