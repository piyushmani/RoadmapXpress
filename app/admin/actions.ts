'use server';

import { requireAdmin } from '@/lib/auth';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function updateSetting(id: string, value: string) {
  await requireAdmin();
  const supabase = await createClient(); // user's own session, so RLS still applies
  const { error } = await supabase.from('site_settings').update({ value }).eq('id', id);
  if (error) throw error;
}

// Only for things RLS can't do: managing other users' accounts
export async function promoteUser(userId: string) {
  await requireAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' },
  });
  if (error) throw error;
  return data;
}

export async function listAllUsers() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  return data.users;
}
