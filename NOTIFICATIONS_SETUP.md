# How to Enable Push Notifications on iPhone 📱

## Step-by-Step Guide

### 1. **Add the App to Your Home Screen** (Required for iOS)

1. Open Safari on your iPhone
2. Navigate to: `http://192.168.1.3:3000` (or your server IP)
3. Tap the **Share button** (square with arrow pointing up) at the bottom
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** in the top right
6. The app icon will appear on your home screen

**Important:** On iOS, notifications only work when the app is opened from the home screen (not from Safari browser).

### 2. **Enable Notification Permissions**

1. Open the app from your home screen (tap the icon you just added)
2. When you first open it, you'll see a popup asking for notification permission
3. Tap **"Allow"** or **"Permit"**

**If you accidentally denied permission:**

**Method 1: Through the App (Easiest)**
1. Open the app from your home screen
2. Go to the **Notifications** page
3. Tap the **"⚠️ Enable Notifications"** button
4. Tap **"Allow"** when prompted

**Method 2: Through iPhone Settings**
The exact path depends on your iOS version:

**For iOS 16.4 and later:**
1. Go to iPhone **Settings** → **Notifications**
2. Scroll down to find your app name (e.g., "Cleaning Manager")
3. Tap on it and enable **"Allow Notifications"**

**For older iOS versions:**
1. Go to iPhone **Settings** → **Safari**
2. Scroll down to **"Advanced"** → **"Website Data"**
3. Find your website and tap on it
4. Enable notifications

**Alternative method:**
1. Open Safari (not the app)
2. Go to your website: `http://192.168.1.3:3000`
3. Tap the **"aA"** icon in the address bar
4. Tap **"Website Settings"**
5. Enable **"Allow Notifications"**
6. Then open the app from home screen again

### 3. **Verify Notifications Are Working**

1. Log in as an **Operator** account
2. Have an **Admin** create a new shift and assign it to you
3. You should receive a notification that says **"TOP UP"** with the message about your new shift

### 4. **Check Notification Status**

- Open the app
- Go to **Notifications** page
- You should see a red badge with the number of unread notifications
- If notifications aren't working, check the steps below

## Troubleshooting

### Notifications Not Appearing?

1. **Check if app is installed:**
   - Make sure you opened the app from the home screen icon, not from Safari
   - iOS only shows notifications for installed PWAs

2. **Check notification permission:**
   - iPhone Settings → Safari → Website Settings
   - Find your app and ensure notifications are enabled

3. **Check if you're logged in:**
   - Notifications only work when you're logged in
   - Make sure you're logged in as an Operator account

4. **Refresh the app:**
   - Close the app completely
   - Reopen it from the home screen
   - Wait a few seconds for the service worker to register

5. **Check browser console:**
   - If you have access to Safari Developer Tools, check for errors
   - Look for messages about service worker registration

### Still Not Working?

1. **Clear Safari cache:**
   - Settings → Safari → Clear History and Website Data

2. **Reinstall the app:**
   - Delete the app from home screen
   - Add it again following Step 1

3. **Check iOS version:**
   - iOS 16.4+ is required for web push notifications
   - Update your iPhone if needed

## How It Works

- The app checks for new notifications every **15 seconds**
- When a new "TOP UP" notification is detected, it shows a push notification
- Tapping the notification opens the shift details page
- Notifications work even when the app is in the background

## Testing Notifications

To test if notifications work:

1. Log in as an **Admin**
2. Create a new shift and assign it to an **Operator**
3. The Operator should receive a notification within 15 seconds
4. The notification will appear even if the app is closed or in the background

## Notes

- **iOS Limitations:** iOS Safari has stricter requirements than Android
- **Must be installed:** Notifications only work when the app is added to home screen
- **Background:** Notifications work in background, but the app needs to be opened at least once
- **Polling:** The app checks for notifications every 15 seconds (not instant like native apps)

