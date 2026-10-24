import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { saveRoadmapToDb } from '@/lib/supabase/server';
import { getUserClaims, isClaimsAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Enforce admin authorization using getClaims()
    const claims = await getUserClaims();
    if (!isClaimsAdmin(claims)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Admin role is required to save changes.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const slug = (body.slug || 'backend').replace(/[^a-z0-9-_]/gi, '');
    const overrideCurrent = Boolean(body.overrideCurrent);

    // Save directly to Supabase Database
    const dbResult = await saveRoadmapToDb({
      slug,
      title: body.title || `${slug.toUpperCase()} Roadmap`,
      subtitle: body.subtitle || '',
      version: Number(body.version) || 1,
      tag: 'latest',
      is_latest: true,
      overrideCurrent,
      stages: body.stages || [],
      theme: body.theme || {},
      overrides: body.overrides || {},
    });

    if (!dbResult.success) {
      return NextResponse.json(
        { ok: false, error: dbResult.error || 'Failed to save to database' },
        { status: 500 }
      );
    }

    // Revalidate Next.js 16 Cache Components and route caches
    try {
      revalidateTag(`roadmap-${slug}`, 'max');
      revalidateTag('roadmaps', 'max');
      revalidatePath(`/roadmap/${slug}`);
      revalidatePath('/roadmap/editor');
    } catch (e) {}

    return NextResponse.json({
      ok: true,
      version: dbResult.version,
      savedToDb: true,
      overrideCurrent,
    });
  } catch (err: any) {
    console.error('Error saving roadmap to database:', err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
