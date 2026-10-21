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

export type TopicStatus = 'pending' | 'in-progress' | 'done' | 'skipped';

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
  label: string;
  lines?: string[];
  subtext?: string[];
  type: SemanticNodeType;
  clickable: boolean;
  parentId?: string;
  stageId?: string;
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

export interface NodePositionOverride {
  dx: number;
  dy: number;
  width?: number;
  height?: number;
}

export interface RoadmapLayoutOverrides {
  nodeOffsets: Record<string, NodePositionOverride>;
  edgePoints: Record<string, Array<{ x: number; y: number }>>;
  customEdges: RoadmapEdge[];
  removedEdgeIds: string[];
}

export interface RoadmapSubSectionSchema {
  id: string;
  title?: string;
  fromTopic?: string;
  side?: 'left' | 'right';
  placement?: 'bottom' | 'side';
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

export interface RoadmapDefinition {
  slug: string;
  version?: number;
  title: string;
  subtitle: string;
  stages: RoadmapStageSchema[];
  theme?: RoadmapThemeConfig;
  overrides?: RoadmapLayoutOverrides;
}
