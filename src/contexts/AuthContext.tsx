import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  isPro: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: any;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our User type
const mapUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email ?? '',
  isPro: supabaseUser.user_metadata?.isPro ?? false,
  created_at: supabaseUser.created_at
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [session, setSession] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check active sessions and sets the user
    console.log("Checking initial session...");
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session:", currentSession);
      if (currentSession) {
        setUser(mapUser(currentSession.user));
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession);
      if (currentSession) {
        setUser(mapUser(currentSession.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getInitialSession();
  }, []);

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;

      console.log("Sign up successful, data:", data);
      if (data.session) {
        setUser(mapUser(data.session.user));
        // Redirect to chat after successful signup
        setLocation('/chat');
        return { success: true };
      }
      
      return { success: false, error: new Error('No session created') };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      console.log("Sign in successful, data:", data);
      if (data.session) {
        setUser(mapUser(data.session.user));
        // Redirect to chat after successful login
        setLocation('/chat');
        return { success: true };
      }
      
      return { success: false, error: new Error('No session created') };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log("Sign out successful");
      setLocation('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      session,
      signOut,
      signIn,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}