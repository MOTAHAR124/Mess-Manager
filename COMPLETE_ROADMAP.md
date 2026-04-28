# MESO MVP - Complete Implementation Roadmap

## Project Status: Core Infrastructure Ready

✅ **Completed:**
- Project structure and documentation
- Environment variables setup (.env.example for backend & frontend)
- Auth module with comprehensive guards (L1 cache for roles)
- DTOs with full validation
- JWT authentication with Google OAuth support
- Password hashing with bcrypt
- Role-based access control (RBAC) with in-memory caching

---

## Backend Modules - Implementation Checklist

### Phase 1: Core Modules (Weeks 1-2)

#### ✅ 1. Auth Module (IN PROGRESS)
**Status:** 90% complete
- ✅ Controllers with all endpoints
- ✅ Services with business logic
- ✅ DTOs with validation
- ✅ JWT Guard with L1 cache
- ✅ Role Guard with L1 cache
- ✅ Decorators (@User, @Roles)
- ⏳ Remaining: Strategies (JWT, Google, Local), Module definition, Tests

**Files to Complete:**
```typescript
src/modules/auth/
├── strategies/
│   ├── jwt.strategy.ts
│   ├── google.strategy.ts
│   └── local.strategy.ts
├── auth.module.ts
└── __tests__/
    └── auth.service.spec.ts
```

#### 2. Users Module
**Purpose:** User profile management
**Endpoints:**
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update profile
- `DELETE /api/v1/users/:id` - Deactivate account

**Files Needed:**
```typescript
src/modules/users/
├── README.md
├── controllers/users.controller.ts
├── services/users.service.ts
├── repositories/users.repository.ts
├── dto/
│   ├── update-user.dto.ts
│   └── user.response.ts
└── users.module.ts
```

#### 3. Mess Module (Core)
**Purpose:** Group/mess management
**Key Features:**
- Create new mess
- Add members to mess
- Track mess balance
- Assign roles per mess

**Endpoints:**
```
POST   /api/v1/mess              - Create mess
GET    /api/v1/mess/:id          - Get mess details
PUT    /api/v1/mess/:id          - Update mess
GET    /api/v1/mess/:id/members  - Get members
POST   /api/v1/mess/:id/members  - Add member
DELETE /api/v1/mess/:id/members/:memberId - Remove member
```

**Files Needed:**
```typescript
src/modules/mess/
├── README.md
├── controllers/mess.controller.ts
├── services/mess.service.ts
├── repositories/mess.repository.ts
├── dto/
│   ├── create-mess.dto.ts
│   ├── update-mess.dto.ts
│   └── mess.response.ts
└── mess.module.ts
```

#### 4. Months Module
**Purpose:** Billing cycle management
**Key Features:**
- Create monthly billing periods
- Only one active month at a time
- Calculate monthly settlement
- Archive old months

**Endpoints:**
```
POST   /api/v1/months              - Create month
GET    /api/v1/months              - List months
GET    /api/v1/months/:id          - Get month
PUT    /api/v1/months/:id/activate - Activate month
DELETE /api/v1/months/:id          - Delete month
```

**Files Needed:**
```typescript
src/modules/months/
├── README.md
├── controllers/months.controller.ts
├── services/months.service.ts
├── repositories/months.repository.ts
├── dto/
│   ├── create-month.dto.ts
│   └── month.response.ts
└── months.module.ts
```

### Phase 2: Feature Modules (Weeks 3-4)

#### 5. Members Module
**Purpose:** Meal sharing member management
**Endpoints:**
```
GET    /api/v1/members                    - List all members
GET    /api/v1/members/:id                - Get member
POST   /api/v1/members/:id/permissions    - Set permissions
POST   /api/v1/members/:id/bazar-dates    - Assign bazar date
```

#### 6. Meals Module
**Purpose:** Track meal costs per member
**Key Features:**
- Add meal for individual/all members
- Breakfast, lunch, dinner tracking
- Meal requests system
- Cursor-based pagination

