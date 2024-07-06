
import { createClient } from '@supabase/supabase-js';

export const adminClient = createClient(
  process.env.SUPABASE_URL as string, 
  process.env.SUPABASE_KEY as string, 
  {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})