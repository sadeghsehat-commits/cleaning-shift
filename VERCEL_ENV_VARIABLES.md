# How to Add Environment Variables in Vercel Dashboard 📝

## Step-by-Step Instructions

### Step 1: Go to Your Vercel Dashboard
1. Open your web browser
2. Go to **https://vercel.com**
3. **Log in** to your account

### Step 2: Select Your Project
1. On the dashboard, you'll see a list of your projects
2. **Click on your project name** (the one you just deployed)
   - It should be something like "cleaning-shift-manager" or "mahdiamooyee"

### Step 3: Navigate to Settings
1. Once you're in your project page, look at the **top menu bar**
2. Click on the **"Settings"** tab
   - It's usually the rightmost tab in the navigation

### Step 4: Go to Environment Variables
1. In the Settings page, look at the **left sidebar menu**
2. Click on **"Environment Variables"**
   - It's usually under the "General" section

### Step 5: Add Each Variable
For each environment variable, follow these steps:

#### Adding MONGODB_URI:
1. Click the **"Add New"** button (or "Add" button)
2. In the **"Key"** field, type: `MONGODB_URI`
3. In the **"Value"** field, paste your MongoDB connection string:
   - If using MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager`
   - Replace `username`, `password`, and `cluster` with your actual values
4. Under **"Environment"**, select:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development**
   (Select all three to use it everywhere)
5. Click **"Save"**

#### Adding JWT_SECRET:
1. Click **"Add New"** again
2. **Key**: `JWT_SECRET`
3. **Value**: Type a long random string (at least 32 characters)
   - Example: `my-super-secret-jwt-key-12345-change-this-in-production`
   - **Important**: Make this unique and secret!
4. **Environment**: Select all three (Production, Preview, Development)
5. Click **"Save"**

#### Adding NODE_ENV:
1. Click **"Add New"** again
2. **Key**: `NODE_ENV`
3. **Value**: `production`
4. **Environment**: Select all three
5. Click **"Save"**

#### Adding NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (Optional):
1. Click **"Add New"** again
2. **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. **Value**: Your Google Maps API key (if you have one)
4. **Environment**: Select all three
5. Click **"Save"**

### Step 6: Redeploy Your App
After adding all environment variables:

1. Go back to the **"Deployments"** tab (top menu)
2. Find your latest deployment
3. Click the **three dots (⋯)** menu on the right
4. Click **"Redeploy"**
5. Confirm the redeploy

**OR** use the command line:
```bash
vercel --prod
```

## Visual Guide (What You'll See)

```
Vercel Dashboard
├── Projects List
│   └── [Your Project Name] ← Click here
│       ├── Overview
│       ├── Deployments
│       ├── Analytics
│       └── Settings ← Click here
│           ├── General
│           │   ├── Project Name
│           │   ├── Framework Preset
│           │   └── Environment Variables ← Click here
│           │       └── [Add New Button]
│           │           ├── Key: [MONGODB_URI]
│           │           ├── Value: [your-connection-string]
│           │           └── Environment: ☑ Production ☑ Preview ☑ Development
│           └── ...
```

## Required Environment Variables

Here's a checklist of what you need:

### Required (Must Have):
- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `JWT_SECRET` - A secret key for authentication
- [ ] `NODE_ENV` - Set to `production`

### Optional:
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For address autocomplete (if you use it)

## Example Values

**MONGODB_URI:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/cleaning-manager?retryWrites=true&w=majority
```

**JWT_SECRET:**
```
my-super-secret-key-1234567890-abcdefghijklmnop
```

**NODE_ENV:**
```
production
```

## Important Notes ⚠️

1. **Never share your environment variables** - They're secret!
2. **JWT_SECRET** should be a long, random string (at least 32 characters)
3. **MONGODB_URI** must be your actual MongoDB Atlas connection string
4. **After adding variables**, you MUST redeploy for them to take effect
5. **Select all environments** (Production, Preview, Development) unless you have a specific reason not to

## Troubleshooting

### Variables not working?
- Make sure you **redeployed** after adding them
- Check for typos in the variable names (case-sensitive!)
- Verify the values are correct (no extra spaces)

### Can't find Environment Variables?
- Make sure you're in the **Settings** tab
- Look in the **left sidebar** under "General"
- If you still can't find it, try: Project → Settings → Environment Variables

### Need to update a variable?
- Click on the variable in the list
- Click **"Edit"** or the pencil icon
- Update the value
- Click **"Save"**
- **Redeploy** your app

## Quick Reference

**URL to go directly to Environment Variables:**
```
https://vercel.com/[your-username]/[your-project]/settings/environment-variables
```

Replace `[your-username]` and `[your-project]` with your actual values.

