## Auth Feature

Authentication feature handling user login, registration, and session management.

### Overview

- **Login**: Email/Password + Google OAuth
- **Register**: Email/Password with verification
- **Session**: JWT tokens with refresh mechanism
- **Protection**: Role-based route guards

### Structure

```
auth/
├── components/
│   ├── LoginForm.tsx       # Email/password login form
│   ├── RegisterForm.tsx    # Registration form
│   ├── GoogleButton.tsx    # Google OAuth button
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── pages/
│   ├── LoginPage.tsx       # Login page
│   └── RegisterPage.tsx    # Register page
├── services/
│   └── authService.ts      # API integration
├── hooks/
│   └── useAuth.ts          # Auth state hook
└── README.md               # This file
```

### Usage

#### Login
```typescript
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Use in router
<Route path="/login" element={<LoginPage />} />
```

#### Register
```typescript
import { RegisterPage } from '@/features/auth/pages/RegisterPage';

// Use in router
<Route path="/register" element={<RegisterPage />} />
```

#### Protected Route
```typescript
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
/>
```

#### Use Auth Hook
```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <>
      {isAuthenticated && <span>{user?.email}</span>}
      <button onClick={logout}>Logout</button>
    </>
  );
};
```

### API Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/google/callback` - Google callback
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Current user profile
- `POST /api/v1/auth/logout` - Logout

### Integration

Uses:
- `authStore` - State management
- `useAuth` hook - Custom React Query hook
- `authService` - API calls
- shadcn/ui `Button`, `Input`, `Form` components
