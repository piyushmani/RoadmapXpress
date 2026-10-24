'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthUser } from '@/lib/supabase/types';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  signOut: async () => {},
});

function checkIsAdmin(metadata?: Record<string, any> | null): boolean {
  return metadata?.role === 'admin';
}

function parseAuthUser(user: { id: string; email?: string | null; app_metadata?: any; user_metadata?: any }): {
  user: AuthUser;
  isAdmin: boolean;
} {
  const email = user.email || '';
  const isAdmin = checkIsAdmin(user.app_metadata || user.user_metadata);
  const role: 'admin' | 'user' = isAdmin ? 'admin' : 'user';
  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    email.split('@')[0];

  return {
    user: { id: user.id, email, role, name },
    isAdmin,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Initialize session from Supabase client
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const { user: authUser, isAdmin: userIsAdmin } = parseAuthUser(session.user);
          setUser(authUser);
          setIsAdmin(userIsAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      })
      .catch((err) => {
        console.warn('Supabase getSession error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const { user: authUser, isAdmin: userIsAdmin } = parseAuthUser(session.user);
          setUser(authUser);
          setIsAdmin(userIsAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: 'Supabase client is not configured. Please check your environment variables.' };
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };

    // Prevent login if email has not been confirmed
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      return {
        error: 'Your email address has not been confirmed yet. Please check your inbox for the activation link.',
      };
    }

    if (data.user) {
      const { user: authUser, isAdmin: userIsAdmin } = parseAuthUser(data.user);
      setUser(authUser);
      setIsAdmin(userIsAdmin);
    }

    return {};
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: 'Supabase client is not configured. Please check your environment variables.' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      },
    });

    if (error) return { error: error.message };

    // If email confirmation is required, Supabase creates the user but returns session = null
    if (data.user && !data.session) {
      setUser(null);
      setIsAdmin(false);
      return {
        message: 'Account created! Please check your email and click the confirmation link before signing in.',
      };
    }

    // Only set user if an active session is returned (e.g. if email confirmation is disabled)
    if (data.user && data.session) {
      const { user: authUser, isAdmin: userIsAdmin } = parseAuthUser(data.user);
      setUser(authUser);
      setIsAdmin(userIsAdmin);
    }

    return {};
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }

    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
