# iOS App Setup Instructions 📱

## Quick Start

### 1. Create Xcode Project

1. **Open Xcode**
2. **File** → **New** → **Project**
3. Select **iOS** → **App**
4. Fill in:
   - **Product Name**: `CleaningShiftManager`
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None (we'll use the files provided)
5. Click **Next** and choose a location
6. Click **Create**

### 2. Add Files to Project

1. **Delete** the default `ContentView.swift` that Xcode created
2. **Copy all files** from this `iOS-App/CleaningShiftManager` folder into your Xcode project:
   - Drag and drop the folders into Xcode
   - Make sure "Copy items if needed" is checked
   - Select your app target

### 3. Update API Base URL

1. Open `Services/APIService.swift`
2. Find this line:
   ```swift
   static let baseURL = "https://your-app.vercel.app"
   ```
3. Replace with your actual backend URL:
   ```swift
   static let baseURL = "https://your-actual-url.vercel.app"
   ```
   Or for local testing:
   ```swift
   static let baseURL = "http://192.168.1.3:3000"
   ```

### 4. Configure Info.plist

1. Open `Info.plist` in Xcode
2. Make sure it includes the network security settings (already included in the provided file)
3. For local development, you may need to add your local IP to exception domains

### 5. Build and Run

1. Select your iPhone or Simulator
2. Press **⌘R** or click the **Play** button
3. The app should build and launch!

## Project Structure

```
CleaningShiftManager/
├── App/
│   └── CleaningShiftManagerApp.swift
├── Models/
│   ├── User.swift
│   ├── Shift.swift
│   ├── Apartment.swift
│   └── Notification.swift
├── Services/
│   ├── APIService.swift
│   └── AuthService.swift
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── RegisterView.swift
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   ├── CalendarView.swift
│   │   ├── ShiftsView.swift
│   │   ├── ShiftDetailView.swift
│   │   └── NotificationsView.swift
│   └── Components/
│       └── ShiftCard.swift
└── Utilities/
    └── Extensions.swift
```

## Features Included

✅ **Authentication**
- Login
- Registration
- Auto-login check

✅ **Dashboard**
- Calendar view
- Shifts list
- Notifications
- Profile

✅ **Shifts**
- View shifts
- Shift details
- Filter by date

✅ **Notifications**
- View notifications
- Mark as read
- Pull to refresh

## Next Steps to Complete

### 1. Add Create/Edit Shift
- Create `CreateShiftView.swift`
- Create `EditShiftView.swift`
- Add navigation from shifts list

### 2. Add Push Notifications
- Set up APNs (Apple Push Notification service)
- Register device token
- Handle remote notifications

### 3. Add Offline Support
- Use Core Data for local storage
- Sync when online

### 4. Polish UI
- Add app icon
- Customize colors
- Add animations
- Improve layouts

### 5. App Store Preparation
- Add app icon (1024x1024)
- Add screenshots
- Write app description
- Set up App Store Connect

## Testing

### Test on Simulator
1. Select iPhone Simulator
2. Run the app
3. Test all features

### Test on Real Device
1. Connect iPhone via USB
2. Select your device in Xcode
3. Trust the developer certificate if prompted
4. Run the app

## Troubleshooting

### Build Errors
- **Clean Build Folder**: Product → Clean Build Folder (⇧⌘K)
- **Check Swift version**: Should be 5.9+
- **Check iOS deployment target**: Should be 16.0+

### API Connection Issues
- Verify `baseURL` in `APIService.swift`
- Check backend is running
- Test API in browser first
- Check network permissions

### Authentication Issues
- Verify cookies are being sent
- Check backend CORS settings
- Test login in browser first

## API Endpoints Used

The app connects to these endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/shifts`
- `GET /api/shifts/[id]`
- `GET /api/notifications`
- `PATCH /api/notifications`
- `GET /api/apartments`
- `GET /api/users`

All endpoints use cookie-based authentication (same as web app).

## Need Help?

- Check Xcode console for errors
- Test API endpoints in browser/Postman first
- Verify backend is accessible
- Check network logs in Xcode


