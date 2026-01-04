# MongoDB Atlas Setup Guide

## Step 1: Get Your MongoDB Atlas Connection String

1. **Log in to MongoDB Atlas**: Go to https://www.mongodb.com/cloud/atlas

2. **Select or Create a Cluster**:
   - If you don't have a cluster, create a free one (M0 Free Tier)
   - Click on your cluster

3. **Get Connection String**:
   - Click the "Connect" button on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

4. **Create Database User** (if you haven't already):
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

5. **Whitelist Your IP**:
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Complete Connection String**:
   - Your connection string should look like:
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cleaning-manager?retryWrites=true&w=majority
   ```
   - Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your database user credentials
   - Replace `cluster0.xxxxx` with your actual cluster name
   - The database name `cleaning-manager` will be created automatically

## Step 2: Update .env.local File

Once you have your connection string, I'll help you update the `.env.local` file.

Your connection string should replace the `MONGODB_URI` in the `.env.local` file.

