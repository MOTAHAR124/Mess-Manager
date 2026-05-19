"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Calculator,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  User as UserIcon,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/lib/auth-session";
import { listenRuntimeChange, getAuthToken, getRuntimeConfig } from "@/lib/runtime-config";
import { clearManagerSession, logout } from "@/lib/next-api";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/reset-password",
]);

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Workspace", path: "/meals", icon: Utensils },
  { label: "Deposits", path: "/deposits", icon: Wallet },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "Settlement", path: "/settlement", icon: Calculator },
  { label: "Members", path: "/members", icon: Users },
  { label: "Profile Settings", path: "/profile", icon: UserIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);
  const [token, setToken] = useState("");
  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("");
  const [monthId, setMonthId] = useState("");
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      const user = getStoredUser();
      const config = getRuntimeConfig();
      setToken(getAuthToken());
      setDisplayName(user ? `${user.firstName} ${user.lastName}`.trim() : "User");
      setEmail(user?.email || "");
      setIsManager(user?.authRole === "MANAGER");
      setMonthId(config.monthId || "No active month");
    };

    hydrate();
    setIsAuthHydrated(true);
    return listenRuntimeChange(() => hydrate());
  }, []);

  const isPublicPath = useMemo(() => PUBLIC_PATHS.has(pathname), [pathname]);

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (!isPublicPath && !token) {
      router.replace("/login");
    }
  }, [isAuthHydrated, isPublicPath, router, token]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // fall through and clear local session regardless
    }
    await clearManagerSession();
    clearAuthSession();
    router.push("/login");
  };

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white shadow-sm lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-100">
              <span className="text-xl font-black italic leading-none text-white">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">Meso</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Workspace</p>
            <h2 className="mt-2 text-base font-bold text-gray-900">Mess workspace</h2>
            <div className="mt-3 rounded-xl bg-white px-3 py-2 shadow-sm">
              <p className="text-xs text-gray-500">Active Month</p>
              <p className="text-sm font-semibold text-red-600">{monthId}</p>
            </div>
          </div>

          <ul className="space-y-1">
            {navItems.filter((item) => isManager || item.path !== "/dashboard").map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={`${item.path}-${item.label}`}>
                  <Link
                    href={item.path}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive ? "bg-gray-100 text-red-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-red-600" : "text-gray-400 transition-colors group-hover:text-gray-600"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-2">
            {isManager && (
              <Link
                href="/dashboard"
                className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <LayoutDashboard size={18} className="text-gray-400" />
                Open Dashboard
              </Link>
            )}
            <Link
              href="/settlement"
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Calculator size={18} className="text-gray-400" />
              Settlement View
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-tr from-red-600 to-orange-500 font-bold text-white shadow-sm">
              {displayName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-900">{displayName}</p>
              <p className="truncate text-[10px] font-medium text-gray-500">{email || "Manager"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-gray-400 shadow-sm transition-all hover:bg-white hover:text-red-500"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
          <button className="p-2 text-gray-500 lg:hidden" onClick={() => setIsMobileMenuOpen((s) => !s)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex flex-1 justify-center lg:justify-start">
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 p-1">
              {[
                { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
                { label: "Calendar", icon: CalendarDays, path: "/settlement" },
                { label: "Members", icon: Users, path: "/members" },
                { label: "Settlement", icon: Calculator, path: "/settlement" },
                { label: "Profile", icon: UserIcon, path: "/profile" },
              ].filter((item) => isManager || item.path !== "/dashboard").map((item, idx) => {
                const Icon = item.icon;
                const isPathActive = pathname === item.path;
                return (
                  <Link
                    key={`${item.path}-${idx}`}
                    href={item.path}
                    aria-label={item.label}
                    title={item.label}
                    className={`group relative rounded-lg p-1.5 transition-all ${
                      isPathActive ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 transition-colors hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <span className="hidden text-sm font-bold text-gray-700 sm:inline-block">{displayName}</span>
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-100 font-bold text-orange-600 shadow-inner transition-all hover:ring-2 hover:ring-red-100"
              >
                {displayName[0]}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 scroll-smooth lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
}
