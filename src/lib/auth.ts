import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  permissions?: string[];
}

export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

// Use a function to get the API URL to ensure it's properly constructed at runtime
function getAuthApiUrl() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/api/v1/auth`;
}

const AUTH_API_URL = getAuthApiUrl();

class AuthService {
  // Check if user is logged in
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }

  // Get current user from local storage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      // Error parsing user data
      return null;
    }
  }

  // Get auth token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // Login user
  async login(params: LoginParams): Promise<User> {
    try {
      const response = await axios.post<LoginResponse>(AUTH_API_URL, {
        ...params,
        action: 'login'
      });

      const { user, access_token } = response.data;

      // Store auth data in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  // Register new user
  async register(params: RegisterParams): Promise<User> {
    try {
      const response = await axios.post<{ message: string; user: User }>(AUTH_API_URL, {
        ...params,
        action: 'register'
      });

      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await axios.post(AUTH_API_URL, { action: 'logout' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  // Verify current session
  async verifySession(): Promise<User | null> {
    const token = this.getToken();
    console.log('[DEBUG] verifySession - Token exists:', !!token);
    
    if (!token) return null;

    try {
      // Use full URL path to avoid URL parsing issues
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const verifyUrl = `${baseUrl}/api/v1/auth/me`;
      console.log('[DEBUG] verifySession - Making request to:', verifyUrl);
      
      // First try: Make the request with the token
      try {
        const response = await axios.get<{ user: User; isAuthenticated: boolean }>(
          verifyUrl, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            // Add timeout to prevent hanging requests
            timeout: 5000
          }
        );

        console.log('[DEBUG] verifySession - Response status:', response.status);

        if (response.data.isAuthenticated && response.data.user) {
          console.log('[DEBUG] verifySession - User authenticated:', response.data.user.name);
          // Update stored user data
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
          return response.data.user;
        }
      } catch (error) {
        console.error('[DEBUG] verifySession - First attempt error:', error);
        
        // If we got a 404, try fallback to base auth endpoint
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log('[DEBUG] verifySession - ME endpoint not found, trying fallback');
          
          // Fall back to getting the stored user
          const storedUser = this.getCurrentUser();
          if (storedUser) {
            console.log('[DEBUG] verifySession - Using stored user as fallback:', storedUser.name);
            return storedUser;
          }
        }
      }

      console.log('[DEBUG] verifySession - User not authenticated');
      // Clear invalid session
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return null;
    } catch (error) {
      console.error('[DEBUG] verifySession - Error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('[DEBUG] verifySession - Status:', error.response?.status);
        console.error('[DEBUG] verifySession - Data:', error.response?.data);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          console.log('[DEBUG] verifySession - Unauthorized, clearing session');
        }
      }
      
      // For network errors, don't immediately clear the session
      // This prevents users from being logged out due to temporary connectivity issues
      if (axios.isAxiosError(error) && !error.response) {
        console.log('[DEBUG] verifySession - Network error, keeping session active');
        const storedUser = this.getCurrentUser();
        if (storedUser) {
          return storedUser;
        }
      } else {
        // Clear invalid session for other errors
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      
      return null;
    }
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }

  // Check if user has role
  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }
}

export const authService = new AuthService();
export default authService; 