"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, LoginParams, RegisterParams, authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Function to verify session
  const verifyUserSession = async () => {
    try {
      // Check if we have a token first to avoid unnecessary API calls
      if (!authService.getToken()) {
        console.log('[AuthContext] No token found, user not authenticated');
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      // Verify session with server
      const verifiedUser = await authService.verifySession();
      if (verifiedUser) {
        setUser(verifiedUser);
        setIsAuthenticated(true);
        return true;
      } else {
        // If verification fails, clear session
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.log('[AuthContext] Session verification failed, clearing auth state');
      // Don't log this as an error since 401 is expected when not authenticated
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        setIsLoading(true);
        
        // Only try to load user if we have a valid token
        if (authService.getToken()) {
          // Try to load user from storage first for immediate UI feedback
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
          
          // Verify session with server
          const sessionValid = await verifyUserSession();
          
          if (!sessionValid && storedUser) {
            // If server verification fails but we had a stored user,
            // clear the session and redirect to login
            console.log('[AuthContext] Session invalid, redirecting to login');
            router.push('/login');
          }
        } else {
          // No token, user is not authenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth loading error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromSession();

    // Set up periodic session verification (every 5 minutes)
    sessionCheckInterval.current = setInterval(() => {
      if (authService.isAuthenticated() && authService.getToken()) {
        console.log('[AuthContext] Periodic session check');
        verifyUserSession();
      }
    }, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [router]);

  // Login function
  const login = async (params: LoginParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const loggedInUser = await authService.login(params);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (params: RegisterParams) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.register(params);
      // After registration, log the user in
      const loginParams = {
        email: params.email,
        password: params.password,
      };
      await login(loginParams);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext); 