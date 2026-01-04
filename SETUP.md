# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/cleaning-manager
   JWT_SECRET=your-secret-key-change-in-production-use-a-long-random-string
   NODE_ENV=development
   ```

   For MongoDB Atlas (cloud):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleaning-manager
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Create First Admin User**
   
   Option A - Using curl:
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

   Option B - Using a REST client (Postman, Insomnia, etc.):
   - URL: `POST http://localhost:3000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "password123",
       "name": "Admin User",
       "role": "admin"
     }
     ```

6. **Login**
   - Open http://localhost:3000
   - Use the admin credentials you just created

## Creating PWA Icons

Before deploying, create the following icon files in the `public/` directory:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

## Production Build

```bash
npm run build
npm start
```

## User Roles

- **admin**: Full system access
- **operator**: Can manage shifts, request time changes, report problems
- **owner**: Can manage their apartments and shifts
- **cleaner**: Can view and complete their assigned shifts

## Next Steps

1. Create users for each role
2. Create apartments
3. Create cleaning shifts
4. Test the notification system
5. Test time change requests
6. Test problem reporting

