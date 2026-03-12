import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('arc_token');
    const storedUserId = localStorage.getItem('arc_userId');
    const storedEmail = localStorage.getItem('arc_email');

    if (storedToken && storedUserId && storedEmail) {
      setToken(storedToken);
      setUserId(parseInt(storedUserId, 10));
      setEmail(storedEmail);
    }
  }, []);

  const login = async (emailInput: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      const { token: newToken, user } = data;

      // Store in state and localStorage
      setToken(newToken);
      setUserId(user.id);
      setEmail(user.email);
      localStorage.setItem('arc_token', newToken);
      localStorage.setItem('arc_userId', user.id.toString());
      localStorage.setItem('arc_email', user.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (emailInput: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
      const { token: newToken, user } = data;

      // Store in state and localStorage
      setToken(newToken);
      setUserId(user.id);
      setEmail(user.email);
      localStorage.setItem('arc_token', newToken);
      localStorage.setItem('arc_userId', user.id.toString());
      localStorage.setItem('arc_email', user.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUserId(null);
    setEmail(null);
    localStorage.removeItem('arc_token');
    localStorage.removeItem('arc_userId');
    localStorage.removeItem('arc_email');
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        email,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
