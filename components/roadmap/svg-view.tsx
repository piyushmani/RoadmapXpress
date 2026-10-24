'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { RoadmapGraph, RoadmapThemeConfig } from '@/types/roadmap';
import { DEFAULT_ROADMAP_THEME, getEffectiveTheme } from '@/config/theme';
import { isDarkColor } from '@/lib/svgEdgeUtils';
import {
  SectionContainer,
  EdgeLine,
  MilestoneMarker,
  CanvasTitle,
  TopicBox,
} from './svg-renderers';

interface SvgViewProps {
  graph: RoadmapGraph;
  theme?: RoadmapThemeConfig;
}

export default function SvgView({
  graph,
  theme = DEFAULT_ROADMAP_THEME,
}: SvgViewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const activeTheme = getEffectiveTheme(theme, isDark);

  const isDarkCanvas = isDarkColor(activeTheme.canvas.backgroundColor);
  const isTransparentBg = activeTheme.canvas.backgroundColor === 'transparent';
  const canvasContrastColor = isTransparentBg
    ? (isDarkCanvas ? '#0f172a' : '#ffffff')
    : activeTheme.canvas.backgroundColor;
  const viewBoxStr = graph.viewBox || `${graph.minX} ${graph.minY} ${graph.width} ${graph.height}`;

  return (
    <div
      style={{
        backgroundColor: activeTheme.canvas.backgroundColor,
        fontFamily: activeTheme.canvas.fontFamily,
      }}
      className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 md:p-6 transition-colors"
      suppressHydrationWarning
    >
      <svg
        viewBox={viewBoxStr}
        style={{ fontFamily: activeTheme.canvas.fontFamily }}
        className="w-full h-auto min-w-[860px] max-w-7xl mx-auto select-none"
        role="img"
        aria-label="Developer Roadmap Canvas"
      >
        <defs>
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
              fill: ${isDarkCanvas ? '#064e3b' : '#dcfce7'} !important;
              stroke: ${isDarkCanvas ? '#10b981' : '#16a34a'} !important;
            }
            .roadmap-node[data-status="done"] .node-title {
              fill: ${isDarkCanvas ? '#d1fae5' : '#14532d'} !important;
              text-decoration: line-through;
            }
            /* Learning / In-Progress (Purple) */
            .roadmap-node[data-status="learning"] .node-box,
            .roadmap-node[data-status="in-progress"] .node-box {
              fill: ${isDarkCanvas ? '#3b0764' : '#f3e8ff'} !important;
              stroke: ${isDarkCanvas ? '#a855f7' : '#9333ea'} !important;
            }
            .roadmap-node[data-status="learning"] .node-title,
            .roadmap-node[data-status="in-progress"] .node-title {
              fill: ${isDarkCanvas ? '#f3e8ff' : '#581c87'} !important;
            }
            /* Skipped (Slate) */
            .roadmap-node[data-status="skipped"] .node-box {
              fill: ${isDarkCanvas ? '#1e293b' : '#f1f5f9'} !important;
              stroke: ${isDarkCanvas ? '#475569' : '#94a3b8'} !important;
            }
            .roadmap-node[data-status="skipped"] .node-title {
              fill: ${isDarkCanvas ? '#94a3b8' : '#64748b'} !important;
              text-decoration: line-through;
            }
          `}</style>
        </defs>

        {/* 1. Sections & Subsections */}
        {graph.nodes
          .filter((n) => n.type === 'section' || n.type === 'subsection')
          .map((node) => {
            const isSub = node.type === 'subsection';
            const boxStyle = isSub ? activeTheme.nodes.subsection : activeTheme.nodes.section;

            return (
              <SectionContainer
                key={node.id}
                node={node}
                isSub={isSub}
                boxStyle={boxStyle}
                canvasContrastColor={canvasContrastColor}
              />
            );
          })}

        {/* 2. Edges */}
        {graph.edges.map((edge) => {
          if (!edge.d) return null;

          const edgeCfg =
            edge.type === 'spine-edge'
              ? activeTheme.edges.spine
              : edge.type === 'sub-branch-edge'
                ? activeTheme.edges.subBranch
                : activeTheme.edges.branch;

          return (
            <EdgeLine
              key={edge.id}
              edge={edge}
              d={edge.d}
              edgeCfg={edgeCfg}
              canvasContrastColor={canvasContrastColor}
            />
          );
        })}

        {/* 3. Milestones, Canvas Titles, and Topics */}
        {graph.nodes
          .filter((n) => n.type !== 'section' && n.type !== 'subsection')
          .map((node) => {
            const centerX = node.centerX ?? Math.round(node.x + node.width / 2);
            const centerY = node.centerY ?? Math.round(node.y + node.height / 2);

            // Milestone
            if (node.type === 'milestone') {
              return (
                <MilestoneMarker
                  key={node.id}
                  cx={centerX}
                  cy={centerY}
                  mStyle={activeTheme.nodes.milestone}
                  pinColor={activeTheme.nodes.milestone.color}
                  canvasContrastColor={canvasContrastColor}
                />
              );
            }

            // Canvas Title Node
            if (node.type === 'title') {
              return (
                <CanvasTitle
                  key={node.id}
                  x={centerX}
                  y={centerY}
                  label={node.label}
                  color={activeTheme.canvas.titleColor}
                  fontSize={activeTheme.canvas.titleFontSize}
                />
              );
            }

            // Topic or Subtopic Node
            const isSubtopic = node.type === 'subtopic';
            const baseBoxStyle = isSubtopic
              ? activeTheme.nodes.subtopic
              : activeTheme.nodes.topic;

            return (
              <TopicBox
                key={node.id}
                node={node}
                baseBoxStyle={baseBoxStyle}
                canvasContrastColor={canvasContrastColor}
                className={`roadmap-node ${node.clickable ? 'roadmap-node-clickable' : ''}`}
                dataAttributes={{
                  'data-node-id': node.id,
                  'data-topic-id': node.topicId || node.label,
                  'data-label': node.label,
                  'data-subtext':
                    node.subtext && node.subtext.length > 0
                      ? JSON.stringify(node.subtext)
                      : undefined,
                  'data-tag': node.tag || 'none',
                  'data-status': 'pending',
                }}
              />
            );
          })}
      </svg>
    </div>
  );
}
