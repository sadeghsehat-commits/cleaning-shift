# Troubleshooting: Users Page - Assign Apartments Not Visible

## Quick Checks

1. **Are you logged in as Admin?**
   - Check the sidebar: you should see "Admin" section with "Users" link (with people icon).
   - If you don't see "Users" in the menu, you're not admin.

2. **Are you on the Users page?**
   - URL should be: `https://cleaning-shift-manager.vercel.app/dashboard/users`
   - Or: `https://cleaning-shift-manager.vercel.app/dashboard/users` (your domain)

3. **Hard refresh the browser (clear cache):**
   - **Chrome/Edge (Windows):** `Ctrl + Shift + R` or `Ctrl + F5`
   - **Chrome/Edge (Mac):** `Cmd + Shift + R`
   - **Firefox:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - **Safari:** `Cmd + Option + R`
   - Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

4. **Check the Operators section:**
   - Scroll to the top of the Users page.
   - You should see **"Operators (N)"** section first (before Owners/Admins).
   - There should be a blue **"Add operator"** button in the top-right of that section.

5. **If you have operators:**
   - Each operator row should have a blue **"Assign apartments"** button.
   - Click it → modal opens → select apartments → **Save**.

6. **If you have NO operators:**
   - You'll see: "No operators yet. Click **Add operator** above..."
   - Click the blue **"Add operator"** button → fill form → **Create operator**.
   - Then the new operator appears with **"Assign apartments"** button.

---

## Still Not Working?

### Check Browser Console (F12)
- Open DevTools → Console tab.
- Look for red errors.
- If you see "404" or "Failed to fetch" for `/api/users`, the API might not be deployed.

### Verify Deployment
1. Check Vercel dashboard: latest deployment should be **successful** (green).
2. Check the commit: the latest commit should include changes to:
   - `app/dashboard/users/page.tsx`
   - `app/api/users/route.ts` (POST method)
   - `app/dashboard/layout.tsx` (Admin section in nav)

### Test API Directly
Open browser console (F12) and run:
```javascript
fetch('https://cleaning-shift-manager.vercel.app/api/users', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
- If you get `{ error: 'Unauthorized' }` → you're not logged in.
- If you get `{ users: [...] }` → API works, but the page might be cached.

---

## Force Clear Cache (Last Resort)

1. **Incognito/Private window:**
   - Open a new incognito window.
   - Log in as admin.
   - Go to `/dashboard/users`.
   - If it works here → it's a cache issue.

2. **Clear site data:**
   - DevTools (F12) → Application tab → Storage → "Clear site data".
   - Or: Settings → Privacy → Clear browsing data → Cached images and files.

---

## Expected UI

**Users Page (Admin only):**
```
┌─────────────────────────────────────────┐
│ Home / Users [Admin badge]              │
│ Manage system users. Add operators...   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Operators (2)          [Add operator]  │
│ Assign which apartments...               │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Operator Name                        │ │
│ │ operator@email.com                   │ │
│ │ Works at: 3 apartments               │ │
│ │                    [Assign apartments]│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Owners (2)                               │
│ ...                                      │
└─────────────────────────────────────────┘
```

If you don't see this, it's likely a cache issue. **Hard refresh first!**
