package com.cleanshift.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int NOTIFICATION_REQUEST_CODE = 1001;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable third-party cookies for cross-origin authentication
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptThirdPartyCookies(
            this.bridge.getWebView(), 
            true
        );
        
        // Register the notification permission plugin
        registerPlugin(NotificationPermissionPlugin.class);
        
        // Auto-request notification permission on app launch (Android 13+)
        requestNotificationPermission();
    }
    
    private void requestNotificationPermission() {
        // Only for Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) 
                != PackageManager.PERMISSION_GRANTED) {
                // Request permission
                ActivityCompat.requestPermissions(
                    this, 
                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, 
                    NOTIFICATION_REQUEST_CODE
                );
            }
        }
        // For Android < 13, notifications are enabled by default, no request needed
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == NOTIFICATION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted
                System.out.println("✅ Notification permission granted");
            } else {
                // Permission denied
                System.out.println("❌ Notification permission denied");
            }
        }
    }
}
