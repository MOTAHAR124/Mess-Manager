import { Cost, Deposit, Settlement } from "@/types/common";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

function withAuthHeaders() {
  const headers = new Headers();
  if (API_TOKEN) headers.set("Authorization", `Bearer ${API_TOKEN}`);
  return headers;
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(withAuthHeaders().entries()),
      },
    });

    if (!response.ok) return null;
    const body = (await response.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function getDashboardSummary(messId: string) {
  return apiGet<{
    totalMembers: number;
    totalMeals: number;
    totalMealCost: number;
    totalDeposits: number;
    totalBalance: number;
  }>(`/dashboard/manager/summary?messId=${messId}`);
}

export async function getMeals(monthId: string) {
  return apiGet<Array<{ id: string; memberId: string; breakfast: number; lunch: number; dinner: number; date: string }>>(
    `/meals/month/${monthId}`,
  );
}

export async function getDeposits(monthId: string) {
  return apiGet<Deposit[]>(`/deposits/month/${monthId}`);
}

export async function getExpenses(monthId: string) {
  const expenses = await apiGet<Cost[]>(`/expenses/month/${monthId}`);
  if (expenses) return expenses;
  // Backward compatibility with existing costs route.
  return apiGet<Cost[]>(`/costs/month/${monthId}`);
}

export async function getSettlement(monthId: string) {
  return apiGet<Settlement>(`/settlement/${monthId}`);
}
