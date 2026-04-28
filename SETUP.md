# MESO MVP - Complete Setup Guide

This guide will help you set up and run the MESO (Mess Management System) application locally for development.

## Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **PostgreSQL**: v13+ ([Download](https://www.postgresql.org/)) or use Docker
- **npm/pnpm**: Latest version
- **Git**: For version control

## Quick Start (Using Docker)

The fastest way to get started is using Docker Compose, which sets up PostgreSQL and the backend automatically.

### 1. Clone & Setup Environment

```bash
cd meso/server
cp .env.example .env
```

Edit `.env` with your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Get these from [Google Cloud Console](https://console.cloud.google.com/).

### 2. Start Backend with Docker

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Run Prisma migrations
- Start the NestJS backend on `http://localhost:3000`

Check logs:
```bash
docker-compose logs -f backend
```

### 3. Setup Frontend

```bash
cd ../client
cp .env.example .env.local
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

Visit `http://localhost:5173` and you should see the app!

---

## Manual Setup (Without Docker)

### Backend Setup

#### 1. Install Dependencies

```bash
cd meso/server
npm install
```

#### 2. Setup Environment

```bash
cp .env.example .env
```

Update `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/meso_dev
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 3. Setup PostgreSQL Database

Create database locally:
```bash
createdb meso_dev
```

Or if PostgreSQL is not installed, install it:
- **macOS**: `brew install postgresql@16`
- **Ubuntu**: `sudo apt-get install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all tables from the schema.

Generate Prisma client:
```bash
npm run prisma:generate
```

#### 5. Start Backend Server

```bash
npm run start:dev
```

Backend will start on `http://localhost:3000`

Check health:
```bash
curl http://localhost:3000/health
```

View Swagger docs:
```
http://localhost:3000/api/docs
```

### Frontend Setup

#### 1. Install Dependencies

```bash
cd meso/client
npm install
```

#### 2. Setup Environment

```bash
cp .env.example .env.local
```

Update `.env.local`:
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 3. Start Development Server

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

#### 4. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## Project Structure

```
meso/
├── server/                      # NestJS Backend
│   ├── src/
│   │   ├── main.ts             # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── common/             # Shared utilities, filters, interceptors
│   │   └── modules/            # Feature modules (Auth, Mess, Meals, etc.)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── docker-compose.yml      # Development stack
│   ├── Dockerfile              # Production image
│   └── package.json            # Dependencies
│
├── client/                      # React Frontend
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # Custom hooks
│   │   ├── stores/             # Zustand stores (to be created)
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Utility functions
│   ├── vite.config.ts          # Vite configuration
│   └── package.json            # Dependencies
│
└── README.md                    # Project overview
```

---

## API Endpoints (Quick Reference)

### Authentication
- `GET /auth/google` - Login with Google
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Mess Management
- `POST /mess` - Create a new mess
- `GET /mess/:id` - Get mess details
- `PUT /mess/:id` - Update mess
- `GET /mess/:id/members` - Get all members

### Members
- `POST /members` - Add member to mess
- `DELETE /members/:id` - Remove member
- `PUT /members/:id/role` - Change member role

### Meals
- `POST /meals` - Add meal record
- `GET /meals?monthId=:id&cursor=:cursor` - Get meals (paginated)
- `PUT /meals/:id` - Update meal
- `DELETE /meals/:id` - Delete meal

### Costs
- `POST /costs` - Add cost
- `GET /costs?monthId=:id` - Get costs
- `DELETE /costs/:id` - Delete cost

### Deposits
- `POST /deposits` - Record deposit
- `GET /deposits?monthId=:id` - Get deposits

### Settlement
- `GET /settlement/:monthId` - Get settlement for month

### Reports
- `GET /reports/settlement/:monthId/pdf` - Download settlement as PDF

---

## Development Workflow

### Backend Development

1. Make changes to TypeScript files in `src/`
2. Dev server auto-reloads with `npm run start:dev`
3. Check types: `npx tsc --noEmit`
4. Lint: `npm run lint`

### Database Migrations

When you update `prisma/schema.prisma`:

```bash
# Create migration
npm run prisma:migrate

# Or push directly (dev only)
npm run prisma:push

# View data with UI
npm run prisma:studio
```

### Frontend Development

1. Changes in `src/` auto-reload in browser
2. Check types: `npm run type-check`
3. Lint: `npm run lint`

### API Testing

Use the Swagger UI at `http://localhost:3000/api/docs` to test endpoints.

Or use curl:
```bash
curl -X GET http://localhost:3000/health
```

---

## Common Issues & Solutions

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Try: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Found
```
Error: @prisma/client not found
```
**Solution**:
```bash
npm install
npm run prisma:generate
```

### Google OAuth Not Working
- Verify Client ID and Secret in .env
- Check Google Cloud Console for correct redirect URI
- Should match: `http://localhost:3000/api/v1/auth/google/callback`

---

## Testing

### Unit Tests (To be implemented)

```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests (To be implemented)

```bash
npm run test:e2e
```

---

## Deployment

### Deploy Backend to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy: `vercel deploy`

### Deploy Frontend to Vercel

Frontend can be deployed separately:

```bash
cd client
vercel deploy
```

Or push to GitHub and connect to Vercel for automatic deploys.

---

## Next Steps

1. **Backend Development**
   - [ ] Add comprehensive DTOs to all modules
   - [ ] Add request validation
   - [ ] Implement missing services
   - [ ] Add error handling for edge cases
   - [ ] Write unit tests

2. **Frontend Development**
   - [ ] Create Zustand stores
   - [ ] Create React Query hooks
   - [ ] Build pages and components
   - [ ] Add form validation
   - [ ] Implement PDF export

3. **Integration**
   - [ ] Connect frontend to API
   - [ ] Test full user workflows
   - [ ] Performance optimization
   - [ ] Security review

---

## Need Help?

- **Backend Issues**: Check `server/README.md`
- **Frontend Issues**: Check `client/README.md`
- **Architecture**: Check root `README.md`
- **Progress**: Check `PROGRESS.md`

## Support

For issues and questions:
1. Check the relevant README
2. Review PROGRESS.md for current implementation status
3. Check code comments for implementation details
