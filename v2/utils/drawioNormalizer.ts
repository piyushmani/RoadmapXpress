import {
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
  SemanticNodeType,
} from '../types/roadmap';
import { wrapTopicLabel } from './autoLayoutEngine';

const LABEL_TYPO_FIXES: Record<string, string> = {
  HTPS: 'HTTPS',
  Cassendra: 'Cassandra',
  'DB normlization': 'DB Normalization',
  Oauth: 'OAuth',
};

export function normalizeDrawioJsonToV2(rawJson: any): RoadmapGraph {
  const root = rawJson?.mxfile?.diagram?.mxGraphModel?.root;
  if (!root)
    return { minX: 0, minY: 0, width: 1200, height: 2400, nodes: [], edges: [] };

  const rawCells = Array.isArray(root.mxCell) ? root.mxCell : [];
  const rawObjects = Array.isArray(root.object) ? root.object : [];

  const unifiedCells = [
    ...rawCells,
    ...rawObjects.map((obj: any) => ({
      _attributes: {
        ...obj.mxCell?._attributes,
        id: obj._attributes.id,
        value: obj._attributes.label,
        NonResource: obj._attributes.NonResource,
      },
      mxGeometry: obj.mxCell?.mxGeometry,
    })),
  ];

  const nodes: RoadmapNode[] = [];
  const edges: RoadmapEdge[] = [];

  for (const cell of unifiedCells) {
    const attr = cell._attributes || {};
    const geom = cell.mxGeometry?._attributes;
    const style: string = attr.style || '';

    if (attr.id === '0' || attr.id === '1') continue;
    if (style.includes('shape=image')) continue;
    if (attr.id === '80UMdSV0X9pKa9VqVtrU-14') continue;

    if (attr.edge === '1') {
      if (!attr.source || !attr.target || attr.source === attr.target) continue;

      const rawPoints = cell.mxGeometry?.Array?.mxPoint;
      const pointList = Array.isArray(rawPoints)
        ? rawPoints
        : rawPoints
          ? [rawPoints]
          : [];

      const points = pointList
        .map((pt: any) => ({
          x: parseFloat(pt._attributes?.x),
          y: parseFloat(pt._attributes?.y),
        }))
        .filter((pt) => !Number.isNaN(pt.x) && !Number.isNaN(pt.y));

      const isSpine = style.includes('strokeWidth=4');
      const isSubBranch = style.includes('orthogonalEdgeStyle');

      edges.push({
        id: attr.id,
        source: attr.source,
        target: attr.target,
        type: isSpine
          ? 'spine-edge'
          : isSubBranch
            ? 'sub-branch-edge'
            : 'branch-edge',
        points,
      });
      continue;
    }

    if (attr.vertex === '1' && geom) {
      const rawLines = (attr.value || '')
        .replace(/\u00a0/g, ' ')
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean);

      const primaryLabel = rawLines[0] || '';
      const fixedLabel = LABEL_TYPO_FIXES[primaryLabel] || primaryLabel;
      const subtext = rawLines.length > 1 ? rawLines.slice(1) : undefined;

      let x = parseFloat(geom.x || '0');
      let y = parseFloat(geom.y || '0');
      const width = parseFloat(geom.width || '0');
      const height = parseFloat(geom.height || '0');

      if (attr.id === 'puWw--o72WlYziN3qKGM-74') {
        x = 135;
        y = 580;
      }

      const adjustedHeight =
        attr.id === 'PTO4_koCIopPKYtKYeJV-376' ? 115 : height;

      let type: SemanticNodeType = 'topic';
      if (style.includes('ellipse')) {
        type = 'milestone';
      } else if (
        style.includes('fontSize=20') ||
        style.includes('fontSize=22') ||
        style.includes('strokeColor=none')
      ) {
        type = 'title';
      } else if (
        attr.NonResource === 'true' ||
        style.includes('fillColor=default') ||
        style.includes('verticalAlign=top')
      ) {
        type =
          width <= 160 && height <= 125 && fixedLabel
            ? 'subsection'
            : 'section';
      }

      const maxChars = Math.max(10, Math.floor((width - 14) / 7.0));

      nodes.push({
        id: attr.id,
        label: fixedLabel,
        lines: type === 'topic' ? wrapTopicLabel(fixedLabel, maxChars) : [fixedLabel],
        subtext,
        type,
        clickable: type === 'topic' && fixedLabel.length > 0,
        x,
        y,
        width,
        height: adjustedHeight,
      });
    }
  }

  const zOrder: Record<SemanticNodeType, number> = {
    section: 0,
    subsection: 1,
    title: 2,
    milestone: 3,
    topic: 4,
  };
  nodes.sort((a, b) => zOrder[a.type] - zOrder[b.type]);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  }

  const pad = 28;
  return {
    minX: Math.floor(minX - pad),
    minY: Math.floor(minY - pad),
    width: Math.ceil(maxX - minX + pad * 2),
    height: Math.ceil(maxY - minY + pad * 2),
    nodes,
    edges,
  };
}
