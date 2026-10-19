'use client';

import React, { useMemo } from 'react';
import {
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
  TopicStatus,
} from '../types/roadmap';

interface RoadmapSvgCanvasProps {
  graph: RoadmapGraph;
  topicStatuses: Record<string, TopicStatus>;
  onSelectTopic: (node: RoadmapNode) => void;
  onToggleTopicDone: (node: RoadmapNode) => void;
}

function getEdgePath(
  edge: RoadmapEdge,
  nodeMap: Map<string, RoadmapNode>
): string {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);
  if (!source || !target) return '';

  const sx = source.x + source.width / 2;
  const sy = source.y + source.height / 2;

  let tx = target.x + target.width / 2;
  const ty = target.y + target.height / 2;

  if (edge.type !== 'spine-edge') {
    if (target.x > sx) {
      tx = target.x;
    } else if (target.x + target.width < sx) {
      tx = target.x + target.width;
    }
  }

  if (edge.points && edge.points.length === 1) {
    const cx = edge.points[0].x;
    const cy = edge.points[0].y;
    return 'M ' + sx + ' ' + sy + ' Q ' + cx + ' ' + cy + ' ' + tx + ' ' + ty;
  }

  if (edge.type !== 'spine-edge') {
    const midX = (sx + tx) / 2;
    return (
      'M ' +
      sx +
      ' ' +
      sy +
      ' C ' +
      midX +
      ' ' +
      sy +
      ', ' +
      midX +
      ' ' +
      ty +
      ', ' +
      tx +
      ' ' +
      ty
    );
  }

  return 'M ' + sx + ' ' + sy + ' L ' + tx + ' ' + ty;
}

const STATUS_STYLES: Record<
  TopicStatus,
  { fill: string; stroke: string; text: string; badge?: string }
> = {
  pending: {
    fill: '#ffe6cc',
    stroke: '#d79b00',
    text: '#0f172a',
  },
  'in-progress': {
    fill: '#dbeafe',
    stroke: '#2563eb',
    text: '#1e3a8a',
    badge: '●',
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

export default function RoadmapSvgCanvas({
  graph,
  topicStatuses,
  onSelectTopic,
  onToggleTopicDone,
}: RoadmapSvgCanvasProps) {
  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const viewBoxStr =
    (graph.minX ?? 0) +
    ' ' +
    (graph.minY ?? 0) +
    ' ' +
    graph.width +
    ' ' +
    graph.height;

  return (
    <div className="w-full overflow-x-auto bg-slate-50/50 rounded-xl border border-slate-200 shadow-xs p-2 md:p-4">
      <svg
        viewBox={viewBoxStr}
        className="w-full h-auto min-w-[820px] max-w-7xl mx-auto select-none"
        role="img"
        aria-label="Backend Developer Roadmap"
      >
        {/* 1. Render Edges */}
        {graph.edges.map((edge) => {
          const d = getEdgePath(edge, nodeMap);
          if (!d) return null;
          const isSpine = edge.type === 'spine-edge';
          const isSub = edge.type === 'sub-branch-edge';

          return (
            <path
              key={edge.id}
              d={d}
              fill="none"
              stroke={isSpine ? '#2563eb' : isSub ? '#475569' : '#64748b'}
              strokeWidth={isSpine ? 3.5 : 2}
              strokeDasharray={isSpine || isSub ? '6 5' : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* 2. Render Nodes */}
        {graph.nodes.map((node) => {
          if (node.type === 'milestone') {
            const cx = node.x + node.width / 2;
            const cy = node.y + node.height / 2;
            return (
              <g key={node.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={11}
                  fill="#2563eb"
                  stroke="#dbeafe"
                  strokeWidth={4}
                />
                <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />
              </g>
            );
          }

          if (node.type === 'title') {
            return (
              <text
                key={node.id}
                x={node.x + node.width / 2}
                y={node.y + node.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#0f172a"
                fontSize={22}
                fontWeight={700}
              >
                {node.label}
              </text>
            );
          }

          if (node.type === 'section' || node.type === 'subsection') {
            const isSub = node.type === 'subsection';
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={isSub ? 6 : 8}
                  fill={isSub ? '#f8fafc' : '#ffffff'}
                  stroke={isSub ? '#94a3b8' : '#64748b'}
                  strokeWidth={isSub ? 1.2 : 1.5}
                />
                {node.label && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e293b"
                    fontSize={isSub ? 13.5 : 15.5}
                    fontWeight={700}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          }

          // Topic Node (supports multi-line wrapped title + optional subtext lines)
          const status = topicStatuses[node.label] || 'pending';
          const palette = STATUS_STYLES[status];
          const titleLines =
            node.lines && node.lines.length > 0 ? node.lines : [node.label];
          const hasSubtext = node.subtext && node.subtext.length > 0;
          const centerX = node.x + node.width / 2;

          // Calculate vertical starting Y for title lines
          const lineSpacing = 15;
          const titleBlockHeight = (titleLines.length - 1) * lineSpacing;
          const firstTitleY = hasSubtext
            ? node.y + 16
            : node.y + node.height / 2 - titleBlockHeight / 2;

          return (
            <g
              key={node.id}
              data-node-id={node.id}
              data-status={status}
              onClick={() => node.clickable && onSelectTopic(node)}
              onContextMenu={(e) => {
                if (!node.clickable) return;
                e.preventDefault();
                onToggleTopicDone(node);
              }}
              className="cursor-pointer transition-opacity hover:opacity-90"
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={5}
                fill={palette.fill}
                stroke={palette.stroke}
                strokeWidth={1.5}
              />

              {titleLines.map((line, lIdx) => {
                const displayLine =
                  lIdx === 0 && palette.badge
                    ? palette.badge + ' ' + line
                    : line;
                return (
                  <text
                    key={lIdx}
                    x={centerX}
                    y={firstTitleY + lIdx * lineSpacing}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={palette.text}
                    fontSize={13}
                    fontWeight={600}
                    textDecoration={
                      status === 'done' || status === 'skipped'
                        ? 'line-through'
                        : undefined
                    }
                  >
                    {displayLine}
                  </text>
                );
              })}

              {node.subtext?.map((subLine, sIdx) => (
                <text
                  key={'sub-' + sIdx}
                  x={centerX}
                  y={
                    firstTitleY +
                    titleLines.length * lineSpacing +
                    4 +
                    sIdx * 14.5
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#475569"
                  fontSize={11}
                >
                  {subLine}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
