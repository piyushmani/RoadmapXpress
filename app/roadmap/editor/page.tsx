import React, { Suspense } from 'react';
import EditorPage from '@/components/roadmap/editor-page';
import { getAllRoadmapsSummaryList } from '@/lib/supabase/roadmaps';

async function RoadmapEditorDataLoader() {
  const allRoadmaps = await getAllRoadmapsSummaryList();

  return <EditorPage availableRoadmaps={allRoadmaps} />;
}

export default function RoadmapEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            <p className="text-sm text-slate-500 animate-pulse">
              Loading editor studio...
            </p>
          </div>
        </div>
      }
    >
      <RoadmapEditorDataLoader />
    </Suspense>
  );
}
