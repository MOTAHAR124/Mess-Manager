import { AuthPayload } from "@/lib/next-api";
import { clearSession, saveAuthToken, saveRefreshToken } from "@/lib/runtime-config";

const USER_KEY = "meso_auth_user";

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthPayload["user"];
  } catch {
    return null;
  }
}

export function saveAuthSession(payload: AuthPayload) {
  if (typeof window === "undefined") return;
  saveAuthToken(payload.accessToken);
  saveRefreshToken(payload.refreshToken);
  saveStoredUser(payload.user);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  clearSession();
  localStorage.removeItem(USER_KEY);
}

export function saveStoredUser(user: AuthPayload["user"]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
