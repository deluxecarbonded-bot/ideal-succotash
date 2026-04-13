'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getProfileById } from '@/lib/database';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  supabaseUser: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await getProfileById(session.user.id);
        if (profile) {
          setUser(profile);
        } else {
          const demoUser: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            bio: '',
            avatar_url: null,
            created_at: new Date().toISOString(),
          };
          setUser(demoUser);
        }
      } else {
        const stored = localStorage.getItem('exotic-user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await getProfileById(session.user.id);
        if (profile) {
          setUser(profile);
        } else {
          const demoUser: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            bio: '',
            avatar_url: null,
            created_at: new Date().toISOString(),
          };
          setUser(demoUser);
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signup = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    
    if (error) throw error;
    
    if (data.user) {
      const profile: User = {
        id: data.user.id,
        username,
        bio: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem('exotic-user', JSON.stringify(profile));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    localStorage.removeItem('exotic-user');
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
