'use client';

import React, { useState } from 'react';
import {
  RoadmapStageSchema,
  RoadmapNode,
  RoadmapEdge,
  RoadmapGraph,
  SemanticEdgeType,
  RoadmapThemeConfig,
  NodeBoxStyle,
  EdgeLineStyle,
  EdgeCurveStyle,
  TopicRequirementTag,
} from '@/types/roadmap';
import { THEME_PRESETS } from '@/config/theme';
import {
  Palette,
  Layers,
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
  Move,
  ChevronUp,
  ChevronDown,
  Columns,
  Tag,
} from 'lucide-react';

interface StructureEditorProps {
  slug: string;
  canvasTitle?: string;
  stages: RoadmapStageSchema[];
  graph: RoadmapGraph;
  theme: RoadmapThemeConfig;
  selectedNode: RoadmapNode | null;
  selectedEdge: RoadmapEdge | null;
  moveGroupWithSection: boolean;
  topicTags?: Record<string, TopicRequirementTag>;
  onToggleMoveGroup: (val: boolean) => void;
  onUpdateCanvasTitle?: (title: string) => void;
  onUpdateTheme: (nextTheme: RoadmapThemeConfig) => void;
  onUpdateStage: (
    stageId: string,
    patch: Partial<RoadmapStageSchema>
  ) => void;
  onMoveStageOrder: (stageId: string, direction: 'up' | 'down') => void;
  onResizeSelectedNode: (nodeId: string, width: number, height: number) => void;
  onUpdateTopicTag?: (topicId: string, tag: TopicRequirementTag) => void;
  onAddCustomEdge: (
    source: string,
    target: string,
    type: SemanticEdgeType
  ) => void;
  onDeleteEdge: (edgeId: string) => void;
  onChangeSelectedEdgePointCount: (edge: RoadmapEdge, delta: 1 | -1) => void;
  onResetAllOverrides: () => void;
  onClose?: () => void;
}

type StudioTab = 'nodes' | 'edges' | 'canvas' | 'structure' | 'badges';
type NodeCategoryKey = 'topic' | 'subtopic' | 'section' | 'subsection';
type EdgeCategoryKey = 'spine' | 'branch' | 'subBranch';

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
      />
      {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{hint}</p>}
    </div>
  );
}

function ColorPickerControl({
  label,
  value,
  onChange,
  allowTransparent = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowTransparent?: boolean;
}) {
  const isTransparent = value.toLowerCase() === 'transparent';
  const colorInputValue =
    isTransparent || !value.startsWith('#') || (value.length !== 7 && value.length !== 4)
      ? '#ffffff'
      : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">{label}</span>
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange(isTransparent ? '#ffffff' : 'transparent')}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all ${
              isTransparent
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isTransparent ? '✓ Transparent' : 'Transparent'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
        {isTransparent ? (
          <div
            onClick={() => onChange('#ffffff')}
            title="Click to pick solid color"
            className="h-6 w-6 rounded cursor-pointer border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:8px_8px] [background-position:0_0,0_4px,4px_-4px,-4px_0]"
          />
        ) : (
          <input
            type="color"
            value={colorInputValue}
            onChange={(e) => onChange(e.target.value)}
            className="h-6 w-6 rounded cursor-pointer border border-slate-300 dark:border-slate-600 p-0 bg-transparent shrink-0"
          />
        )}
        <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 uppercase">
          {isTransparent ? 'transparent' : value}
        </span>
        {isTransparent && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic ml-auto">No background</span>
        )}
      </div>
    </div>
  );
}

