import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient, isAdminEmail } from '@/lib/supabase/server';

export interface UserClaims {
  sub: string;
  email?: string;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Returns claims if authenticated, or null if unauthenticated (does not redirect).
 */
export async function getUserClaims(): Promise<UserClaims | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return null;

    // Reject claims if email is explicitly marked unverified
    if (data.claims.email_verified === false) {
      return null;
    }

    return data.claims as UserClaims;
  } catch {
    return null;
  }
}

/**
 * Ensures user is authenticated via getClaims(). Redirects to /login if not authenticated.
 */
export async function requireUser(): Promise<UserClaims> {
  const claims = await getUserClaims();
  if (!claims) {
    redirect('/login');
  }
  return claims;
}

/**
 * Checks if the claims represent an admin:
 * 1. checks app_metadata.role === 'admin'
 * 2. or fallback to configured ADMIN_EMAILS
 */
export function isClaimsAdmin(claims?: UserClaims | null): boolean {
  if (!claims) return false;
  if (claims.app_metadata?.role === 'admin') return true;
  if (claims.email && isAdminEmail(claims.email)) return true;
  return false;
}

/**
 * Ensures user is authenticated and has admin privileges.
 * Redirects to /login if unauthenticated, or to / if unauthorized.
 */
export async function requireAdmin(): Promise<UserClaims> {
  const claims = await requireUser();
  if (!isClaimsAdmin(claims)) {
    redirect('/');
  }
  return claims;
}
