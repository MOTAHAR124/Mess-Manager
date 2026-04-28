# Dashboard Module

## Purpose

The Dashboard module provides comprehensive overview statistics and data summaries for system administrators and managers. It aggregates data from multiple modules to provide real-time insights into mess operations.

## What It Does

- **Admin Dashboard**: Provides system-wide statistics and overview
- **Manager Dashboard**: Shows mess-specific summary and key metrics
- **Pagination Support**: All list endpoints support cursor-based pagination
- **Real-time Data**: Aggregates latest data from all modules
- **Performance Optimized**: Uses database indexes and caching

## Architecture

```
dashboard/
├── controllers/
│   └── dashboard.controller.ts      # HTTP endpoints
├── services/
│   └── dashboard.service.ts         # Business logic
├── repositories/
│   └── dashboard.repository.ts      # Data access layer
├── dto/
│   └── dashboard.dto.ts             # Request/Response DTOs
└── README.md                        # This file
```

## Endpoints

### Admin Dashboard Endpoints

**GET /api/v1/dashboard/admin/stats** (ADMIN only)
- Returns system-wide statistics
- Includes: Total users, total messes, active months, total transactions
- Response includes pagination info for nested lists

**GET /api/v1/dashboard/admin/recent-messes** (ADMIN only)
- Returns recently created messes with pagination
- Pagination: cursor, pageSize, hasMore
- Fields: id, name, createdBy, memberCount, createdAt

**GET /api/v1/dashboard/admin/top-messes** (ADMIN only)
- Returns messes by activity (most meals, most transactions)
- Pagination supported
- Fields: id, name, mealCount, transactionCount, lastActivity

### Manager Dashboard Endpoints

**GET /api/v1/dashboard/manager/summary** (MANAGER only)
- Returns current month summary for managed mess
- Fields: totalMembers, totalMeals, totalCosts, totalDeposits, totalBalance

**GET /api/v1/dashboard/manager/members-summary** (MANAGER only)
- Returns all members with their current month summaries
- Pagination supported (cursor-based)
- Fields per member: id, name, meals, costs, deposits, balance

**GET /api/v1/dashboard/manager/recent-activities** (MANAGER only)
- Returns recent meal, cost, deposit entries
- Pagination supported
- Fields: id, type, amount, date, member, description

## Data Models

### AdminDashboardStats
```typescript
{
  totalUsers: number;
  totalMesses: number;
  activeMesses: number;
  totalMembers: number;
  totalTransactions: number;
  totalMealCost: number;
  totalDeposits: number;
  lastUpdated: Date;
}
```

### ManagerDashboardSummary
```typescript
{
  messId: string;
  messName: string;
  monthId: string;
  monthName: string;
  totalMembers: number;
  totalMeals: number;
  totalMealCost: number;
  totalSharedCosts: number;
  totalIndividualCosts: number;
  totalDeposits: number;
  totalBalance: number;
}
```

### MemberSummary (for pagination)
```typescript
{
  id: string;
  name: string;
  email: string;
  totalMeals: number;
  totalMealCost: number;
  totalIndividualCosts: number;
  shareInSharedCosts: number;
  totalDeposits: number;
  balance: number;
}
```

## Pagination Format

All list endpoints return:
```typescript
{
  data: T[];
  cursor: string | null;  // For next page
  pageSize: number;
  hasMore: boolean;
  totalCount?: number;    // Optional total count
}
```

## Usage Examples

### Get Admin Stats
```bash
GET /api/v1/dashboard/admin/stats
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "totalUsers": 245,
    "totalMesses": 45,
    "activeMesses": 38,
    "totalMembers": 1250,
    "totalTransactions": 15000,
    "lastUpdated": "2026-04-04T10:30:00Z"
  }
}
```

### Get Members Summary (with pagination)
```bash
GET /api/v1/dashboard/manager/members-summary?pageSize=20&cursor=abc123
Authorization: Bearer <manager_token>

Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "member-1",
        "name": "John Doe",
        "totalMeals": 45,
        "totalMealCost": 2250,
        "totalDeposits": 3000,
        "balance": 750
      },
      // ... more members
    ],
    "cursor": "xyz789",
    "pageSize": 20,
    "hasMore": true,
    "totalCount": 8
  }
}
```

## Integration Points

- **Auth Module**: For user and role verification
- **Mess Module**: For mess and member data
- **Months Module**: For active month context
- **Meals Module**: For meal statistics
- **Costs Module**: For cost aggregations
- **Deposits Module**: For deposit data
- **Settlement Module**: For balance calculations

## Performance Considerations

1. **Caching**: Dashboard stats are cached for 5 minutes
2. **Indexes**: Database has indexes on:
   - users(created_at)
   - messes(created_at)
   - mess_members(mess_id)
   - meals(month_id, created_at)
   - costs(month_id, created_at)

3. **Pagination**: Always use cursor-based pagination for large datasets
4. **Aggregations**: Use database aggregations instead of in-memory calculations

## Security

- Admin stats endpoint requires ADMIN role
- Manager endpoints require MANAGER role for their mess
- All endpoints require authentication
- No sensitive data (passwords, tokens) is exposed

## Error Handling

All endpoints return standardized error responses:
```typescript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You don't have permission to access this resource"
  }
}
```

Common error codes:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have required role
- `NOT_FOUND`: Mess or user not found
- `INTERNAL_SERVER_ERROR`: Server error

## Testing

See `dashboard.controller.spec.ts` for unit tests.

## References

- [Architecture Plan](../../../../../../COMPLETE_ROADMAP.md)
- [Auth Module](../auth/README.md)
- [Response Format](../../../common/dto/response.dto.ts)
