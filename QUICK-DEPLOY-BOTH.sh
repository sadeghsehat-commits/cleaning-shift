#!/bin/bash

# Quick Deployment Script for Web and Android
# This script deploys changes to Vercel (web) and prepares Android build

echo "🚀 Starting deployment..."
echo ""

# Fix Xcode error (temporary)
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# Navigate to project directory
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# ==========================================
# WEB DEPLOYMENT (Vercel)
# ==========================================
echo "📱 Step 1: Deploying to Vercel (Web)..."
echo ""

echo "📦 Adding files..."
git add .

echo "💾 Committing changes..."
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"

echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Web deployment started!"
echo "⏳ Vercel will auto-deploy in 1-3 minutes"
echo "🔗 Check status: https://vercel.com/dashboard"
echo ""

# ==========================================
# ANDROID DEPLOYMENT PREPARATION
# ==========================================
echo "📱 Step 2: Preparing Android build..."
echo ""
echo "ℹ️  To build Android app, run these commands:"
echo ""
echo "   ./build-for-mobile.sh"
echo "   npx cap sync android"
echo "   npx cap open android"
echo ""
echo "✅ Then build APK in Android Studio"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for Vercel deployment (1-3 minutes)"
echo "   2. Run Android build commands above"
echo "   3. Build APK in Android Studio"

