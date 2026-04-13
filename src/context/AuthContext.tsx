'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('exotic-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    const demoUser: User = {
      id: 'demo-user-id',
      username: email.split('@')[0],
      bio: 'Welcome to Exotic',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    setUser(demoUser);
    localStorage.setItem('exotic-user', JSON.stringify(demoUser));
  };

  const signup = async (_email: string, _password: string, username: string) => {
    const demoUser: User = {
      id: 'new-user-' + Date.now(),
      username,
      bio: '',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    setUser(demoUser);
    localStorage.setItem('exotic-user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('exotic-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
