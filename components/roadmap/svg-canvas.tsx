'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
  TopicStatus,
  RoadmapThemeConfig,
} from '@/types/roadmap';
import { DEFAULT_ROADMAP_THEME, getEffectiveTheme } from '@/config/theme';
import {
  STATUS_OVERRIDES,
  DARK_STATUS_OVERRIDES,
  resolveEdgeControlPoints,
  getEdgePath,
  isDarkColor,
} from '@/lib/svgEdgeUtils';
import {
  SectionContainer,
  EdgeLine,
  MilestoneMarker,
  CanvasTitle,
  TopicBox,
} from './svg-renderers';

export { resolveEdgeControlPoints };

interface SvgCanvasProps {
  graph: RoadmapGraph;
  theme?: RoadmapThemeConfig;
  autoDarkMode?: boolean;
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

export default function SvgCanvas({
  graph,
  theme = DEFAULT_ROADMAP_THEME,
  autoDarkMode = true,
  topicStatuses = {},
  editMode = true,
  moveGroupWithSection = true,
  selectedNodeId,
  selectedEdgeId,
  onSelectEditNode,
  onSelectEditEdge,
  onMoveNodes,
  onMoveEdgeControlPoint,
}: SvgCanvasProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = autoDarkMode && mounted ? resolvedTheme === 'dark' : false;
  const activeTheme = getEffectiveTheme(theme, isDarkMode);

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

  const viewBoxStr = `${graph.minX ?? 0} ${graph.minY ?? 0} ${graph.width} ${graph.height}`;

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

  const isTransparentBg = activeTheme.canvas.backgroundColor === 'transparent';
  const canvasContrastColor = isTransparentBg ? '#ffffff' : activeTheme.canvas.backgroundColor;

  return (
    <div
      style={{
        backgroundColor: activeTheme.canvas.backgroundColor,
        fontFamily: activeTheme.canvas.fontFamily,
      }}
      className={
        'w-full overflow-x-auto rounded-2xl border shadow-xs p-3 md:p-6 transition-colors ' +
        (isTransparentBg && editMode
          ? 'bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] '
          : '') +
        (editMode ? 'border-amber-400 ring-2 ring-amber-200/60' : 'border-slate-200 dark:border-slate-800')
      }
      suppressHydrationWarning
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ fontFamily: activeTheme.canvas.fontFamily }}
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

        {/* 1. Sections & Subsections */}
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
            const boxStyle = isSub ? activeTheme.nodes.subsection : activeTheme.nodes.section;
            const isSelected = editMode && selectedNodeId === node.id;

            return (
              <SectionContainer
                key={node.id}
                node={node}
                isSub={isSub}
                boxStyle={boxStyle}
                canvasContrastColor={canvasContrastColor}
                isSelected={isSelected}
                isEditMode={editMode}
                onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
              />
            );
          })}

        {/* 2. Edges with interactive control points */}
        {graph.edges.map((edge) => {
          const edgeCfg =
            edge.type === 'spine-edge'
              ? activeTheme.edges.spine
              : edge.type === 'sub-branch-edge'
                ? activeTheme.edges.subBranch
                : activeTheme.edges.branch;

          const controlPoints = resolveEdgeControlPoints(
            edge,
            nodeMap,
            edgeCfg.controlPointsCount
          );
          const d = getEdgePath(edge, nodeMap, edgeCfg.curveStyle, controlPoints);
          if (!d) return null;

          const isSelected = editMode && selectedEdgeId === edge.id;

          return (
            <g key={edge.id}>
              <EdgeLine
                edge={edge}
                d={d}
                edgeCfg={edgeCfg}
                canvasContrastColor={canvasContrastColor}
                isSelected={isSelected}
                isEditMode={editMode}
                onClick={() => editMode && onSelectEditEdge?.(edge)}
              />

              {/* Draggable control handles in edit mode */}
              {editMode &&
                controlPoints.map((pt, pIdx) => (
                  <g
                    key={`${edge.id}-pt-${pIdx}`}
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

        {/* 3. Milestones, Titles & Topics */}
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
            const cx = node.x + node.width / 2;
            const cy = node.y + node.height / 2;

            if (node.type === 'milestone') {
              const mStyle = activeTheme.nodes.milestone;
              const pinColor = isSelected ? '#f97316' : mStyle.color;

              return (
                <MilestoneMarker
                  key={node.id}
                  cx={cx}
                  cy={cy}
                  mStyle={mStyle}
                  pinColor={pinColor}
                  canvasContrastColor={canvasContrastColor}
                  onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                  className={editMode ? 'cursor-move' : undefined}
                />
              );
            }

            if (node.type === 'title') {
              return (
                <CanvasTitle
                  key={node.id}
                  x={cx}
                  y={cy}
                  label={node.label}
                  color={activeTheme.canvas.titleColor}
                  fontSize={activeTheme.canvas.titleFontSize}
                  onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                  className={editMode ? 'cursor-move' : undefined}
                />
              );
            }

            // Topic or Subtopic
            const status =
              topicStatuses[node.topicId] ||
              topicStatuses[node.label] ||
              'pending';
            const isSubtopic = node.type === 'subtopic';
            const baseBoxStyle = isSubtopic
              ? activeTheme.nodes.subtopic
              : activeTheme.nodes.topic;

            const isDark = isDarkColor(activeTheme.canvas.backgroundColor);
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

            return (
              <TopicBox
                key={node.id}
                node={node}
                baseBoxStyle={baseBoxStyle}
                canvasContrastColor={canvasContrastColor}
                fillColor={fillColor}
                strokeColor={strokeColor}
                textColor={textColor}
                isSelected={isSelected}
                status={status}
                badge={badge}
                onPointerDown={(e) => handleNodePointerDown(e, rawNode)}
                className="cursor-move"
                dataAttributes={{
                  'data-node-id': node.id,
                  'data-topic-id': node.topicId,
                  'data-status': status,
                }}
              />
            );
          })}
      </svg>
    </div>
  );
}
