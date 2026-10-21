import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoadmapPageClient from '@/components/roadmap/RoadmapPageClient';
import { getHybridRoadmapData } from '@/lib/supabase/roadmaps';

async function RoadmapDataLoader({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const requestedVersion = sp.v ? parseInt(sp.v, 10) : undefined;
  const data = await getHybridRoadmapData(slug, requestedVersion);

  if (!data) {
    notFound();
  }

  return <RoadmapPageClient data={data} />;
}

export default function RoadmapPage({
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
              Loading roadmap...
            </p>
          </div>
        </div>
      }
    >
      <RoadmapDataLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
