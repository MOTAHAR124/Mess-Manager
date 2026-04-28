# MESO Frontend - React + Vite

Modern, responsive frontend for Mess Management System using React 18, Vite, Zustand, and TanStack React Query.

## Architecture

### Feature-Based Architecture

```
App
├── features/
│   ├── auth/                    # Authentication
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── README.md
│   │
│   ├── dashboard/                # Dashboard & Overview
│   │   ├── components/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── MembersTable.tsx
│   │   │   ├── RecentActivities.tsx
│   │   │   └── QuickStats.tsx
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── services/
│   │   │   └── dashboardService.ts
│   │   ├── hooks/
│   │   │   └── useDashboard.ts
│   │   └── README.md
│   │
│   ├── members/                  # Member Management
│   │   ├── components/
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberForm.tsx
│   │   │   └── MembersList.tsx
│   │   ├── pages/
│   │   │   └── MembersPage.tsx
│   │   ├── services/
│   │   │   └── memberService.ts
│   │   ├── hooks/
│   │   │   └── useMembers.ts
│   │   └── README.md
│   │
│   ├── meals/                    # Meal Tracking
│   │   ├── components/
│   │   │   ├── MealForm.tsx
│   │   │   ├── MealCard.tsx
│   │   │   └── MealsList.tsx
│   │   ├── pages/
│   │   │   └── MealsPage.tsx
│   │   ├── services/
│   │   │   └── mealService.ts
│   │   ├── hooks/
│   │   │   └── useMeals.ts
│   │   └── README.md
│   │
│   ├── costs/                    # Cost Management
│   │   ├── components/
│   │   │   ├── CostForm.tsx
│   │   │   ├── CostCard.tsx
│   │   │   └── CostsList.tsx
│   │   ├── pages/
│   │   │   └── CostsPage.tsx
│   │   ├── services/
│   │   │   └── costService.ts
│   │   ├── hooks/
│   │   │   └── useCosts.ts
│   │   └── README.md
│   │
│   ├── deposits/                 # Deposit Tracking
│   │   ├── components/
│   │   │   ├── DepositForm.tsx
│   │   │   ├── DepositCard.tsx
│   │   │   └── DepositsList.tsx
│   │   ├── pages/
│   │   │   └── DepositsPage.tsx
│   │   ├── services/
│   │   │   └── depositService.ts
│   │   ├── hooks/
│   │   │   └── useDeposits.ts
│   │   └── README.md
│   │
│   ├── settlement/               # Settlement & Reports
│   │   ├── components/
│   │   │   ├── SettlementTable.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── PDFGenerator.tsx
│   │   │   └── DebtSummary.tsx
│   │   ├── pages/
│   │   │   └── SettlementPage.tsx
│   │   ├── services/
│   │   │   └── settlementService.ts
│   │   ├── hooks/
│   │   │   └── useSettlement.ts
│   │   └── README.md
│   │
│   ├── onboarding/               # Setup Wizard
│   │   ├── components/
│   │   │   ├── CreateMessForm.tsx
│   │   │   ├── CreateMonthForm.tsx
│   │   │   └── WizardSteps.tsx
│   │   ├── pages/
│   │   │   └── OnboardingPage.tsx
│   │   └── README.md
│   │
│   └── profile/                  # User Profile
│       ├── components/
│       │   ├── ProfileForm.tsx
│       │   └── SettingsPanel.tsx
│       ├── pages/
│       │   └── ProfilePage.tsx
│       └── README.md
│
├── components/
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Empty.tsx
│   │
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       ├── form.tsx
│       └── ...
│
├── hooks/
│   ├── useMobileNav.ts           # Mobile navigation
│   └── useToast.ts               # Toast notifications
│
├── stores/
│   ├── authStore.ts              # ✅ Auth state
│   ├── messStore.ts              # ✅ Mess context
│   ├── mealStore.ts              # ✅ Meals data
│   ├── costStore.ts              # ✅ Costs data
│   ├── depositStore.ts           # ✅ Deposits data
│   ├── settlementStore.ts        # ✅ Settlement calculations
│   └── uiStore.ts                # ✅ UI state
│
├── services/
│   ├── apiClient.ts              # Axios instance
│   └── common.ts                 # Common service utilities
│
├── types/
│   ├── common.ts                 # Common types
│   └── api.ts                    # API response types
│
├── utils/
│   ├── constants.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── App.tsx
└── main.tsx
```

