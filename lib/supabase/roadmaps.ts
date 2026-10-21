import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import { buildRoadmapFromSchema } from '@/lib/autoLayoutEngine';
import { getLatestRoadmapFromDb, getAllRoadmapsSummary, getAllVersionsForSlug } from './server';
import { RoadmapHybridData, RoadmapSummaryItem } from './types';
import {
  RoadmapStageSchema,
  RoadmapLayoutOverrides,
  RoadmapThemeConfig,
} from '@/types/roadmap';

const EMPTY_OVERRIDES: RoadmapLayoutOverrides = {
  nodeOffsets: {},
  edgePoints: {},
  customEdges: [],
  removedEdgeIds: [],
};

/**
 * Loads the roadmap solely from the database with Next.js 16 Cache Components.
 * Cached across requests, taggable, and on-demand revalidatable.
 */
export async function getHybridRoadmapData(
  slug: string,
  version?: number
): Promise<RoadmapHybridData | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`roadmap-${slug}`, `roadmap-${slug}-${version || 'latest'}`, 'roadmaps');

  const dbRecord = await getLatestRoadmapFromDb(slug, version);

  if (!dbRecord) {
    return null;
  }

  const rawJson = dbRecord.json || {};
  const stages: RoadmapStageSchema[] = rawJson.stages || [];
  const theme: RoadmapThemeConfig = {
    ...DEFAULT_ROADMAP_THEME,
    ...(rawJson.theme || {}),
    nodes: { ...DEFAULT_ROADMAP_THEME.nodes, ...(rawJson.theme?.nodes || {}) },
    edges: { ...DEFAULT_ROADMAP_THEME.edges, ...(rawJson.theme?.edges || {}) },
    canvas: { ...DEFAULT_ROADMAP_THEME.canvas, ...(rawJson.theme?.canvas || {}) },
  };

  const overrides: RoadmapLayoutOverrides =
    rawJson.overrides || EMPTY_OVERRIDES;

  // Pre-calculate SVG layout on server from the database record
  const graph = buildRoadmapFromSchema(dbRecord.title, stages, overrides, theme);

  return {
    graph,
    slug: dbRecord.slug,
    title: dbRecord.title,
    subtitle: dbRecord.subtitle,
    version: dbRecord.version,
    tag: dbRecord.tag || 'latest',
    stages,
    theme,
    overrides,
    isDbSource: true,
  };
}

/**
 * Returns a cached list of roadmap summaries (slug, title, version) for navigation/selector.
 */
export async function getAllRoadmapsSummaryList(): Promise<RoadmapSummaryItem[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('roadmaps');

  return getAllRoadmapsSummary();
}

/**
 * Returns a cached list of all available versions for a roadmap slug.
 */
export async function getAllVersionsForSlugList(
  slug: string
): Promise<Array<{ version: number; is_latest: boolean; updated_at?: string }>> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`roadmap-${slug}-versions`, 'roadmaps');

  return getAllVersionsForSlug(slug);
}

