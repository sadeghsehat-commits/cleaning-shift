# How to Access Your App on iPhone Using Mobile Data 📱

You have two main options to access your app on iPhone without WiFi:

## Option 1: Quick Testing with ngrok (Temporary) ⚡

**Best for:** Quick testing and development

### Steps:

1. **Install ngrok:**
   ```bash
   # On Mac, install via Homebrew
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your app:**
   ```bash
   cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
   npm run dev:network
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL:**
   - ngrok will show something like: `https://abc123.ngrok.io`
   - Copy this URL

5. **Access on iPhone:**
   - Open Safari on your iPhone
   - Go to the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Add to home screen
   - Use it with mobile data!

**Note:** Free ngrok URLs change every time you restart. For a permanent URL, you need a paid ngrok account.

---

## Option 2: Deploy to Vercel (Permanent & Free) 🚀

**Best for:** Production use, permanent access

### Steps:

1. **Create a Vercel account:**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy your app:**
   ```bash
   cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No**
   - Project name? (press Enter for default)
   - Directory? (press Enter for `./`)
   - Override settings? **No**

5. **Set up environment variables:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - **See `VERCEL_ENV_VARIABLES.md` for detailed step-by-step instructions**
   - Add these variables:
     ```
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     ```
   - If you have Google Maps API key:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
     ```

6. **Redeploy after adding environment variables:**
   ```bash
   vercel --prod
   ```

7. **Get your URL:**
   - Vercel will give you a URL like: `https://your-app.vercel.app`
   - This URL is permanent and works with mobile data!

8. **Access on iPhone:**
   - Open Safari on your iPhone
   - Go to your Vercel URL
   - Add to home screen
   - Use it anywhere with mobile data!

---

## Option 3: Other Cloud Services 🌐

### Railway (Easy MongoDB hosting too)
- Go to https://railway.app
- Connect GitHub repository
- Add MongoDB service
- Deploy automatically

### Render
- Go to https://render.com
- Create new Web Service
- Connect GitHub repository
- Add environment variables
- Deploy

### Netlify (Static hosting - may need adjustments)
- Go to https://netlify.com
- Drag and drop your `out` folder (after `next build` and `next export`)

---

## Important Notes ⚠️

### For MongoDB:
- If using **MongoDB Atlas** (cloud): No changes needed, works from anywhere
- If using **local MongoDB**: You need to:
  1. Use MongoDB Atlas (free tier available)
  2. Or set up MongoDB on a cloud server
  3. Update `MONGODB_URI` in environment variables

### For Environment Variables:
Make sure to set these in your cloud provider:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret key (keep it secret!)
- `NODE_ENV` - Set to `production`

### Security:
- Never commit `.env.local` to GitHub
- Use environment variables in your cloud provider
- Keep `JWT_SECRET` secret and strong

---

## Quick Comparison

| Method | Cost | Setup Time | Permanent URL | Best For |
|--------|------|------------|---------------|----------|
| ngrok | Free (paid for permanent) | 2 minutes | No (changes) | Quick testing |
| Vercel | Free | 10 minutes | Yes | Production |
| Railway | Free tier | 15 minutes | Yes | Full stack apps |
| Render | Free tier | 15 minutes | Yes | General hosting |

---

## Recommended: Vercel 🎯

For Next.js apps, **Vercel is the best choice** because:
- ✅ Made by Next.js creators
- ✅ Automatic deployments from GitHub
- ✅ Free tier is generous
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ Works perfectly with mobile data

---

## Need Help?

1. **ngrok issues:** Check https://ngrok.com/docs
2. **Vercel issues:** Check https://vercel.com/docs
3. **MongoDB setup:** See `MONGODB_ATLAS_SETUP.md` in this project

