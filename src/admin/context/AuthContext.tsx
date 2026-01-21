import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Password from environment variable or default for development
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('admin_auth');
    if (authToken) {
      // Verify token (simple timestamp check - expires in 24h)
      const tokenData = JSON.parse(authToken);
      const now = Date.now();
      if (tokenData.expires > now) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_auth');
      }
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const token = {
        authenticated: true,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      localStorage.setItem('admin_auth', JSON.stringify(token));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
