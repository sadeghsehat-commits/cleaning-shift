# iOS Notifications: Free Xcode vs Paid Apple Developer

## Current setup (free Xcode / free Apple ID)

- **iOS**: **Local Notifications** only. No Push capability, no Apple Developer Program.
- **Android**: **Push (FCM)** — unchanged.

Config: `lib/notification-config.ts` → `USE_PUSH_IOS = false`.

### What works on iOS now

- Shift reminders (“in 1 hour”) via **local** notifications.
- Permission request on first use.
- Tap notification → open app → navigate to shift details.
- Badge clear when visiting the Notifications page.

### What you need

1. **npm**: Run `npm install` so `@capacitor/local-notifications` is present (it’s in `package.json`). The iOS app won’t build without it.
2. **iOS project**: The Local Notifications plugin is added in `ios/App/CapApp-SPM/Package.swift`.  
   If you run `npx cap sync ios` later, it may overwrite `Package.swift`. If Local Notifications is removed, add it back the same way as Push Notifications.
3. **Build**: `./build-for-mobile.sh` → `npx cap sync ios` → build in Xcode.

---

## When you pay for Apple Developer ($99/yr) — final release

You only need to **switch to Push** and **add the capability**. No other app logic changes.

### 1. Xcode

- App target → **Signing & Capabilities**.
- **+ Capability** → **Push Notifications**.

### 2. Config

In `lib/notification-config.ts`:

```ts
export const USE_PUSH_IOS = true;
```

### 3. Rebuild

```bash
./build-for-mobile.sh
npx cap sync ios
```

Then build and run from Xcode (or archive for App Store).

### 4. Backend / Firebase

- Ensure **FIREBASE_SERVICE_ACCOUNT_KEY** is set in Vercel (or your backend).
- iOS app in Firebase: **GoogleService-Info.plist** in the Xcode project, same as now.

---

## Summary

| | Free Xcode (now) | Paid Apple Developer (release) |
|---|---|---|
| **USE_PUSH_IOS** | `false` | `true` |
| **Xcode capability** | None | Push Notifications |
| **iOS notifications** | Local only | Push (FCM) |
| **Code changes** | — | Only the flag above |

Android always uses Push (FCM); this config does not affect it.
