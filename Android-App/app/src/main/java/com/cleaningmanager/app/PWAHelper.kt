package com.cleaningmanager.app

import android.content.Context
import android.content.Intent

/**
 * Helper class to launch PWA Activity from anywhere in the app
 */
object PWAHelper {
    /**
     * Launch the PWA Activity
     * 
     * Usage:
     * PWAHelper.launchPWA(context)
     */
    fun launchPWA(context: Context) {
        val intent = Intent(context, PWAActivity::class.java)
        context.startActivity(intent)
    }
}


