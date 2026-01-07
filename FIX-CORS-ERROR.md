# 🔧 Fix: CORS Error - Login Not Working

## Problem Identified

**CORS Error:**
```
Access to fetch at 'https://cleaning-shift-manager.vercel.app/api/auth/login' 
from origin 'https://localhost' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution Applied

I've added CORS support to the API routes:

1. ✅ **Created `middleware.ts`** - Handles CORS for all API routes
2. ✅ **Added OPTIONS handler** to `/api/auth/login` - Handles preflight requests
3. ✅ **Added OPTIONS handler** to `/api/auth/register` - Handles preflight requests
4. ✅ **Added OPTIONS handler** to `/api/auth/me` - Handles preflight requests
5. ✅ **Updated cookie settings** - Changed `sameSite: 'lax'` to `sameSite: 'none'` for cross-origin requests
6. ✅ **Set `secure: true`** - Required when using `sameSite: 'none'`

## 🚀 Deploy to Vercel

**IMPORTANT:** The API routes with CORS headers need to be deployed to Vercel!

### Step 1: Restore API Routes

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Restore API routes (they were moved for mobile build)
mv .api-backup/api app/api 2>/dev/null || echo "API routes already in app/api"
```

### Step 2: Commit and Push to Git

```bash
# Add all changes
git add .

# Commit
git commit -m "Add CORS support for mobile app"

# Push to trigger Vercel deployment
git push
```

### Step 3: Wait for Vercel Deployment

- Go to: https://vercel.com/dashboard
- Check your project
- Wait for deployment to complete (usually 1-2 minutes)

### Step 4: Test Login Again

After Vercel deploys, try logging in again in the mobile app.

## 🔍 Verify CORS is Working

**Test the API with CORS:**

```bash
curl -X OPTIONS https://cleaning-shift-manager.vercel.app/api/auth/login \
  -H "Origin: https://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**You should see:**
```
< HTTP/2 200
< Access-Control-Allow-Origin: https://localhost
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## 📋 What Changed

### 1. Cookie Settings

**Before:**
```typescript
sameSite: 'lax'  // Doesn't work for cross-origin
```

**After:**
```typescript
sameSite: 'none'  // Works for cross-origin
secure: true      // Required with sameSite: 'none'
```

### 2. CORS Headers Added

All API routes now return:
- `Access-Control-Allow-Origin: <origin>`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

### 3. OPTIONS Handler

All API routes now handle OPTIONS (preflight) requests.

## ✅ After Deployment

1. **Wait for Vercel to deploy** (check Vercel dashboard)
2. **Try logging in** in the mobile app
3. **Check console** - CORS error should be gone
4. **Login should work!**

---

**Deploy the changes to Vercel and login should work! 🚀**