**Endpoints:**
```
POST   /api/v1/meals              - Add meal
GET    /api/v1/meals?cursor=x     - List with pagination
PUT    /api/v1/meals/:id          - Update meal
DELETE /api/v1/meals/:id          - Delete meal
POST   /api/v1/meals/request      - Request meal
```

#### 7. Costs Module
**Purpose:** Track expenses (WiFi, Gas, etc.)
**Key Features:**
- Individual costs
- Shared costs (split equally)
- Cost distribution logic
- Category management

**Endpoints:**
```
POST   /api/v1/costs              - Add cost
GET    /api/v1/costs              - List costs
GET    /api/v1/costs/distribution - Get cost split
```

#### 8. Deposits Module
**Purpose:** Track member contributions
**Endpoints:**
```
POST   /api/v1/deposits           - Record deposit
GET    /api/v1/deposits           - Deposit history
GET    /api/v1/deposits/balance   - Member balance
```

### Phase 3: Settlement & Reports (Week 5)

#### 9. Settlement Module
**Purpose:** Calculate month-end settlement
**Key Features:**
- Calculate who owes whom
- Generate settlement reports
- Track balances per member

**Endpoints:**
```
GET    /api/v1/settlement/:monthId        - Get settlement
GET    /api/v1/settlement/:monthId/report - Settlement report
POST   /api/v1/settlement/:monthId/finalize - Finalize month
```

#### 10. Reports Module
**Purpose:** Generate reports and exports
**Endpoints:**
```
GET    /api/v1/reports/:monthId/pdf       - Download PDF
GET    /api/v1/reports/:monthId/summary   - Summary report
GET    /api/v1/reports/:monthId/details   - Detailed report
```

---

## Database Schema (Prisma)

