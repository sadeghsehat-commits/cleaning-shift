/**
 * Notification mode for iOS.
 *
 * - false: Local Notifications (works with free Xcode / free Apple ID). No Push capability needed.
 * - true:  Push Notifications (requires Apple Developer Program $99/yr + Push capability in Xcode).
 *
 * CURRENT: Use Local Notifications. When the app is 100% ready and you've paid for Apple Developer:
 *
 * 1. Xcode → App target → Signing & Capabilities → + Capability → "Push Notifications".
 * 2. Set USE_PUSH_IOS to true below.
 * 3. Rebuild: build-for-mobile (or npm run build) → npx cap sync ios → build in Xcode.
 *
 * No other code changes needed. Android always uses Push (FCM) regardless of this flag.
 */
export const USE_PUSH_IOS = false;
