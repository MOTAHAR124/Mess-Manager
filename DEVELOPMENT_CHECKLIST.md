# MESO MVP - Development Checklist

Use this checklist to track progress as you implement the remaining modules.

## Backend Implementation

### Phase 1: Auth Module Completion
- [ ] Create `auth/strategies/jwt.strategy.ts`
  ```typescript
  // Validate JWT tokens from headers
  // Extract user payload
  // Return authenticated user
  ```

- [ ] Create `auth/strategies/google.strategy.ts`
  ```typescript
  // Passport Google OAuth strategy
  // Handle Google profile
  // Return authenticated user
  ```

- [ ] Create `auth/strategies/local.strategy.ts`
  ```typescript
  // Passport local strategy for email/password
  // Validate credentials
  // Return authenticated user
  ```

- [ ] Create `auth/auth.module.ts`
  ```typescript
  @Module({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRATION },
      }),
      PassportModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard, RoleGuard],
    exports: [JwtAuthGuard, RoleGuard, AuthService],
  })
  export class AuthModule {}
  ```

- [ ] Create `auth/__tests__/auth.service.spec.ts` (unit tests)
  - Test register with valid/invalid data
  - Test login with correct/incorrect password
  - Test token generation
  - Test email verification
  - Test password change
  - Coverage: > 80%

- [ ] Run tests: `npm run test auth`

### Phase 2: Users Module
- [ ] Create `users/README.md`
  - Document module purpose
  - List all endpoints
  - Show usage examples
  - Document database schema

- [ ] Create `users/dto/update-user.dto.ts`
  - firstName (optional)
  - lastName (optional)
  - phone (optional)
  - profilePicture (optional)

- [ ] Create `users/dto/user.response.ts`
  - id, email, firstName, lastName
  - profilePicture, phone, isVerified
  - lastLogin, createdAt

- [ ] Create `users/repositories/users.repository.ts`
  - findById(id): Promise<User>
  - findByEmail(email): Promise<User>
  - update(id, data): Promise<User>
  - delete(id): Promise<void>
  - Implement pagination

- [ ] Create `users/services/users.service.ts`
  - getProfile(userId): Promise<User>
  - updateProfile(userId, dto): Promise<User>
  - deleteAccount(userId): Promise<void>
  - Validation and error handling

- [ ] Create `users/controllers/users.controller.ts`
  - GET /users/:id
  - PUT /users/:id
  - DELETE /users/:id
  - All protected with JwtAuthGuard

- [ ] Create `users/users.module.ts`
  - Wire up controller, service, repository
  - Export services for other modules

- [ ] Create `users/__tests__/users.service.spec.ts`

### Phase 3: Mess Module (CRITICAL)
- [ ] Create `mess/README.md`
  - Document group/mess concept
  - Show full lifecycle
  - Document role-based access

- [ ] Create `mess/dto/create-mess.dto.ts`
  - name: string (required, 3-100 chars)
  - description?: string

- [ ] Create `mess/dto/mess.response.ts`
  - id, name, description, balance
  - members count, createdAt

- [ ] Create `mess/repositories/mess.repository.ts`
  - create(data): Promise<Mess>
  - findById(id): Promise<Mess with members>
  - update(id, data): Promise<Mess>
  - delete(id): Promise<void>
  - getMembersByMessId(messId): Promise<Member[]>
  - addMember(messId, userId, role)
  - removeMember(messId, userId)

- [ ] Create `mess/services/mess.service.ts`
  - createMess(userId, dto): Promise<Mess>
  - getMess(messId): Promise<Mess>
  - updateMess(messId, userId, dto): Promise<Mess>
  - deleteMess(messId, userId): Promise<void>
  - addMember(messId, userId, newMemberId, role)
  - removeMember(messId, userId, memberId)
  - getMembers(messId): Promise<Member[]>
  - Role validation and authorization

- [ ] Create `mess/controllers/mess.controller.ts`
  ```
  POST   /mess              - Create mess
  GET    /mess/:id          - Get mess
  PUT    /mess/:id          - Update mess
  DELETE /mess/:id          - Delete mess
  GET    /mess/:id/members  - List members
  POST   /mess/:id/members  - Add member
  DELETE /mess/:id/members/:memberId - Remove member
  ```

- [ ] Create `mess/mess.module.ts`

