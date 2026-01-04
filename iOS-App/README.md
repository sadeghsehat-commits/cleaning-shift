# Cleaning Shift Manager - iOS App 📱

Native iOS application for the Cleaning Shift Manager system.

## Requirements

- Xcode 15.0 or later
- iOS 16.0 or later
- Swift 5.9 or later
- Your backend API deployed (Vercel or other)

## Setup Instructions

### 1. Open the Project

1. Open Xcode
2. File → Open
3. Navigate to the `iOS-App` folder
4. Open `CleaningShiftManager.xcodeproj`

### 2. Configure API Base URL

1. Open `Services/APIService.swift`
2. Update `baseURL` to your deployed backend URL:
   ```swift
   static let baseURL = "https://your-app.vercel.app"
   ```
   Or for local testing:
   ```swift
   static let baseURL = "http://192.168.1.3:3000"
   ```

### 3. Build and Run

1. Select your iPhone or Simulator
2. Press ⌘R or click the Play button
3. The app will build and launch

## Project Structure

```
iOS-App/
├── CleaningShiftManager/
│   ├── App/
│   │   └── CleaningShiftManagerApp.swift    # Main app entry
│   ├── Models/
│   │   ├── User.swift                       # User model
│   │   ├── Shift.swift                      # Shift model
│   │   ├── Apartment.swift                  # Apartment model
│   │   └── Notification.swift               # Notification model
│   ├── Services/
│   │   ├── APIService.swift                 # API communication
│   │   └── AuthService.swift                # Authentication
│   ├── Views/
│   │   ├── Auth/
│   │   │   ├── LoginView.swift              # Login screen
│   │   │   └── RegisterView.swift           # Registration screen
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.swift          # Main dashboard
│   │   │   ├── ShiftsView.swift             # Shifts list
│   │   │   ├── ShiftDetailView.swift        # Shift details
│   │   │   ├── NotificationsView.swift      # Notifications
│   │   │   └── CalendarView.swift           # Calendar
│   │   └── Components/
│   │       └── ShiftCard.swift              # Reusable shift card
│   └── Utilities/
│       └── Extensions.swift                 # Helper extensions
└── CleaningShiftManager.xcodeproj
```

## Features

- ✅ Authentication (Login/Register)
- ✅ Dashboard with calendar
- ✅ View shifts
- ✅ View notifications
- ✅ Shift details
- ✅ Role-based access control
- ✅ Push notifications support

## API Integration

The app connects to your existing Next.js backend API. All endpoints are the same:
- `/api/auth/login`
- `/api/auth/register`
- `/api/shifts`
- `/api/notifications`
- etc.

## Authentication

The app uses cookie-based authentication (same as web app). Cookies are automatically handled by URLSession.

## Next Steps

1. **Customize UI**: Modify colors, fonts, and layouts in the Views
2. **Add Features**: Implement create/edit shift functionality
3. **Push Notifications**: Set up APNs (Apple Push Notification service)
4. **Offline Support**: Add Core Data for offline functionality
5. **App Store**: Prepare for App Store submission

## Testing

- Use the iOS Simulator for quick testing
- Test on a real device for push notifications
- Make sure your backend is accessible from the device

## Troubleshooting

### Can't connect to API
- Check `baseURL` in `APIService.swift`
- Verify backend is running and accessible
- Check network permissions in Info.plist

### Authentication not working
- Verify cookies are being sent (check network logs)
- Make sure backend CORS settings allow your app

### Build errors
- Clean build folder: Product → Clean Build Folder (⇧⌘K)
- Update dependencies if needed


