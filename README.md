# Cleaning Shift Manager

A Progressive Web App (PWA) for managing cleaning shifts for apartments. This application allows administrators, operators, owners, and cleaners to coordinate cleaning schedules efficiently.

## Features

- **Role-based Access Control**: Admin, Operator, Owner, and Cleaner roles with appropriate permissions
- **Calendar System**: Visual calendar for viewing and managing cleaning shifts
- **Shift Management**: Create, view, and manage cleaning shifts
- **Notifications**: Real-time notifications for shift assignments and time change requests
- **Time Change Requests**: Operators can request time changes, approved by owners/admins
- **Problem Reporting**: Operators can report issues or forgotten items
- **Cleaning History**: Track completed cleaning operations
- **Mobile-First Design**: Optimized for smartphone browsers
- **PWA Support**: Installable as a mobile app

## Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based authentication
- **PWA**: Service Worker and Web App Manifest

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd Mahdiamooyee
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your MongoDB connection string and Google Maps API key:
```
MONGODB_URI=mongodb://localhost:27017/cleaning-manager
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager

JWT_SECRET=your-secret-key-change-in-production-use-a-long-random-string
NODE_ENV=development

# Google Maps API Key (for address autocomplete)
# Get your API key from: https://console.cloud.google.com/google/maps-apis
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Creating the First Admin User

You can create users through the registration API or directly in MongoDB. To create an admin user via API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## User Roles

### Administrator
- Full access to all features
- Can manage users, apartments, and shifts
- Can approve/reject time change requests
- Receives notifications for all important events

### Operator
- Can create and manage shifts
- Can request time changes
- Can report problems (issues or forgotten items)
- Can view all shifts and history

### Owner
- Can create apartments
- Can create shifts for their apartments
- Can approve/reject time change requests for their apartments
- Can view shifts and history for their apartments

### Cleaner
- Can view only their assigned shifts
- Can start and complete cleaning shifts
- Receives notifications when assigned to shifts
- Can view their cleaning history

## Project Structure

```
Mahdiamooyee/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/login page
├── components/            # React components
├── lib/                   # Utility functions
├── models/                # MongoDB models
├── public/                # Static assets
└── package.json           # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Shifts
- `GET /api/shifts` - Get shifts (with optional month filter)
- `POST /api/shifts` - Create new shift
- `GET /api/shifts/[id]` - Get shift details
- `PATCH /api/shifts/[id]` - Update shift
- `DELETE /api/shifts/[id]` - Delete shift
- `POST /api/shifts/[id]/time-change` - Request time change
- `PATCH /api/shifts/[id]/time-change` - Approve/reject time change
- `POST /api/shifts/[id]/problems` - Report problem

### Apartments
- `GET /api/apartments` - Get apartments
- `POST /api/apartments` - Create apartment

### Users
- `GET /api/users` - Get users (admin/operator only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notifications as read

### History
- `GET /api/history` - Get cleaning history

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## PWA Installation

The app is configured as a Progressive Web App. Users can install it on their smartphones:

1. Open the app in a mobile browser
2. Look for the "Add to Home Screen" prompt or use the browser menu
3. The app will be installed and can be launched like a native app

## Future Enhancements

- Native iOS and Android apps (as requested)
- Push notifications
- Offline mode support
- Advanced reporting and analytics
- Multi-language support
- Image uploads for problem reports

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.

