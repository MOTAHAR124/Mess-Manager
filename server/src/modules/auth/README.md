# Authentication Module

## Overview
The Authentication module handles user login, registration, and session management. It supports multiple authentication strategies:
- **Google OAuth 2.0** - Third-party authentication
- **Email/Password** - Local authentication with bcrypt hashing
- **JWT** - Token-based session management

## Purpose
This module is the entry point for all user authentication. It manages:
1. User registration and email verification
2. Login with email/password or Google OAuth
3. JWT token generation and validation
4. Password reset functionality
5. Role-based access control (RBAC) with L1 caching

## Architecture

```
auth/
├── controllers/
│   └── auth.controller.ts        # HTTP request handlers
├── services/
│   ├── auth.service.ts           # Authentication business logic
│   └── token.service.ts          # JWT token management
├── repositories/
│   └── auth.repository.ts        # Database operations
├── strategies/
│   ├── jwt.strategy.ts           # JWT validation
│   ├── google.strategy.ts        # Google OAuth flow
│   └── local.strategy.ts         # Email/Password validation
├── guards/
│   ├── jwt.guard.ts              # JWT verification with L1 cache
│   ├── google.guard.ts           # Google OAuth guard
│   └── role.guard.ts             # Role-based access with L1 cache
├── decorators/
│   ├── user.decorator.ts         # Extract user from request
│   └── roles.decorator.ts        # Mark required roles
├── dto/
│   ├── login.dto.ts              # Login request/response
│   ├── register.dto.ts           # Registration request/response
│   ├── auth-response.dto.ts      # Token response
│   └── verify-email.dto.ts       # Email verification
└── auth.module.ts                # Module definition
```

## Key Features

### 1. User Registration
- Email validation
- Password strength validation (min 8 chars, uppercase, number, special char)
- Account creation with automatic email verification link
- Returns access and refresh tokens

**Endpoint:**
```
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Email/Password Login
- Email and password validation
- Bcrypt password verification
- JWT token generation
- Refresh token creation

**Endpoint:**
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### 3. Google OAuth 2.0
- Seamless Google authentication
- Automatic user creation if first login
- Returns JWT tokens

**Endpoint:**
```
GET /api/v1/auth/google
POST /api/v1/auth/google/callback
```

### 4. Email Verification
- Send verification link to email
- Verify email with token
- Only verified accounts can fully access the app

**Endpoints:**
```
POST /api/v1/auth/send-verification-email
POST /api/v1/auth/verify-email/:token
```

### 5. Token Management
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- Token refresh endpoint for seamless UX

**Endpoints:**
```
POST /api/v1/auth/refresh
GET /api/v1/auth/me
POST /api/v1/auth/logout
```

## L1 Cache Implementation

The module uses **L1 Cache (in-memory)** for:
1. **JWT Guard**: Cache decoded JWT for 5 minutes to skip validation
2. **Role Guard**: Cache user roles for 10 minutes to avoid database queries

**Benefits:**
- Massive performance improvement
- Reduced database load
- Sub-millisecond guard checks
- Cache invalidation on logout

**Implementation:**
```typescript
// L1 Cache with TTL
private cache = new Map<string, { data: any; expiry: number }>();

isTokenValid(token: string): boolean {
  const cached = this.cache.get(token);
  if (cached && cached.expiry > Date.now()) {
    return cached.data; // No DB hit!
  }
  // DB hit only on cache miss
}
```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL if OAuth
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP,
  refresh_token_hash VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  mess_id UUID,  -- Role is per-mess
  assigned_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### 1. Protect Routes with JWT
```typescript
@UseGuards(JwtAuthGuard)
@Get('/profile')
getProfile(@User() user: UserEntity) {
  return user;
}
```

### 2. Role-Based Access
```typescript
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('manager')
@Post('/invite-member')
inviteMember(@Body() dto: InviteMemberDto) {
  // Only managers can invite
}
```

### 3. Public Routes
```typescript
@Post('/register')
register(@Body() dto: RegisterDto) {
  // No guards needed
}
```

## Error Handling

All endpoints return standardized error responses:

```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "timestamp": "2024-04-04T10:30:00Z"
  }
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_ALREADY_EXISTS` - Email already registered
- `INVALID_TOKEN` - Expired or invalid token
- `EMAIL_NOT_VERIFIED` - Account not verified
- `FORBIDDEN` - Insufficient permissions

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds 10
2. **JWT Secrets**: Minimum 32 characters, different for access/refresh
3. **Token Expiration**: Access tokens expire in 15 minutes
4. **CORS**: Restricted to frontend origin only
5. **Rate Limiting**: Max 5 login attempts per hour per IP
6. **HTTPS Only**: Cookies set with secure flag in production

## Testing

```bash
# Unit tests
npm run test:auth

# Integration tests
npm run test:integration -- auth

# End-to-end tests
npm run test:e2e -- auth
```

## Dependencies

- `@nestjs/passport` - Authentication strategies
- `@nestjs/jwt` - JWT token handling
- `bcryptjs` - Password hashing
- `passport-google-oauth20` - Google OAuth
- `nodemailer` - Email sending

## Related Modules

- **Users Module**: User profile management
- **Mess Module**: Group/mess management
- **Reports Module**: Audit logs of auth events

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Facebook, GitHub)
- [ ] Single Sign-On (SSO)
- [ ] LDAP/Active Directory support
- [ ] Biometric authentication
