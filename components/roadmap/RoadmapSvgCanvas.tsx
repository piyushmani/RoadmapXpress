'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
  TopicStatus,
  TopicRequirementTag,
  RoadmapThemeConfig,
  EdgeCurveStyle,
} from '@/types/roadmap';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import {
  REQUIREMENT_BADGE_COLORS,
  STATUS_OVERRIDES,
  DARK_STATUS_OVERRIDES,
  getEdgeEndpoints,
  resolveEdgeControlPoints,
  buildSmoothSplineThroughPoints,
  getEdgePath,
  isDarkColor,
} from '@/lib/svgEdgeUtils';

export { resolveEdgeControlPoints };

interface RoadmapSvgCanvasProps {
  graph: RoadmapGraph;
  theme?: RoadmapThemeConfig;
  topicStatuses?: Record<string, TopicStatus>;
  editMode?: boolean;
  moveGroupWithSection?: boolean;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectEditNode?: (node: RoadmapNode) => void;
  onSelectEditEdge?: (edge: RoadmapEdge) => void;
  onMoveNodes?: (nodeIds: string[], dx: number, dy: number) => void;
  onMoveEdgeControlPoint?: (
    edgeId: string,
    pointIndex: number,
    allPoints: Array<{ x: number; y: number }>
  ) => void;
}

