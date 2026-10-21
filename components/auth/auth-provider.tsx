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

function checkIsAdmin(email?: string | null, appMetadata?: Record<string, any> | null): boolean {
  if (!email) return false;
  if (appMetadata?.role === 'admin') return true;
  const adminEmailsEnv =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@roadmapxpress.com,admin@example.com';
  const allowed = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return (
    allowed.includes(email.toLowerCase()) ||
    email.toLowerCase().startsWith('admin@')
  );
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
          const email = session.user.email || '';
          const role = checkIsAdmin(email, session.user.app_metadata || session.user.user_metadata)
            ? 'admin'
            : 'user';
          setUser({
            id: session.user.id,
            email,
            role,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || email.split('@')[0],
          });
          setIsAdmin(role === 'admin');
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
          const email = session.user.email || '';
          const role = checkIsAdmin(email, session.user.app_metadata || session.user.user_metadata)
            ? 'admin'
            : 'user';
          setUser({
            id: session.user.id,
            email,
            role,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || email.split('@')[0],
          });
          setIsAdmin(role === 'admin');
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
      const uEmail = data.user.email || email;
      const role = checkIsAdmin(uEmail, data.user.app_metadata || data.user.user_metadata) ? 'admin' : 'user';
      setUser({
        id: data.user.id,
        email: uEmail,
        role,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || uEmail.split('@')[0],
      });
      setIsAdmin(role === 'admin');
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
      const uEmail = data.user.email || email;
      const role = checkIsAdmin(uEmail, data.user.app_metadata || data.user.user_metadata) ? 'admin' : 'user';
      setUser({
        id: data.user.id,
        email: uEmail,
        role,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || uEmail.split('@')[0],
      });
      setIsAdmin(role === 'admin');
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
