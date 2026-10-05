import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; data?: any }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-user-12345',
  app_metadata: {},
  user_metadata: { full_name: 'Alex Johnson (Guest)' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex.guest@taskpulse.demo',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('taskpulse_demo_mode') === 'true';
  });

  useEffect(() => {
    // If demo mode active in storage, set demo user
    if (isDemoMode) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.warn('Error fetching Supabase auth session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isDemoMode) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signIn = async (email: string, password: string) => {
    setIsDemoMode(false);
    localStorage.removeItem('taskpulse_demo_mode');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    setUser(data.user);
    setSession(data.session);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsDemoMode(false);
    localStorage.removeItem('taskpulse_demo_mode');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });
    if (error) return { error };
    return { error: null, data };
  };

  const signOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      localStorage.removeItem('taskpulse_demo_mode');
      setUser(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('taskpulse_demo_mode', 'true');
    setUser(DEMO_USER);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('taskpulse_demo_mode');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
