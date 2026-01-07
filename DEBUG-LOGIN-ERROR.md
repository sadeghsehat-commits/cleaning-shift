# 🔍 Debug: Login "An Error Occurred"

## Problem

After entering login credentials, you see "An error occurred" but no specific error message.

## ✅ Fix Applied

I've improved error handling to show **specific error messages** instead of the generic "An error occurred".

Now the console will show:
- 🔐 Login attempt details
- 📡 Response status and headers
- 📡 Response data
- ❌ Specific error messages

## 🔍 How to See the Actual Error

### Method 1: Chrome DevTools (Recommended)

1. **Connect phone to computer** via USB
2. **Enable USB Debugging** on phone
3. **Open Chrome:** `chrome://inspect`
4. **Click "inspect"** on your device
5. **Go to Console tab**
6. **Try to login**
7. **Look for error messages** starting with:
   - `❌ Login error:`
   - `Error name:`
   - `Error message:`

### Method 2: Check Network Tab

1. **In Chrome DevTools, go to Network tab**
2. **Try to login**
3. **Look for the request to `/api/auth/login`**
4. **Click on it** and check:
   - **Status:** What HTTP status code? (200, 401, 500, etc.)
   - **Response:** What does the server return?
   - **Headers:** Are cookies being sent/received?

## 🔧 Common Errors and Solutions

### Error 1: "Network error: Cannot connect to server"

**Cause:** Cannot reach Vercel API

**Solutions:**
- Check internet connection
- Verify Vercel is up: `https://cleaning-shift-manager.vercel.app`
- Check if URL is correct in `lib/api-config.ts`

### Error 2: CORS Error

**Cause:** Vercel not allowing requests from mobile app

**Error message:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:** Need to configure CORS on Vercel to allow credentials from mobile app

### Error 3: 401 Unauthorized

**Cause:** Wrong email/password

**Solution:** Verify credentials are correct

### Error 4: 500 Internal Server Error

**Cause:** Server error on Vercel

**Solution:** Check Vercel logs for server errors

### Error 5: "Failed to fetch" or "Network request failed"

**Cause:** Connection issue

**Solutions:**
- Check internet connection
- Verify API URL is accessible
- Check if firewall/VPN is blocking

## 🔍 What to Check

### 1. Verify API URL is Correct

In console, you should see:
```
🔐 Login attempt: { endpoint: 'https://cleaning-shift-manager.vercel.app/api/auth/login', ... }
```

If you see `localhost` or empty URL, that's the problem!

### 2. Check Response Status

In Network tab, check the status code:
- **200** = Success (but might have error in response body)
- **401** = Wrong credentials
- **403** = Forbidden (CORS issue?)
- **500** = Server error
- **Network error** = Cannot connect

### 3. Check Response Body

In Network tab, click the request and check "Response" tab:
- `{"error":"Invalid credentials"}` = Wrong email/password
- `{"error":"..."}` = Other error from server
- Empty or HTML = Server error

## 🚀 Next Steps

1. **Rebuild the app** with the improved error handling:
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

2. **After rebuilding, try login again**

3. **Check Chrome DevTools Console** for the specific error

4. **Share the error message** you see in console

---

**The improved error handling will now show you the exact problem!**

