import { useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/authService';
import type { LoginDto, RegisterDto, AuthResponseDto } from '@/types/common';

/**
 * useAuth Hook
 * 
 * Manages authentication state and mutations
 * Syncs with authStore and API
 */

export function useAuth() {
  const authStore = useAuthStore();

  // Set auth header when token changes
  useEffect(() => {
    if (authStore.accessToken) {
      authService.setAuthHeader(authStore.accessToken);
    } else {
      authService.removeAuthHeader();
    }
  }, [authStore.accessToken]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onSuccess: (response) => {
      authStore.login(response);
    },
    onError: (error: Error) => {
      authStore.setError(error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response) => {
      authStore.login(response);
    },
    onError: (error: Error) => {
      authStore.setError(error.message);
    },
  });

  // Get current user
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () =>
      authStore.accessToken ? authService.getCurrentUser(authStore.accessToken) : null,
    enabled: !!authStore.accessToken && !authStore.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync profile to store
  useEffect(() => {
    if (profile) {
      authStore.setUser(profile);
    }
  }, [profile, authStore]);

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (authStore.accessToken) {
        await authService.logout(authStore.accessToken);
      }
    },
    onSuccess: () => {
      authStore.logout();
    },
    onError: () => {
      // Still logout locally even if API fails
      authStore.logout();
    },
  });

  // Refresh token
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      if (!authStore.refreshToken) throw new Error('No refresh token');
      return authService.refreshToken(authStore.refreshToken);
    },
    onSuccess: (response) => {
      authStore.setAccessToken(response.accessToken);
    },
    onError: () => {
      authStore.logout();
    },
  });

  // Verify email
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      authStore.setLoading(true);
      authStore.clearError();
      try {
        await loginMutation.mutateAsync({ email, password });
      } finally {
        authStore.setLoading(false);
      }
    },
    [loginMutation, authStore],
  );

  const handleRegister = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      authStore.setLoading(true);
      authStore.clearError();
      try {
        await registerMutation.mutateAsync({
          email,
          password,
          firstName,
          lastName,
        });
      } finally {
        authStore.setLoading(false);
      }
    },
    [registerMutation, authStore],
  );

  const handleLogout = useCallback(async () => {
    authStore.setLoading(true);
    try {
      await logoutMutation.mutateAsync();
    } finally {
      authStore.setLoading(false);
    }
  }, [logoutMutation, authStore]);

  const handleRefreshToken = useCallback(async () => {
    await refreshTokenMutation.mutateAsync();
  }, [refreshTokenMutation]);

  const handleVerifyEmail = useCallback(
    async (token: string) => {
      await verifyEmailMutation.mutateAsync(token);
    },
    [verifyEmailMutation],
  );

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading || isLoadingProfile,
    error: authStore.error,
    accessToken: authStore.accessToken,
    refreshToken: authStore.refreshToken,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    verifyEmail: handleVerifyEmail,
    clearError: () => authStore.clearError(),

    // Mutation states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
  };
}