- [ ] Create `mess/__tests__/mess.service.spec.ts`

### Phase 4: Months Module
- [ ] Create `months/README.md`

- [ ] Create DTOs:
  - CreateMonthDto (name: string)
  - MonthResponseDto
  - ActivateMonthDto

- [ ] Create `months/repositories/months.repository.ts`
  - create(), findById(), update(), delete()
  - getActiveMonth(messId)
  - setActiveMonth(messId, monthId)

- [ ] Create `months/services/months.service.ts`
  - createMonth(messId, userId, dto)
  - getMonth(monthId, messId)
  - activateMonth(monthId, messId, userId)
  - Enforce: only one active month per mess
  - closeMonth(), archiveMonth()

- [ ] Create `months/controllers/months.controller.ts`

- [ ] Create `months/months.module.ts`

- [ ] Create tests

### Phase 5: Members Module
- [ ] Create `members/README.md`

- [ ] Create DTOs:
  - MemberResponseDto
  - UpdateMemberPermissionsDto
  - AssignBazarDateDto

- [ ] Create repository and service

- [ ] Create controller with endpoints:
  - GET /members (list all)
  - GET /members/:id
  - PUT /members/:id/permissions
  - POST /members/:id/bazar-dates

- [ ] Create tests

### Phase 6: Meals Module
- [ ] Create `meals/README.md`

- [ ] Create DTOs:
  - CreateMealDto (userId, date, breakfast, lunch, dinner, cost)
  - MealResponseDto
  - MealRequestDto

- [ ] Create repository with pagination:
  - findByMonthId(monthId, cursor, limit)
  - create(), update(), delete()

- [ ] Create service with:
  - addMeal(), updateMeal(), deleteMeal()
  - listMeals(monthId, cursor) with pagination
  - requestMeal()
  - Cost calculation

- [ ] Create controller with cursor-based pagination:
  ```
  POST   /meals
  GET    /meals?cursor=xxx&limit=20
  PUT    /meals/:id
  DELETE /meals/:id
  POST   /meals/request
  ```

- [ ] Create tests

### Phase 7: Costs Module
- [ ] Create `costs/README.md`

- [ ] Create DTOs:
  - CreateCostDto (name, amount, type, category, distribution)
  - CostResponseDto
  - CostDistributionDto

- [ ] Create repository:
  - create(), findById(), delete()
  - getCosts(monthId), getDistribution(costId)

- [ ] Create service with:
  - addCost(messId, monthId, userId, dto)
  - Distribution logic (split equally or custom)
  - getCostBreakdown(monthId)

- [ ] Create controller:
  ```
  POST   /costs
  GET    /costs/:monthId
  DELETE /costs/:id
  GET    /costs/:monthId/breakdown
  ```

- [ ] Create tests

### Phase 8: Deposits Module
- [ ] Create `deposits/README.md`

- [ ] Create DTOs:
  - CreateDepositDto (userId, amount, details)
  - DepositResponseDto
  - DepositHistoryDto

- [ ] Create repository and service

- [ ] Create controller:
  ```
  POST   /deposits
  GET    /deposits/:monthId
  ```

- [ ] Create tests

### Phase 9: Settlement Module
- [ ] Create `settlement/README.md`

- [ ] Create DTOs:
  - SettlementResponseDto (member balances)
  - SettlementReportDto

- [ ] Create service with:
  - calculateSettlement(monthId, messId)
  - who owes whom logic
  - generateReport(monthId)

- [ ] Create controller:
  ```
  GET    /settlement/:monthId
  GET    /settlement/:monthId/report
  POST   /settlement/:monthId/finalize
  ```

- [ ] Create tests

### Phase 10: Reports Module
- [ ] Create `reports/README.md`

- [ ] Create service with:
  - generatePDF(monthId, messId): Buffer
  - generateSummary(monthId): Object
  - generateDetailedReport(monthId): Object

- [ ] Create controller:
  ```
  GET    /reports/:monthId/pdf
  GET    /reports/:monthId/summary
  GET    /reports/:monthId/detailed
  ```

- [ ] Implement PDF generation (pdfkit or similar)

- [ ] Create tests

