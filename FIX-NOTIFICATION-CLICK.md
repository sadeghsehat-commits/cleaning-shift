# Fix Notification Click Issue

## Problem
When operator clicks on a notification (like "TOP UP" when owner adds a shift):
- Notification disappears immediately
- Doesn't navigate to shift details
- User has to manually go to notifications menu to see what it was

## Solution
Changed the order of operations in `handleNotificationClick`:
- Navigate FIRST to shift details
- Clear badge AFTER navigation (non-blocking)

## Changes Made
- File: `components/CapacitorPushNotifications.tsx`
- Function: `handleNotificationClick`
- Changed: Navigate before clearing badge

## What Happens Now
1. User clicks notification
2. App navigates to shift details page immediately
3. Badge is cleared in background (doesn't block navigation)
4. User can see the shift details