## State Management (Zustand - 7 Stores)

### 1. Auth Store (`authStore.ts`)
User authentication state with persist middleware
```typescript
{
  user: UserProfileDto | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  
  setUser, setTokens, login, logout, 
  clearError, getAuthHeader()
}
```

### 2. Mess Store (`messStore.ts`)
Active mess context and members
```typescript
{
  messId: string | null,
  messName: string | null,
  members: Member[],
  activeMonth: Month | null,
  allMonths: Month[],
  
  setMess, setMembers, addMember, removeMember, updateMember,
  setActiveMonth, isMemberManager, getMemberById()
}
```

### 3. Meal Store (`mealStore.ts`)
Meals with pagination and aggregation
```typescript
{
  meals: Meal[],
  totalMeals: number,
  currentPage: number,
  pageSize: number,
  cursor: string | null,
  hasMore: boolean,
  mealsByMember: Record<string, Meal[]>,
  
  setMeals, addMeal, updateMeal, deleteMeal,
  getMemberMeals(), calculateMemberMealCost()
}
```

### 4. Cost Store (`costStore.ts`)
Individual and shared costs with tracking
```typescript
{
  costs: Cost[],
  totalIndividualCost: number,
  totalSharedCost: number,
  costsByMember: Record<string, Cost[]>,
  costsByType: { individual: Cost[], shared: Cost[] },
  
  setCosts, addCost, updateCost, deleteCost,
  getMemberCosts(), calculateTotalCosts()
}
```

### 5. Deposit Store (`depositStore.ts`)
Member deposits and contributions
```typescript
{
  deposits: Deposit[],
  totalDeposits: number,
  depositsByMember: Record<string, Deposit[]>,
  
  setDeposits, addDeposit, updateDeposit, deleteDeposit,
  getMemberDeposits(), getMemberTotalDeposit(), getTotalDeposits()
}
```

### 6. Settlement Store (`settlementStore.ts`)
Balance calculations and debt settlement
```typescript
{
  currentSettlement: Settlement | null,
  settlements: Settlement[],
  memberBalances: Record<string, number>,
  totalMealCost: number,
  totalDeposit: number,
  totalCost: number,
  
  setCurrentSettlement, calculateBalances,
  getMemberBalance(), getDebts()
  // Returns: [{from, to, amount}]
}
```

### 7. UI Store (`uiStore.ts`)
Modal, loading, and notification states
```typescript
{
  isAuthModalOpen: boolean,
  isAddMealModalOpen: boolean,
  isAddCostModalOpen: boolean,
  isPageLoading: boolean,
  isSidebarOpen: boolean,
  toasts: Toast[],
  confirmDialog: { isOpen, title, message, onConfirm },
  
  openAuthModal/closeAuthModal/toggleAuthModal,
  openAddMealModal/closeAddMealModal,
  setPageLoading, toggleSidebar,
  addToast, removeToast, clearToasts,
  openConfirmDialog, closeConfirmDialog
}
```

## Data Fetching (TanStack React Query)

### Hooks Pattern
```typescript
// Queries (GET)
useGetMess(messId)
useGetMealsByMonth(monthId, { cursor })
useGetMembersList(messId)

// Mutations (POST, PUT, DELETE)
useAddMeal()
useAddCost()
useAddDeposit()
useUpdateSettlement()
```

### Query Keys
```typescript
queryKeys = {
  mess: {
    all: ['mess'],
    byId: (id) => ['mess', id],
    members: (id) => ['mess', id, 'members']
  },
  meals: {
    all: ['meals'],
    byMonth: (monthId) => ['meals', monthId],
    infinite: (monthId) => ['meals', monthId, 'infinite']
  },
  settlement: {
    all: ['settlement'],
    byMonth: (monthId) => ['settlement', monthId]
  }
}
```

## API Service Layer

