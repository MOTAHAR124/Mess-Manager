"use client";

import { useEffect, useState } from "react";
import { clearAuthSession, getStoredUser, saveStoredUser } from "@/lib/auth-session";
import { getCurrentUser, logout } from "@/lib/next-api";
import { getAuthToken } from "@/lib/runtime-config";

type ProfileState = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  hasActiveMonth: boolean;
  createdAt: string;
  lastLogin?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getStoredUser();
    if (cached) setUser(cached);

    if (!getAuthToken()) return;

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const live = await getCurrentUser();
        setUser(live);
        saveStoredUser(live);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLogout() {
    try {
      if (getAuthToken()) {
        await logout();
      }
    } catch {
      // Ignore API logout errors and still clear local session.
    } finally {
      clearAuthSession();
      window.location.href = "/login";
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Session status and current authenticated user details.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}

      <div className="card space-y-3 p-5">
        <p className="text-sm"><span className="font-bold text-slate-700">Name:</span> {user ? `${user.firstName} ${user.lastName}` : "-"}</p>
        <p className="text-sm"><span className="font-bold text-slate-700">Email:</span> {user?.email || "-"}</p>
        <p className="text-sm"><span className="font-bold text-slate-700">Verified:</span> {user?.isVerified ? "Yes" : "No"}</p>
        <p className="text-sm"><span className="font-bold text-slate-700">Active Month:</span> {user?.hasActiveMonth ? "Yes" : "No"}</p>
        <p className="text-sm"><span className="font-bold text-slate-700">Created:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
        <p className="text-sm"><span className="font-bold text-slate-700">Last Login:</span> {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</p>
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={loading}
          className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-60"
        >
          Logout
        </button>
      </div>
    </section>
  );
}
