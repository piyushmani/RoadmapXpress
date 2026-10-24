import {
  RoadmapStageSchema,
  RoadmapLayoutOverrides,
  RoadmapThemeConfig,
  RoadmapGraph,
} from '@/types/roadmap';

export const DEFAULT_LAYOUT_OVERRIDES: RoadmapLayoutOverrides = {
  nodeOffsets: {},
  edgePoints: {},
  customEdges: [],
  removedEdgeIds: [],
};

export interface DbRoadmapJson {
  stages: RoadmapStageSchema[];
  theme?: RoadmapThemeConfig;
  overrides?: RoadmapLayoutOverrides;
  [key: string]: any;
}

export interface DbRoadmapRecord {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  version: number;
  tag: string; // 'latest' | 'draft' | 'archived'
  is_latest: boolean;
  json: DbRoadmapJson;
  created_at?: string;
  updated_at?: string;
}

export interface SaveRoadmapPayload {
  slug: string;
  title: string;
  subtitle?: string;
  version?: number;
  tag?: string;
  is_latest?: boolean;
  overrideCurrent?: boolean;
  stages: RoadmapStageSchema[];
  theme?: RoadmapThemeConfig;
  overrides?: RoadmapLayoutOverrides;
  json?: DbRoadmapJson;
}

export interface RoadmapSummaryItem {
  slug: string;
  title: string;
  version: number;
}

export interface RoadmapHybridData {
  graph: RoadmapGraph;
  slug: string;
  title: string;
  subtitle: string;
  version: number;
  tag: string;
  stages: RoadmapStageSchema[];
  theme: RoadmapThemeConfig;
  overrides: RoadmapLayoutOverrides;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}