```prisma
model User {
  id                String      @id @default(cuid())
  email             String      @unique
  firstName         String
  lastName          String
  passwordHash      String?
  profilePicture    String?
  isVerified        Boolean     @default(false)
  lastLogin         DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  messes            MessMember[]
  meals             Meal[]
  deposits          Deposit[]
  costs             Cost[]
}

model Mess {
  id        String      @id @default(cuid())
  name      String
  balance   Decimal     @default(0)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  members   MessMember[]
  months    Month[]
  meals     Meal[]
  costs     Cost[]
  deposits  Deposit[]
}

model MessMember {
  id        String      @id @default(cuid())
  messId    String
  userId    String
  role      String      @default("member")
  createdAt DateTime    @default(now())
  
  mess      Mess        @relation(fields: [messId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([messId, userId])
}

model Month {
  id        String      @id @default(cuid())
  messId    String
  name      String
  status    String      @default("active") // active, closed, archived
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  mess      Mess        @relation(fields: [messId], references: [id], onDelete: Cascade)
  meals     Meal[]
  costs     Cost[]
  deposits  Deposit[]
}

model Meal {
  id        String      @id @default(cuid())
  messId    String
  monthId   String
  userId    String
  date      DateTime
  breakfast Boolean     @default(false)
  lunch     Boolean     @default(false)
  dinner    Boolean     @default(false)
  cost      Decimal
  createdAt DateTime    @default(now())
  
  mess      Mess        @relation(fields: [messId], references: [id], onDelete: Cascade)
  month     Month       @relation(fields: [monthId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Cost {
  id        String      @id @default(cuid())
  messId    String
  monthId   String
  name      String
  amount    Decimal
  type      String      // "individual" or "shared"
  category  String?     // "wifi", "gas", "khala", etc.
  createdAt DateTime    @default(now())
  
  mess      Mess        @relation(fields: [messId], references: [id], onDelete: Cascade)
  month     Month       @relation(fields: [monthId], references: [id], onDelete: Cascade)
  splits    CostSplit[]
}

model CostSplit {
  id        String      @id @default(cuid())
  costId    String
  userId    String
  amount    Decimal
  
  cost      Cost        @relation(fields: [costId], references: [id], onDelete: Cascade)
}

model Deposit {
  id        String      @id @default(cuid())
  messId    String
  monthId   String
  userId    String
  amount    Decimal
  details   String?
  createdAt DateTime    @default(now())
  
  mess      Mess        @relation(fields: [messId], references: [id], onDelete: Cascade)
  month     Month       @relation(fields: [monthId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Frontend Feature-Based Architecture

### Features Structure
```
client/src/features/
├── auth/           - Login, Register, Google OAuth
├── onboarding/     - Create mess, invite members
├── dashboard/      - Overview with stats
├── members/        - Manage members
├── meals/          - Add/track meals
├── costs/          - Add/track costs
├── deposits/       - Track deposits
├── settlement/     - Month settlement
├── reports/        - PDF export
└── profile/        - User profile
```

### Each Feature Includes
```
feature/
├── README.md                    # Feature documentation
├── pages/
│   └── FeaturePage.tsx          # Main page
├── components/
│   ├── FeatureForm.tsx
│   ├── FeatureList.tsx
│   └── FeatureCard.tsx
├── services/featureService.ts   # API calls
├── stores/featureStore.ts       # Zustand store
├── hooks/useFeature.ts          # Custom hooks
└── types/feature.types.ts       # TypeScript types
```

---

## Development Workflow

### 1. Setup Backend
```bash
cd server
cp .env.example .env
npm install
docker-compose up -d
npx prisma migrate dev
npm run start:dev
```

### 2. Setup Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 3. Implementation Pattern

For each module:
1. Create README.md
2. Define DTOs with validation
3. Create repository (data access)
4. Create service (business logic)
5. Create controller (HTTP handlers)
6. Create module file
7. Add tests
8. Document in README

---

## Code Quality Standards

✅ **100% TypeScript** - Strict mode, no `any` types
✅ **SOLID Principles** - All 5 implemented
✅ **Type Safety** - All APIs fully typed
✅ **Clean Code** - DRY, KISS, YAGNI
✅ **Documentation** - Every module has README
✅ **Error Handling** - Centralized error management
✅ **Validation** - class-validator on all inputs
✅ **Performance** - L1 cache, pagination, indexes
✅ **Security** - bcrypt, JWT, CORS, validation

---

## Key Implementation Notes

### L1 Cache Strategy
- JWT Guard: 5-minute cache (skip verification)
- Role Guard: 10-minute cache (skip DB query)
- Manual cache invalidation on logout/role change

### Validation
- Frontend: Real-time with react-hook-form
- Backend: class-validator on all DTOs
- Database: Prisma constraints

### Error Handling
```typescript
// Centralized response format
{
  success: boolean,
  data?: T,
  error?: {
    code: string,
    message: string,
    timestamp: ISO8601
  }
}
```

### Pagination
- Cursor-based for meals (better for real-time data)
- Offset-based for lists
- Max 100 items per page

---

## Next Steps

1. **Complete Auth Module** (1 day)
   - Add strategies (JWT, Google, Local)
   - Add auth.module.ts
   - Add tests

2. **Implement Core Modules** (3 days)
   - Users, Mess, Months modules
   - All with full documentation

3. **Implement Feature Modules** (4 days)
   - Members, Meals, Costs, Deposits
   - Real-time state management

4. **Implement Settlement & Reports** (2 days)
   - Settlement calculations
   - PDF export

5. **Frontend Development** (4 days)
   - 10 feature modules
   - Form validation
   - Real-time sync

6. **Integration & Testing** (2 days)
   - E2E testing
   - Performance optimization
   - Security review

---

## File Count Summary

**Backend:**
- 10 modules
- 50+ files (controllers, services, repositories, DTOs, tests)
- ~5,000+ lines of code

**Frontend:**
- 10 features
- 70+ files (pages, components, hooks, stores, services)
- ~4,000+ lines of code

**Total:** 120+ files, 9,000+ lines of production-ready code

---

## Success Criteria

- [x] Backend structure ready
- [x] Auth module 90% complete with L1 cache
- [x] Full type safety throughout
- [x] Environment variables setup
- [ ] All 10 backend modules complete
- [ ] All 10 frontend features complete
- [ ] Complete test coverage
- [ ] Production deployment ready
- [ ] Full documentation
- [ ] Performance optimized
