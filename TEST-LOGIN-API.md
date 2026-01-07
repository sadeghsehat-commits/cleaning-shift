# 🧪 Test Login API - Find the Real Error

## Quick Test: Is the API Working?

**Test the login API directly from your computer:**

```bash
curl -X POST https://cleaning-shift-manager.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  -v
```

**What to look for:**
- **200 OK** = API is working (credentials might be wrong)
- **401 Unauthorized** = Wrong credentials (API is working)
- **CORS error** = CORS not configured
- **Connection error** = Cannot reach Vercel

## 🔍 Most Likely Issues

### Issue 1: CORS Not Configured for Credentials

**Error in console:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Problem:** Vercel API routes need to allow credentials from mobile apps.

**Solution:** Need to add CORS headers to API routes on Vercel. But since API routes are on Vercel, we need to check if they're configured.

### Issue 2: Network Error

**Error in console:** `Failed to fetch` or `Network request failed`

**Problem:** Cannot connect to Vercel API.

**Solutions:**
- Check internet connection
- Verify Vercel URL is correct: `https://cleaning-shift-manager.vercel.app`
- Test URL in browser: `https://cleaning-shift-manager.vercel.app/api/auth/me`

### Issue 3: Wrong Credentials

**Error in console:** `401 Unauthorized` or `{"error":"Invalid credentials"}`

**Problem:** Email/password is incorrect.

**Solution:** Verify credentials are correct, or create a new account.

## 🔧 How to See the Actual Error

**After rebuilding with improved error handling:**

1. **Connect phone to computer** via USB
2. **Open Chrome DevTools:** `chrome://inspect`
3. **Click "inspect"** on your device
4. **Go to Console tab**
5. **Try to login**
6. **Look for messages starting with:**
   - `🔐 Login attempt:`
   - `📡 Response status:`
   - `❌ Login error:`

**Copy the error message** and share it with me!

## 🚀 Rebuild with Better Error Messages

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

**After rebuilding, the console will show the exact error!**

