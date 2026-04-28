import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (code: string) => authService.googleLogin(code),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });

  const getUserQuery = useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    loginMutation,
    logoutMutation,
    getUserQuery,
  };
};
