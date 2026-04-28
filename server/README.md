# MESO Backend - NestJS API

Scalable, modular backend API for Mess Management System using NestJS, PostgreSQL, and Prisma ORM.

## Architecture

### Layered Architecture (SOLID Principles)

```
Request → Controller → Service → Repository → Database
           ↓ ↓        ↓ ↓       ↓ ↓
        Validation  Business  Data
        & Routing   Logic     Access
```

### Module Structure

Each feature module follows this pattern:

```
module/
├── dto/
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *.response.ts
├── controllers/
│   └── *.controller.ts
├── services/
│   └── *.service.ts
├── repositories/
│   └── *.repository.ts
├── guards/
│   └── *.guard.ts
├── interceptors/
│   └── *.interceptor.ts
└── *.module.ts
```

## Core Modules

### Authentication Module (`auth/`)
- Google OAuth Strategy
- JWT Token Management
- Session Management
- Role-Based Access Guards

**Files:**
- `auth.controller.ts` - Google callback, login endpoints
- `auth.service.ts` - Token generation, validation
- `google.strategy.ts` - Passport Google OAuth strategy
- `jwt.strategy.ts` - JWT validation

### User Module (`users/`)
- User Profile Management
- User Settings
- Account Management

**Controllers:**
- `POST /users` - Create user
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile

### Mess Module (`mess/`)
- Create/Manage Mess Groups
- Mess Configuration
- Mess Permissions

**Controllers:**
- `POST /mess` - Create mess
- `GET /mess/:id` - Get mess details
- `PUT /mess/:id` - Update mess

### Month Module (`months/`)
- Create/Manage Active Months
- Month Status Tracking
- Month Calculations

**Controllers:**
- `POST /months` - Create month
- `GET /months/:id` - Get month details
- `PUT /months/:id/activate` - Set as active month

### Member Module (`members/`)
- Add/Remove Members
- Manage Member Roles
- Manage Permissions

**Controllers:**
- `POST /members` - Add member
- `DELETE /members/:id` - Remove member
- `PUT /members/:id/role` - Change role

### Meal Module (`meals/`)
- Add Meal Records
- Meal Requests
- Meal History

**Controllers:**
- `POST /meals` - Add meal
- `GET /meals?cursor=xyz` - Get meals (paginated)
- `PUT /meals/:id` - Update meal

### Cost Module (`costs/`)
- Individual Costs
- Shared Costs
- Cost Distribution

**Controllers:**
- `POST /costs` - Add cost
- `GET /costs` - Get costs
- `DELETE /costs/:id` - Delete cost

### Deposit Module (`deposits/`)
- Record Deposits
- Track Member Deposits
- Deposit History

**Controllers:**
- `POST /deposits` - Record deposit
- `GET /deposits` - Get deposit history

### Settlement Module (`settlement/`)
- Calculate Settlements
- Generate Reports
- Track Balances

**Controllers:**
- `GET /settlement/:monthId` - Get settlement for month

### Dashboard Module (`dashboard/`)
- Admin Statistics & Overview
- Manager Mess Summary
- Paginated Lists (Members, Activities)
- Real-time Calculations

**Controllers (Admin):**
- `GET /dashboard/admin/stats` - System-wide statistics
- `GET /dashboard/admin/recent-messes?cursor=xyz` - Recent messes (paginated)
- `GET /dashboard/admin/top-messes?cursor=xyz` - Top messes (paginated)

**Controllers (Manager):**
- `GET /dashboard/manager/summary?messId=xyz` - Mess summary
- `GET /dashboard/manager/members-summary?messId=xyz&cursor=abc` - Members (paginated)
- `GET /dashboard/manager/recent-activities?messId=xyz&cursor=abc` - Activities (paginated)
- `GET /dashboard/manager/quick-stats?messId=xyz` - Quick statistics

## Response Format (Centralized)

All API responses follow this format:

```typescript
// Success Response
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2024-04-04T12:00:00Z",
    "version": "1.0"
  }
}

// Paginated Response (Cursor-Based)
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "cursor": "next_cursor_token",  // Use for next request
    "pageSize": 20,
    "hasMore": true,
    "totalCount": 147  // Optional
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User friendly error message",
    "details": [ /* field errors */ ]
  }
}
```

## Pagination Strategy

All list endpoints support **cursor-based pagination** for efficiency:

```bash
# First page
GET /api/v1/meals?pageSize=20

# Next page using cursor from previous response
GET /api/v1/meals?pageSize=20&cursor=uuid_from_previous_cursor

# Important: pageSize must be ≤ 100
```

**Response includes:**
- `data`: Array of items
- `cursor`: Token for next page (null if last page)
- `pageSize`: Number of items returned
- `hasMore`: Boolean indicating if more data exists
- `totalCount`: Optional total count (if index available)

## Global Interceptors & Filters

### Response Interceptor
- Wraps all responses in standardized format
- Adds metadata (timestamp, version)
- Handles pagination

### Error Filter
- Catches all exceptions
- Converts to standard error format
- Logs errors appropriately

### Validation Pipe
- Validates DTOs using class-validator
- Returns field-level errors
- Strips unknown properties

## Database Schema

PostgreSQL with Prisma ORM. Key tables:

- `users` - User accounts
- `mess` - Shared living groups
- `mess_members` - Member associations
- `months` - Billing months
- `meals` - Meal records
- `costs` - Cost entries
- `deposits` - Member deposits
- `settlement` - Settlement calculations

## Authentication Flow

1. Frontend redirects to `/auth/google`
2. Google callback to `/auth/google/callback`
3. Server creates/updates user and generates JWT
4. JWT stored in httpOnly cookie
5. All requests authenticated via JWT middleware

## Environment Variables

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/meso
DATABASE_LOG=query

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
```

## Development

### Run Development Server
```bash
npm run start:dev
```

### Run Tests
```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Database Migrations
```bash
# Create migration
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio
npm run prisma:studio
```

### API Documentation
```
http://localhost:3000/api/docs
```

## Performance

### Database Indexing
- Indexed foreign keys
- Indexed frequently filtered columns
- Composite indexes for common queries

### Caching
- Response caching for GET requests
- Redis caching for expensive calculations

### Pagination
- Cursor-based pagination for large datasets
- Efficient query pagination

## Security

- JWT-based authentication
- Role-Based Access Control (RBAC)
- SQL Injection prevention (Prisma parameterized queries)
- CORS configuration
- Rate limiting
- Input validation & sanitization
- HTTP-only secure cookies

## Deployment

See Docker configuration in `Dockerfile` and `docker-compose.yml`.

```bash
# Build Docker image
docker build -t meso-backend .

# Run with docker-compose
docker-compose up -d
```
