export type SemanticNodeType =
  | 'title'
  | 'milestone'
  | 'section'
  | 'subsection'
  | 'topic'
  | 'subtopic';

export type SemanticEdgeType =
  | 'spine-edge'
  | 'branch-edge'
  | 'sub-branch-edge';

export type EdgeCurveStyle = 'bezier' | 'orthogonal' | 'straight';

export type TopicStatus = 'pending' | 'learning' | 'in-progress' | 'done' | 'skipped';

export type TopicRequirementTag = 'none' | 'required' | 'pick-any' | 'optional';

export function toTopicSlugId(label: string): string {
  return (label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export interface NodeBoxStyle {
  fillColor: string;
  strokeColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  strokeWidth: number;
  dashed?: boolean;
  titleOnBorder?: boolean;
  borderTitlePaddingX?: number;
}

export interface MilestoneStyle {
  shape: 'pin' | 'circle';
  color: string;
  size: number;
  showGroundShadow: boolean;
}

export interface EdgeLineStyle {
  strokeColor: string;
  strokeWidth: number;
  dashed: boolean;
  curveStyle: EdgeCurveStyle;
  roadTrack?: boolean;
  controlPointsCount: number;
}

export interface CanvasSpacingStyle {
  backgroundColor: string;
  fontFamily: string;
  titleColor: string;
  titleFontSize: number;
  topicGap: number;
  subTopicGap: number;
  sectionPadding: number;
  stageVerticalGap: number;
  subSectionGap: number;
  spineBranchGap: number;
}

export interface RoadmapThemeConfig {
  nodes: {
    topic: NodeBoxStyle;
    subtopic: NodeBoxStyle;
    section: NodeBoxStyle;
    subsection: NodeBoxStyle;
    milestone: MilestoneStyle;
  };
  edges: {
    spine: EdgeLineStyle;
    branch: EdgeLineStyle;
    subBranch: EdgeLineStyle;
  };
  canvas: CanvasSpacingStyle;
}

export interface RoadmapNode {
  id: string;
  topicId: string;
  label: string;
  lines?: string[];
  subtext?: string[];
  tag?: TopicRequirementTag;
  type: SemanticNodeType;
  clickable: boolean;
  parentId?: string;
  stageId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // Precomputed layout & render geometry (calculated by layout engine)
  centerX?: number;
  centerY?: number;
  titleY?: number;
  borderMask?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  renderedLines?: Array<{ text: string; y: number }>;
  renderedSubtext?: Array<{ text: string; y: number }>;
  badgeX?: number;
  badgeY?: number;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type: SemanticEdgeType;
  points?: Array<{ x: number; y: number }>;
  d?: string;
}

export interface RoadmapGraph {
  minX: number;
  minY: number;
  width: number;
  height: number;
  viewBox?: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface NodePositionOverride {
  dx: number;
  dy: number;
  width?: number;
  height?: number;
}

export interface RoadmapLayoutOverrides {
  canvasTitle?: string;
  nodeOffsets: Record<string, NodePositionOverride>;
  edgePoints: Record<string, Array<{ x: number; y: number }>>;
  customEdges: RoadmapEdge[];
  removedEdgeIds: string[];
  topicTags?: Record<string, TopicRequirementTag>;
}

export type TopicItemSchema =
  | string
  | {
      label: string;
      subtext?: string[];
      tag?: TopicRequirementTag;
    };

export interface RoadmapSubSectionSchema {
  id: string;
  title?: string;
  fromTopic?: string;
  side?: 'left' | 'right';
  placement?: 'bottom' | 'side';
  columns?: 1 | 2;
  topics: TopicItemSchema[];
}

export interface RoadmapStageSchema {
  id: string;
  title?: string;
  side: 'left' | 'right';
  standaloneTopic?: boolean;
  columns?: 1 | 2 | 3;
  topics?: TopicItemSchema[];
  groups?: Array<{
    id: string;
    title: string;
    topics: string[];
  }>;
  subSections?: RoadmapSubSectionSchema[];
}

export interface RoadmapDefinition {
  slug: string;
  version?: number;
  title: string;
  subtitle: string;
  stages: RoadmapStageSchema[];
  theme?: RoadmapThemeConfig;
  overrides?: RoadmapLayoutOverrides;
}
