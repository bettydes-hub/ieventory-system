import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { RootState } from '@/store';
import { authService } from '@/services/authService';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, clearError, updateUser, clearAuth, showFirstTimeLogin as showFirstTimeLoginAction, hideFirstTimeLogin, completeFirstTimeLogin } from '@/store/slices/authSlice';
import { LoginRequest, User, BasecampLoginRequest, ChangePasswordRequest } from '@/types';

// Enhanced error types
export interface AuthError {
  type: 'network' | 'validation' | 'unauthorized' | 'server' | 'unknown';
  message: string;
  code?: string;
}

// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, loading, error, showFirstTimeLogin } = useSelector((state: RootState) => state.auth);

  // Clear session timeout - Define this first
  const clearSessionTimeout = useCallback(() => {
    if (typeof window !== 'undefined') {
      const timeoutId = localStorage.getItem('sessionTimeout');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem('sessionTimeout');
      }
    }
  }, []);

  // Session timeout management
  const setupSessionTimeout = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Clear existing timeout
      const existingTimeout = localStorage.getItem('sessionTimeout');
      if (existingTimeout) {
        clearTimeout(parseInt(existingTimeout));
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        clearSessionTimeout();
        dispatch(logoutAction());
        queryClient.clear(); // Clear all cached data
      }, SESSION_TIMEOUT);

      localStorage.setItem('sessionTimeout', timeoutId.toString());
    }
  }, [dispatch, clearSessionTimeout, queryClient]);

  // Check authentication status on app startup
  useEffect(() => {
    const checkAuthStatus = () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        try {
          const userData = JSON.parse(savedUser);
          // Verify token is still valid (in a real app, you'd validate with the server)
          if (userData && userData.id) {
            dispatch(loginSuccess({ user: userData, token: savedToken }));
            // Set up session timeout for restored session
            setupSessionTimeout();
          } else {
            dispatch(clearAuth());
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          dispatch(clearAuth());
        }
      }
    };

    checkAuthStatus();
  }, [dispatch, setupSessionTimeout]);

  // Enhanced login mutation with better error handling
  const loginMutation = useMutation(authService.login, {
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      console.log('Login success data:', data);
      dispatch(loginSuccess(data));
      
      // Check if this is a first-time login
      if ((data.user as any).isFirstLogin && !(data.user as any).passwordChanged) {
        dispatch(showFirstTimeLoginAction());
      } else {
        // Set up session timeout only if not first-time login
        setupSessionTimeout();
      }
    },
    onError: (error: any) => {
      console.error('Login error in useAuth:', error);
      const authError: AuthError = {
        type: 'unknown',
        message: 'Login failed',
      };

      // Handle the new error structure with errorType
      if (error.errorType) {
        console.log('Error type:', error.errorType);
        switch (error.errorType) {
          case 'INVALID_EMAIL_FORMAT':
            authError.type = 'validation';
            authError.message = 'Please enter a valid email address';
            break;
          case 'EMAIL_NOT_FOUND':
            authError.type = 'unauthorized';
            authError.message = 'No account found with this email address';
            break;
          case 'INVALID_PASSWORD':
            authError.type = 'unauthorized';
            authError.message = 'Incorrect password. Please try again';
            break;
          case 'ACCOUNT_DEACTIVATED':
            authError.type = 'unauthorized';
            authError.message = 'Your account has been deactivated. Please contact an administrator';
            break;
          case 'MISSING_FIELDS':
            authError.type = 'validation';
            authError.message = 'Email and password are required';
            break;
          default:
            authError.type = 'unknown';
            authError.message = error.message || 'Login failed';
        }
      } else if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';
        
        if (status === 401) {
          authError.type = 'unauthorized';
          authError.message = 'Invalid credentials';
        } else if (status === 422) {
          authError.type = 'validation';
          authError.message = message;
        } else if (status >= 500) {
          authError.type = 'server';
          authError.message = 'Server error. Please try again later.';
        } else {
          authError.type = 'network';
          authError.message = message;
        }
      } else if (error.request) {
        authError.type = 'network';
        authError.message = 'Network error. Please check your connection.';
      }

      dispatch(loginFailure(authError.message));
    },
  });

  // Basecamp login mutation
  const basecampLoginMutation = useMutation(authService.basecampLogin, {
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      setupSessionTimeout();
    },
    onError: (error: any) => {
      const authError: AuthError = {
        type: 'unknown',
        message: 'Basecamp login failed',
      };

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Basecamp authentication failed';
        
        if (status === 401) {
          authError.type = 'unauthorized';
          authError.message = 'Basecamp authentication failed';
        } else if (status === 422) {
          authError.type = 'validation';
          authError.message = message;
        } else if (status >= 500) {
          authError.type = 'server';
          authError.message = 'Server error during Basecamp authentication';
        } else {
          authError.type = 'network';
          authError.message = message;
        }
      } else if (error.request) {
        authError.type = 'network';
        authError.message = 'Network error during Basecamp authentication';
      }

      dispatch(loginFailure(authError.message));
    },
  });

  // Enhanced logout mutation
  const logoutMutation = useMutation(authService.logout, {
    onSuccess: () => {
      handleLogout();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      handleLogout();
    },
  });

  // Profile query with automatic refetch
  const { data: profile, refetch: refetchProfile, isLoading: profileLoading } = useQuery(
    'profile',
    authService.getProfile,
    {
      enabled: isAuthenticated,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false; // Don't retry on auth errors
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Profile update mutation
  const updateProfileMutation = useMutation(authService.updateProfile, {
    onSuccess: (updatedUser) => {
      dispatch(updateUser(updatedUser));
      queryClient.invalidateQueries('profile');
    },
    onError: (error: any) => {
      console.error('Profile update failed:', error);
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation(authService.changePassword, {
    onSuccess: () => {
      // Could show success message here
    },
    onError: (error: any) => {
      console.error('Password change failed:', error);
    },
  });


  // Enhanced logout handler
  const handleLogout = useCallback(() => {
    clearSessionTimeout();
    dispatch(logoutAction());
    queryClient.clear(); // Clear all cached data
  }, [dispatch, queryClient, clearSessionTimeout]);

  // Role-based access control helpers
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return user && roles.indexOf(user.role) !== -1;
  }, [user]);

  const isAdmin = useMemo(() => hasRole('Admin'), [hasRole]);
  const isEmployee = useMemo(() => hasRole('Employee'), [hasRole]);
  const isDeliveryStaff = useMemo(() => hasRole('Delivery Staff'), [hasRole]);

  // Enhanced login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      // Error is already handled in mutation
      throw error;
    }
  }, [loginMutation]);

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Error is already handled in mutation
      throw error;
    }
  }, [logoutMutation]);

  // Profile update function
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [updateProfileMutation]);

  // Password change function
  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      await changePasswordMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [changePasswordMutation]);

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user has permission for specific actions
  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    
    // Define permissions based on roles
    const rolePermissions: Record<string, string[]> = {
      'Admin': ['*'], // Admin has all permissions
      'Employee': ['borrow', 'return', 'report_damage', 'view_inventory'],
      'Delivery Staff': ['view_deliveries', 'update_delivery_status'],
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.indexOf('*') !== -1 || userPermissions.indexOf(permission) !== -1;
  }, [user]);

  // Setup session timeout on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setupSessionTimeout();
    } else {
      clearSessionTimeout();
    }

    return () => {
      clearSessionTimeout();
    };
  }, [isAuthenticated, setupSessionTimeout, clearSessionTimeout]);

  // Handle window focus to refresh session
  useEffect(() => {
    const handleWindowFocus = () => {
      if (isAuthenticated) {
        // Reset session timeout when user returns to the app
        setupSessionTimeout();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [isAuthenticated, setupSessionTimeout]);

  // Enhanced return object
  return {
    // Core auth state
    user: user || profile,
    token,
    isAuthenticated,
    loading: loading || loginMutation.isLoading || profileLoading,
    error,
    
    // Auth actions
    login,
    basecampLogin: basecampLoginMutation.mutateAsync,
    logout,
    clearError: clearAuthError,
    refetchProfile,
    
    // Profile management
    updateProfile,
    changePassword,
    isUpdatingProfile: updateProfileMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
    
    // First-time login management
    showFirstTimeLogin,
    hideFirstTimeLogin: () => dispatch(hideFirstTimeLogin()),
    completeFirstTimeLogin: () => {
      dispatch(completeFirstTimeLogin());
      setupSessionTimeout();
    },
    
    // Role-based access control
    hasRole,
    hasAnyRole,
    hasPermission,
    isAdmin,
    isEmployee,
    isDeliveryStaff,
    
    // Session management
    setupSessionTimeout,
    clearSessionTimeout,
  };
};