export default function RoadmapSvgCanvas({
  graph,
  theme = DEFAULT_ROADMAP_THEME,
  topicStatuses = {},
  editMode = true,
  moveGroupWithSection = true,
  selectedNodeId,
  selectedEdgeId,
  onSelectEditNode,
  onSelectEditEdge,
  onMoveNodes,
  onMoveEdgeControlPoint,
}: RoadmapSvgCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [dragState, setDragState] = useState<{
    kind: 'node' | 'edge-point';
    ids: string[];
    edgeId?: string;
    pointIndex?: number;
    initialEdgePoints?: Array<{ x: number; y: number }>;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
  } | null>(null);

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: clientX, y: clientY };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handleNodePointerDown = (e: React.PointerEvent, node: RoadmapNode) => {
    if (!editMode) return;
    e.stopPropagation();
    onSelectEditNode?.(node);

    const { x, y } = toSvgCoords(e.clientX, e.clientY);

    let affectedIds = [node.id];
    if (
      moveGroupWithSection &&
      (node.type === 'section' || node.type === 'subsection')
    ) {
      const childIds = graph.nodes
        .filter((n) => n.parentId === node.id)
        .map((n) => n.id);
      affectedIds = [node.id, ...childIds];
    }

    setDragState({
      kind: 'node',
      ids: affectedIds,
      startX: x,
      startY: y,
      dx: 0,
      dy: 0,
    });
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handleEdgePointPointerDown = (
    e: React.PointerEvent,
    edge: RoadmapEdge,
    pointIndex: number,
    resolvedPoints: Array<{ x: number; y: number }>
  ) => {
    if (!editMode) return;
    e.stopPropagation();
    onSelectEditEdge?.(edge);
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    setDragState({
      kind: 'edge-point',
      ids: [],
      edgeId: edge.id,
      pointIndex,
      initialEdgePoints: resolvedPoints.map((p) => ({ ...p })),
      startX: x,
      startY: y,
      dx: 0,
      dy: 0,
    });
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    const dx = Math.round((x - dragState.startX) / 4) * 4;
    const dy = Math.round((y - dragState.startY) / 4) * 4;

    if (
      dragState.kind === 'edge-point' &&
      dragState.edgeId !== undefined &&
      dragState.pointIndex !== undefined &&
      dragState.initialEdgePoints
    ) {
      const updatedPts = dragState.initialEdgePoints.map((pt, idx) =>
        idx === dragState.pointIndex
          ? { x: Math.round(x), y: Math.round(y) }
          : pt
      );
      onMoveEdgeControlPoint?.(
        dragState.edgeId,
        dragState.pointIndex,
        updatedPts
      );
      return;
    }

    setDragState((prev) => (prev ? { ...prev, dx, dy } : null));
  };

  const handlePointerUp = () => {
    if (!dragState) return;
    if (
      dragState.kind === 'node' &&
      (dragState.dx !== 0 || dragState.dy !== 0)
    ) {
      onMoveNodes?.(dragState.ids, dragState.dx, dragState.dy);
    }
    setDragState(null);
  };

  const draggedSet = useMemo(
    () => new Set(dragState?.kind === 'node' ? dragState.ids : []),
    [dragState]
  );

  const viewBoxStr =
    (graph.minX ?? 0) +
    ' ' +
    (graph.minY ?? 0) +
    ' ' +
    graph.width +
    ' ' +
    graph.height;

  const sortedNodes = useMemo(() => {
    const order: Record<string, number> = {
      section: 0,
      subsection: 1,
      title: 2,
      milestone: 3,
      topic: 4,
      subtopic: 5,
    };
    return [...graph.nodes].sort(
      (a, b) => (order[a.type] ?? 3) - (order[b.type] ?? 3)
    );
  }, [graph.nodes]);

  const isTransparentBg = theme.canvas.backgroundColor === 'transparent';
  const canvasContrastColor = isTransparentBg ? '#ffffff' : theme.canvas.backgroundColor;

  return (
    <div
      style={{
        backgroundColor: theme.canvas.backgroundColor,
        fontFamily: theme.canvas.fontFamily,
      }}
      className={
        'w-full overflow-x-auto rounded-2xl border shadow-xs p-3 md:p-6 transition-colors ' +
        (isTransparentBg && editMode
          ? 'bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] '
          : '') +
        (editMode ? 'border-amber-400 ring-2 ring-amber-200/60' : 'border-slate-200')
      }
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ fontFamily: theme.canvas.fontFamily }}
        className="w-full h-auto min-w-[860px] max-w-7xl mx-auto select-none"
        role="img"
        aria-label="Developer Roadmap Canvas"
      >
        {editMode && (
          <defs>
            <pattern
              id="roadmap-edit-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.6"
                strokeOpacity="0.6"
              />
            </pattern>
          </defs>
        )}

        {editMode && (
          <rect
            x={graph.minX}
            y={graph.minY}
            width={graph.width}
            height={graph.height}
            fill="url(#roadmap-edit-grid)"
          />
        )}

        {/* 1. Render Section & Sub-Section Containers (With Title on Top Border!) */}
        {sortedNodes
          .filter((n) => n.type === 'section' || n.type === 'subsection')
          .map((rawNode) => {
            const isDragging = draggedSet.has(rawNode.id);
            const node = isDragging
              ? {
                ...rawNode,
                x: rawNode.x + (dragState?.dx || 0),
                y: rawNode.y + (dragState?.dy || 0),
              }
              : rawNode;

            const isSub = node.type === 'subsection';
            const boxStyle = isSub
              ? theme.nodes.subsection
              : theme.nodes.section;
            const isSelected = editMode && selectedNodeId === node.id;
            const titleOnBorder = boxStyle.titleOnBorder ?? true;
            const padX = boxStyle.borderTitlePaddingX ?? 14;
            const estTextW = node.label
              ? Math.ceil(node.label.length * (boxStyle.fontSize * 0.6))
              : 0;
            const maskW = estTextW + padX * 2;
            const maskX = node.x + node.width / 2 - maskW / 2;

            return (
              <g
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                className={editMode ? 'cursor-move' : undefined}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={boxStyle.borderRadius}
                  fill={boxStyle.fillColor}
                  stroke={isSelected ? '#f97316' : boxStyle.strokeColor}
                  strokeWidth={isSelected ? 2.5 : boxStyle.strokeWidth}
                  strokeDasharray={boxStyle.dashed ? '5 4' : undefined}
                />

                {/* Mask out the top border line behind the title with left/right space */}
                {node.label && titleOnBorder && (
                  <rect
                    x={maskX}
                    y={node.y - 10}
                    width={maskW}
                    height={20}
                    rx={4}
                    fill={
                      isSub
                        ? theme.nodes.section.fillColor
                        : canvasContrastColor
                    }
                  />
                )}

                {node.label && (
                  <text
                    x={node.x + node.width / 2}
                    y={titleOnBorder ? node.y : node.y + (isSub ? 20 : 23)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={boxStyle.textColor}
                    fontSize={boxStyle.fontSize}
                    fontWeight={700}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}

        {/* 2. Render Edges (Supports Road Path SVG + Multi-Control Point Handles!) */}
        {graph.edges.map((edge) => {
          const edgeCfg =
            edge.type === 'spine-edge'
              ? theme.edges.spine
              : edge.type === 'sub-branch-edge'
                ? theme.edges.subBranch
                : theme.edges.branch;

          const controlPoints = resolveEdgeControlPoints(
            edge,
            nodeMap,
            edgeCfg.controlPointsCount
          );
          const d = getEdgePath(edge, nodeMap, edgeCfg.curveStyle, controlPoints);
          if (!d) return null;

          const isSelected = editMode && selectedEdgeId === edge.id;
          const isRoadTrack = Boolean(edgeCfg.roadTrack);

          return (
            <g key={edge.id}>
              {/* Single-color Road Track Base + Dashed Centerline (like screenshot 1) */}
              {isRoadTrack ? (
                <g
                  onClick={() => editMode && onSelectEditEdge?.(edge)}
                  className={editMode ? 'cursor-pointer' : undefined}
                >
                  <path
                    d={d}
                    fill="none"
                    stroke={isSelected ? '#f97316' : edgeCfg.strokeColor}
                    strokeWidth={Math.max(8, edgeCfg.strokeWidth)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={canvasContrastColor}
                    strokeWidth={Math.max(1.8, edgeCfg.strokeWidth * 0.18)}
                    strokeDasharray="7 7"
                    strokeLinecap="round"
                  />
                </g>
              ) : (
                <path
                  d={d}
                  fill="none"
                  stroke={isSelected ? '#f97316' : edgeCfg.strokeColor}
                  strokeWidth={
                    isSelected ? edgeCfg.strokeWidth + 1.5 : edgeCfg.strokeWidth
                  }
                  strokeDasharray={edgeCfg.dashed ? '6 5' : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={() => editMode && onSelectEditEdge?.(edge)}
                  className={editMode ? 'cursor-pointer' : undefined}
                />
              )}

              {/* Multi-Point Draggable Control Handles in Edit Mode */}
              {editMode &&
                controlPoints.map((pt, pIdx) => (
                  <g
                    key={edge.id + '-pt-' + pIdx}
                    onPointerDown={(e) =>
                      handleEdgePointPointerDown(e, edge, pIdx, controlPoints)
                    }
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={6.5}
                      fill={isSelected ? '#ea580c' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <title>
                      Drag control point #{pIdx + 1} of {controlPoints.length} ({edge.id})
                    </title>
                  </g>
                ))}
            </g>
          );
        })}

        {/* 3. Render Milestones (Single-Color Pin Marker SVG, No Text!), Titles & Topics */}
        {sortedNodes
          .filter((n) => n.type !== 'section' && n.type !== 'subsection')
          .map((rawNode) => {
            const isDragging = draggedSet.has(rawNode.id);
            const node = isDragging
              ? {
                ...rawNode,
                x: rawNode.x + (dragState?.dx || 0),
                y: rawNode.y + (dragState?.dy || 0),
              }
              : rawNode;

            const isSelected = editMode && selectedNodeId === node.id;

            // Single-color Teardrop Pin Marker SVG or Circle Dot (No Text)
            if (node.type === 'milestone') {
              const cx = node.x + node.width / 2;
              const cy = node.y + node.height / 2;
              const mStyle = theme.nodes.milestone;
              const pinColor = isSelected ? '#f97316' : mStyle.color;
              const scale = (mStyle.size || 28) / 28;

              if (mStyle.shape === 'pin') {
                return (
                  <g
                    key={node.id}
                    transform={'translate(' + cx + ', ' + cy + ') scale(' + scale + ')'}
                    onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                    className={editMode ? 'cursor-move' : undefined}
                  >
                    {/* Subtle ground shadow ellipse under pin tip */}
                    {mStyle.showGroundShadow && (
                      <ellipse
                        cx={0}
                        cy={0}
                        rx={8}
                        ry={3.2}
                        fill={pinColor}
                        fillOpacity={0.28}
                      />
                    )}
                    {/* Single-color SVG Teardrop Map Marker with tip at (0,0) */}
                    <path
                      d="M 0 0 C -6 -8 -12 -14 -12 -21 A 12 12 0 1 1 12 -21 C 12 -14 6 -8 0 0 Z"
                      fill={pinColor}
                    />
                    {/* Inner cutout hole */}
                    <circle
                      cx={0}
                      cy={-21}
                      r={4.8}
                      fill={canvasContrastColor}
                    />
                  </g>
                );
              }

              return (
                <g
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                  className={editMode ? 'cursor-move' : undefined}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={Math.round((mStyle.size || 24) * 0.42)}
                    fill={pinColor}
                    stroke={canvasContrastColor}
                    strokeWidth={3.5}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={Math.max(3, Math.round((mStyle.size || 24) * 0.15))}
                    fill={canvasContrastColor}
                  />
                </g>
              );
            }

            if (node.type === 'title') {
              return (
                <g
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                  className={editMode ? 'cursor-move' : undefined}
                >
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={theme.canvas.titleColor}
                    fontSize={theme.canvas.titleFontSize}
                    fontWeight={800}
                  >
                    {node.label}
                  </text>
                </g>
              );
            }

            // Topic or Subtopic Node
            const status =
              topicStatuses[node.topicId] ||
              topicStatuses[node.label] ||
              'pending';
            const isSubtopic = node.type === 'subtopic';
            const baseBoxStyle = isSubtopic
              ? theme.nodes.subtopic
              : theme.nodes.topic;

            const isDark = isDarkColor(theme.canvas.backgroundColor);
            const statusOverride =
              status !== 'pending'
                ? (isDark ? DARK_STATUS_OVERRIDES : STATUS_OVERRIDES)[status]
                : null;

            const fillColor = statusOverride
              ? statusOverride.fill
              : baseBoxStyle.fillColor;
            const strokeColor = statusOverride
              ? statusOverride.stroke
              : baseBoxStyle.strokeColor;
            const textColor = statusOverride
              ? statusOverride.text
              : baseBoxStyle.textColor;
            const badge = statusOverride?.badge;

            const titleLines =
              node.lines && node.lines.length > 0 ? node.lines : [node.label];
            const hasSubtext = node.subtext && node.subtext.length > 0;
            const centerX = node.x + node.width / 2;

            const fontSize = baseBoxStyle.fontSize;
            const lineSpacing = Math.round(fontSize * 1.2);
            const titleBlockHeight = (titleLines.length - 1) * lineSpacing;
            const firstTitleY = hasSubtext
              ? node.y + 18
              : node.y + node.height / 2 - titleBlockHeight / 2;

            const reqTag = node.tag && node.tag !== 'none' ? node.tag : null;
            const badgeCfg = reqTag ? REQUIREMENT_BADGE_COLORS[reqTag] : null;

            return (
              <g
                key={node.id}
                id={node.topicId}
                data-node-id={node.id}
                data-topic-id={node.topicId}
                data-status={status}
                onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                className="cursor-move"
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={baseBoxStyle.borderRadius}
                  fill={fillColor}
                  stroke={isSelected ? '#f97316' : strokeColor}
                  strokeWidth={isSelected ? 2.5 : baseBoxStyle.strokeWidth}
                  strokeDasharray={baseBoxStyle.dashed ? '4 3' : undefined}
                />

                {titleLines.map((line, lIdx) => {
                  const displayLine =
                    lIdx === 0 && badge ? badge + ' ' + line : line;
                  return (
                    <text
                      key={lIdx}
                      x={centerX}
                      y={firstTitleY + lIdx * lineSpacing}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight={isSubtopic ? 500 : 600}
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
                      6 +
                      sIdx * 15
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#64748b"
                    fontSize={Math.max(10.5, fontSize - 2)}
                  >
                    {subLine}
                  </text>
                ))}

                {/* Requirement Badge: Required 🟣, Pick-Any 🟢, Optional ⚪ */}
                {badgeCfg && (
                  <g
                    transform={
                      'translate(' +
                      (node.x + node.width - 6) +
                      ', ' +
                      (node.y + 6) +
                      ')'
                    }
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={8.5}
                      fill={badgeCfg.bg}
                      stroke={canvasContrastColor}
                      strokeWidth={1.5}
                    />
                    <path
                      d="M -3.5 0.2 L -1 2.8 L 3.8 -2.5"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <title>{badgeCfg.title}</title>
                  </g>
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
}
