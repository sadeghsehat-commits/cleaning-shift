# 🔧 Fix: Login Not Working - Missing Credentials

## Problem

Login page shows up, but username and password don't work.

## Root Cause

**Missing `credentials: 'include'` in fetch calls!**

In mobile apps, when making API calls to a remote server (Vercel), cookies need to be explicitly included with `credentials: 'include'`. Without this, the authentication cookies won't be sent or received.

## ✅ Fix Applied

I've added `credentials: 'include'` to:
1. ✅ `components/LoginForm.tsx` - Login/Register API calls
2. ✅ `app/page.tsx` - Auth check API call

## 🔍 How to Verify It's Working

### Method 1: Check Browser Console (Chrome DevTools)

1. **Connect phone to computer** via USB
2. **Enable USB Debugging** on phone
3. **Open Chrome:** `chrome://inspect`
4. **Click "inspect"** on your device
5. **Go to Console tab**
6. **Try to login**
7. **Check for:**
   - `📱 LOCALHOST DETECTED - This is a mobile app!`
   - `✅ Using remote API URL: https://cleaning-shift-manager.vercel.app`
   - Any error messages

### Method 2: Check Network Tab

1. **In Chrome DevTools, go to Network tab**
2. **Try to login**
3. **Look for the request to `/api/auth/login`**
4. **Click on it** and check:
   - **Request URL:** Should be `https://cleaning-shift-manager.vercel.app/api/auth/login`
   - **Request Headers:** Should include cookies
   - **Response:** Check if it's 200 OK or an error

## 🔧 If Still Not Working

### Check 1: Verify API URL

The API should be: `https://cleaning-shift-manager.vercel.app`

**Test manually:**
```bash
curl -X POST https://cleaning-shift-manager.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Expected:** `{"error":"Invalid credentials"}` or similar (not a connection error)

### Check 2: CORS Configuration

Vercel needs to allow credentials from your mobile app. Check if CORS is configured correctly on Vercel.

### Check 3: Check Console Errors

Look for:
- `CORS error` → CORS not configured
- `Network error` → Connection issue
- `401 Unauthorized` → Wrong credentials
- `500 Internal Server Error` → Server issue

## 📋 Common Issues

### Issue 1: "Invalid credentials" but credentials are correct

**Possible causes:**
- User doesn't exist in database
- Password is wrong
- Database connection issue on Vercel

**Solution:** Check Vercel logs or try creating a new user

### Issue 2: "Network error" or "Failed to fetch"

**Possible causes:**
- No internet connection
- Vercel API down
- CORS not configured

**Solution:** Check internet, verify Vercel is up, check CORS

### Issue 3: Login succeeds but redirects back to login

**Possible causes:**
- Cookies not being set
- `credentials: 'include'` missing (now fixed)
- Cookie domain mismatch

**Solution:** Should be fixed with `credentials: 'include'`

---

## ✅ What I Fixed

1. ✅ Added `credentials: 'include'` to login form
2. ✅ Added `credentials: 'include'` to auth check

**Now rebuild the app:**

```bash
# Move API routes
mkdir -p .api-backup
mv app/api .api-backup/api

# Build
rm -rf .next out
npm run build

# Sync
npx cap sync android

# Build APK in Android Studio
```

**After rebuilding, login should work!**

---

**Try logging in again after rebuilding. If it still doesn't work, check the console for specific error messages.**

