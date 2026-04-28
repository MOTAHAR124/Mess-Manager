# MESO Current System Audit

Date: 2026-04-09

This file is the current source of truth for the repository state. Many older
root `*.md` files describe an earlier planned architecture and should be treated
as historical planning material, not runtime truth.

## Current Reality

- Backend and frontend both build successfully.
- The active runtime frontend is the app under `client/src/pages`, `hooks`,
  `services`, and `stores`.
- The `client/src/features` tree is not the live application path.
- Backend API routes are versioned through the frontend base URL
  `.../api/v1` and controller paths like `auth`, `mess`, `months`, etc.

## Module Status

### Auth
- Email/password register and login work.
- Google OAuth flow is wired.
- Refresh, logout, forgot password, and reset password endpoints exist.
- Auth payload now includes `hasActiveMonth`, `createdAt`, and `lastLogin`.

### Mess
- Create mess works.
- Get mess by ID works.
- Get members by mess works.
- `GET /mess/current` now exists to bootstrap the authenticated user's mess
  context after login.

### Months
- Create month works.
- Activate and complete month work.
- Creating a month now also updates `mess.activeMonthId` and closes older
  active months for the same mess.

### Members
- Add member by email works through `/members`.
- Remove member and update role endpoints exist.
- Frontend member management now targets the real backend routes.

### Meals
- Monthly meal fetch works via `/meals/month/:monthId`.
- Bulk upsert works.
- Frontend meal grid now aligns with the backend route contract.

### Costs
- Shared and individual costs work.
- Frontend now supports choosing a member for individual costs.
- Cost payloads are aligned to backend fields (`name`, `details`, `memberId`).

### Deposits
- Record, list, and delete deposit flows are aligned.
- Frontend now sends `date` and stores payment method in `details`.

### Dashboard
- Dashboard summary, members summary, and quick stats compile and connect.
- Role checks now resolve real database mess roles instead of placeholder logic.

### Settlement
- Settlement get/calculate flow is aligned.
- Frontend settlement types now match the backend's detailed member balance
  shape.

### Reports
- Settlement PDF route is aligned with the frontend download client.

## Important Improvements Made

- Fixed auth/frontend payload mismatches that broke registration.
- Fixed runtime route inconsistencies.
- Fixed JWT request identity shape so protected handlers can reliably use
  `@User('id')`.
- Fixed role guard to query actual mess roles from the database.
- Added client bootstrap of current mess context after authentication.
- Fixed logout flow so server logout is called before local token cleanup.
- Reduced dead-code build noise by excluding unused legacy frontend paths from
  the live TypeScript build.

## Remaining Gaps Before True Production Readiness

- There is still no automated test suite covering the critical paths.
- Some root documentation remains stale and should be consolidated over time.
- Admin role handling is still environment-based, not modeled in the user
  schema.
- Runtime E2E validation with a real database, seeded users, and Google OAuth
  credentials is still required.
- Observability, rate limiting, background jobs, and deployment hardening are
  still minimal.

## Recommended Next Steps

1. Add backend integration tests for auth, mess, months, members, meals,
   costs, deposits, settlement, and reports.
2. Add frontend smoke/E2E tests for login, onboarding, dashboard, and CRUD
   flows.
3. Consolidate or archive stale root planning docs.
4. Decide whether admin should remain env-driven or become a first-class schema
   role.
