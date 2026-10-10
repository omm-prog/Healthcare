import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResponse } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('carepulse_access_token');
    localStorage.removeItem('carepulse_refresh_token');
    localStorage.removeItem('carepulse_user');
    setToken(null);
    setUser(null);
  }, []);

  // Initialize from localStorage on initial load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('carepulse_access_token');
      const savedUser = localStorage.getItem('carepulse_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved authentication state', e);
      logout();
    } finally {
      setIsLoading(false);
    }

    // Listen for automatic logout events triggered by axios interceptor
    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('carepulse_auth_logout', handleAutoLogout);
    return () => {
      window.removeEventListener('carepulse_auth_logout', handleAutoLogout);
    };
  }, [logout]);

  const login = async (credentials: LoginPayload): Promise<LoginResponse> => {
    const data = await authApi.login(credentials);
    
    // Store credentials securely
    localStorage.setItem('carepulse_access_token', data.access);
    localStorage.setItem('carepulse_refresh_token', data.refresh);
    localStorage.setItem('carepulse_user', JSON.stringify(data.user));

    setToken(data.access);
    setUser(data.user);

    return data;
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    await authApi.register(payload);
    // After registration, automatically log the user in
    await login({ email: payload.email, password: payload.password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
