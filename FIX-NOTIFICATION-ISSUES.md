# Fix Notification Issues

## Problems Fixed

### 1. Notification Title Not Descriptive
**Problem:** Notifications only showed "TOP UP" without indicating what type (new shift, comment, etc.)

**Solution:**
- Changed "TOP UP" to "TOP UP - New Shift" for shift assignments
- Changed "TOP UP" to "TOP UP - New Comment" for comments
- Notification body already contains descriptive message

### 2. Notification Click Doesn't Navigate
**Problem:** When clicking notification, it disappears but doesn't navigate to shift details

**Solution:**
- Added delay before navigation to ensure app is ready
- Added error handling with fallback to window.location
- Added extensive logging for debugging
- Navigation happens before badge clearing

## Files Changed

1. **app/api/shifts/route.ts**
   - Title: "TOP UP" → "TOP UP - New Shift"
   - Message includes apartment name

2. **app/api/shifts/[id]/comments/route.ts**
   - Title: "TOP UP" → "TOP UP - New Comment"
   - For both operator and owner notifications

3. **components/CapacitorPushNotifications.tsx**
   - Added 100ms delay before navigation
   - Added error handling with window.location fallback
   - Added extensive console logging
   - Navigation happens before badge clearing

## What Users Will See Now

### Before:
- Notification: "TOP UP"
- Click → Disappears, no navigation

### After:
- Notification: "TOP UP - New Shift" or "TOP UP - New Comment"
- Body: "You have been assigned a new cleaning shift at [Apartment Name]"
- Click → Navigates to shift details page
- Notification remains in notifications list

