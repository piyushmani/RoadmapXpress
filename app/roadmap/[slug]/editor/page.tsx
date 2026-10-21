import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoadmapEditorPageClient from '@/components/roadmap/RoadmapEditorPageClient';
import {
  getHybridRoadmapData,
  getAllRoadmapsSummaryList,
  getAllVersionsForSlugList,
} from '@/lib/supabase/roadmaps';
import { requireAdmin } from '@/lib/auth';

async function RoadmapEditorDataLoader({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const requestedVersion = sp.v ? parseInt(sp.v, 10) : undefined;

  const [data, allRoadmaps, allVersions] = await Promise.all([
    getHybridRoadmapData(slug, requestedVersion),
    getAllRoadmapsSummaryList(),
    getAllVersionsForSlugList(slug),
  ]);

  if (!data) {
    notFound();
  }

  // Ensure current roadmap is present in the selector list
  const roadmapsList = allRoadmaps.some((r) => r.slug === data.slug)
    ? allRoadmaps
    : [{ slug: data.slug, title: data.title, version: data.version }, ...allRoadmaps];

  return (
    <RoadmapEditorPageClient
      initialData={data}
      availableRoadmaps={roadmapsList}
      allVersions={allVersions}
    />
  );
}

export default function RoadmapEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading editor studio...
            </p>
          </div>
        </div>
      }
    >
      <RoadmapEditorDataLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
