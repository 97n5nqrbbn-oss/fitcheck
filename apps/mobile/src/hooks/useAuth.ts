import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store';

export function useAuth() {
  const { user, token, isLoading, login, logout, register } = useAuthStore();

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  };
}