### General Backend Tasks
- [ ] Update app.module.ts with all modules
- [ ] Create global error filter (if not exists)
- [ ] Add request/response logging
- [ ] Add rate limiting middleware
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Add database seeders for testing
- [ ] Create database migration files
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive error codes
- [ ] Create logging service

---

## Frontend Implementation

### Auth Feature
- [ ] Create `features/auth/README.md`

- [ ] Create `features/auth/pages/`
  - [ ] Login.tsx - Email/password login form
  - [ ] Register.tsx - Registration form
  - [ ] GoogleAuthCallback.tsx - Handle OAuth callback

- [ ] Create `features/auth/components/`
  - [ ] LoginForm.tsx - shadcn form components
  - [ ] RegisterForm.tsx - shadcn form components
  - [ ] GoogleAuthButton.tsx - Google login button

- [ ] Create `features/auth/services/authService.ts`
  - [ ] register(data): Promise<AuthResponse>
  - [ ] login(data): Promise<AuthResponse>
  - [ ] logout(): Promise<void>
  - [ ] refreshToken(): Promise<string>

- [ ] Create `features/auth/stores/authStore.ts`
  - [ ] user: User | null
  - [ ] token: string | null
  - [ ] isAuthenticated: boolean
  - [ ] setUser(), setToken(), logout()

- [ ] Create `features/auth/hooks/useAuth.ts`
  - [ ] useAuth(): { user, token, login, logout }

- [ ] Create `features/auth/guards/ProtectedRoute.tsx`
  - [ ] Redirect if not authenticated
  - [ ] Check email verification

### Onboarding Feature
- [ ] Create `features/onboarding/README.md`

- [ ] Create `features/onboarding/pages/Onboarding.tsx`
  - [ ] Mess name input
  - [ ] First month name input
  - [ ] Invite members
  - [ ] Setup complete

- [ ] Create `features/onboarding/components/`
  - [ ] MessSetupForm.tsx
  - [ ] MonthSetupForm.tsx
  - [ ] InviteMembersForm.tsx

- [ ] Create onboarding store and service

### Dashboard Feature
- [ ] Create `features/dashboard/README.md`

- [ ] Create `features/dashboard/pages/Dashboard.tsx`
  - [ ] Stats cards (balance, meals, costs)
  - [ ] Quick actions
  - [ ] Activity summary

- [ ] Create `features/dashboard/components/`
  - [ ] StatsCard.tsx (shadcn Card)
  - [ ] QuickActions.tsx (shadcn Button group)
  - [ ] ActivitySummary.tsx

- [ ] Create `features/dashboard/hooks/useDashboard.ts`
  - [ ] Fetch and calculate statistics
  - [ ] Real-time updates with Zustand

### Members Feature
- [ ] Create `features/members/README.md`

- [ ] Create `features/members/pages/MembersPage.tsx`

- [ ] Create `features/members/components/`
  - [ ] MemberCard.tsx (shadcn Card)
  - [ ] AddMemberDialog.tsx (shadcn Dialog)
  - [ ] MemberList.tsx
  - [ ] MemberPermissions.tsx (shadcn Checkbox/Switch)

- [ ] Create member service and store

### Meals Feature
- [ ] Create `features/meals/README.md`

- [ ] Create `features/meals/pages/MealsPage.tsx`

- [ ] Create `features/meals/components/`
  - [ ] AddMealForm.tsx (shadcn Form)
  - [ ] MealTable.tsx (shadcn Table)
  - [ ] MealRequestForm.tsx
  - [ ] MealStats.tsx

- [ ] Implement cursor-based pagination

- [ ] Create store with real-time calculations

### Costs Feature
- [ ] Create `features/costs/README.md`

- [ ] Create `features/costs/pages/CostsPage.tsx`

- [ ] Create `features/costs/components/`
  - [ ] AddCostForm.tsx (shadcn Form)
  - [ ] CostList.tsx (shadcn Table)
  - [ ] CostDistribution.tsx
  - [ ] CostStats.tsx

- [ ] Create cost service and store

### Deposits Feature
- [ ] Create `features/deposits/README.md`

- [ ] Create `features/deposits/pages/DepositsPage.tsx`

- [ ] Create `features/deposits/components/`
  - [ ] AddDepositForm.tsx (shadcn Form)
  - [ ] DepositHistory.tsx (shadcn Table)
  - [ ] DepositStats.tsx

- [ ] Create deposit service and store

