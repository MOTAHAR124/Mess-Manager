import { Cost, Deposit, MessMember, Settlement } from "@/types/common";
import { clearSession, getAuthToken, getRefreshToken, saveAuthToken, saveRefreshToken } from "@/lib/runtime-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
};

type RefreshPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    hasActiveMonth: boolean;
    createdAt: string;
    lastLogin?: string;
  };
};

function authHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

const NO_RETRY_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

let refreshInFlight: Promise<string | null> | null = null;

function extractErrorMessage<T>(raw: ApiEnvelope<T> | T, status: number) {
  const maybeEnvelope = raw as ApiEnvelope<T>;
  if (typeof maybeEnvelope?.error?.message === "string") return maybeEnvelope.error.message;
  if (typeof maybeEnvelope?.message === "string") return maybeEnvelope.message;
  return `Request failed: ${status}`;
}

function unwrapApiResponse<T>(response: Response, raw: ApiEnvelope<T> | T): T {
  if (!response.ok) {
    throw new Error(extractErrorMessage(raw, response.status));
  }

  if (typeof raw === "object" && raw !== null && "data" in raw) {
    return (raw as ApiEnvelope<T>).data as T;
  }

  return raw as T;
}

async function performRequest<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string,
): Promise<{ response: Response; raw: ApiEnvelope<T> | T }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
      ...(tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {}),
    },
    cache: "no-store",
  });

  const raw = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | T;
  return { response, raw };
}

async function tryRefreshAccessToken() {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { response, raw } = await performRequest<RefreshPayload>(
          "/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
          },
        );
        const payload = unwrapApiResponse<RefreshPayload>(response, raw);
        saveAuthToken(payload.accessToken);
        saveRefreshToken(payload.refreshToken);
        return payload.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const firstAttempt = await performRequest<T>(path, init);

  if (
    firstAttempt.response.status === 401 &&
    !NO_RETRY_PATHS.has(path) &&
    !!getAuthToken()
  ) {
    const newAccessToken = await tryRefreshAccessToken();

    if (newAccessToken) {
      const retryAttempt = await performRequest<T>(path, init, newAccessToken);
      return unwrapApiResponse<T>(retryAttempt.response, retryAttempt.raw);
    }
  }

  return unwrapApiResponse<T>(firstAttempt.response, firstAttempt.raw);
}

export async function getDashboardSummary(messId: string) {
  return apiRequest<{
    totalMembers: number;
    totalMeals: number;
    totalMealCost: number;
    totalDeposits: number;
    totalBalance: number;
  }>(`/dashboard/manager/${encodeURIComponent(messId)}/summary`);
}

export async function getMembers(messId: string) {
  return apiRequest<MessMember[]>(`/mess/${messId}/members`);
}

export async function getMeals(monthId: string) {
  return apiRequest<Array<{ id: string; memberId: string; breakfast: number; lunch: number; dinner: number; date: string }>>(
    `/meals/month/${monthId}`,
  );
}

export async function createMeal(payload: {
  monthId: string;
  messId: string;
  memberId: string;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  details?: string;
}) {
  return apiRequest<unknown>(`/meals/bulk`, {
    method: "POST",
    body: JSON.stringify({ meals: [payload] }),
  });
}

export async function updateMeal(
  id: string,
  payload: { breakfast?: number; lunch?: number; dinner?: number; details?: string },
) {
  return apiRequest<unknown>(`/meals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMeal(id: string) {
  return apiRequest<null>(`/meals/${id}`, { method: "DELETE" });
}

export async function getDeposits(monthId: string) {
  return apiRequest<Deposit[]>(`/deposits/month/${monthId}`);
}

export async function createDeposit(payload: {
  monthId: string;
  messId: string;
  memberId: string;
  amount: number;
  date: string;
  details?: string;
}) {
  return apiRequest<Deposit>(`/deposits`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDeposit(
  id: string,
  payload: { amount?: number; date?: string; details?: string; memberId?: string },
) {
  return apiRequest<Deposit>(`/deposits/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDeposit(id: string) {
  return apiRequest<null>(`/deposits/${id}`, { method: "DELETE" });
}

export async function getExpenses(monthId: string) {
  try {
    return await apiRequest<Cost[]>(`/expenses/month/${monthId}`);
  } catch {
    return apiRequest<Cost[]>(`/costs/month/${monthId}`);
  }
}

export async function createExpense(payload: {
  monthId: string;
  messId: string;
  name: string;
  amount: number;
  type: "SHARED" | "INDIVIDUAL";
  memberId?: string;
  details?: string;
}) {
  return apiRequest<Cost>(`/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Note: SHARED update currently needs backend enhancement for split recalculation.
export async function updateExpense(
  id: string,
  payload: { name?: string; amount?: number; type?: "SHARED" | "INDIVIDUAL"; memberId?: string; details?: string },
) {
  return apiRequest<Cost>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id: string) {
  return apiRequest<null>(`/expenses/${id}`, { method: "DELETE" });
}

export async function getSettlement(monthId: string) {
  return apiRequest<Settlement>(`/settlement/${monthId}`);
}

export async function calculateSettlement(monthId: string) {
  return apiRequest<Settlement>(`/settlement/${monthId}/calculate`, {
    method: "POST",
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiRequest<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return apiRequest<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiRequest<AuthPayload["user"]>("/auth/me");
}

export async function logout() {
  return apiRequest<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function refreshToken(refreshTokenValue: string) {
  return apiRequest<{ accessToken: string; refreshToken: string; expiresIn: number }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return apiRequest<{ success: boolean; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  return apiRequest<{ success: boolean; message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
