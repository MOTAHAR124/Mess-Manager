# Step 3 - REST API Routes (Next.js Frontend + NestJS Backend)

Base URL: `/api/v1`
Auth: `Authorization: Bearer <JWT>`

## Step 3 Status Legend
- `[x]` Implemented in Next.js frontend (`client/src/lib/next-api.ts` + pages)
- `[ ]` Pending frontend integration (backend route exists, not yet wired in UI)

## Auth
- `[x] POST /auth/register`
- `[x] POST /auth/login`
- `[x] POST /auth/refresh`
- `[x] POST /auth/logout`
- `[x] POST /auth/forgot-password`
- `[x] POST /auth/reset-password`
- `[x] GET /auth/me`

## Users
- `[ ] GET /users/:id`
- `[ ] PUT /users/:id`

## Mess / Members / Months
- `[ ] POST /mess`
- `[ ] GET /mess/current`
- `[ ] GET /mess/:id`
- `[x] GET /mess/:id/members`
- `[ ] POST /members`
- `[ ] GET /members/mess/:messId`
- `[ ] PUT /members/:id/role`
- `[ ] DELETE /members/:id`
- `[ ] POST /months`
- `[ ] GET /months/:id`
- `[ ] GET /months/mess/:messId`
- `[ ] POST /months/:id/active`
- `[ ] POST /months/:id/complete`

## Meals
- `[x] POST /meals/bulk`
- `[x] GET /meals/month/:monthId?limit=20&cursor=<id>`
- `[ ] GET /meals/:id`
- `[x] PUT /meals/:id`
- `[x] DELETE /meals/:id`

## Deposits
- `[x] POST /deposits`
- `[x] GET /deposits/month/:monthId`
- `[x] PUT /deposits/:id`
- `[x] DELETE /deposits/:id`

## Expenses (new canonical)
- `[x] POST /expenses`
- `[x] GET /expenses/month/:monthId`
- `[x] PUT /expenses/:id` (UI supports update flow; backend currently restricts SHARED update)
- `[x] DELETE /expenses/:id`

Legacy compatibility route still available:
- `[ ] POST /costs`
- `[x] GET /costs/month/:monthId` (frontend fallback only when `/expenses/month/:monthId` fails)
- `[ ] PUT /costs/:id`
- `[ ] DELETE /costs/:id`

## Settlement + Reports
- `[x] GET /settlement/:monthId`
- `[x] POST /settlement/:monthId/calculate`
- `[ ] GET /reports/settlement/:monthId/pdf`

## Formula Contract (finalized)
- `meal_rate = total_expense / total_meals`
- `user_balance = deposit - (meal_count * meal_rate)`

## Required frontend env
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`
- `NEXT_PUBLIC_API_TOKEN=<temporary dev jwt>`
- `NEXT_PUBLIC_MESS_ID=<current mess id>`
- `NEXT_PUBLIC_MONTH_ID=<current month id>`

## Current Step 3 Summary
- Implemented now: Auth login/register/profile/logout/refresh/forgot/reset integration, automatic refresh-token retry for protected APIs, dashboard summary, meals CRUD (list/create/update/delete), deposits CRUD, expenses CRUD (with SHARED update limitation), settlement fetch + recalculate, runtime config/token controls.
- Pending next: mess/month/member management screens and settlement PDF report download wiring.