export default function StructureEditor({
  canvasTitle,
  stages,
  graph,
  theme,
  selectedNode,
  selectedEdge,
  moveGroupWithSection,
  topicTags = {},
  onToggleMoveGroup,
  onUpdateCanvasTitle,
  onUpdateTheme,
  onUpdateStage,
  onMoveStageOrder,
  onResizeSelectedNode,
  onUpdateTopicTag,
  onAddCustomEdge,
  onDeleteEdge,
  onChangeSelectedEdgePointCount,
  onResetAllOverrides,
  onClose,
}: StructureEditorProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('nodes');
  const [nodeCat, setNodeCat] = useState<NodeCategoryKey>('section');
  const [edgeCat, setEdgeCat] = useState<EdgeCategoryKey>('spine');

  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeType, setEdgeType] = useState<SemanticEdgeType>('branch-edge');
  const [searchTopic, setSearchTopic] = useState('');

  const filteredTopics = React.useMemo(() => {
    const clickable = graph.nodes.filter((n) => n.clickable && n.label);
    if (!searchTopic.trim()) return clickable;
    const q = searchTopic.toLowerCase();
    return clickable.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.topicId && n.topicId.toLowerCase().includes(q))
    );
  }, [graph.nodes, searchTopic]);

  const patchNodeCategory = (
    cat: NodeCategoryKey,
    patch: Partial<NodeBoxStyle>
  ) => {
    onUpdateTheme({
      ...theme,
      nodes: {
        ...theme.nodes,
        [cat]: {
          ...theme.nodes[cat],
          ...patch,
        },
      },
    });
  };

  const patchEdgeCategory = (
    cat: EdgeCategoryKey,
    patch: Partial<EdgeLineStyle>
  ) => {
    onUpdateTheme({
      ...theme,
      edges: {
        ...theme.edges,
        [cat]: {
          ...theme.edges[cat],
          ...patch,
        },
      },
    });
  };

  const patchCanvas = (patch: Partial<RoadmapThemeConfig['canvas']>) => {
    onUpdateTheme({
      ...theme,
      canvas: {
        ...theme.canvas,
        ...patch,
      },
    });
  };

  const currentNodeStyle = theme.nodes[nodeCat];
  const currentEdgeStyle = theme.edges[edgeCat];
  const isContainerCat = nodeCat === 'section' || nodeCat === 'subsection';

  return (
    <aside className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-slate-50/90 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl gap-1">
          {(
            [
              { id: 'nodes', label: 'Node Styling', icon: Layers },
              { id: 'edges', label: 'Line Routing', icon: Move },
              { id: 'canvas', label: 'Canvas & Spacing', icon: Sliders },
              { id: 'structure', label: 'Stages & Layout', icon: Columns },
              { id: 'badges', label: 'Topic Badges', icon: Tag },
            ] as const
          ).map((t) => {
            const IconComponent = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' +
                  (isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50')
                }
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAllOverrides}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Overrides</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Collapse controls panel"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </button>
          )}
        </div>
      </div>

      {/* Theme Presets */}
      <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Presets (7):</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onUpdateTheme(preset.theme)}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-h-[38vh] overflow-y-auto overscroll-contain">
        {/* TAB 1: NODE STYLING */}
        {activeTab === 'nodes' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Node Type
              </h4>
              <div className="space-y-1">
                {(
                  [
                    { id: 'section', label: 'Main Section' },
                    { id: 'subsection', label: 'Sub-Section' },
                    { id: 'topic', label: 'Primary Topic' },
                    { id: 'subtopic', label: 'Sub-Topic Node' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setNodeCat(item.id)}
                    className={
                      'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                      (nodeCat === item.id
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {nodeCat.toUpperCase()} Colors
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <ColorPickerControl
                  label="Fill Color"
                  value={currentNodeStyle.fillColor}
                  onChange={(val) => patchNodeCategory(nodeCat, { fillColor: val })}
                />
                <ColorPickerControl
                  label="Border Color"
                  value={currentNodeStyle.strokeColor}
                  onChange={(val) => patchNodeCategory(nodeCat, { strokeColor: val })}
                />
                <ColorPickerControl
                  label="Text Color"
                  value={currentNodeStyle.textColor}
                  onChange={(val) => patchNodeCategory(nodeCat, { textColor: val })}
                />
              </div>

              {isContainerCat && (
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={currentNodeStyle.titleOnBorder ?? true}
                      onChange={(e) =>
                        patchNodeCategory(nodeCat, {
                          titleOnBorder: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>Write Title on Top Border Line</span>
                  </label>
                  <RangeControl
                    label="Title Side Padding"
                    value={currentNodeStyle.borderTitlePaddingX ?? 14}
                    min={6}
                    max={36}
                    step={2}
                    onChange={(val) =>
                      patchNodeCategory(nodeCat, { borderTitlePaddingX: val })
                    }
                  />
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Geometry & Text
              </h4>
              <RangeControl
                label="Font Size"
                value={currentNodeStyle.fontSize}
                min={10}
                max={22}
                step={0.5}
                onChange={(val) => patchNodeCategory(nodeCat, { fontSize: val })}
              />
              <RangeControl
                label="Corner Radius"
                value={currentNodeStyle.borderRadius}
                min={0}
                max={20}
                step={1}
                onChange={(val) => patchNodeCategory(nodeCat, { borderRadius: val })}
              />
              <RangeControl
                label="Border Width"
                value={currentNodeStyle.strokeWidth}
                min={0.5}
                max={4}
                step={0.2}
                onChange={(val) => patchNodeCategory(nodeCat, { strokeWidth: val })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: LINE ROUTING & MILESTONE PINS */}
        {activeTab === 'edges' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Edge Type
              </h4>
              <div className="space-y-1">
                {(
                  [
                    { id: 'spine', label: 'Central Spine Road' },
                    { id: 'branch', label: 'Main Section Branches' },
                    { id: 'subBranch', label: 'Sub-Section Connectors' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEdgeCat(item.id)}
                    className={
                      'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                      (edgeCat === item.id
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {edgeCat.toUpperCase()} Routing & Styling
              </h4>

              <ColorPickerControl
                label="Line Color"
                value={currentEdgeStyle.strokeColor}
                onChange={(val) => patchEdgeCategory(edgeCat, { strokeColor: val })}
              />

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={Boolean(currentEdgeStyle.roadTrack)}
                  onChange={(e) =>
                    patchEdgeCategory(edgeCat, { roadTrack: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Road Track (Center Dashed Line)</span>
              </label>

              <RangeControl
                label="Line Thickness"
                value={currentEdgeStyle.strokeWidth}
                min={1}
                max={18}
                step={0.5}
                onChange={(val) => patchEdgeCategory(edgeCat, { strokeWidth: val })}
              />

              <RangeControl
                label="Draggable Control Points"
                value={currentEdgeStyle.controlPointsCount ?? 2}
                min={1}
                max={6}
                step={1}
                unit=" pts"
                onChange={(val) =>
                  patchEdgeCategory(edgeCat, { controlPointsCount: val })
                }
                hint="Additional points allow curving around boxes cleanly."
              />

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Routing Curve Style
                </span>
                <select
                  value={currentEdgeStyle.curveStyle}
                  onChange={(e) =>
                    patchEdgeCategory(edgeCat, {
                      curveStyle: e.target.value as EdgeCurveStyle,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="bezier">Smooth Bezier Spline</option>
                  <option value="orthogonal">Right-Angle Step (Orthogonal)</option>
                  <option value="straight">Segmented Straight Lines</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected Edge & Custom Connections
              </h4>

              {selectedEdge ? (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Active Edge: <span className="font-mono text-amber-700 dark:text-amber-400">{selectedEdge.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onChangeSelectedEdgePointCount(selectedEdge, 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Bend Point</span>
                    </button>
                    <button
                      onClick={() => onChangeSelectedEdgePointCount(selectedEdge, -1)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      - Remove Point
                    </button>
                    <button
                      onClick={() => onDeleteEdge(selectedEdge.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  Click any line or orange bend handle on the canvas to inspect or adjust its curve points.
                </p>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Connect Two Nodes
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={edgeSource}
                    onChange={(e) => setEdgeSource(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">From Node...</option>
                    {graph.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label ? n.label : n.id} ({n.type})
                      </option>
                    ))}
                  </select>

                  <select
                    value={edgeTarget}
                    onChange={(e) => setEdgeTarget(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">To Node...</option>
                    {graph.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label ? n.label : n.id} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={edgeType}
                    onChange={(e) =>
                      setEdgeType(e.target.value as SemanticEdgeType)
                    }
                    className="flex-1 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="branch-edge">Main Branch Style</option>
                    <option value="sub-branch-edge">Sub-Branch Style</option>
                    <option value="spine-edge">Spine Road Style</option>
                  </select>
                  <button
                    onClick={() => {
                      if (edgeSource && edgeTarget && edgeSource !== edgeTarget) {
                        onAddCustomEdge(edgeSource, edgeTarget, edgeType);
                        setEdgeSource('');
                        setEdgeTarget('');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Spine Milestone Pin Marker
              </h4>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Pin Shape</span>
                <select
                  value={theme.nodes.milestone.shape}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      nodes: {
                        ...theme.nodes,
                        milestone: {
                          ...theme.nodes.milestone,
                          shape: e.target.value as 'pin' | 'circle',
                        },
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="pin">📍 Location Pin SVG</option>
                  <option value="circle">● Solid Dot Marker</option>
                </select>
              </div>

              <ColorPickerControl
                label="Marker Color"
                value={theme.nodes.milestone.color}
                onChange={(val) =>
                  onUpdateTheme({
                    ...theme,
                    nodes: {
                      ...theme.nodes,
                      milestone: {
                        ...theme.nodes.milestone,
                        color: val,
                      },
                    },
                  })
                }
              />

              <RangeControl
                label="Marker Size"
                value={theme.nodes.milestone.size}
                min={18}
                max={44}
                step={2}
                onChange={(val) =>
                  onUpdateTheme({
                    ...theme,
                    nodes: {
                      ...theme.nodes,
                      milestone: {
                        ...theme.nodes.milestone,
                        size: val,
                      },
                    },
                  })
                }
              />

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={theme.nodes.milestone.showGroundShadow}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      nodes: {
                        ...theme.nodes,
                        milestone: {
                          ...theme.nodes.milestone,
                          showGroundShadow: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Show Ground Shadow Ring</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: SPACING & CANVAS */}
        {activeTab === 'canvas' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Canvas & Typography
              </h4>
              <ColorPickerControl
                label="Canvas Background Color"
                value={theme.canvas.backgroundColor}
                onChange={(val) => patchCanvas({ backgroundColor: val })}
                allowTransparent
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => patchCanvas({ backgroundColor: 'transparent' })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    theme.canvas.backgroundColor === 'transparent'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => patchCanvas({ backgroundColor: '#ffffff' })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    theme.canvas.backgroundColor.toLowerCase() === '#ffffff'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => patchCanvas({ backgroundColor: '#f8fafc' })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    theme.canvas.backgroundColor.toLowerCase() === '#f8fafc'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Slate
                </button>
                <button
                  type="button"
                  onClick={() => patchCanvas({ backgroundColor: '#090d16' })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    theme.canvas.backgroundColor.toLowerCase() === '#090d16'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Dark
                </button>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Global Font Family
                </span>
                <select
                  value={theme.canvas.fontFamily}
                  onChange={(e) => patchCanvas({ fontFamily: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Inter, system-ui, sans-serif">Inter (Clean Modern Sans)</option>
                  <option value="Architects Daughter, Inter, cursive">
                    Architects Daughter (Handwritten)
                  </option>
                  <option value="ui-monospace, SFMono-Regular, Menlo, monospace">
                    JetBrains Monospace
                  </option>
                  <option value="Georgia, serif">Editorial Serif</option>
                </select>
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Canvas Display Title
                </span>
                <input
                  type="text"
                  value={canvasTitle ?? ''}
                  placeholder="e.g. Backend (defaults to roadmap title)"
                  onChange={(e) => onUpdateCanvasTitle?.(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  Text on the canvas header. Falls back to roadmap title if blank.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Topic Breathing Room
              </h4>
              <RangeControl
                label="Main Topic Gap"
                value={theme.canvas.topicGap}
                min={6}
                max={28}
                step={2}
                onChange={(val) => patchCanvas({ topicGap: val })}
              />
              <RangeControl
                label="Sub-Topic Gap"
                value={theme.canvas.subTopicGap}
                min={6}
                max={26}
                step={2}
                onChange={(val) => patchCanvas({ subTopicGap: val })}
              />
              <RangeControl
                label="Section Inner Padding"
                value={theme.canvas.sectionPadding}
                min={10}
                max={36}
                step={2}
                onChange={(val) => patchCanvas({ sectionPadding: val })}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Spine & Stage Separation
              </h4>
              <RangeControl
                label="Vertical Stage Gap"
                value={theme.canvas.stageVerticalGap}
                min={20}
                max={90}
                step={4}
                onChange={(val) => patchCanvas({ stageVerticalGap: val })}
              />
              <RangeControl
                label="Parent-to-Sub-Section Gap"
                value={theme.canvas.subSectionGap}
                min={14}
                max={64}
                step={2}
                onChange={(val) => patchCanvas({ subSectionGap: val })}
              />
              <RangeControl
                label="Spine Branch Distance"
                value={theme.canvas.spineBranchGap}
                min={32}
                max={120}
                step={4}
                onChange={(val) => patchCanvas({ spineBranchGap: val })}
              />
            </div>
          </div>
        )}

        {/* TAB 4: STAGES & LAYOUT */}
        {activeTab === 'structure' && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Selected Element Inspector
                </h4>
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moveGroupWithSection}
                    onChange={(e) => onToggleMoveGroup(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Move child topics with section</span>
                </label>
              </div>

              {selectedNode ? (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedNode.label || selectedNode.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {selectedNode.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Coordinates: x={selectedNode.x}, y={selectedNode.y}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Width (px)
                      <input
                        type="number"
                        value={selectedNode.width}
                        onChange={(e) =>
                          onResizeSelectedNode(
                            selectedNode.id,
                            Number(e.target.value) || selectedNode.width,
                            selectedNode.height
                          )
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </label>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Height (px)
                      <input
                        type="number"
                        value={selectedNode.height}
                        onChange={(e) =>
                          onResizeSelectedNode(
                            selectedNode.id,
                            selectedNode.width,
                            Number(e.target.value) || selectedNode.height
                          )
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </label>
                  </div>

                  {(selectedNode.id === 'roadmap-main-title' || selectedNode.type === 'title') && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Canvas Display Title
                      </label>
                      <input
                        type="text"
                        value={canvasTitle ?? ''}
                        placeholder="e.g. Backend (defaults to roadmap title)"
                        onChange={(e) => onUpdateCanvasTitle?.(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                        Text displayed on this canvas title node.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  Click or drag any box on the roadmap canvas below to inspect its dimensions and coordinates.
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Stages Alignment & Order
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {stages.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {idx + 1}. {st.title || st.topics?.[0]?.toString() || st.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onUpdateStage(st.id, {
                            side: st.side === 'left' ? 'right' : 'left',
                          })
                        }
                        className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium text-[11px] text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        {st.side === 'left' ? '⬅ Left' : 'Right ➡'}
                      </button>
                      {!st.standaloneTopic && !st.groups && (
                        <button
                          onClick={() =>
                            onUpdateStage(st.id, {
                              columns:
                                (((st.columns || 2) % 3) + 1) as 1 | 2 | 3,
                            })
                          }
                          className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono text-[11px] text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          {st.columns || 2} cols
                        </button>
                      )}
                      <button
                        onClick={() => onMoveStageOrder(st.id, 'up')}
                        className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                        title="Move stage up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveStageOrder(st.id, 'down')}
                        className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                        title="Move stage down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TOPIC REQUIREMENT BADGES */}
        {activeTab === 'badges' && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected Topic Badge
              </h4>
              {selectedNode && selectedNode.clickable ? (
                <div className="space-y-3">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {selectedNode.label}
                    </div>
                    <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                      id: #{selectedNode.topicId}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'required', label: '🟣 Required / Recommended' },
                        { id: 'pick-any', label: '🟢 Pick Any / Alternative' },
                        { id: 'optional', label: '⚪ Optional / Anytime' },
                        { id: 'none', label: '✕ No Badge' },
                      ] as const
                    ).map((b) => {
                      const active =
                        ((topicTags && topicTags[selectedNode.topicId]) || selectedNode.tag || 'none') ===
                        b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            onUpdateTopicTag?.(selectedNode.topicId, b.id)
                          }
                          className={
                            'px-2.5 py-2 rounded-lg font-semibold border text-left transition-all ' +
                            (active
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700')
                          }
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  Click any topic box on the canvas below to inspect and assign badges—or use the quick list on the right.
                </p>
              )}
            </div>

            <div className="lg:col-span-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Topics ({filteredTopics.length}) — Quick Requirement Tagging
                </h4>
                <input
                  type="text"
                  placeholder="Search topic or snake_case id..."
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredTopics.map((tNode) => {
                  const curTag =
                    (topicTags && topicTags[tNode.topicId]) || tNode.tag || 'none';
                  return (
                    <div
                      key={tNode.id}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tNode.label}
                        </span>
                        <span className="ml-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          #{tNode.topicId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(
                          [
                            { id: 'required', label: '🟣 Required' },
                            { id: 'pick-any', label: '🟢 Pick Any' },
                            { id: 'optional', label: '⚪ Optional' },
                            { id: 'none', label: 'None' },
                          ] as const
                        ).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() =>
                              onUpdateTopicTag?.(tNode.topicId, b.id)
                            }
                            className={
                              'px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ' +
                              (curTag === b.id
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600')
                            }
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
