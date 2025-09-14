// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthService, type User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Optional: Refresh user data from server if token exists
    if (AuthService.getToken() && currentUser) {
      AuthService.refreshUserProfile().then(updatedUser => {
        if (updatedUser) {
          setUser(updatedUser);
        }
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}