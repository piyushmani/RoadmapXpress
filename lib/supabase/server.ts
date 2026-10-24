import fs from 'fs';
import path from 'path';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { DbRoadmapRecord, SaveRoadmapPayload, DEFAULT_LAYOUT_OVERRIDES } from './types';

let secretsLoaded = false;
export function loadRenderSecrets() {
  if (secretsLoaded) return;
  secretsLoaded = true;
  const secretDir = '/etc/secrets';
  try {
    if (fs.existsSync(secretDir)) {
      const files = fs.readdirSync(secretDir);
      for (const file of files) {
        const fullPath = path.join(secretDir, file);
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf8');
          content.split('\n').forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
              const eqIdx = trimmed.indexOf('=');
              const key = trimmed.slice(0, eqIdx).trim();
              const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
              if (key && !process.env[key]) {
                process.env[key] = val;
              }
            }
          });
        }
      }
    }
  } catch {}
}

export function getSupabaseUrl() {
  loadRenderSecrets();
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getServerSecretKey() {
  loadRenderSecrets();
  return (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getPublishableKey() {
  loadRenderSecrets();
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getPublishableKey();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY'
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
        }
      },
    },
  });
}

let serverClientInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (serverClientInstance) return serverClientInstance;
  const supabaseUrl = getSupabaseUrl();
  const serverSecretKey = getServerSecretKey();

  if (!supabaseUrl || !serverSecretKey) {
    return null;
  }

  try {
    serverClientInstance = createSupabaseJsClient(supabaseUrl, serverSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return serverClientInstance;
  } catch (e) {
    console.warn('Failed to initialize server Supabase client:', e);
    return null;
  }
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServerClient();
    if (!client) {
      throw new Error(
        'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY'
      );
    }
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});


function parseDbRoadmapRecord(data: any): DbRoadmapRecord {
  const rawJson =
    typeof data.json === 'string'
      ? JSON.parse(data.json)
      : data.json || {};

  const stages = rawJson.stages || [];
  const theme = rawJson.theme || {};
  const overrides = rawJson.overrides || DEFAULT_LAYOUT_OVERRIDES;

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
}

export async function getLatestRoadmapFromDb(
  slug: string
): Promise<DbRoadmapRecord | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    // 1. Strictly look for row marked is_latest === true
    const { data, error } = await client
      .from('roadmaps')
      .select('*')
      .eq('slug', slug)
      .eq('is_latest', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error querying latest roadmap for "${slug}":`, error.message);
      return null;
    }

    if (data) {
      return parseDbRoadmapRecord(data);
    }

    // 2. Fallback if is_latest has not yet been set on legacy data
    const { data: fallbackData, error: fallbackError } = await client
      .from('roadmaps')
      .select('*')
      .eq('slug', slug)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError || !fallbackData) return null;

    return parseDbRoadmapRecord(fallbackData);
  } catch (e: any) {
    console.warn(`[Supabase] Exception querying latest roadmap for "${slug}":`, e.message);
    return null;
  }
}

export async function getRoadmapByVersionFromDb(
  slug: string,
  version: number
): Promise<DbRoadmapRecord | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('roadmaps')
      .select('*')
      .eq('slug', slug)
      .eq('version', version)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error querying roadmap for "${slug}" v${version}:`, error.message);
      return null;
    }

    if (!data) return null;

    return parseDbRoadmapRecord(data);
  } catch (e: any) {
    console.warn(`[Supabase] Exception querying roadmap for "${slug}" v${version}:`, e.message);
    return null;
  }
}

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

    const consolidatedJson = {
      stages: payload.stages || [],
      theme: payload.theme || {},
      overrides: payload.overrides || DEFAULT_LAYOUT_OVERRIDES,
      ...(payload.json || {}),
    };

    if (payload.overrideCurrent && latestRow?.id) {
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
      const nextVersion = latestRow ? currentVersionNumber + 1 : (payload.version || 1);
      if (latestRow) {
        const { error: unsetError } = await client
          .from('roadmaps')
          .update({ is_latest: false })
          .eq('slug', payload.slug);

        if (unsetError) {
          console.warn('[Supabase] Unset is_latest warning:', unsetError.message);
        }
      }

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

        // Guidance if database still has single-slug unique constraint
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
