import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useMessStore } from '@/stores/messStore';
import { messService } from '@/services/messService';

// Pages - Lazy loaded for better performance
import LandingPage from '@/pages/Landing';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import OnboardingPage from '@/pages/Onboarding';
import DashboardPage from '@/pages/Dashboard';
import MembersPage from '@/pages/Members';
import MealsPage from '@/pages/Meals';
import CostsPage from '@/pages/Costs';
import DepositsPage from '@/pages/Deposits';
import SettlementPage from '@/pages/Settlement';
import ProfilePage from '@/pages/Profile';
import HistoryPage from '@/pages/History';
import AuthCallbackPage from '@/pages/AuthCallback';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';

// Layout
import MainLayout from '@/layouts/MainLayout';

function App() {
  const { user, accessToken, setUser } = useAuthStore();
  const { messId, setMess, setMembers, setActiveMonth, clearMess } = useMessStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState<boolean>(false);

  useEffect(() => {
    if (!accessToken || !user) {
      clearMess();
      setHasWorkspace(false);
      setIsBootstrapping(false);
      return;
    }

    let isMounted = true;

    const bootstrapMessContext = async () => {
      try {
        const response = await messService.getCurrentMess();
        const mess = response.data;

        if (!isMounted || !mess) {
          if (isMounted && user?.hasActiveMonth !== false) {
            setUser({ ...user!, hasActiveMonth: false });
          }
          if (isMounted) {
            setHasWorkspace(false);
          }
          return;
        }

        setHasWorkspace(true);
        setMess(mess.id, mess.name);
        setMembers(mess.members || []);

        if (mess.activeMonth) {
          setActiveMonth(mess.activeMonth);
          if (user?.hasActiveMonth !== true) {
            setUser({ ...user!, hasActiveMonth: true });
          }
        } else {
          if (user?.hasActiveMonth !== false) {
            setUser({ ...user!, hasActiveMonth: false });
          }
        }
      } catch (error) {
        console.error('Failed to bootstrap mess context:', error);
        if (isMounted) {
          setHasWorkspace(false);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapMessContext();

    return () => {
      isMounted = false;
    };
  }, [accessToken, user?.id, messId, clearMess, setMess, setMembers, setActiveMonth, setUser]);

  const BootstrapScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="rounded-3xl border border-gray-100 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />
        <h1 className="text-lg font-bold text-gray-900">Loading workspace</h1>
        <p className="mt-2 text-sm text-gray-500">We are preparing your mess data.</p>
      </div>
    </div>
  );

  // Protected Route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!accessToken || !user) {
      return <Navigate to="/login" replace />;
    }
    if (isBootstrapping) {
      return <BootstrapScreen />;
    }
    return children;
  };

  // Onboarding Route wrapper
  const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
    if (!accessToken || !user) {
      return <Navigate to="/login" replace />;
    }
    if (isBootstrapping) {
      return <BootstrapScreen />;
    }
    if (hasWorkspace) {
      return <Navigate to={user.hasActiveMonth ? "/dashboard" : "/history"} replace />;
    }
    if (user.hasActiveMonth) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  // Dashboard Route wrapper (requires activeMonth)
  const DashboardRoute = ({ children }: { children: React.ReactNode }) => {
    if (!accessToken || !user) {
      return <Navigate to="/login" replace />;
    }
    if (isBootstrapping) {
      return <BootstrapScreen />;
    }
    if (user.hasActiveMonth && !messId) {
      return <BootstrapScreen />;
    }
    if (!user.hasActiveMonth && hasWorkspace) {
      return <Navigate to="/history" replace />;
    }
    if (!user.hasActiveMonth) {
      return <Navigate to="/onboarding" replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (accessToken && user) {
      if (isBootstrapping) {
        return <BootstrapScreen />;
      }
      if (hasWorkspace) {
        return <Navigate to={user.hasActiveMonth ? '/dashboard' : '/history'} replace />;
      }
      return <Navigate to={user.hasActiveMonth ? '/dashboard' : '/onboarding'} replace />;
    }
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/members"
            element={
              <DashboardRoute>
                <MainLayout>
                  <MembersPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/meals"
            element={
              <DashboardRoute>
                <MainLayout>
                  <MealsPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/costs"
            element={
              <DashboardRoute>
                <MainLayout>
                  <CostsPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/history"
            element={
              <DashboardRoute>
                <MainLayout>
                  <HistoryPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/deposits"
            element={
              <DashboardRoute>
                <MainLayout>
                  <DepositsPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/settlement"
            element={
              <DashboardRoute>
                <MainLayout>
                  <SettlementPage />
                </MainLayout>
              </DashboardRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
