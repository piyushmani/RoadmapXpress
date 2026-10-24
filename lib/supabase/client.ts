import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let configuredKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient | null = null;

export function configureSupabaseBrowser(url?: string, key?: string) {
  if (url && key) {
    if (configuredUrl !== url || configuredKey !== key || !clientInstance) {
      configuredUrl = url;
      configuredKey = key;
      try {
        clientInstance = createBrowserClient(url, key);
      } catch (e) {
        console.warn('Failed to configure browser Supabase client:', e);
      }
    }
  }
}

export function getSupabaseBrowserClient(url?: string, key?: string): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  if (url && key) {
    configureSupabaseBrowser(url, key);
  }

  if (clientInstance) return clientInstance;

  const supabaseUrl = configuredUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    configuredKey ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      clientInstance = createBrowserClient(supabaseUrl, supabaseKey);
      return clientInstance;
    } catch (e) {
      console.warn('Failed to initialize browser Supabase client:', e);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = configuredUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    configuredKey ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(supabaseUrl && supabaseKey);
}
