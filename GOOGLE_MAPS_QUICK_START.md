# Quick Start: Google Maps API Setup (FREE)

## ✅ Good News: It's FREE for Most Use Cases!

Google Maps gives you **$200 free credit per month**, which is enough for:
- **~70,000 autocomplete requests per month** (city + address)
- Most small to medium applications stay within the free tier
- You only pay if you exceed $200/month

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click **"Create Project"** or select an existing project
   - Project name: "Cleaning Shift Manager" (or any name)
   - Click **Create**

### Step 2: Enable Billing (Required but FREE)
1. Go to **Billing** in the left menu
2. Click **Link a billing account**
3. Add a payment method (credit card)
   - ⚠️ **Don't worry!** You get $200 free credit every month
   - You only pay if you exceed $200 (very unlikely for this app)
   - You can set up billing alerts to prevent charges

### Step 3: Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Search for **"Places API"** and click on it
3. Click **Enable**
4. Search for **"Maps JavaScript API"** and click on it
5. Click **Enable**

### Step 4: Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API Key**
3. Your API key will be created and displayed
4. **Copy the API key** (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 5: (Optional but Recommended) Restrict API Key
1. Click on your newly created API key to edit it
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Click **Add an item**
   - Add: `localhost:3001/*` (for development)
   - Add: `yourdomain.com/*` (for production, when you deploy)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Check: **Places API** and **Maps JavaScript API**
4. Click **Save**

### Step 6: Add API Key to Your Project
1. Open your project folder: `/Users/LUNAFELICE/Desktop/Mahdiamooyee`
2. Create or edit `.env.local` file in the root directory
3. Add this line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```
   Replace `your-api-key-here` with the API key you copied

4. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Step 7: Test It!
1. Go to: http://localhost:3001/dashboard/apartments/new
2. In the "City (Italy)" field, start typing "Roma" or "Milano"
3. You should see autocomplete suggestions appear!
4. Select a city, then type an address - it should also show suggestions

## 📊 Cost Breakdown

- **City Autocomplete**: ~$2.83 per 1,000 requests
- **Address Autocomplete**: ~$2.83 per 1,000 requests
- **Free Credit**: $200/month = ~70,000 requests/month FREE
- **Typical Usage**: 100-500 requests/month for a small app = **$0 cost**

## 🔒 Security Tips

1. ✅ **Restrict your API key** (Step 5 above) - prevents others from using it
2. ✅ **Never commit** `.env.local` to git (it's already in .gitignore)
3. ✅ **Monitor usage** in Google Cloud Console > APIs & Services > Dashboard

## 🐛 Troubleshooting

### Autocomplete Not Showing?
1. **Check API Key**: Make sure it's in `.env.local` and server is restarted
2. **Check Browser Console**: Press F12, look for errors
3. **Verify APIs Enabled**: Go to Google Cloud Console > APIs & Services > Enabled APIs
   - Should see: "Places API" and "Maps JavaScript API"
4. **Check Billing**: Make sure billing is enabled (even with free tier)

### Common Errors:
- **"This API project is not authorized to use this API"**: Enable Places API
- **"RefererNotAllowedMapError"**: Add your domain to API key restrictions
- **"REQUEST_DENIED"**: Check if billing is enabled

## 📝 Example .env.local File

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cleaning-manager
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production-use-a-long-random-string

# Environment
NODE_ENV=development

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ Verification Checklist

- [ ] Google Cloud project created
- [ ] Billing account linked (with payment method)
- [ ] Places API enabled
- [ ] Maps JavaScript API enabled
- [ ] API key created
- [ ] API key added to `.env.local`
- [ ] Development server restarted
- [ ] Autocomplete working in browser

## 🆘 Still Having Issues?

1. Check browser console (F12) for errors
2. Verify API key is correct in `.env.local`
3. Make sure you restarted the server after adding the key
4. Check Google Cloud Console for API usage/errors
5. See `GOOGLE_MAPS_SETUP.md` for more detailed troubleshooting

## 💡 Pro Tip

You can test if your API key works by visiting this URL in your browser:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

If it loads without errors, your API key is valid!





