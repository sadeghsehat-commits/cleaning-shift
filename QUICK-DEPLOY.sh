#!/bin/bash

# Quick Deployment Script
# This script commits and pushes changes to GitHub (triggers Vercel deployment)

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Add all changes
echo "📦 Adding files..."
git add .

# Commit with message
echo "💾 Committing changes..."
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"

# Push to GitHub (triggers Vercel deployment)
echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Deployment started!"
echo "📱 Vercel will automatically deploy in 1-3 minutes"
echo "🔗 Check status: https://vercel.com/dashboard"

