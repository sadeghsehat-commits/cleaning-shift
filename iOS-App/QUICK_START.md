# iOS App Quick Start Guide 🚀

## What I Created

I've created a **complete iOS app structure** that connects to your existing backend API. The app includes:

✅ **Authentication** (Login/Register)  
✅ **Dashboard** with calendar  
✅ **Shifts** viewing  
✅ **Notifications**  
✅ **Profile** page  

## How to Use It

### Option 1: Create New Xcode Project (Recommended)

1. **Open Xcode**
2. **File** → **New** → **Project**
3. Choose **iOS** → **App**
4. Fill in:
   - Product Name: `CleaningShiftManager`
   - Interface: **SwiftUI**
   - Language: **Swift**
5. Click **Create**

6. **Delete** the default files Xcode created:
   - Delete `ContentView.swift`

7. **Add the files I created:**
   - Drag the entire `CleaningShiftManager` folder from `iOS-App/` into your Xcode project
   - Make sure "Copy items if needed" is checked
   - Select your app target

8. **Update API URL:**
   - Open `Services/APIService.swift`
   - Change `baseURL` to your backend URL:
     ```swift
     static let baseURL = "https://your-app.vercel.app"
     ```

9. **Build and Run:**
   - Select iPhone Simulator or your device
   - Press ⌘R

### Option 2: Use Existing Project

If you already have an Xcode project:

1. Copy all files from `iOS-App/CleaningShiftManager/` into your project
2. Update `APIService.swift` with your backend URL
3. Build and run

## Important: Update API URL

**Before running**, you MUST update the API URL in `Services/APIService.swift`:

```swift
// Change this line:
static let baseURL = "https://your-app.vercel.app"

// To your actual backend URL, for example:
static let baseURL = "https://cleaning-manager.vercel.app"
```

## What's Included

### Models
- `User.swift` - User model
- `Shift.swift` - Shift model with all fields
- `Apartment.swift` - Apartment model
- `Notification.swift` - Notification model

### Services
- `APIService.swift` - Handles all API calls
- `AuthService.swift` - Manages authentication state

### Views
- `LoginView.swift` - Login screen
- `RegisterView.swift` - Registration screen
- `DashboardView.swift` - Main dashboard with tabs
- `CalendarView.swift` - Calendar with shifts
- `ShiftsView.swift` - List of shifts
- `ShiftDetailView.swift` - Shift details
- `NotificationsView.swift` - Notifications list
- `ShiftCard.swift` - Reusable shift card component

## Features Working

✅ Login/Register  
✅ View shifts  
✅ View notifications  
✅ Calendar view  
✅ Shift details  
✅ Profile/logout  

## Features to Add (Future)

- Create new shift
- Edit shift
- Confirm shift (for operators)
- Request time change
- Create/edit apartments
- Push notifications (APNs)

## Testing

1. **Test on Simulator:**
   - Select iPhone Simulator
   - Run the app
   - Login with your credentials

2. **Test on Real Device:**
   - Connect iPhone via USB
   - Select device in Xcode
   - Run the app

## Troubleshooting

### "Cannot connect to server"
- Check `baseURL` in `APIService.swift`
- Make sure backend is running
- Test API in browser first

### Build errors
- Clean build: Product → Clean Build Folder (⇧⌘K)
- Check iOS deployment target (should be 16.0+)

### Authentication not working
- Verify cookies are enabled
- Check backend CORS settings
- Test login in browser first

## Next Steps

1. **Customize UI** - Change colors, fonts, layouts
2. **Add Create/Edit** - Implement shift creation
3. **Push Notifications** - Set up APNs
4. **App Store** - Prepare for submission

## Need Help?

- See `SETUP_INSTRUCTIONS.md` for detailed setup
- Check Xcode console for errors
- Test API endpoints in browser/Postman first


