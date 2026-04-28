"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/lib/auth-session";
import type { AuthPayload } from "@/lib/next-api";
import { logout } from "@/lib/next-api";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload["user"] | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const isAuthenticated = !!user;
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const workspaceHref = user?.hasActiveMonth ? "/dashboard" : "/meals";
  const primaryHref = isAuthenticated ? workspaceHref : "/register";

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore and clear local session
    }
    clearAuthSession();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <span className="font-bold text-white">M</span>
          </div>
          <span className="text-xl font-bold">Meso</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-sm font-semibold text-gray-900">{displayName}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
              <Link
                href={workspaceHref}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <UserCircle size={18} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2 text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            {isAuthenticated ? `Welcome back, ${user?.firstName}` : "Manage Your Mess Finances Effortlessly"}
          </h1>
          <p className="mb-8 text-xl text-gray-700">
            {isAuthenticated
              ? "Jump back into your mess workspace, review your profile, and continue managing meals, costs, deposits, and settlement."
              : "Track meals, manage costs, handle deposits, and settle accounts with your roommates. All in one beautiful, simple platform."}
          </p>
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-3 rounded-[14px] bg-red-600 px-9 py-4 text-xl font-bold text-white transition-colors hover:bg-red-700"
          >
            {isAuthenticated ? "Open Workspace" : "Get Started"} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="mb-2 text-lg font-bold">Track Meals</h3>
            <p className="text-gray-600">Record meals for each member and automatically calculate costs</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="mb-2 text-lg font-bold">Manage Costs</h3>
            <p className="text-gray-600">Add individual or shared expenses and track spending</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mb-2 text-lg font-bold">Settle Accounts</h3>
            <p className="text-gray-600">Calculate balances and settle accounts at the end of each month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
