# 🗺️ Google Maps API Setup - Simple Guide

## ✅ It's FREE! (For Most Uses)

Google gives you **$200 free credit per month**, which covers:
- **~70,000 autocomplete requests** (city + address searches)
- For a small app like this, you'll likely use **less than 1,000 requests/month = $0 cost**

## 🎯 Quick Answer: City vs Country

**Both are FREE!** The cost is the same whether you search:
- Cities in Italy (what we're doing)
- Cities worldwide
- Addresses in Rome only
- Addresses in all of Italy

**Cost**: ~$2.83 per 1,000 requests (same for all)

## 📋 Step-by-Step Setup

### 1️⃣ Create Google Cloud Project (2 minutes)

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"**
4. Name it: `Cleaning Shift Manager` (or any name)
5. Click **Create**

### 2️⃣ Enable Billing (Required - But FREE!)

1. In Google Cloud Console, go to **"Billing"** (left menu)
2. Click **"Link a billing account"**
3. Add a credit card
   - ⚠️ **Don't worry!** You get $200 free every month
   - You only pay if you exceed $200 (very unlikely)
   - Set up billing alerts to be safe

### 3️⃣ Enable APIs (1 minute)

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Places API"** → Click **Enable**
3. Search for **"Maps JavaScript API"** → Click **Enable**

### 4️⃣ Create API Key (1 minute)

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. **Copy the API key** (looks like: `AIzaSyB...`)

### 5️⃣ (Optional) Restrict API Key for Security

1. Click on your API key to edit it
2. **Application restrictions**: Select **"HTTP referrers"**
   - Add: `localhost:3001/*`
3. **API restrictions**: Select **"Restrict key"**
   - Check: **Places API** and **Maps JavaScript API**
4. Click **Save**

### 6️⃣ Add to Your Project (1 minute)

1. In your project folder, create/edit `.env.local`:
   ```bash
   cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
   ```

2. Create the file (if it doesn't exist):
   ```bash
   touch .env.local
   ```

3. Add this line to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```
   Replace `your-api-key-here` with the API key you copied

4. Your `.env.local` should look like:
   ```
   MONGODB_URI=mongodb://localhost:27017/cleaning-manager
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 7️⃣ Restart Server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 8️⃣ Test It! 🎉

1. Go to: **http://localhost:3001/dashboard/apartments/new**
2. In **"City (Italy)"** field, type **"R"**
3. You should see suggestions: **Roma, Rimini, Reggio Calabria**, etc.
4. Select **"Roma"**
5. In **"Address"** field, type an address
6. You should see address suggestions!

## 💰 Cost Breakdown

| Feature | Cost per 1,000 requests | Free Tier Coverage |
|---------|------------------------|-------------------|
| City Autocomplete | $2.83 | ~70,000 requests/month |
| Address Autocomplete | $2.83 | ~70,000 requests/month |
| **Total Free** | **$200/month** | **~70,000 requests** |

**For this app**: You'll probably use 100-500 requests/month = **$0.00 cost** ✅

## 🔍 Verify It's Working

### Check 1: API Key in Environment
```bash
# In your terminal, check if the file exists:
cat .env.local | grep GOOGLE_MAPS
```

### Check 2: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ "City autocomplete initialized successfully" = Working!
   - ❌ "Google Maps API key not found" = Need to add key
   - ❌ "Failed to load Google Maps" = Check API key or enable APIs

### Check 3: Test URL
Visit this in your browser (replace YOUR_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places
```
- ✅ If it loads = API key works
- ❌ If you see an error = Check API key or enable APIs

## 🐛 Common Issues & Fixes

### Issue: "Autocomplete not showing"
**Fix**:
1. Check `.env.local` has the API key
2. Restart the server (`npm run dev`)
3. Check browser console for errors
4. Verify Places API is enabled in Google Cloud

### Issue: "API key not working"
**Fix**:
1. Make sure billing is enabled (required even for free tier)
2. Check API restrictions allow your domain
3. Verify Places API is enabled
4. Check API key is correct (no extra spaces)

### Issue: "Address field stays gray"
**Fix**:
- Type at least 2 characters in the city field
- The address field will automatically enable
- You don't need to select from autocomplete - just type!

## 📝 Complete .env.local Example

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/cleaning-manager
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager

# JWT Secret (change this to a random string)
JWT_SECRET=your-secret-key-change-in-production-use-a-long-random-string

# Environment
NODE_ENV=development

# Google Maps API Key (get from https://console.cloud.google.com/)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ Quick Checklist

- [ ] Google Cloud project created
- [ ] Billing account linked (with credit card)
- [ ] Places API enabled
- [ ] Maps JavaScript API enabled  
- [ ] API key created and copied
- [ ] API key added to `.env.local`
- [ ] Server restarted (`npm run dev`)
- [ ] Tested in browser - autocomplete works!

## 🆘 Still Need Help?

1. **Check the browser console** (F12) for specific error messages
2. **Check Google Cloud Console** → APIs & Services → Dashboard for API errors
3. **Verify your API key** by testing the URL above
4. See `GOOGLE_MAPS_QUICK_START.md` for more detailed instructions

## 💡 Pro Tips

1. **Set up billing alerts** in Google Cloud to get notified if you approach the free limit
2. **Restrict your API key** to prevent unauthorized use
3. **Monitor usage** in Google Cloud Console → APIs & Services → Dashboard
4. The free tier is very generous - you'd need to make 70,000+ requests/month to exceed it!

---

**Ready to set it up?** Follow the steps above, and you'll have autocomplete working in 5 minutes! 🚀