### Settlement Feature
- [ ] Create `features/settlement/README.md`

- [ ] Create `features/settlement/pages/SettlementPage.tsx`

- [ ] Create `features/settlement/components/`
  - [ ] SettlementSummary.tsx
  - [ ] MemberBalance.tsx (shadcn Card)
  - [ ] DebtCalculator.tsx

- [ ] Create settlement calculations

### Reports Feature
- [ ] Create `features/reports/README.md`

- [ ] Create `features/reports/pages/ReportsPage.tsx`

- [ ] Create `features/reports/components/`
  - [ ] PDFExport.tsx (shadcn Button)
  - [ ] ReportGenerator.tsx
  - [ ] ReportPreview.tsx

- [ ] Implement PDF generation

### Profile Feature
- [ ] Create `features/profile/README.md`

- [ ] Create `features/profile/pages/ProfilePage.tsx`

- [ ] Create `features/profile/components/`
  - [ ] ProfileForm.tsx
  - [ ] ChangePassword.tsx

- [ ] Create profile service and store

### General Frontend Tasks
- [ ] Create MainLayout.tsx with sidebar/navbar
- [ ] Create responsive design for mobile
- [ ] Implement error handling/toast notifications
- [ ] Add loading states to all forms
- [ ] Create confirmation dialogs for destructive actions
- [ ] Add form validation with react-hook-form
- [ ] Create API client service with interceptors
- [ ] Implement token refresh logic
- [ ] Add localStorage for offline support
- [ ] Create dark mode support (optional)

---

## Testing Checklist

### Backend Tests
- [ ] Auth service: 95%+ coverage
- [ ] Users service: 90%+ coverage
- [ ] Mess service: 90%+ coverage
- [ ] Months service: 90%+ coverage
- [ ] Guards: 100% coverage (critical)
- [ ] Integration tests: All API endpoints
- [ ] End-to-end tests: Full user flows

### Frontend Tests
- [ ] Auth feature: 80%+ coverage
- [ ] Form validation: 100% coverage
- [ ] State management: 90%+ coverage
- [ ] API integration: 85%+ coverage
- [ ] E2E tests: Critical user flows

---

## Documentation Checklist

- [ ] Auth module README ✅
- [ ] Users module README
- [ ] Mess module README
- [ ] Months module README
- [ ] Members module README
- [ ] Meals module README
- [ ] Costs module README
- [ ] Deposits module README
- [ ] Settlement module README
- [ ] Reports module README
- [ ] API documentation (Swagger)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## Deployment Checklist

- [ ] Docker configuration
- [ ] Docker Compose setup
- [ ] Environment variables secured
- [ ] Database migrations automated
- [ ] Logs configured
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Security audit
- [ ] Load testing
- [ ] Staging environment
- [ ] Production deployment
- [ ] Backup strategy
- [ ] Disaster recovery plan

---

## Performance Checklist

- [ ] L1 Cache implemented ✅
- [ ] Database indexes created
- [ ] Query optimization (N+1 fixes)
- [ ] API response times < 200ms
- [ ] Frontend bundle size optimized
- [ ] Image optimization
- [ ] Caching strategy implemented
- [ ] CDN configuration
- [ ] Database connection pooling
- [ ] Rate limiting
- [ ] Pagination implemented

---

## Security Checklist

- [ ] Password hashing with bcrypt ✅
- [ ] JWT tokens implemented ✅
- [ ] CORS configured ✅
- [ ] Input validation ✅
- [ ] SQL injection prevention (Prisma) ✅
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] HTTPS enforcement
- [ ] Secure headers (helmet.js)
- [ ] Dependency audit
- [ ] Secrets management
- [ ] Audit logging
- [ ] Encryption at rest

---

## Final Verification

- [ ] All modules complete
- [ ] All tests passing (95%+ coverage)
- [ ] All endpoints documented
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Code review completed
- [ ] Documentation complete
- [ ] No console errors/warnings
- [ ] Responsive design verified
- [ ] Cross-browser testing
- [ ] Accessibility audit (WCAG)
- [ ] Load testing completed
- [ ] Staging deployment successful
- [ ] Production ready

---

**Total Tasks:** ~150
**Estimated Effort:** 6-8 weeks (single developer)
**Priority:** Follow phases in order

**Last Updated:** April 4, 2026
