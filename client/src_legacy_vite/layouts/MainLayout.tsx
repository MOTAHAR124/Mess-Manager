import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMessStore } from '@/stores/messStore';
import { useMonthQuery } from '@/hooks/useMonth';
import { authService } from '@/services/authService';
import {
  LayoutDashboard,
  Wallet,
  Utensils,
  Receipt,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Bell,
  Home,
  Menu,
  X,
  User as UserIcon,
  PlusSquare,
  RefreshCcw,
  Trash2,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { clearMess, messName, activeMonth, allMonths } = useMessStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getMonthsQuery, switchMonthMutation } = useMonthQuery();

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspace', path: '/meals', icon: Utensils },
    { label: 'Deposits', path: '/deposits', icon: Wallet },
    { label: 'Expenses', path: '/costs', icon: Receipt },
    { label: 'Settlement', path: '/settlement', icon: Calculator },
    { label: 'History', path: '/history', icon: CalendarDays },
    { label: 'Members', path: '/members', icon: Users },
    { label: 'Profile Settings', path: '/profile', icon: UserIcon },
  ];
  const monthItems = (getMonthsQuery.data || []).length > 0 ? (getMonthsQuery.data || []) : allMonths;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    logout();
    clearMess();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100">
              <span className="text-white font-black text-xl italic leading-none">M</span>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">Meso</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Workspace</p>
            <h2 className="mt-2 text-base font-bold text-gray-900">{messName || 'Mess workspace'}</h2>
            <div className="mt-3 rounded-xl bg-white px-3 py-2 shadow-sm">
              <p className="text-xs text-gray-500">Active Month</p>
              <p className="text-sm font-semibold text-red-600">{activeMonth?.name || 'No active month'}</p>
            </div>
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-gray-100 text-red-600" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon size={18} className={cn(
                      "transition-colors",
                      isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">All Months</p>
              <CalendarDays size={14} className="text-gray-400" />
            </div>

            <div className="space-y-2">
              {monthItems.length > 0 ? monthItems.map((month) => {
                const isMonthActive = activeMonth?.id === month.id;
                return (
                  <button
                    key={month.id}
                    onClick={() => switchMonthMutation.mutate(month.id)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-left transition-colors',
                      isMonthActive
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <p className="text-sm font-semibold">{month.name}</p>
                    <p className="text-xs uppercase tracking-wide">{month.status}</p>
                  </button>
                );
              }) : (
                <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
                  Month list will appear after the first month is created.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button
              onClick={() => navigate('/onboarding')}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <PlusSquare size={18} className="text-gray-400" />
              Start New Month
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <CalendarDays size={18} className="text-gray-400" />
              View Month History
            </button>
            <button
              onClick={() => navigate('/members')}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <RefreshCcw size={18} className="text-gray-400" />
              Manage Members
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Settings size={18} className="text-gray-400" />
              Account Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={18} />
              Log Out
            </button>
          </div>
        </nav>

        {/* User context in sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
               {user?.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : displayName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-500 font-medium">Manager</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">
          <button 
            className="lg:hidden p-2 text-gray-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
               {[
                 { icon: LayoutDashboard, path: '/dashboard' },
                 { icon: Home, path: '/' },
                 { icon: CalendarDays, path: '/history' },
                 { icon: Users, path: '/members' },
                 { icon: Calculator, path: '/settlement' },
                 { icon: UserIcon, path: '/profile' }
               ].map((item, idx) => {
                 const Icon = item.icon;
                 const isPathActive = location.pathname === item.path;
                 return (
                   <button 
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isPathActive ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-900"
                    )}
                   >
                     <Icon size={18} />
                   </button>
                 );
               })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
               <span className="text-sm font-bold text-gray-700 hidden sm:inline-block">{displayName}</span>
               <div 
                className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-orange-200 cursor-pointer hover:ring-2 hover:ring-red-100 transition-all shadow-inner"
                onClick={() => navigate('/profile')}
               >
                 {displayName[0]}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
