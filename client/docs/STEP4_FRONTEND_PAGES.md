# Step 4 - Frontend Pages (Next.js App Router + Tailwind)

Base app path: `/`
Frontend app root: `client/app`

## Step 4 Scope
- Convert Laravel Blade screens into Next.js App Router pages.
- Keep feature parity for core flows:
  - Dashboard
  - Meals
  - Deposits
  - Expenses
  - Settlement
- Use reusable UI pieces and shared API client integration.

## Implemented Routes
- `[x] /` Home + navigation hub
- `[x] /login` Email/password login
- `[x] /register` Email/password registration
- `[x] /auth/callback` Google OAuth callback token handoff
- `[x] /forgot-password` Password reset request
- `[x] /reset-password` Password reset form
- `[x] /profile` Authenticated user profile + logout
- `[x] /dashboard` Monthly summary cards
- `[x] /meals` Meal entry form + table (create/update/delete)
- `[x] /deposits` Deposit form + table (create/update/delete)
- `[x] /expenses` Expense form + table (create/update/delete)
- `[x] /settlement` Meal-rate settlement summary + member balance table + recalculate action

## Shared UI Components
- `[x] App shell layout and nav: `src/components/app/app-shell.tsx`
- `[x] Runtime configuration controls (mess/month/token): `src/components/app/runtime-controls.tsx`
- `[x] Reusable page header: `src/components/app/page-header.tsx`
- `[x] Reusable status stack (hint/error/success): `src/components/app/status-stack.tsx`
- `[x] Stat cards: `src/components/app/stat-card.tsx`

## API Integration (from Step 3)
- `[x] Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/refresh`
- `[x] Auth recovery: `POST /auth/forgot-password`, `POST /auth/reset-password`
- `[x] Dashboard summary: `GET /dashboard/manager/:messId/summary`
- `[x] Members list: `GET /mess/:id/members`
- `[x] Meals CRUD: `/meals/*`
- `[x] Deposits CRUD: `/deposits/*`
- `[x] Expenses CRUD: `/expenses/*` (+ fallback `/costs/month/:monthId`)
- `[x] Settlement fetch/recalculate: `/settlement/:monthId` and `/settlement/:monthId/calculate`

## Runtime Requirements
Set through top-bar runtime controls or environment variables:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_TOKEN`
- `NEXT_PUBLIC_MESS_ID`
- `NEXT_PUBLIC_MONTH_ID`

## Notes
- Shared expense update remains constrained by backend behavior (current UI warns and blocks unsupported update flow).
- Runtime settings now emit change events, and all feature pages auto-refetch when mess/month/token changes.
- API client now includes single-attempt auto refresh token retry on `401` for protected endpoints.
