import {
  RoadmapNode,
  RoadmapEdge,
  TopicRequirementTag,
  TopicStatus,
  EdgeCurveStyle,
} from '@/types/roadmap';

export const STATUS_OVERRIDES: Record<
  Exclude<TopicStatus, 'pending'>,
  { fill: string; stroke: string; text: string; badge?: string }
> = {
  learning: {
    fill: '#f3e8ff',
    stroke: '#9333ea',
    text: '#581c87',
    badge: '📖',
  },
  'in-progress': {
    fill: '#f3e8ff',
    stroke: '#9333ea',
    text: '#581c87',
    badge: '📖',
  },
  done: {
    fill: '#dcfce7',
    stroke: '#16a34a',
    text: '#14532d',
    badge: '✓',
  },
  skipped: {
    fill: '#f1f5f9',
    stroke: '#94a3b8',
    text: '#64748b',
  },
};

export const DARK_STATUS_OVERRIDES: Record<
  Exclude<TopicStatus, 'pending'>,
  { fill: string; stroke: string; text: string; badge?: string }
> = {
  learning: {
    fill: '#3b0764',
    stroke: '#a855f7',
    text: '#f3e8ff',
    badge: '📖',
  },
  'in-progress': {
    fill: '#3b0764',
    stroke: '#a855f7',
    text: '#f3e8ff',
    badge: '📖',
  },
  done: {
    fill: '#064e3b',
    stroke: '#10b981',
    text: '#d1fae5',
    badge: '✓',
  },
  skipped: {
    fill: '#1e293b',
    stroke: '#475569',
    text: '#64748b',
  },
};

export const REQUIREMENT_BADGE_COLORS: Record<
  Exclude<TopicRequirementTag, 'none'>,
  { bg: string; title: string }
> = {
  required: {
    bg: '#9333ea',
    title: 'Personal Recommendation / Required',
  },
  'pick-any': {
    bg: '#16a34a',
    title: 'Alternative Option (Pick Any)',
  },
  optional: {
    bg: '#64748b',
    title: 'Optional / Learn Anytime',
  },
};

export function getEdgeEndpoints(
  edge: RoadmapEdge,
  nodeMap: Map<string, RoadmapNode>
) {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);
  if (!source || !target) return null;

  let sx = source.x + source.width / 2;
  let sy = source.y + source.height / 2;
  let tx = target.x + target.width / 2;
  let ty = target.y + target.height / 2;

  if (edge.type === 'branch-edge') {
    if (target.x > sx) {
      tx = target.x;
      ty = Math.min(target.y + 42, target.y + target.height / 2);
    } else if (target.x + target.width < sx) {
      tx = target.x + target.width;
      ty = Math.min(target.y + 42, target.y + target.height / 2);
    }
  } else if (edge.type === 'sub-branch-edge') {
    sy = source.y + source.height;
    ty = target.y;
  } else if (edge.type === 'spine-edge') {
    if (source.type === 'title') {
      sy = source.y + source.height + 4;
    }
    if (target.type === 'title') {
      ty = target.y - 4;
    }
  }

  return { sx, sy, tx, ty };
}

export function resolveEdgeControlPoints(
  edge: RoadmapEdge,
  nodeMap: Map<string, RoadmapNode>,
  desiredCount: number
): Array<{ x: number; y: number }> {
  const pts = getEdgeEndpoints(edge, nodeMap);
  if (!pts) return [];
  const { sx, sy, tx, ty } = pts;
  const count = Math.max(1, Math.min(6, desiredCount || 2));

  if (edge.points && edge.points.length === count) {
    return edge.points;
  }

  const result: Array<{ x: number; y: number }> = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const curveOffset =
      edge.type === 'branch-edge' && count >= 2
        ? (t < 0.5 ? -1 : 1) * 10
        : 0;
    result.push({
      x: Math.round(sx + (tx - sx) * t),
      y: Math.round(sy + (ty - sy) * t + curveOffset),
    });
  }
  return result;
}

export function buildSmoothSplineThroughPoints(
  allPts: Array<{ x: number; y: number }>
): string {
  if (allPts.length < 2) return '';
  if (allPts.length === 2) {
    return 'M ' + allPts[0].x + ' ' + allPts[0].y + ' L ' + allPts[1].x + ' ' + allPts[1].y;
  }
  if (allPts.length === 3) {
    return (
      'M ' +
      allPts[0].x +
      ' ' +
      allPts[0].y +
      ' Q ' +
      allPts[1].x +
      ' ' +
      allPts[1].y +
      ' ' +
      allPts[2].x +
      ' ' +
      allPts[2].y
    );
  }

  let d = 'M ' + allPts[0].x + ' ' + allPts[0].y;
  for (let i = 0; i < allPts.length - 1; i++) {
    const p0 = allPts[i === 0 ? 0 : i - 1];
    const p1 = allPts[i];
    const p2 = allPts[i + 1];
    const p3 = allPts[i + 2 < allPts.length ? i + 2 : i + 1];

    const cp1x = Math.round(p1.x + (p2.x - p0.x) / 6);
    const cp1y = Math.round(p1.y + (p2.y - p0.y) / 6);
    const cp2x = Math.round(p2.x - (p3.x - p1.x) / 6);
    const cp2y = Math.round(p2.y - (p3.y - p1.y) / 6);

    d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p2.x + ' ' + p2.y;
  }
  return d;
}

export function getEdgePath(
  edge: RoadmapEdge,
  nodeMap: Map<string, RoadmapNode>,
  curveStyle: EdgeCurveStyle,
  controlPoints: Array<{ x: number; y: number }>
): string {
  const pts = getEdgeEndpoints(edge, nodeMap);
  if (!pts) return '';
  const { sx, sy, tx, ty } = pts;

  const hasCustomDraggedPoints = Boolean(edge.points && edge.points.length > 0);
  const fullChain = [{ x: sx, y: sy }, ...controlPoints, { x: tx, y: ty }];

  if (curveStyle === 'straight') {
    return fullChain
      .map((p, idx) => (idx === 0 ? 'M ' : 'L ') + p.x + ' ' + p.y)
      .join(' ');
  }

  if (curveStyle === 'orthogonal' && !hasCustomDraggedPoints) {
    if (edge.type === 'sub-branch-edge') {
      const midY = Math.round((sy + ty) / 2);
      return (
        'M ' + sx + ' ' + sy +
        ' L ' + sx + ' ' + midY +
        ' L ' + tx + ' ' + midY +
        ' L ' + tx + ' ' + ty
      );
    }
    const midX = Math.round((sx + tx) / 2);
    return (
      'M ' + sx + ' ' + sy +
      ' L ' + midX + ' ' + sy +
      ' L ' + midX + ' ' + ty +
      ' L ' + tx + ' ' + ty
    );
  }

  if (hasCustomDraggedPoints || controlPoints.length >= 2) {
    return buildSmoothSplineThroughPoints(fullChain);
  }

  const midX = (sx + tx) / 2;
  return (
    'M ' + sx + ' ' + sy +
    ' C ' + midX + ' ' + sy + ', ' + midX + ' ' + ty + ', ' + tx + ' ' + ty
  );
}

export function isDarkColor(hex?: string) {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.slice(1);
  if (c.length !== 6 && c.length !== 3) return false;
  const r = parseInt(c.length === 3 ? c[0] + c[0] : c.slice(0, 2), 16);
  const g = parseInt(c.length === 3 ? c[1] + c[1] : c.slice(2, 4), 16);
  const b = parseInt(c.length === 3 ? c[2] + c[2] : c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}
