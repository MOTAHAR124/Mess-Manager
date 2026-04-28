# Dashboard Feature

## Purpose

The Dashboard feature provides comprehensive overview of mess operations with real-time statistics and data summaries.

## Architecture

```
dashboard/
├── components/
│   ├── DashboardHeader.tsx          # Page header
│   ├── StatsCard.tsx                 # Stat cards component
│   ├── MembersTable.tsx              # Members summary table
│   ├── RecentActivities.tsx          # Recent activities list
│   └── QuickStats.tsx                # Quick statistics display
├── hooks/
│   └── useDashboard.ts               # Custom hooks for data fetching
├── services/
│   └── dashboardService.ts           # API calls
├── pages/
│   └── DashboardPage.tsx             # Main dashboard page
└── README.md                         # This file
```

## Features

### Admin Dashboard
- System-wide statistics (users, messes, transactions)
- Recent messes list with pagination
- Top messes by activity

### Manager Dashboard
- Mess-specific summary
- Members with balances (paginated)
- Recent activities
- Quick stats cards

## Components

### StatsCard
Displays a single statistic with icon and label
```tsx
<StatsCard 
  title="Total Members"
  value={8}
  icon="Users"
  trend="+2"
/>
```

### MembersTable
Paginated table of members with their balances
```tsx
<MembersTable 
  members={members}
  loading={isLoading}
  onNextPage={() => {}}
/>
```

### RecentActivities
List of recent meals, costs, and deposits
```tsx
<RecentActivities 
  activities={activities}
  loading={isLoading}
/>
```

## Data Flow

1. Page loads with active mess context from messStore
2. Hooks fetch dashboard data via API
3. Data is displayed using shadcn UI components
4. Real-time updates on deposit/meal additions

## shadcn UI Components Used

- Card - For stat cards and containers
- Table - For members and activities lists
- Badge - For status indicators
- Button - For actions
- Skeleton - For loading states
- Empty - For no data states

## Hooks

### useDashboard
```tsx
const { stats, members, activities, loading, error } = useDashboard();
```

Fetches and caches dashboard data with automatic refetching.

## Integration Points

- messStore - Get active mess context
- authStore - Get user role for conditional rendering
- API - Fetch dashboard data
- useUIStore - Show loading/error states
