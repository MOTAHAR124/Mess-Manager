# Step 5 - Integration (Next.js + NestJS + Prisma)

## Goal
Wire frontend and backend as one working system with authenticated API access, live runtime switching, and end-to-end CRUD + settlement flows.

## Completed in Step 5

### 1. Auth integration
- Added frontend auth routes:
  - `/login`
  - `/register`
  - `/auth/callback`
  - `/profile`
- Connected backend auth APIs in `src/lib/next-api.ts`:
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /auth/me`
  - `POST /auth/logout`
  - `POST /auth/refresh`
- Added shared auth session storage in `src/lib/auth-session.ts`.

### 2. App shell integration
- Added auth-aware top bar actions in `src/components/app/app-shell.tsx`:
  - Login/Register buttons when unauthenticated
  - Profile/Logout buttons when authenticated
- Added client-side protected-route behavior for non-public pages:
  - Redirects to `/login` when no token exists.

### 3. Runtime config sync integration
- Extended runtime state handling in `src/lib/runtime-config.ts`:
  - Session token + refresh token support
  - Runtime change event emitter/listener
  - Cross-tab/session sync support via storage + custom event
- Updated runtime controls (`src/components/app/runtime-controls.tsx`):
  - Prefills existing token
  - Added `Clear Session` action

### 4. Live page re-fetch integration
- Connected runtime-change listener to feature pages:
  - `/dashboard`
  - `/meals`
  - `/deposits`
  - `/expenses`
  - `/settlement`
- Result: changing Mess ID, Month ID, or token now refreshes data without manual reload.

### 5. API error integration hardening
- Improved error extraction in `src/lib/next-api.ts` to read backend `error.message` envelope first.
- This aligns frontend error display with NestJS global exception response format.
- Added automatic single-attempt token refresh and request retry on `401` for protected API calls.

## End-to-end validation checklist
- [x] Login/Register can create session and navigate to dashboard.
- [x] API token is attached to protected backend requests.
- [x] Dashboard + Meals + Deposits + Expenses + Settlement still function with JWT flow.
- [x] Runtime control changes trigger immediate reload behavior.
- [x] Logout clears local session and blocks protected routes.
- [x] Expired access token flow now refreshes and retries automatically when refresh token is valid.

## Remaining (Next Step candidates)
- [ ] Settlement PDF download UI wiring (`GET /reports/settlement/:monthId/pdf`).
