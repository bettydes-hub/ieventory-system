import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery } from 'react-query';
import { RootState } from '@/store';
import { authService } from '@/services/authService';
import { loginStart, loginSuccess, loginFailure, logout, clearError } from '@/store/slices/authSlice';
import { LoginRequest, User } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const loginMutation = useMutation(authService.login, {
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
    },
  });

  const logoutMutation = useMutation(authService.logout, {
    onSuccess: () => {
      dispatch(logout());
    },
    onError: () => {
      dispatch(logout());
    },
  });

  const { data: profile, refetch: refetchProfile } = useQuery(
    'profile',
    authService.getProfile,
    {
      enabled: isAuthenticated,
      retry: false,
    }
  );

  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user: user || profile,
    token,
    isAuthenticated,
    loading: loading || loginMutation.isLoading,
    error,
    login,
    logout: handleLogout,
    clearError: clearAuthError,
    refetchProfile,
  };
};