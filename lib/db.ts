import { getSupabaseServerClient } from './supabase/server';

export const adminClient = getSupabaseServerClient();
export { getSupabaseServerClient };
