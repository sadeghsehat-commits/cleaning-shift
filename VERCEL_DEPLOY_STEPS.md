# How to Deploy to Vercel - Step by Step 🚀

Follow these steps to deploy your Cleaning Shift Manager app to Vercel.

## Prerequisites

- ✅ Your code is ready
- ✅ You have a GitHub account (recommended) or can use Vercel CLI
- ✅ MongoDB Atlas account (for database)

---

## Method 1: Deploy via Vercel Website (Easiest) 🌐

### Step 1: Prepare Your Code

1. **Make sure your code is in a Git repository:**
   ```bash
   cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
   
   # If not already a git repo, initialize it:
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub (https://github.com/new)
   - Name it: `cleaning-shift-manager` (or any name you like)
   - Don't initialize with README
   - Copy the repository URL
   
   ```bash
   # Add GitHub remote (replace with your URL)
   git remote add origin https://github.com/YOUR_USERNAME/cleaning-shift-manager.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

### Step 3: Deploy Your Project

1. **In Vercel Dashboard:**
   - Click **"Add New..."** → **"Project"**
   - You'll see your GitHub repositories
   - Find **"cleaning-shift-manager"** (or your repo name)
   - Click **"Import"**

2. **Configure Project:**
   - **Framework Preset**: Should auto-detect "Next.js" ✅
   - **Root Directory**: Leave as `./` (default)
   - **Build Command**: Leave default (Next.js auto-detects)
   - **Output Directory**: Leave default
   - **Install Command**: Leave default

3. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add these variables:
     
     **Variable 1:**
     - Key: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string
       - Example: `mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager`
     - Environments: ☑ Production ☑ Preview ☑ Development
     
     **Variable 2:**
     - Key: `JWT_SECRET`
     - Value: A long random string (at least 32 characters)
       - Example: `my-super-secret-jwt-key-1234567890-abcdefghijklmnop`
     - Environments: ☑ Production ☑ Preview ☑ Development
     
     **Variable 3:**
     - Key: `NODE_ENV`
     - Value: `production`
     - Environments: ☑ Production ☑ Preview ☑ Development
     
     **Variable 4 (Optional - if you use Google Maps):**
     - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - Value: Your Google Maps API key
     - Environments: ☑ Production ☑ Preview ☑ Development

4. **Deploy:**
   - Click **"Deploy"** button
   - Wait 2-3 minutes for deployment
   - You'll see build logs in real-time

5. **Get Your URL:**
   - After deployment completes, you'll see:
     - **Production URL**: `https://your-project-name.vercel.app`
   - This is your live app URL! 🎉

---

## Method 2: Deploy via Vercel CLI (Command Line) 💻

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Navigate to Your Project

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### Step 4: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Type `Y` and press Enter
- **Which scope?** → Select your account
- **Link to existing project?** → Type `N` (first time)
- **What's your project's name?** → Press Enter (uses folder name) or type a name
- **In which directory is your code located?** → Press Enter (uses `./`)
- **Want to override the settings?** → Type `N`

### Step 5: Add Environment Variables

```bash
# Add MongoDB URI
vercel env add MONGODB_URI

# When prompted:
# - Value: Paste your MongoDB Atlas connection string
# - Environment: Select all (Production, Preview, Development)

# Add JWT Secret
vercel env add JWT_SECRET

# When prompted:
# - Value: Type a long random string
# - Environment: Select all

# Add Node Environment
vercel env add NODE_ENV

# When prompted:
# - Value: Type `production`
# - Environment: Select all
```

### Step 6: Deploy to Production

```bash
vercel --prod
```

This deploys to production with your environment variables.

### Step 7: Get Your URL

After deployment, Vercel will show you:
```
✅ Production: https://your-project-name.vercel.app
```

---

## 📝 Quick Checklist

Before deploying, make sure:

- [ ] Code is committed to Git
- [ ] Pushed to GitHub (if using Method 1)
- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string ready
- [ ] JWT_SECRET prepared (long random string)

---

## 🔧 After Deployment

### 1. Test Your App

1. Open your Vercel URL: `https://your-project-name.vercel.app`
2. Test login
3. Test creating shifts
4. Test on mobile device

### 2. Update Mobile Apps

Update the API URL in your mobile apps:

**iOS:** `Services/APIService.swift`
```swift
static let baseURL = "https://your-project-name.vercel.app"
```

**Android:** `data/api/ApiService.kt`
```kotlin
const val BASE_URL = "https://your-project-name.vercel.app"
```

### 3. Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally first to test

**Error: "Environment variable missing"**
- Check all environment variables are added
- Make sure they're added to Production environment

**Error: "Build timeout"**
- First build can take 3-5 minutes
- Be patient, subsequent builds are faster

### App Doesn't Work After Deployment

**Can't connect to database:**
- Check `MONGODB_URI` is correct
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Test connection string in MongoDB Compass first

**Authentication not working:**
- Check `JWT_SECRET` is set
- Make sure it's the same for all environments

**API routes return 500 errors:**
- Check Vercel function logs
- Go to: Vercel Dashboard → Your Project → Functions → View Logs

---

## 📊 Monitoring Your App

### View Logs

1. Go to Vercel Dashboard
2. Click your project
3. Click **"Functions"** tab
4. Click any function to see logs

### View Analytics

1. Go to Vercel Dashboard
2. Click your project
3. Click **"Analytics"** tab
4. See requests, performance, etc.

---

## 🔄 Updating Your App

### Automatic Updates (GitHub Method)

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. Vercel automatically deploys! ✅

### Manual Updates (CLI Method)

```bash
vercel --prod
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] Can login
- [ ] Can view shifts
- [ ] Can view notifications
- [ ] Database connection works
- [ ] Works on mobile device
- [ ] Works with mobile data (not just WiFi)

---

## 🎉 You're Live!

Once deployed, your app is:
- ✅ Accessible worldwide
- ✅ Works with mobile data
- ✅ Has HTTPS (secure)
- ✅ Fast (global CDN)
- ✅ Auto-updates when you push to GitHub

**Your app URL will be:**
```
https://your-project-name.vercel.app
```

Share this URL with your team and use it in your mobile apps!

---

## 📚 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas Setup**: See `MONGODB_ATLAS_SETUP.md` in this project

---

## 💡 Pro Tips

1. **Use GitHub integration** - Automatic deployments on every push
2. **Set up preview deployments** - Test changes before production
3. **Monitor logs** - Check function logs if something breaks
4. **Use environment variables** - Never commit secrets to code
5. **Test on mobile** - Always test the deployed version on real devices