### Request/Response Types (Fully Typed)

```typescript
// Generic Response Wrapper
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta: {
    timestamp: string
    version: string
  }
}

interface ApiError {
  code: string
  message: string
  details?: Record<string, string>
}

// Paginated Response
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    cursor: string
    hasMore: boolean
    limit: number
  }
}
```

### Service Methods

All service methods return fully typed responses:

```typescript
// Auth Service
authService.login(email: string, password: string): Promise<ApiResponse<LoginResponse>>
authService.logout(): Promise<ApiResponse<null>>

// Meal Service
mealService.addMeal(data: CreateMealDTO): Promise<ApiResponse<Meal>>
mealService.getMeals(monthId: string, cursor?: string): Promise<PaginatedResponse<Meal>>

// Settlement Service
settlementService.getSettlement(monthId: string): Promise<ApiResponse<Settlement>>
```

## Custom Hooks

### useAuth
```typescript
const { user, token, login, logout, isLoading } = useAuth()
```

### useActiveMess
```typescript
const { mess, members, setActiveMess } = useActiveMess()
```

### useBalance
```typescript
const balance = useBalance(memberId)
```

### usePagination
```typescript
const { items, cursor, hasMore, fetchMore } = usePagination(
  mealService.getMeals,
  monthId
)
```

### useRealtimeCalculations
```typescript
const { totalMeal, totalCost, totalDeposit, balance } = useRealtimeCalculations()
```

## Pages

### Public Pages
- **Landing** - Marketing and overview
- **Login** - Google OAuth login
- **Register** - Account creation

### Protected Pages
- **Onboarding** - Create mess and first month
- **Dashboard** - Overview with stats and member info
- **Members** - Manage group members
- **Meals** - Add and view meal records
- **Costs** - Individual and shared costs
- **Deposits** - Track member deposits
- **Settlement** - View and settle balances
- **Profile** - User profile and settings

## Forms

### React Hook Form Integration

All forms use React Hook Form for state management and validation:

```typescript
const form = useForm<CreateMealDTO>({
  resolver: zodResolver(createMealSchema),
  defaultValues: { ... }
})
```

### Validation

Zod schemas for runtime validation:

```typescript
const createMealSchema = z.object({
  date: z.date(),
  memberId: z.string().uuid(),
  breakfast: z.number().min(0),
  lunch: z.number().min(0),
  dinner: z.number().min(0)
})
```

## Components

### Common Components
- **Button** - Primary, secondary variants
- **Card** - Content containers
- **Input** - Text, email, number, date
- **Select** - Dropdown selection
- **Modal** - Dialog boxes
- **Toast** - Notifications

### Domain Components
- **MemberCard** - Display member info
- **MealForm** - Add meal form
- **CostForm** - Add cost form
- **SettlementTable** - Settlement breakdown
- **BalanceCard** - Member balance display

## PDF Generation

Using jsPDF and html2pdf:

```typescript
const generatePDF = async (monthId: string) => {
  const settlement = await settlementService.getSettlement(monthId)
  const doc = new jsPDF()
  // Generate PDF content
  doc.save(`settlement-${monthId}.pdf`)
}
```

## Real-time Calculations

Zustand stores handle real-time calculations:

```typescript
const settlementStore = create((set) => ({
  updateCalculations: () => {
    const meals = mealStore.getState().meals
    const costs = costStore.getState().costs
    const deposits = depositStore.getState().deposits
    // Calculate balances
    set({ balances: newBalances })
  }
}))
```

## Authentication Flow

1. User clicks "Login with Google"
2. Redirected to `/auth/callback?code=xxx`
3. Exchange code for token
4. Store JWT in localStorage/session
5. Attach to all API requests via authorization header
6. Protected routes check auth before rendering

## Environment Variables

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=MESO
VITE_APP_VERSION=1.0.0
```

## Development

### Run Development Server
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Type Checking
```bash
npm run type-check
```

## Performance Optimizations

- Code splitting with React lazy
- Image optimization and lazy loading
- Virtual scrolling for large lists
- Query caching with TanStack React Query
- Debounced search and input
- Memoized components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Code Style

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- SOLID principles
