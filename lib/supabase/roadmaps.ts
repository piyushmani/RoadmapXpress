import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import { buildRoadmapFromSchema } from '@/lib/autoLayoutEngine';
import {
  getLatestRoadmapFromDb,
  getRoadmapByVersionFromDb,
  getAllRoadmapsSummary,
  getAllVersionsForSlug,
} from './server';
import {
  RoadmapHybridData,
  RoadmapSummaryItem,
  DbRoadmapRecord,
  DEFAULT_LAYOUT_OVERRIDES,
} from './types';
import {
  RoadmapStageSchema,
  RoadmapLayoutOverrides,
  RoadmapThemeConfig,
} from '@/types/roadmap';

function formatRoadmapData(dbRecord: DbRoadmapRecord): RoadmapHybridData {
  const rawJson = dbRecord.json || {};
  const stages: RoadmapStageSchema[] = rawJson.stages || [];
  const theme: RoadmapThemeConfig = {
    ...DEFAULT_ROADMAP_THEME,
    ...(rawJson.theme || {}),
    nodes: { ...DEFAULT_ROADMAP_THEME.nodes, ...(rawJson.theme?.nodes || {}) },
    edges: { ...DEFAULT_ROADMAP_THEME.edges, ...(rawJson.theme?.edges || {}) },
    canvas: { ...DEFAULT_ROADMAP_THEME.canvas, ...(rawJson.theme?.canvas || {}) },
  };

  const rawOverrides = rawJson.overrides || DEFAULT_LAYOUT_OVERRIDES;
  const defaultCanvasTitle = dbRecord.slug === 'backend' ? 'Backend' : undefined;
  const canvasTitle = rawOverrides.canvasTitle || rawJson.canvasTitle || defaultCanvasTitle;

  const overrides: RoadmapLayoutOverrides = {
    ...rawOverrides,
    ...(canvasTitle ? { canvasTitle } : {}),
  };

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
  };
}

/**
 * Loads published roadmap (viewer strictly sees is_latest: true).
 */
export async function getRoadmapData(
  slug: string
): Promise<RoadmapHybridData | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`roadmap-${slug}`, 'roadmaps');

  const dbRecord = await getLatestRoadmapFromDb(slug);
  if (!dbRecord) {
    return null;
  }

  return formatRoadmapData(dbRecord);
}

/**
 * Loads a specific version of a roadmap (editor can inspect/restore older versions).
 */
export async function getRoadmapByVersion(
  slug: string,
  version: number
): Promise<RoadmapHybridData | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`roadmap-${slug}-v${version}`, 'roadmaps');

  const dbRecord = await getRoadmapByVersionFromDb(slug, version);
  if (!dbRecord) {
    return null;
  }

  return formatRoadmapData(dbRecord);
}


export async function getAllRoadmapsSummaryList(): Promise<RoadmapSummaryItem[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('roadmaps');

  return getAllRoadmapsSummary();
}

export async function getAllVersionsForSlugList(
  slug: string
): Promise<Array<{ version: number; is_latest: boolean; updated_at?: string }>> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`roadmap-${slug}-versions`, 'roadmaps');

  return getAllVersionsForSlug(slug);
}

