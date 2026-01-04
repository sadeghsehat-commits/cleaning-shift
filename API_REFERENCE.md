# API Reference

All API endpoints require authentication via JWT token stored in cookies (except registration).

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "admin" | "operator" | "owner" | "cleaner",
  "phone": "optional-phone-number"
}
```

**Response:** User object with JWT token in cookie

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** User object with JWT token in cookie

### POST /api/auth/logout
Logout current user.

**Response:** Success message

### GET /api/auth/me
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "phone": "phone-number"
  }
}
```

## Shift Endpoints

### GET /api/shifts
Get shifts. Supports query parameters:
- `month` - Filter by month (YYYY-MM format)
- `cleanerId` - Filter by cleaner ID

**Response:**
```json
{
  "shifts": [
    {
      "_id": "shift-id",
      "apartment": { "name": "Apt 1", "address": "123 Main St" },
      "cleaner": { "name": "Cleaner Name", "email": "cleaner@example.com" },
      "scheduledDate": "2024-01-15T00:00:00.000Z",
      "scheduledStartTime": "2024-01-15T09:00:00.000Z",
      "status": "scheduled",
      ...
    }
  ]
}
```

### POST /api/shifts
Create a new shift. (Admin, Operator, Owner only)

**Request Body:**
```json
{
  "apartment": "apartment-id",
  "cleaner": "cleaner-id",
  "scheduledDate": "2024-01-15",
  "scheduledStartTime": "2024-01-15T09:00:00.000Z",
  "scheduledEndTime": "2024-01-15T11:00:00.000Z",
  "notes": "Optional notes"
}
```

### GET /api/shifts/[id]
Get shift details.

### PATCH /api/shifts/[id]
Update shift. Cleaners can update their own shifts.

**Request Body:**
```json
{
  "actualStartTime": "2024-01-15T09:05:00.000Z",
  "actualEndTime": "2024-01-15T11:00:00.000Z",
  "status": "completed",
  "notes": "Updated notes"
}
```

### DELETE /api/shifts/[id]
Delete shift. (Admin, Operator only)

### POST /api/shifts/[id]/time-change
Request time change. (Operator only)

**Request Body:**
```json
{
  "newStartTime": "2024-01-15T10:00:00.000Z",
  "newEndTime": "2024-01-15T12:00:00.000Z",
  "reason": "Reason for change"
}
```

### PATCH /api/shifts/[id]/time-change
Approve/reject time change. (Admin, Owner only)

**Request Body:**
```json
{
  "status": "approved" | "rejected"
}
```

### POST /api/shifts/[id]/problems
Report a problem. (Operator only)

**Request Body:**
```json
{
  "description": "Problem description",
  "type": "issue" | "forgotten_item"
}
```

## Apartment Endpoints

### GET /api/apartments
Get apartments. Owners see only their own.

**Response:**
```json
{
  "apartments": [
    {
      "_id": "apartment-id",
      "name": "Apartment Name",
      "address": "123 Main St",
      "owner": { "name": "Owner Name", "email": "owner@example.com" }
    }
  ]
}
```

### POST /api/apartments
Create apartment. (Admin, Operator, Owner only)

**Request Body:**
```json
{
  "name": "Apartment Name",
  "address": "123 Main St",
  "description": "Optional description",
  "owner": "owner-id" // Optional, defaults to current user for owners
}
```

## User Endpoints

### GET /api/users
Get users. (Admin, Operator only)

**Query Parameters:**
- `role` - Filter by role

**Response:**
```json
{
  "users": [
    {
      "_id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "cleaner",
      "phone": "phone-number"
    }
  ]
}
```

## Notification Endpoints

### GET /api/notifications
Get user's notifications.

**Response:**
```json
{
  "notifications": [
    {
      "_id": "notification-id",
      "type": "shift_assigned",
      "title": "New Cleaning Shift Assigned",
      "message": "You have been assigned a new cleaning shift.",
      "read": false,
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

### PATCH /api/notifications
Mark notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  "read": true
}
```

## History Endpoints

### GET /api/history
Get cleaning history.

**Query Parameters:**
- `startDate` - Filter from date
- `endDate` - Filter to date
- `apartmentId` - Filter by apartment
- `cleanerId` - Filter by cleaner

**Response:**
```json
{
  "shifts": [
    {
      "_id": "shift-id",
      "apartment": { "name": "Apt 1", "address": "123 Main St" },
      "cleaner": { "name": "Cleaner Name" },
      "actualStartTime": "2024-01-15T09:00:00.000Z",
      "actualEndTime": "2024-01-15T11:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

