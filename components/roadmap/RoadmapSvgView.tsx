import React from 'react';
import {
  RoadmapGraph,
  RoadmapThemeConfig,
} from '@/types/roadmap';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import { REQUIREMENT_BADGE_COLORS } from '@/lib/svgEdgeUtils';

interface RoadmapSvgViewProps {
  graph: RoadmapGraph;
  theme?: RoadmapThemeConfig;
}

export default function RoadmapSvgView({
  graph,
  theme = DEFAULT_ROADMAP_THEME,
}: RoadmapSvgViewProps) {
  const isTransparentBg = theme.canvas.backgroundColor === 'transparent';
  const canvasContrastColor = isTransparentBg ? '#ffffff' : theme.canvas.backgroundColor;
  const viewBoxStr = graph.viewBox || `${graph.minX} ${graph.minY} ${graph.width} ${graph.height}`;

  return (
    <div
      style={{
        backgroundColor: theme.canvas.backgroundColor,
        fontFamily: theme.canvas.fontFamily,
      }}
      className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-xs p-3 md:p-6 transition-colors"
    >
      <svg
        viewBox={viewBoxStr}
        style={{ fontFamily: theme.canvas.fontFamily }}
        className="w-full h-auto min-w-[860px] max-w-7xl mx-auto select-none"
        role="img"
        aria-label="Developer Roadmap Canvas"
      >
        <defs>
          {/* CSS rules embedded in SVG so dynamic status updates from client island take effect instantly */}
          <style>{`
            .roadmap-node-clickable {
              cursor: pointer;
            }
            .roadmap-node-clickable:hover .node-box {
              filter: brightness(0.95);
              stroke-width: 2.2px;
            }
            /* Done (Emerald) */
            .roadmap-node[data-status="done"] .node-box {
              fill: #dcfce7 !important;
              stroke: #16a34a !important;
            }
            .roadmap-node[data-status="done"] .node-title {
              fill: #14532d !important;
              text-decoration: line-through;
            }
            /* Learning / In-Progress (Purple) */
            .roadmap-node[data-status="learning"] .node-box,
            .roadmap-node[data-status="in-progress"] .node-box {
              fill: #f3e8ff !important;
              stroke: #9333ea !important;
            }
            .roadmap-node[data-status="learning"] .node-title,
            .roadmap-node[data-status="in-progress"] .node-title {
              fill: #581c87 !important;
            }
            /* Skipped (Slate) */
            .roadmap-node[data-status="skipped"] .node-box {
              fill: #f1f5f9 !important;
              stroke: #94a3b8 !important;
            }
            .roadmap-node[data-status="skipped"] .node-title {
              fill: #64748b !important;
              text-decoration: line-through;
            }
          `}</style>
        </defs>

        {/* 1. Sections & Subsections */}
        {graph.nodes
          .filter((n) => n.type === 'section' || n.type === 'subsection')
          .map((node) => {
            const isSub = node.type === 'subsection';
            const boxStyle = isSub
              ? theme.nodes.subsection
              : theme.nodes.section;

            const centerX = node.centerX ?? Math.round(node.x + node.width / 2);
            const titleY = node.titleY ?? (node.y + (isSub ? 20 : 23));

            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={boxStyle.borderRadius}
                  fill={boxStyle.fillColor}
                  stroke={boxStyle.strokeColor}
                  strokeWidth={boxStyle.strokeWidth}
                  strokeDasharray={boxStyle.dashed ? '5 4' : undefined}
                />

                {node.borderMask && (
                  <rect
                    x={node.borderMask.x}
                    y={node.borderMask.y}
                    width={node.borderMask.width}
                    height={node.borderMask.height}
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
                    x={centerX}
                    y={titleY}
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

        {/* 2. Edges */}
        {graph.edges.map((edge) => {
          if (!edge.d) return null;

          const edgeCfg =
            edge.type === 'spine-edge'
              ? theme.edges.spine
              : edge.type === 'sub-branch-edge'
                ? theme.edges.subBranch
                : theme.edges.branch;

          const isRoadTrack = Boolean(edgeCfg.roadTrack);

          return (
            <g key={edge.id}>
              {isRoadTrack ? (
                <g>
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={edgeCfg.strokeColor}
                    strokeWidth={Math.max(8, edgeCfg.strokeWidth)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={canvasContrastColor}
                    strokeWidth={Math.max(1.8, edgeCfg.strokeWidth * 0.18)}
                    strokeDasharray="7 7"
                    strokeLinecap="round"
                  />
                </g>
              ) : (
                <path
                  d={edge.d}
                  fill="none"
                  stroke={edgeCfg.strokeColor}
                  strokeWidth={edgeCfg.strokeWidth}
                  strokeDasharray={edgeCfg.dashed ? '6 5' : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          );
        })}

        {/* 3. Milestones, Canvas Titles, and Topics */}
        {graph.nodes
          .filter((n) => n.type !== 'section' && n.type !== 'subsection')
          .map((node) => {
            const centerX = node.centerX ?? Math.round(node.x + node.width / 2);
            const centerY = node.centerY ?? Math.round(node.y + node.height / 2);

            // Milestone (Pin / Circle)
            if (node.type === 'milestone') {
              const mStyle = theme.nodes.milestone;
              const pinColor = mStyle.color;
              const scale = (mStyle.size || 28) / 28;

              if (mStyle.shape === 'pin') {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
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
                    <path
                      d="M 0 0 C -6 -8 -12 -14 -12 -21 A 12 12 0 1 1 12 -21 C 12 -14 6 -8 0 0 Z"
                      fill={pinColor}
                    />
                    <circle cx={0} cy={-21} r={4.5} fill="#ffffff" />
                  </g>
                );
              }

              return (
                <circle
                  key={node.id}
                  cx={centerX}
                  cy={centerY}
                  r={(mStyle.size || 24) / 2}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              );
            }

            // Canvas Title Node
            if (node.type === 'title') {
              return (
                <g key={node.id}>
                  <text
                    x={centerX}
                    y={centerY}
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
            const isSubtopic = node.type === 'subtopic';
            const baseBoxStyle = isSubtopic
              ? theme.nodes.subtopic
              : theme.nodes.topic;

            const lines = node.renderedLines ?? [{ text: node.label, y: centerY }];
            const badgeX = node.badgeX ?? (node.x + node.width - 6);
            const badgeY = node.badgeY ?? (node.y + 6);

            const reqTag = node.tag && node.tag !== 'none' ? node.tag : null;
            const badgeCfg = reqTag ? REQUIREMENT_BADGE_COLORS[reqTag] : null;

            return (
              <g
                key={node.id}
                id={node.topicId}
                data-node-id={node.id}
                data-topic-id={node.topicId || node.label}
                data-label={node.label}
                data-subtext={
                  node.subtext && node.subtext.length > 0
                    ? JSON.stringify(node.subtext)
                    : undefined
                }
                data-tag={node.tag || 'none'}
                data-status="pending"
                className={`roadmap-node ${node.clickable ? 'roadmap-node-clickable' : ''}`}
              >
                <rect
                  className="node-box"
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={baseBoxStyle.borderRadius}
                  fill={baseBoxStyle.fillColor}
                  stroke={baseBoxStyle.strokeColor}
                  strokeWidth={baseBoxStyle.strokeWidth}
                  strokeDasharray={baseBoxStyle.dashed ? '4 3' : undefined}
                />

                {lines.map((line, lIdx) => (
                  <text
                    key={lIdx}
                    className="node-title"
                    x={centerX}
                    y={line.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={baseBoxStyle.textColor}
                    fontSize={baseBoxStyle.fontSize}
                    fontWeight={isSubtopic ? 500 : 600}
                  >
                    {line.text}
                  </text>
                ))}

                {node.renderedSubtext?.map((subLine, sIdx) => (
                  <text
                    key={'sub-' + sIdx}
                    className="node-subtext"
                    x={centerX}
                    y={subLine.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#64748b"
                    fontSize={Math.max(10.5, baseBoxStyle.fontSize - 2)}
                  >
                    {subLine.text}
                  </text>
                ))}

                {/* Requirement Badge: Required 🟣, Pick-Any 🟢, Optional ⚪ */}
                {badgeCfg && (
                  <g transform={`translate(${badgeX}, ${badgeY})`}>
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
