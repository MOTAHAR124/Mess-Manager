## Quick Start Testing Guide

**Time**: 15 minutes to see the app running end-to-end

---

## Step 1: Backend Setup (5 minutes)

### 1.1 Environment
```bash
cd meso/server
cp .env.example .env
```

Verify these in `.env`:
```
DATABASE_URL=postgresql://meso_user:meso_password@localhost:5432/meso_db
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_change_in_prod
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
API_PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 1.2 Dependencies & Database
```bash
npm install
docker-compose up -d
npx prisma migrate dev --name init
```

### 1.3 Seed Test Data
```bash
npm run prisma:seed
```

Expected output:
```
✅ Database seed completed successfully!

Test Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Manager:
  Email: manager@test.com
  Password: password123

Member:
  Email: member@test.com
  Password: password123
```

### 1.4 Start Backend
```bash
npm run start:dev
```

Expected:
```
[Nest] 12345 - 04/04/2026, 4:00:00 PM LOG [NestFactory] Nest application successfully started +145ms
```

Backend is running: `http://localhost:3000/api/v1`

---

## Step 2: Frontend Setup (5 minutes)

### 2.1 Environment
```bash
cd meso/client
cp .env.example .env
```

Verify `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=MESO
```

### 2.2 Dependencies
```bash
npm install
```

### 2.3 Start Frontend
```bash
npm run dev
```

Expected:
```
VITE v5.x.x build 0.00s

➜ Local: http://localhost:5173/
```

Frontend is running: `http://localhost:5173`

---

## Step 3: Test Login Flow (5 minutes)

### 3.1 Navigate to Login
1. Open http://localhost:5173/login
2. You should see the login page with:
   - "MESO - Mess Management System" header
   - Email/password form
   - "Sign in with Google" button
   - "Sign up" link
   - Test credentials box (dev only)

### 3.2 Test Login
```
Email: manager@test.com
Password: password123
```

Click "Sign In"

Expected:
1. Loading spinner appears
2. API call to `POST /api/v1/auth/login`
3. Success toast notification
4. Redirected to `/dashboard`
5. User name displayed in navbar

### 3.3 Test Registration
1. Click "Sign up" link
2. Fill form:
   ```
   First Name: Test
   Last Name: User
   Email: testuser@example.com
   Password: TestPassword123
   Confirm: TestPassword123
   ```
3. Click "Create Account"
4. Should redirect to dashboard automatically
5. New user created in database

### 3.4 Verify Database
```bash
# In another terminal
cd server
npx prisma studio

# Browse User table - should see new user
```

---

## Step 4: Test Dashboard

### 4.1 Navigate to Dashboard
1. Already on `/dashboard` after login
2. Should see:
   - Stats cards (members count, meals, costs, deposits)
   - Members table with pagination
   - Recent activities
   - Balance information

### 4.2 Check Console Logs
Open browser DevTools (F12):
1. Network tab → check API calls
2. Console tab → check store logs
3. Application tab → check localStorage

Expected in localStorage:
```json
{
  "meso-auth-store": {
    "user": { "id": "...", "email": "manager@test.com" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "isAuthenticated": true
  }
}
```

### 4.3 Test Logout
1. Click user menu (top right)
2. Click "Logout"
3. Redirected to login page
4. localStorage cleared
5. API call to `POST /api/v1/auth/logout`

---

## Step 5: Verify Stores

### 5.1 Check Zustand Store State
```javascript
// In browser console
import { useAuthStore } from '@/stores/authStore'
const store = useAuthStore()
console.log(store.getState())

// Should show:
// {
//   user: {...},
//   accessToken: "...",
//   isAuthenticated: true,
//   ...
// }
```

### 5.2 Check Mess Store
```javascript
import { useMessStore } from '@/stores/messStore'
const store = useMessStore()
console.log(store.getState())
// Should show populated with mess data after loading
```

---

## Step 6: API Testing

### 6.1 Test Auth Endpoints
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "Password123",
    "firstName": "New",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "password123"
  }'

# Get profile (with token)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6.2 Test Dashboard Endpoints
```bash
# Admin stats
curl -X GET http://localhost:3000/api/v1/dashboard/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Manager summary
curl -X GET http://localhost:3000/api/v1/dashboard/manager/summary?messId=MESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000
kill -9 PID  # Replace PID with process ID

# Or change port in .env
API_PORT=3001
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker-compose down
docker-compose up -d
```

### Frontend Won't Start
```bash
# Check if port 5173 is in use
lsof -i :5173
kill -9 PID

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Login Fails with CORS Error
```
✗ Check CORS_ORIGIN in server .env
✗ Should be: http://localhost:5173
✗ Restart backend after changing
```

### "Cannot find module" errors
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

---

## Success Criteria

You've successfully tested when you can:

✅ Register a new user  
✅ Login with email/password  
✅ See dashboard after login  
✅ See user profile in navbar  
✅ Logout and return to login  
✅ See test data (members, meals, etc.)  
✅ No console errors  
✅ API calls visible in Network tab  

---

## Files to Monitor

| File | Purpose | Watch For |
|------|---------|-----------|
| `server/src/modules/auth/` | Auth logic | Errors during login |
| `client/src/features/auth/` | Auth UI | Form validation |
| `client/src/stores/authStore.ts` | Auth state | Token persistence |
| `server/logs/` | Server logs | API errors |
| Browser DevTools Console | Errors | Error messages |

---

## Next Steps After Testing

1. ✅ Verify both register and login work
2. ✅ Check test data is present
3. ✅ Confirm store persistence works
4. ✅ Test API endpoints with curl
5. → Proceed to feature development

---

## Commands Reference

```bash
# Backend
cd server
npm install
docker-compose up -d
npx prisma migrate dev
npm run prisma:seed
npm run start:dev

# Frontend  
cd client
npm install
npm run dev

# Testing
npm run test          # When available
npm run test:e2e      # When available

# Database
npx prisma studio    # Visual DB browser
npx prisma db seed   # Reseed data
```

---

**Ready? Start from Step 1!** 🚀
