import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { DbRoadmapRecord, SaveRoadmapPayload } from './types';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

// Secret key for privileged server operations (reading/upserting roadmaps bypassing RLS)
const serverSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Publishable key for user-session context
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Standard user-session server client using cookies (respects user session & RLS).
 * Used in Server Actions, route handlers, and protected user pages.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
  }

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if proxy.ts is handling session refresh.
        }
      },
    },
  });
}

/**
 * Privileged server client (using secret/service_role key) for backend DB operations.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !serverSecretKey) {
    return null;
  }

  try {
    return createSupabaseJsClient(supabaseUrl, serverSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (e) {
    console.warn('Failed to initialize server Supabase client:', e);
    return null;
  }
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminEmailsEnv =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    'admin@roadmapxpress.com,admin@example.com';
  const allowed = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return (
    allowed.includes(email.toLowerCase()) ||
    email.toLowerCase().startsWith('admin@')
  );
}

/**
 * Loads the roadmap row for the given slug (and optional version).
 * If version is omitted, loads the latest version (ordered by version descending).
 * All roadmap data (stages, theme, overrides) lives inside the consolidated `json` column.
 */
export async function getLatestRoadmapFromDb(
  slug: string,
  version?: number
): Promise<DbRoadmapRecord | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    let query = client
      .from('roadmaps')
      .select('*')
      .eq('slug', slug);

    if (version !== undefined && !isNaN(version)) {
      query = query.eq('version', version);
    } else {
      query = query.order('version', { ascending: false });
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error querying roadmap for "${slug}":`, error.message);
      return null;
    }

    if (!data) return null;

    // Parse the consolidated `json` column
    const rawJson =
      typeof data.json === 'string'
        ? JSON.parse(data.json)
        : data.json || {};

    const stages =
      rawJson.stages ||
      (typeof data.stages === 'string' ? JSON.parse(data.stages) : data.stages) ||
      [];

    const theme =
      rawJson.theme ||
      (typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme) ||
      {};

    const overrides =
      rawJson.overrides ||
      (typeof data.overrides === 'string'
        ? JSON.parse(data.overrides)
        : data.overrides) || {
        nodeOffsets: {},
        edgePoints: {},
        customEdges: [],
        removedEdgeIds: [],
      };

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || '',
      version: Number(data.version) || 1,
      tag: data.tag || 'latest',
      is_latest: data.is_latest !== undefined ? Boolean(data.is_latest) : true,
      json: {
        stages,
        theme,
        overrides,
        ...rawJson,
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (e: any) {
    console.warn(`[Supabase] Exception querying roadmap for "${slug}":`, e.message);
    return null;
  }
}

/**
 * Saves roadmap data.
 * - When overrideCurrent is FALSE (default): creates a completely NEW row in the roadmaps table
 *   with an incremented version (nextVersion) so older versions are preserved, and unsets is_latest on old rows.
 * - When overrideCurrent is TRUE: updates the existing latest row in place without bumping version.
 */
export async function saveRoadmapToDb(
  payload: SaveRoadmapPayload
): Promise<{ success: boolean; version: number; error?: string }> {
  const client = getSupabaseServerClient();
  if (!client) {
    return {
      success: false,
      version: payload.version || 1,
      error: 'Supabase credentials are not configured on the server.',
    };
  }

  try {
    // 1. Fetch current latest row for this slug to know latest version and id
    const { data: latestRow, error: checkError } = await client
      .from('roadmaps')
      .select('id, version, is_latest')
      .eq('slug', payload.slug)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.warn('[Supabase] Slug check warning:', checkError.message);
    }

    const currentVersionNumber = latestRow
      ? Number(latestRow.version) || 1
      : (payload.version || 1);

    // Consolidate stages, theme & overrides into the consolidated `json` column
    const consolidatedJson = {
      stages: payload.stages || [],
      theme: payload.theme || {},
      overrides: payload.overrides || {
        nodeOffsets: {},
        edgePoints: {},
        customEdges: [],
        removedEdgeIds: [],
      },
      ...(payload.json || {}),
    };

    if (payload.overrideCurrent && latestRow?.id) {
      // MODE 1: OVERRIDE CURRENT
      // Overwrite the existing row in place without bumping version number
      const { error: updateError } = await client
        .from('roadmaps')
        .update({
          title: payload.title,
          subtitle: payload.subtitle || '',
          tag: payload.tag || 'latest',
          is_latest: true,
          json: consolidatedJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', latestRow.id);

      if (updateError) {
        console.error('[Supabase] Override update error:', updateError);
        return { success: false, version: currentVersionNumber, error: updateError.message };
      }

      return { success: true, version: currentVersionNumber };
    } else {
      // MODE 2: CREATE COMPLETELY NEW ROW DATA WITH UPDATED VERSION
      // 1. Calculate incremented version number
      const nextVersion = latestRow ? currentVersionNumber + 1 : (payload.version || 1);

      // 2. Mark older versions as is_latest: false
      if (latestRow) {
        const { error: unsetError } = await client
          .from('roadmaps')
          .update({ is_latest: false })
          .eq('slug', payload.slug);

        if (unsetError) {
          console.warn('[Supabase] Unset is_latest warning:', unsetError.message);
        }
      }

      // 3. Insert a completely NEW row with the incremented version
      const newRowData = {
        slug: payload.slug,
        title: payload.title,
        subtitle: payload.subtitle || '',
        version: nextVersion,
        tag: payload.tag || 'latest',
        is_latest: true,
        json: consolidatedJson,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await client
        .from('roadmaps')
        .insert(newRowData);

      if (insertError) {
        console.error('[Supabase] Insert new version error:', insertError);

        // Friendly guidance if database still has single-slug unique constraint
        if (
          insertError.code === '23505' &&
          (insertError.message.includes('roadmaps_slug_key') ||
            insertError.details?.includes('slug'))
        ) {
          return {
            success: false,
            version: nextVersion,
            error:
              'Database constraint "roadmaps_slug_key" prevents storing multiple version rows. Please run in Supabase SQL editor: ALTER TABLE roadmaps DROP CONSTRAINT IF EXISTS roadmaps_slug_key; ALTER TABLE roadmaps ADD CONSTRAINT roadmaps_slug_version_key UNIQUE (slug, version);',
          };
        }

        return { success: false, version: nextVersion, error: insertError.message };
      }

      return { success: true, version: nextVersion };
    }
  } catch (e: any) {
    console.error('[Supabase] Save exception:', e);
    return { success: false, version: payload.version || 1, error: e.message };
  }
}

/**
 * Lists all roadmap slugs and titles for the editor selector menu.
 * Deduplicates by slug so only the latest version of each roadmap is returned.
 */
export async function getAllRoadmapsSummary(): Promise<
  Array<{ slug: string; title: string; version: number }>
> {
  const fallback = [
    { slug: 'backend', title: 'Backend Developer Roadmap', version: 4 },
    { slug: 'frontend', title: 'Frontend Developer Roadmap (2026)', version: 5 },
  ];

  const client = getSupabaseServerClient();
  if (!client) return fallback;

  try {
    const { data, error } = await client
      .from('roadmaps')
      .select('slug, title, version, is_latest, updated_at')
      .order('version', { ascending: false });

    if (error || !data || data.length === 0) {
      return fallback;
    }

    // Deduplicate by slug, keeping the latest version of each roadmap
    const map = new Map<string, { slug: string; title: string; version: number }>();
    for (const r of data) {
      if (!map.has(r.slug)) {
        map.set(r.slug, {
          slug: r.slug,
          title: r.title || r.slug,
          version: Number(r.version) || 1,
        });
      }
    }

    return Array.from(map.values());
  } catch (e: any) {
    console.warn('[Supabase] Exception querying roadmaps summary:', e.message);
    return fallback;
  }
}

/**
 * Returns all saved version rows for a specific slug.
 */
export async function getAllVersionsForSlug(slug: string): Promise<
  Array<{ version: number; is_latest: boolean; updated_at?: string }>
> {
  const client = getSupabaseServerClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('roadmaps')
      .select('version, is_latest, updated_at')
      .eq('slug', slug)
      .order('version', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      version: Number(d.version) || 1,
      is_latest: Boolean(d.is_latest),
      updated_at: d.updated_at,
    }));
  } catch (e) {
    return [];
  }
}
