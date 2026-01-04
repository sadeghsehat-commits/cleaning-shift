package com.cleaningmanager.app

/**
 * Configuration file for PWA URL
 * 
 * Update PWA_URL to point to your deployed application:
 * - Development: "http://10.0.2.2:3000" (Android Emulator)
 * - Development (Physical Device): "http://YOUR_LOCAL_IP:3000" (e.g., "http://192.168.1.100:3000")
 * - Production: "https://your-domain.vercel.app" or your production URL
 */
object Config {
    // Change this to your PWA URL
    const val PWA_URL = "https://your-app.vercel.app"
    
    // Alternative URLs for different environments:
    // const val PWA_URL = "http://10.0.2.2:3000"  // Android Emulator
    // const val PWA_URL = "http://192.168.1.100:3000"  // Local network (replace with your IP)
    // const val PWA_URL = "https://cleaning-shift-manager.vercel.app"  // Production
}


