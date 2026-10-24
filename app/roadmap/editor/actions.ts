'use server';

import {
  getRoadmapData,
  getRoadmapByVersion,
  getAllVersionsForSlugList,
} from '@/lib/supabase/roadmaps';

export async function fetchRoadmapForEditor(slug: string, version?: number) {
  const [data, allVersions] = await Promise.all([
    version !== undefined && !isNaN(version)
      ? getRoadmapByVersion(slug, version)
      : getRoadmapData(slug),
    getAllVersionsForSlugList(slug),
  ]);
  return { data, allVersions };
}
