export type SemanticNodeType =
  | 'title'
  | 'milestone'
  | 'section'
  | 'subsection'
  | 'topic';

export type SemanticEdgeType =
  | 'spine-edge'
  | 'branch-edge'
  | 'sub-branch-edge';

export type TopicStatus = 'pending' | 'in-progress' | 'done' | 'skipped';

export interface RoadmapNode {
  id: string;
  label: string;
  lines?: string[];
  subtext?: string[];
  type: SemanticNodeType;
  clickable: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type: SemanticEdgeType;
  points?: Array<{ x: number; y: number }>;
}

export interface RoadmapGraph {
  minX: number;
  minY: number;
  width: number;
  height: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface RoadmapSubSectionSchema {
  id: string;
  title?: string;
  fromTopic?: string;
  side: 'left' | 'right';
  placement?: 'side' | 'bottom';
  columns?: 1 | 2;
  topics: Array<string | { label: string; subtext?: string[] }>;
}

export interface RoadmapStageSchema {
  id: string;
  title?: string;
  side: 'left' | 'right';
  standaloneTopic?: boolean;
  columns?: 1 | 2 | 3;
  topics?: Array<string | { label: string; subtext?: string[] }>;
  groups?: Array<{
    id: string;
    title: string;
    topics: string[];
  }>;
  subSections?: RoadmapSubSectionSchema[];
}
