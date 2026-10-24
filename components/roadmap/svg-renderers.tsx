import React from 'react';
import {
  RoadmapNode,
  RoadmapEdge,
  TopicStatus,
  TopicRequirementTag,
  NodeBoxStyle,
  EdgeLineStyle,
  MilestoneStyle,
} from '@/types/roadmap';
import { REQUIREMENT_BADGE_COLORS } from '@/lib/svgEdgeUtils';

export interface SectionContainerProps {
  node: RoadmapNode;
  isSub: boolean;
  boxStyle: NodeBoxStyle;
  canvasContrastColor: string;
  isSelected?: boolean;
  isEditMode?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export function SectionContainer({
  node,
  isSub,
  boxStyle,
  canvasContrastColor,
  isSelected,
  isEditMode,
  onPointerDown,
}: SectionContainerProps) {
  const titleOnBorder = boxStyle.titleOnBorder ?? true;
  const padX = boxStyle.borderTitlePaddingX ?? 14;
  const estTextW = node.label
    ? Math.ceil(node.label.length * (boxStyle.fontSize * 0.6))
    : 0;
  const maskW = estTextW + padX * 2;
  const maskX = Math.round(node.x + node.width / 2 - maskW / 2);

  const centerX = node.centerX ?? Math.round(node.x + node.width / 2);
  const titleY = titleOnBorder ? node.y : node.y + (isSub ? 20 : 23);

  return (
    <g
      key={node.id}
      onPointerDown={onPointerDown}
      className={isEditMode ? 'cursor-move' : undefined}
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

      {/* Mask out top border line behind title */}
      {node.label && titleOnBorder && (
        <rect
          x={maskX}
          y={node.y - 10}
          width={maskW}
          height={20}
          rx={4}
          fill={isSub ? canvasContrastColor : canvasContrastColor}
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
}

export interface EdgeLineProps {
  edge: RoadmapEdge;
  d: string;
  edgeCfg: EdgeLineStyle;
  canvasContrastColor: string;
  isSelected?: boolean;
  isEditMode?: boolean;
  onClick?: () => void;
}

export function EdgeLine({
  d,
  edgeCfg,
  canvasContrastColor,
  isSelected,
  isEditMode,
  onClick,
}: EdgeLineProps) {
  const isRoadTrack = Boolean(edgeCfg.roadTrack);

  if (isRoadTrack) {
    return (
      <g onClick={onClick} className={isEditMode ? 'cursor-pointer' : undefined}>
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
    );
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={isSelected ? '#f97316' : edgeCfg.strokeColor}
      strokeWidth={isSelected ? edgeCfg.strokeWidth + 1.5 : edgeCfg.strokeWidth}
      strokeDasharray={edgeCfg.dashed ? '6 5' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={onClick}
      className={isEditMode ? 'cursor-pointer' : undefined}
    />
  );
}

export interface MilestoneMarkerProps {
  cx: number;
  cy: number;
  mStyle: MilestoneStyle;
  pinColor: string;
  canvasContrastColor: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  className?: string;
}

export function MilestoneMarker({
  cx,
  cy,
  mStyle,
  pinColor,
  canvasContrastColor,
  onPointerDown,
  className,
}: MilestoneMarkerProps) {
  const scale = (mStyle.size || 28) / 28;

  if (mStyle.shape === 'pin') {
    return (
      <g
        transform={`translate(${cx}, ${cy}) scale(${scale})`}
        onPointerDown={onPointerDown}
        className={className}
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
        <circle cx={0} cy={-21} r={4.8} fill={canvasContrastColor} />
      </g>
    );
  }

  return (
    <g onPointerDown={onPointerDown} className={className}>
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

export interface RequirementBadgeProps {
  x: number;
  y: number;
  tag?: TopicRequirementTag;
  canvasContrastColor: string;
}

export function RequirementBadge({
  x,
  y,
  tag,
  canvasContrastColor,
}: RequirementBadgeProps) {
  if (!tag || tag === 'none') return null;
  const badgeCfg = REQUIREMENT_BADGE_COLORS[tag];
  if (!badgeCfg) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
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
  );
}

export interface CanvasTitleProps {
  x: number;
  y: number;
  label: string;
  color: string;
  fontSize: number;
  onPointerDown?: (e: React.PointerEvent) => void;
  className?: string;
}

export function CanvasTitle({
  x,
  y,
  label,
  color,
  fontSize,
  onPointerDown,
  className,
}: CanvasTitleProps) {
  return (
    <g onPointerDown={onPointerDown} className={className}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={fontSize}
        fontWeight={800}
      >
        {label}
      </text>
    </g>
  );
}

export interface TopicBoxProps {
  node: RoadmapNode;
  baseBoxStyle: NodeBoxStyle;
  canvasContrastColor: string;
  fillColor?: string;
  strokeColor?: string;
  textColor?: string;
  isSelected?: boolean;
  status?: TopicStatus;
  badge?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  className?: string;
  dataAttributes?: Record<string, string | undefined>;
}

export function TopicBox({
  node,
  baseBoxStyle,
  canvasContrastColor,
  fillColor = baseBoxStyle.fillColor,
  strokeColor = baseBoxStyle.strokeColor,
  textColor = baseBoxStyle.textColor,
  isSelected,
  status = 'pending',
  badge,
  onPointerDown,
  className,
  dataAttributes,
}: TopicBoxProps) {
  const isSubtopic = node.type === 'subtopic';
  const centerX = node.centerX ?? Math.round(node.x + node.width / 2);
  const centerY = node.centerY ?? Math.round(node.y + node.height / 2);

  const titleLines =
    node.lines && node.lines.length > 0 ? node.lines : [node.label];
  const hasSubtext = Boolean(node.subtext && node.subtext.length > 0);
  const fontSize = baseBoxStyle.fontSize;
  const lineSpacing = Math.round(fontSize * 1.2);
  const titleBlockHeight = (titleLines.length - 1) * lineSpacing;
  const firstTitleY = hasSubtext
    ? node.y + 18
    : Math.round(node.y + node.height / 2 - titleBlockHeight / 2);

  const linesToRender = node.renderedLines ?? titleLines.map((line, lIdx) => ({
    text: lIdx === 0 && badge ? `${badge} ${line}` : line,
    y: firstTitleY + lIdx * lineSpacing,
  }));

  const badgeX = node.badgeX ?? node.x + node.width - 6;
  const badgeY = node.badgeY ?? node.y + 6;
  const reqTag = node.tag && node.tag !== 'none' ? node.tag : undefined;

  const isCrossedOut = status === 'done' || status === 'skipped';

  return (
    <g
      id={node.topicId}
      onPointerDown={onPointerDown}
      className={className}
      {...dataAttributes}
    >
      <rect
        className="node-box"
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

      {linesToRender.map((line, lIdx) => (
        <text
          key={lIdx}
          className="node-title"
          x={centerX}
          y={line.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={fontSize}
          fontWeight={isSubtopic ? 500 : 600}
          textDecoration={isCrossedOut ? 'line-through' : undefined}
        >
          {line.text}
        </text>
      ))}

      {node.renderedSubtext ? (
        node.renderedSubtext.map((sub, sIdx) => (
          <text
            key={'sub-' + sIdx}
            className="node-subtext"
            x={centerX}
            y={sub.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize={Math.max(10.5, fontSize - 2)}
          >
            {sub.text}
          </text>
        ))
      ) : (
        node.subtext?.map((subText, sIdx) => (
          <text
            key={'sub-' + sIdx}
            className="node-subtext"
            x={centerX}
            y={firstTitleY + titleLines.length * lineSpacing + 6 + sIdx * 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize={Math.max(10.5, fontSize - 2)}
          >
            {subText}
          </text>
        ))
      )}

      <RequirementBadge
        x={badgeX}
        y={badgeY}
        tag={reqTag}
        canvasContrastColor={canvasContrastColor}
      />
    </g>
  );
}
