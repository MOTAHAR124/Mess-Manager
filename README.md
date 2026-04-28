# MESO - Mess Management System

A full-stack mess management platform for shared living groups to manage members, meals, costs, deposits, month cycles, and final settlement.

## Executive Summary

MESO provides end-to-end workflows for:

- Authentication and user profile lifecycle
- Mess and member management
- Monthly cycle creation and activation
- Meal, cost, and deposit tracking
- Settlement calculation and reporting

The codebase is currently operational on both backend and frontend. For the most accurate runtime truth, use [`CURRENT_SYSTEM_AUDIT.md`](./CURRENT_SYSTEM_AUDIT.md).

## Current Project Status

- Backend and frontend build successfully.
- API and frontend route integrations are actively aligned.
- Major domain modules are implemented and wired.
- Remaining work before production hardening includes test coverage, observability, and deployment hardening.

## Architecture

### Backend

- Framework: NestJS (TypeScript)
- Database: PostgreSQL + Prisma
- Auth: JWT + Passport (email/password + Google OAuth)
- Validation: `class-validator`
- Reporting: PDF generation

### Frontend

- Framework: Next.js (App Router) + React + TypeScript
- State: Zustand
- Server state/data fetching: TanStack React Query
- UI: Tailwind + Radix/shadcn-style component patterns

## Project Structure

```text
mess-manager/
  client/
    app/                        # Next.js app routes (active runtime)
      login/
      register/
      dashboard/
      meals/
      expenses/
      deposits/
      settlement/
      profile/
      auth/callback/
    src/
      components/
      lib/
      types/
    .env.example

  server/
    src/
      modules/
        auth/
        users/
        mess/
        months/
        members/
        meals/
        costs/
        deposits/
        settlement/
        reports/
        dashboard/
        expenses/
        bazar/
        bazar-dates/
      common/
      config/
      prisma/
    prisma/
    .env.example

  CURRENT_SYSTEM_AUDIT.md       # Current source of truth
  CONNECTION_GUIDE.md           # Frontend-backend alignment reference
  DEVELOPMENT_CHECKLIST.md      # Detailed implementation checklist
  DELIVERY_SUMMARY.md           # Historical delivery summary
  README.md
```

## Core Module Coverage (Backend)

- `auth`: register/login/logout/refresh/reset flow + JWT guard + role guard
- `users`: profile and user operations
- `mess`: mess lifecycle, current mess bootstrap, member listing
- `months`: create/activate/complete month lifecycle
- `members`: add/remove/update member role flows
- `meals`: month meal retrieval + bulk operations
- `costs`: shared and individual costs
- `deposits`: record/list/delete deposit flows
- `settlement`: settlement retrieval/calculation
- `reports`: settlement PDF/report endpoints
- `dashboard`: summary and quick stats endpoints

## API Endpoints Overview

Base URL: `/api/v1`

| Module | Sample Endpoints |
|--------|------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Mess | `POST /mess`, `GET /mess/current`, `GET /mess/:id`, `GET /mess/:id/members` |
| Months | `POST /months`, `GET /months`, `PATCH /months/:id/activate`, `PATCH /months/:id/complete` |
| Members | `POST /members`, `GET /members/mess/:messId`, `PATCH /members/:id/role`, `DELETE /members/:id` |
| Meals | `GET /meals/month/:monthId`, `POST /meals/bulk`, `PATCH /meals/:id`, `DELETE /meals/:id` |
| Costs | `POST /costs`, `GET /costs/month/:monthId`, `PATCH /costs/:id`, `DELETE /costs/:id` |
| Deposits | `POST /deposits`, `GET /deposits/month/:monthId`, `DELETE /deposits/:id` |
| Settlement | `GET /settlement/month/:monthId`, `POST /settlement/month/:monthId/calculate` |
| Reports | `GET /reports/month/:monthId/settlement/pdf` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/members`, `GET /dashboard/quick-stats` |

Note: Some routes evolved over time; confirm exact runtime behavior from [`CURRENT_SYSTEM_AUDIT.md`](./CURRENT_SYSTEM_AUDIT.md) and module controllers.

## Security and Performance Highlights

- Bcrypt password hashing
- JWT access and refresh token flows
- Google OAuth support
- Role-based access control
- Input validation on DTOs
- Prisma ORM protections against SQL injection patterns
- L1 guard-level caching strategy for token/role checks

## Quick Start

### 1) Backend setup

```bash
cd server
cp .env.example .env
npm install
docker-compose up -d
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

Backend default: `http://localhost:3000`

### 2) Frontend setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend default: `http://localhost:3001` (or next available port)

### 3) Run both from root (optional)

```bash
pnpm dev
```

## Documentation Map

- [`CURRENT_SYSTEM_AUDIT.md`](./CURRENT_SYSTEM_AUDIT.md): current repository/runtime truth
- [`CONNECTION_GUIDE.md`](./CONNECTION_GUIDE.md): frontend-backend integration mapping
- [`DEVELOPMENT_CHECKLIST.md`](./DEVELOPMENT_CHECKLIST.md): development and completion checklist
- [`GETTING_STARTED.md`](./GETTING_STARTED.md): onboarding/start guide
- [`DELIVERY_SUMMARY.md`](./DELIVERY_SUMMARY.md): historical delivery snapshot

## Known Gaps Before Production Readiness

- Automated integration and E2E tests are still limited.
- Some root-level planning docs are historical and need consolidation.
- Observability, rate limiting, and deployment hardening need expansion.

## Recommended Read Order

1. [`CURRENT_SYSTEM_AUDIT.md`](./CURRENT_SYSTEM_AUDIT.md)
2. [`GETTING_STARTED.md`](./GETTING_STARTED.md)
3. [`CONNECTION_GUIDE.md`](./CONNECTION_GUIDE.md)
4. [`DEVELOPMENT_CHECKLIST.md`](./DEVELOPMENT_CHECKLIST.md)

## License

Private project. All rights reserved.



