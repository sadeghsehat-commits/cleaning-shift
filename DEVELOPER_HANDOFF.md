# Developer Handoff Document

## Project Overview

**Cleaning Shift Manager** - A Progressive Web App (PWA) for managing cleaning shifts for apartments. The application enables administrators, operators, owners, cleaners, and viewers to coordinate cleaning schedules efficiently.

---

## Architecture

### Application Type
- **Full-stack Next.js 14 application** using the App Router
- **Progressive Web App (PWA)** with service worker support
- **Server-side rendering (SSR)** and **API routes** architecture
- **Mobile-first design** optimized for smartphone browsers

### Project Structure
```
Mahdiamooyee/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── shifts/       # Shift management
│   │   ├── apartments/   # Apartment management
│   │   ├── users/        # User management
│   │   ├── notifications/ # Notification system
│   │   ├── history/      # Cleaning history
│   │   ├── cleaning-schedule/ # Schedule management
│   │   ├── push/         # Push notification subscriptions
│   │   ├── reports/      # Reporting endpoints
│   │   └── photos/       # Photo management
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Authentication page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable React components
├── lib/                  # Utility functions
│   ├── auth.ts          # JWT authentication helpers
│   ├── mongodb.ts       # Database connection
│   ├── push-notifications.ts # Push notification service
│   └── i18n.ts          # Internationalization
├── models/               # MongoDB Mongoose models
│   ├── User.ts
│   ├── Apartment.ts
│   ├── CleaningShift.ts
│   ├── CleaningSchedule.ts
│   ├── Notification.ts
│   └── PushSubscription.ts
├── messages/             # i18n translation files
│   ├── en.json, ar.json, it.json, uk.json
├── contexts/             # React contexts
├── types/                # TypeScript type definitions
└── public/               # Static assets & PWA files
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (React 18.2.0)
- **Language**: TypeScript 5.3.0
- **Styling**: Tailwind CSS 3.3.6
- **State Management**: Zustand 4.4.7
- **UI Components**: 
  - React Calendar 4.7.0
  - React Hot Toast 2.4.1
- **Internationalization**: next-intl 4.6.1
- **Date Handling**: date-fns 2.30.0

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: MongoDB with Mongoose 8.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Push Notifications**: web-push 3.6.7

### Development Tools
- **Linting**: ESLint 9.0.0 with Next.js config
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

### Mobile Apps
- **Android**: Kotlin-based native app (in `Android-App/`)
- **iOS**: Swift-based native app (in `iOS-App/`)

---

## Authentication Method

### Implementation
- **JWT (JSON Web Tokens)** stored in **HTTP-only cookies**
- **Token expiration**: 7 days
- **Password hashing**: bcryptjs with salt rounds of 10

### Authentication Flow
1. User submits credentials via `/api/auth/login` or `/api/auth/register`
2. Server validates credentials and generates JWT token
3. Token is set in HTTP-only cookie with:
   - `httpOnly: true` (prevents XSS)
   - `secure: true` (HTTPS only in production)
   - `sameSite: 'lax'`
   - `maxAge: 7 days`

### Protected Routes
- All API endpoints (except `/api/auth/register`) require authentication
- Authentication is verified via `getCurrentUser()` helper function
- Role-based access control via `requireAuth(roles[])` middleware

### User Roles
- **admin**: Full system access
- **operator**: Can create/manage shifts, request time changes, report problems
- **owner**: Can manage their apartments and shifts
- **cleaner**: Can view and complete assigned shifts
- **viewer**: Read-only access

### Role Registration Passwords
- Admin: `25Dicembre@2025`
- Owner: `26Dicembre@2025`
- Operator: `27Dicembre@2025`
- Viewer: No password required

---

## API Endpoints

### Base URL
All endpoints are prefixed with `/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Shift Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/shifts` | Get shifts (supports `month`, `cleanerId` query params) | Yes | All |
| POST | `/api/shifts` | Create new shift | Yes | admin, operator, owner |
| GET | `/api/shifts/[id]` | Get shift details | Yes | All |
| PATCH | `/api/shifts/[id]` | Update shift | Yes | admin, operator, owner, cleaner (own shifts) |
| DELETE | `/api/shifts/[id]` | Delete shift | Yes | admin, operator |
| POST | `/api/shifts/[id]/time-change` | Request time change | Yes | operator |
| PATCH | `/api/shifts/[id]/time-change` | Approve/reject time change | Yes | admin, owner |
| POST | `/api/shifts/[id]/time-change/confirm` | Confirm time change | Yes | cleaner |
| POST | `/api/shifts/[id]/confirm` | Confirm shift completion | Yes | cleaner |
| POST | `/api/shifts/[id]/problems` | Report problem | Yes | operator |
| GET | `/api/shifts/[id]/instruction-photos` | Get instruction photos | Yes | All |
| DELETE | `/api/shifts/delete-all` | Delete all shifts (admin only) | Yes | admin |

### Apartment Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/apartments` | Get apartments (owners see only their own) | Yes | All |
| POST | `/api/apartments` | Create apartment | Yes | admin, operator, owner |
| GET | `/api/apartments/[id]` | Get apartment details | Yes | All |
| PATCH | `/api/apartments/[id]` | Update apartment | Yes | admin, operator, owner |
| DELETE | `/api/apartments/[id]` | Delete apartment | Yes | admin, operator |

