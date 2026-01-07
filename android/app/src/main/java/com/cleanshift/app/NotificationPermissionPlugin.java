package com.cleanshift.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "NotificationPermission",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        )
    }
)
public class NotificationPermissionPlugin extends Plugin {
    
    private static final int NOTIFICATION_REQUEST_CODE = 1001;
    
    @PluginMethod
    public void requestPermission(PluginCall call) {
        // On Android 13+ (API 33+), we need to request POST_NOTIFICATIONS permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) 
                == PackageManager.PERMISSION_GRANTED) {
                call.resolve();
            } else {
                // Request permission
                ActivityCompat.requestPermissions(
                    getActivity(), 
                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, 
                    NOTIFICATION_REQUEST_CODE
                );
                // Note: The result will be handled in onRequestPermissionsResult
                call.resolve(); // Resolve immediately for now
            }
        } else {
            // For Android < 13, notifications are enabled by default
            call.resolve();
        }
    }
    
    @PluginMethod
    public void checkPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted = ContextCompat.checkSelfPermission(
                getContext(), 
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED;
            call.resolve(new com.getcapacitor.JSObject().put("granted", granted));
        } else {
            // For Android < 13, notifications are enabled by default
            call.resolve(new com.getcapacitor.JSObject().put("granted", true));
        }
    }
}

