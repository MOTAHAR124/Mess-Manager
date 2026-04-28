/**
 * Common types and interfaces used across the application
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  rawPass?: string
  profilePicture?: string
  phone?: string
  address?: string
  isVerified: boolean
  hasActiveMonth: boolean
  lastLogin?: string
  createdAt: string
}

export interface CreateMessRequest {
  name: string
}

export interface CreateMonthRequest {
  messId: string
  name: string
  startDate: string
  endDate: string
}

export interface CreateMealRequest {
  monthId: string
  messId: string
  memberId: string
  date: string
  breakfast: number
  lunch: number
  dinner: number
  details?: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  success: boolean
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: ApiError
  metadata: {
    timestamp: string
    requestId?: string
    pagination?: Pagination
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  cursor?: string | null
}

export enum Role {
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED',
}

export enum MonthStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CostType {
  INDIVIDUAL = 'INDIVIDUAL',
  SHARED = 'SHARED',
}

export interface Mess {
  id: string
  name: string
  managerId: string
  activeMonthId?: string
  members?: MessMember[]
  activeMonth?: Month | null
  createdAt: string
  updatedAt: string
}

export interface MessMember {
  id: string
  messId: string
  userId: string
  user: User
  role: Role
  status: MemberStatus
  joinedAt: string
}

export interface Month {
  id: string
  messId: string
  name: string
  status: MonthStatus
  startDate: string
  endDate: string
  createdAt: string
  updatedAt?: string
}

export interface Meal {
  id: string
  monthId: string
  messId: string
  memberId: string
  date: string
  breakfast: number
  lunch: number
  dinner: number
  details?: string
  createdAt: string
}

export interface Cost {
  id: string
  monthId: string
  messId: string
  name: string
  amount: number
  type: CostType
  memberId?: string
  distribution?: CostDistribution[]
  details?: string
  description?: string
  category?: string
  createdAt: string
  updatedAt?: string
}

export interface CostDistribution {
  id: string
  costId: string
  memberId: string
  amount: number
}

export interface Deposit {
  id: string
  monthId: string
  messId: string
  memberId: string
  amount: number
  date: string
  details?: string
  method?: string
  createdAt: string
  updatedAt?: string
}

export interface SettlementMemberBalance {
  meals: number
  cost: number
  deposit: number
  balance: number
}

export interface Settlement {
  id: string
  monthId: string
  memberBalances: Record<string, SettlementMemberBalance>
  totalMeals?: number
  mealRate?: number
  totalMealCost: number
  totalDeposit: number
  totalCost: number
  settledAt?: string
  createdAt: string
  updatedAt?: string
}

export interface BazarDate {
  id: string
  monthId: string
  date: string
  memberId: string
  member?: MessMember
  createdAt: string
}

export interface Pagination {
  cursor: string | null
  hasMore: boolean
  limit: number
}