### User Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users` | Get users (supports `role` query param) | Yes | admin, operator |
| GET | `/api/users/[id]` | Get user details | Yes | admin, operator |
| PATCH | `/api/users/[id]` | Update user | Yes | admin, operator |
| DELETE | `/api/users/[id]` | Delete user | Yes | admin |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user's notifications | Yes |
| PATCH | `/api/notifications` | Mark notifications as read | Yes |
| DELETE | `/api/notifications/delete-all` | Delete all notifications | Yes |
| POST | `/api/notifications/cleanup` | Cleanup old notifications | Yes |

### History Endpoints

| Method | Endpoint | Description | Auth Required | Query Params |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/history` | Get cleaning history | Yes | `startDate`, `endDate`, `apartmentId`, `cleanerId` |

### Cleaning Schedule Endpoints

| Method | Endpoint | Description | Auth Required | Query Params |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/cleaning-schedule` | Get cleaning schedule | Yes | `apartmentId`, `year`, `month` |
| POST | `/api/cleaning-schedule` | Create/update schedule | Yes | - |
| PATCH | `/api/cleaning-schedule/update-guest-count` | Update guest count | Yes | - |

### Push Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/push/subscribe` | Subscribe to push notifications | Yes |

### Report Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/reports/operators` | Get operator reports | Yes | admin, operator |

### Photo Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/photos/cleanup` | Cleanup old photos | Yes |

---

## Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/cleaning-manager` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-key-min-32-chars` | ✅ Yes |
| `NODE_ENV` | Environment mode | `production` or `development` | ✅ Yes |

### Optional Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for address autocomplete | `AIzaSy...` | ❌ No |

### Environment Variable Setup

1. **Local Development**: Create `.env.local` in project root
2. **Vercel Deployment**: Add via Vercel Dashboard → Settings → Environment Variables
3. **All environments** (Production, Preview, Development) should have the same variables

### Example `.env.local`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
NODE_ENV=development
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

---

## Database Schema

### Models (MongoDB/Mongoose)

#### User
- `email`: String (unique, required, lowercase)
- `password`: String (hashed, required)
- `name`: String (required)
- `role`: Enum ['admin', 'operator', 'owner', 'cleaner', 'viewer'] (required)
- `phone`: String (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

#### Apartment
- `name`: String (required)
- `address`: String (required)
- `description`: String (optional)
- `owner`: ObjectId (ref: User)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

#### CleaningShift
- `apartment`: ObjectId (ref: Apartment)
- `cleaner`: ObjectId (ref: User)
- `scheduledDate`: Date (required)
- `scheduledStartTime`: Date (required)
- `scheduledEndTime`: Date (required)
- `actualStartTime`: Date (optional)
- `actualEndTime`: Date (optional)
- `status`: Enum ['scheduled', 'in-progress', 'completed', 'cancelled']
- `notes`: String (optional)
- `timeChangeRequest`: Object (optional)
- `problems`: Array (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

#### CleaningSchedule
- `apartment`: ObjectId (ref: Apartment)
- `schedule`: Array of schedule entries
- `guestCount`: Number (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

#### Notification
- `user`: ObjectId (ref: User)
- `type`: String (e.g., 'shift_assigned', 'time_change_request')
- `title`: String (required)
- `message`: String (required)
- `read`: Boolean (default: false)
- `data`: Object (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

#### PushSubscription
- `user`: ObjectId (ref: User)
- `endpoint`: String (required)
- `keys`: Object (p256dh, auth)
- `createdAt`: Date (auto)

---

## Key Features

1. **Role-Based Access Control**: Different permissions for admin, operator, owner, cleaner, and viewer roles
2. **Shift Management**: Create, update, delete, and track cleaning shifts
3. **Time Change Requests**: Operators can request time changes, approved by admins/owners
4. **Problem Reporting**: Operators can report issues or forgotten items
5. **Cleaning History**: Track completed cleaning operations with filtering
6. **Notifications**: Real-time notifications for shift assignments and updates
7. **Push Notifications**: Web push notification support (requires VAPID keys setup)
8. **Internationalization**: Multi-language support (English, Arabic, Italian, Ukrainian)
9. **PWA Support**: Installable as mobile app with service worker
10. **Calendar View**: Visual calendar for viewing and managing shifts
11. **Cleaning Schedule**: Automated schedule management per apartment
12. **Photo Management**: Instruction photos and cleanup functionality

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run development server (network accessible)
npm run dev:network

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Deployment

### Vercel Deployment
- **Platform**: Vercel (recommended)
- **Configuration**: `vercel.json` present
- **Environment Variables**: Must be set in Vercel Dashboard
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Important Notes
- After adding environment variables in Vercel, **redeploy** is required
- MongoDB Atlas connection string must allow Vercel IPs (or use 0.0.0.0/0 for all)
- JWT_SECRET should be a long, random string (minimum 32 characters)

---

## Security Considerations

1. **JWT Tokens**: Stored in HTTP-only cookies to prevent XSS attacks
2. **Password Hashing**: bcryptjs with salt rounds of 10
3. **Role-Based Access**: All endpoints validate user roles
4. **Secure Cookies**: `secure: true` in production (HTTPS only)
5. **Input Validation**: Email normalization (lowercase), required field validation
6. **Role Passwords**: Hardcoded role registration passwords (consider moving to env vars)

---

## Additional Resources

- **API Reference**: See `API_REFERENCE.md`
- **Installation Guide**: See `INSTALLATION_GUIDE.md`
- **Vercel Setup**: See `VERCEL_ENV_VARIABLES.md`
- **MongoDB Setup**: See `MONGODB_ATLAS_SETUP.md`
- **Mobile Apps**: See `MOBILE_APPS_SUMMARY.md`
- **Cron Jobs**: See `CRON_JOBS_SETUP.md`

---

## Contact & Support

For questions or issues, refer to the project documentation or contact the development team.




