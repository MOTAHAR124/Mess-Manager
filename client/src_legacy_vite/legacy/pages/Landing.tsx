import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAuthenticated = !!user;
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-xl font-bold">Meso</span>
        </div>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-900">{displayName}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
              <button
                onClick={() => navigate(user?.hasActiveMonth ? '/dashboard' : '/onboarding')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 inline-flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 inline-flex items-center gap-2"
              >
                <UserCircle size={18} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-gray-700 hover:text-gray-900"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {isAuthenticated
              ? `Welcome back, ${user?.firstName}`
              : 'Manage Your Mess Finances Effortlessly'}
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            {isAuthenticated
              ? 'Jump back into your mess workspace, review your profile, and continue managing meals, costs, deposits, and settlement.'
              : 'Track meals, manage costs, handle deposits, and settle accounts with your roommates. All in one beautiful, simple platform.'}
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? (user?.hasActiveMonth ? '/dashboard' : '/onboarding') : '/register')}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-semibold"
          >
            {isAuthenticated ? 'Open Workspace' : 'Get Started'} <ArrowRight size={20} />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Track Meals</h3>
            <p className="text-gray-600">
              Record meals for each member and automatically calculate costs
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Manage Costs</h3>
            <p className="text-gray-600">
              Add individual or shared expenses and track spending
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Settle Accounts</h3>
            <p className="text-gray-600">
              Calculate balances and settle accounts at the end of each month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
