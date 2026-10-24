import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoadmapSvgView from '@/components/roadmap/RoadmapSvgView';
import RoadmapClientIsland from '@/components/roadmap/RoadmapClientIsland';
import { getRoadmapData } from '@/lib/supabase/roadmaps';

async function RoadmapDataLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getRoadmapData(slug);

  if (!data) {
    notFound();
  }

  const roadmapdata = {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    version: data.version,
    tag: data.tag,
    graph: data.graph,
    theme: data.theme,
  };

  const totalTopics = new Set(
    data.graph.nodes
      .filter((n) => n.clickable && n.label)
      .map((n) => n.topicId || n.label)
  ).size;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <RoadmapClientIsland
        slug={roadmapdata.slug}
        title={roadmapdata.title}
        totalTopics={totalTopics}
        subtitle={roadmapdata.subtitle}
      >
        <RoadmapSvgView
          graph={roadmapdata.graph}
          theme={roadmapdata.theme}
        />
      </RoadmapClientIsland>
    </main>
  );
}

export default function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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
      <RoadmapDataLoader params={params} />
    </Suspense>
  );
}
